'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ClientStatus, JobStage, Plan } from '@prisma/client';
import { db } from '@/lib/db';

// -----------------------------------------------------------------------------
// Every mutation is a form action, so the whole tool works without client-side
// JavaScript. Nothing here re-checks auth: middleware.ts gates every route
// including these POSTs, and there is only one user to be.
// -----------------------------------------------------------------------------

const PLANS = ['STARTER', 'GROWTH'] as const;
const CLIENT_STATUSES = ['PROSPECT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'LOST'] as const;
const JOB_STAGES = [
  'INTAKE',
  'CONCEPT',
  'PRODUCTION',
  'QA',
  'CLIENT_REVIEW',
  'DELIVERED',
] as const;
const LEAD_STATUSES = ['NEW', 'CONTACTED', 'CONVERTED', 'ARCHIVED'] as const;

/** Trimmed string, or null for anything blank — never store empty strings. */
function text(form: FormData, key: string): string | null {
  const value = form.get(key);
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function required(form: FormData, key: string, label: string): string {
  const value = text(form, key);
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

/** Enum values arrive from a <select>, so anything unexpected is a bad request. */
function oneOf<T extends readonly string[]>(
  form: FormData,
  key: string,
  allowed: T,
): T[number] | null {
  const value = text(form, key);
  if (!value) return null;
  return (allowed as readonly string[]).includes(value) ? (value as T[number]) : null;
}

/** `<input type="date">` gives `YYYY-MM-DD`; anchor it to midday UTC so the
 *  date doesn't slide a day either way when rendered in a local timezone. */
function date(form: FormData, key: string): Date | null {
  const value = text(form, key);
  if (!value) return null;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function count(form: FormData, key: string, fallback: number): number {
  const value = Number(text(form, key));
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.trunc(value), 1), 99);
}

// --- clients -----------------------------------------------------------------

export async function createClient(form: FormData) {
  const created = await db.client.create({
    data: {
      businessName: required(form, 'businessName', 'Business name'),
      contactName: text(form, 'contactName'),
      email: text(form, 'email'),
      phone: text(form, 'phone'),
      location: text(form, 'location'),
      plan: oneOf(form, 'plan', PLANS) as Plan | null,
      status: (oneOf(form, 'status', CLIENT_STATUSES) as ClientStatus | null) ?? 'PROSPECT',
      notes: text(form, 'notes'),
    },
  });

  revalidatePath('/');
  redirect(`/clients/${created.id}`);
}

export async function updateClient(form: FormData) {
  const id = required(form, 'id', 'Client id');

  await db.client.update({
    where: { id },
    data: {
      businessName: required(form, 'businessName', 'Business name'),
      contactName: text(form, 'contactName'),
      email: text(form, 'email'),
      phone: text(form, 'phone'),
      location: text(form, 'location'),
      plan: oneOf(form, 'plan', PLANS) as Plan | null,
      status: (oneOf(form, 'status', CLIENT_STATUSES) as ClientStatus | null) ?? 'PROSPECT',
      notes: text(form, 'notes'),
    },
  });

  revalidatePath('/');
  revalidatePath(`/clients/${id}`);
}

export async function deleteClient(form: FormData) {
  const id = required(form, 'id', 'Client id');
  // Hard delete, unlike the QR product's soft-delete rule — nothing here is
  // engraved on a physical object, and a mistyped prospect shouldn't linger.
  // Jobs cascade (see schema.prisma).
  await db.client.delete({ where: { id } });

  revalidatePath('/');
  redirect('/');
}

// --- jobs --------------------------------------------------------------------

export async function createJob(form: FormData) {
  const clientId = required(form, 'clientId', 'Client id');

  await db.job.create({
    data: {
      clientId,
      title: required(form, 'title', 'Title'),
      stage: (oneOf(form, 'stage', JOB_STAGES) as JobStage | null) ?? 'INTAKE',
      videoCount: count(form, 'videoCount', 2),
      dueDate: date(form, 'dueDate'),
      notes: text(form, 'notes'),
    },
  });

  revalidatePath('/');
  revalidatePath(`/clients/${clientId}`);
}

export async function setJobStage(form: FormData) {
  const id = required(form, 'id', 'Job id');
  const clientId = required(form, 'clientId', 'Client id');
  const stage = oneOf(form, 'stage', JOB_STAGES) as JobStage | null;
  if (!stage) throw new Error('Unknown stage.');

  await db.job.update({
    where: { id },
    data: {
      stage,
      // Stamp the delivery date on the way in, and clear it if a job is moved
      // back out of Delivered — otherwise a corrected mis-click leaves behind a
      // delivery date for work that hasn't shipped.
      deliveredAt: stage === 'DELIVERED' ? new Date() : null,
    },
  });

  revalidatePath('/');
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteJob(form: FormData) {
  const id = required(form, 'id', 'Job id');
  const clientId = required(form, 'clientId', 'Client id');

  await db.job.delete({ where: { id } });

  revalidatePath('/');
  revalidatePath(`/clients/${clientId}`);
}

// --- leads -------------------------------------------------------------------

/**
 * Best-effort read of which package a lead picked on the quote form. The stored
 * value is whatever the form offered that day ("Growth — $1,000 CAD/mo for 6
 * videos"), so this matches loosely and gives up rather than guessing wrong —
 * an unset package on a new client is harmless; a wrong one is misleading.
 */
function inferPlan(packageInterest: string | null): Plan | null {
  if (!packageInterest) return null;
  const value = packageInterest.toLowerCase();
  if (value.includes('growth')) return 'GROWTH';
  if (value.includes('starter')) return 'STARTER';
  return null;
}

export async function setLeadStatus(form: FormData) {
  const id = required(form, 'id', 'Lead id');
  const status = oneOf(form, 'status', LEAD_STATUSES);
  if (!status) throw new Error('Unknown lead status.');

  await db.lead.update({ where: { id }, data: { status } });

  revalidatePath('/leads');
  revalidatePath(`/leads/${id}`);
  revalidatePath('/');
}

export async function updateLeadNotes(form: FormData) {
  const id = required(form, 'id', 'Lead id');

  await db.lead.update({ where: { id }, data: { notes: text(form, 'notes') } });

  revalidatePath(`/leads/${id}`);
}

/**
 * Turns a lead into a client and links the two. The lead is kept, not deleted,
 * so the original enquiry text stays readable next to the client record.
 */
export async function convertLeadToClient(form: FormData) {
  const id = required(form, 'id', 'Lead id');

  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) throw new Error('Lead not found.');
  if (lead.clientId) redirect(`/clients/${lead.clientId}`); // already converted

  const created = await db.client.create({
    data: {
      businessName: lead.business,
      contactName: lead.name,
      email: lead.email,
      phone: lead.phone,
      location: lead.location,
      plan: inferPlan(lead.packageInterest),
      status: 'PROSPECT',
      // Carry the enquiry across so the first thing on the client record is
      // what they actually asked for, in their words.
      notes: [lead.details, lead.notes].filter(Boolean).join('\n\n') || null,
    },
  });

  await db.lead.update({
    where: { id },
    data: { status: 'CONVERTED', clientId: created.id },
  });

  revalidatePath('/leads');
  revalidatePath('/');
  redirect(`/clients/${created.id}`);
}

export async function deleteLead(form: FormData) {
  const id = required(form, 'id', 'Lead id');

  await db.lead.delete({ where: { id } });

  revalidatePath('/leads');
  revalidatePath('/');
  redirect('/leads');
}
