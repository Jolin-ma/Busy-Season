import { NextResponse, type NextRequest } from 'next/server';
import { checkIngestKey } from '@/lib/auth';
import { db } from '@/lib/db';

// -----------------------------------------------------------------------------
// Lead ingest, called server-to-server by website/api/quote.js.
//
// This route is EXEMPT from the session gate in proxy.ts — the caller is a
// serverless function on another origin with no cookie — so it does its own
// auth against a shared secret and fails closed without one.
//
// The caller treats every failure here as non-fatal, because the lead has
// already been emailed by the time this is called. Never return a shape that
// would make it think otherwise, and never make it wait long: a slow response
// here delays a real visitor's form submission.
// -----------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

// Mirrors the caps in website/api/quote.js. Re-applied rather than trusted:
// this endpoint is reachable by anyone holding the key, not just that function.
const LIMITS = {
  business: 200,
  name: 200,
  email: 320,
  phone: 50,
  service: 300,
  location: 200,
  packageInterest: 100,
  details: 5000,
} as const;

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: NextRequest) {
  if (!(await checkIngestKey(request.headers.get('x-lead-key')))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const business = clean(input.business, LIMITS.business);
  const name = clean(input.name, LIMITS.name);
  const email = clean(input.email, LIMITS.email);

  // The caller validates these too. Checked again because "the caller already
  // did it" stops being true the moment anything else uses this endpoint.
  if (!business || !name || !email) {
    return NextResponse.json({ error: 'missing required fields' }, { status: 400 });
  }

  try {
    const lead = await db.lead.create({
      data: {
        business,
        name,
        email,
        phone: clean(input.phone, LIMITS.phone) || null,
        service: clean(input.service, LIMITS.service) || null,
        location: clean(input.location, LIMITS.location) || null,
        packageInterest: clean(input.packageInterest, LIMITS.packageInterest) || null,
        details: clean(input.details, LIMITS.details) || null,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (error) {
    // Log the payload, matching the marketing site's reasoning: if the write
    // fails the lead should still be recoverable from a log rather than gone.
    // It is also in the info@ inbox, so this is the second of two copies.
    console.error(
      `[leads/ingest] write failed: ${error instanceof Error ? error.message : String(error)}\n` +
        JSON.stringify({ business, name, email }),
    );
    return NextResponse.json({ error: 'write failed' }, { status: 500 });
  }
}
