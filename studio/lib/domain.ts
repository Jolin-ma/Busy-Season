import type { ClientStatus, JobStage, LeadStatus, Plan } from '@prisma/client';

// -----------------------------------------------------------------------------
// Labels and business facts, in one place.
//
// These figures are the same ones published on the marketing site. If pricing
// changes, it changes in the brief first, then on the site, then here — and all
// three have to agree. See LegacyLink_Studio_Master_Build_Brief.md §2.
// -----------------------------------------------------------------------------

export const PLANS: Record<Plan, { label: string; summary: string; perVideo: string }> = {
  STARTER: {
    label: 'Starter',
    summary: '$400 CAD · 2 videos · one-off',
    perVideo: '$200 / video',
  },
  GROWTH: {
    label: 'Growth',
    summary: '$1,000 CAD/mo · 6 videos · biweekly batches of 3',
    perVideo: '$166.67 / video',
  },
};

export const CLIENT_STATUSES: Record<ClientStatus, { label: string; tone: string }> = {
  PROSPECT: { label: 'Prospect', tone: 'neutral' },
  ACTIVE: { label: 'Active', tone: 'good' },
  PAUSED: { label: 'Paused', tone: 'warn' },
  COMPLETED: { label: 'Completed', tone: 'neutral' },
  LOST: { label: 'Lost', tone: 'bad' },
};

export const LEAD_STATUSES: Record<LeadStatus, { label: string; tone: string }> = {
  NEW: { label: 'New', tone: 'warn' },
  CONTACTED: { label: 'Contacted', tone: 'steel' },
  CONVERTED: { label: 'Converted', tone: 'good' },
  ARCHIVED: { label: 'Archived', tone: 'neutral' },
};

/**
 * The six production steps from brief §5, in order. Array order drives the
 * pipeline UI, so it must match the JobStage enum in schema.prisma.
 */
export const STAGES: { value: JobStage; label: string; hint: string }[] = [
  { value: 'INTAKE', label: 'Intake', hint: 'Brief in, not yet scripted' },
  { value: 'CONCEPT', label: 'Concept', hint: 'Script with the client for sign-off' },
  { value: 'PRODUCTION', label: 'Production', hint: 'Generating in Higgsfield' },
  { value: 'QA', label: 'QA', hint: 'Your own review pass' },
  { value: 'CLIENT_REVIEW', label: 'Client review', hint: 'One revision round included' },
  { value: 'DELIVERED', label: 'Delivered', hint: 'Final files handed over' },
];

export const STAGE_LABELS = Object.fromEntries(
  STAGES.map((s) => [s.value, s.label]),
) as Record<JobStage, string>;

export function stageIndex(stage: JobStage): number {
  return STAGES.findIndex((s) => s.value === stage);
}

/** Videos in a standard batch: 2 for a Starter order, 3 for one Growth batch. */
export function defaultVideoCount(plan: Plan | null): number {
  return plan === 'GROWTH' ? 3 : 2;
}

export function formatDate(value: Date | null): string {
  if (!value) return '—';
  return value.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Whole days until `due`. Negative means overdue. Both sides are floored to
 * midnight so "due today" reads as 0 rather than a fraction of a day.
 */
export function daysUntil(due: Date | null): number | null {
  if (!due) return null;
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOfDay(due) - startOfDay(new Date())) / 86_400_000);
}
