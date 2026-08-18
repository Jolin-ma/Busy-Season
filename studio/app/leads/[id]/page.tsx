import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import {
  convertLeadToClient,
  deleteLead,
  setLeadStatus,
  updateLeadNotes,
} from '@/app/actions';
import { LEAD_STATUSES, formatDate } from '@/lib/domain';

export const dynamic = 'force-dynamic';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const lead = await db.lead.findUnique({
    where: { id },
    include: { client: { select: { id: true, businessName: true } } },
  });

  if (!lead) notFound();

  const status = LEAD_STATUSES[lead.status];

  return (
    <main style={{ maxWidth: '52rem' }}>
      <div className="page-head">
        <div>
          <p className="eyebrow">
            <a href="/leads" style={{ color: 'inherit', textDecoration: 'none' }}>
              ← Leads
            </a>
          </p>
          <h1>{lead.business}</h1>
          <p>
            <span className={`badge badge-${status.tone}`}>{status.label}</span>{' '}
            <span className="sub">Received {formatDate(lead.createdAt)}</span>
          </p>
        </div>
      </div>

      <div className="stack">
        {lead.client && (
          <div className="notice">
            Converted to <a href={`/clients/${lead.client.id}`}>{lead.client.businessName}</a>.
          </div>
        )}

        {/* --- what they sent ------------------------------------------- */}
        <section className="card card-pad">
          <div className="section-title">
            <h2>The enquiry</h2>
          </div>

          <div className="grid-2">
            <div>
              <p className="sub" style={{ margin: 0 }}>
                Contact
              </p>
              <p style={{ margin: '0.125rem 0 0.75rem' }}>{lead.name}</p>

              <p className="sub" style={{ margin: 0 }}>
                Email
              </p>
              <p style={{ margin: '0.125rem 0 0.75rem' }}>
                <a href={`mailto:${lead.email}`}>{lead.email}</a>
              </p>
            </div>
            <div>
              <p className="sub" style={{ margin: 0 }}>
                Phone
              </p>
              <p style={{ margin: '0.125rem 0 0.75rem' }}>
                {lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : '—'}
              </p>

              <p className="sub" style={{ margin: 0 }}>
                What they do
              </p>
              <p style={{ margin: '0.125rem 0 0.75rem' }}>{lead.service ?? '—'}</p>

              <p className="sub" style={{ margin: 0 }}>
                Location
              </p>
              <p style={{ margin: '0.125rem 0 0.75rem' }}>{lead.location ?? '—'}</p>
            </div>
          </div>

          <hr className="divider" />

          <p className="sub" style={{ margin: 0 }}>
            Interested in
          </p>
          <p style={{ margin: '0.125rem 0 0.75rem' }}>{lead.packageInterest ?? '—'}</p>

          <p className="sub" style={{ margin: 0 }}>
            What they want the ads to do
          </p>
          <p style={{ margin: '0.25rem 0 0', whiteSpace: 'pre-wrap' }}>{lead.details ?? '—'}</p>

          <hr className="divider" />
          <div className="btn-row">
            <a
              href={`mailto:${lead.email}?subject=${encodeURIComponent(`Re: your enquiry — ${lead.business}`)}`}
              className="btn btn-primary"
            >
              Reply by email
            </a>
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="btn btn-secondary">
                Call
              </a>
            )}
          </div>
        </section>

        {/* --- status --------------------------------------------------- */}
        <section className="card card-pad">
          <div className="section-title">
            <h2>Status</h2>
          </div>
          <div className="btn-row">
            {(Object.keys(LEAD_STATUSES) as (keyof typeof LEAD_STATUSES)[])
              // Converted isn't set by hand — it's a side effect of converting,
              // and setting it without creating a client would be a lie.
              .filter((key) => key !== 'CONVERTED')
              .map((key) => (
                <form key={key} action={setLeadStatus}>
                  <input type="hidden" name="id" value={lead.id} />
                  <input type="hidden" name="status" value={key} />
                  <button
                    type="submit"
                    className="stage-step"
                    data-state={lead.status === key ? 'current' : 'todo'}
                    style={{ minWidth: '110px' }}
                  >
                    {LEAD_STATUSES[key].label}
                  </button>
                </form>
              ))}
          </div>
        </section>

        {/* --- notes ---------------------------------------------------- */}
        <section className="card card-pad">
          <div className="section-title">
            <h2>Your notes</h2>
          </div>
          <form action={updateLeadNotes}>
            <input type="hidden" name="id" value={lead.id} />
            <div className="field">
              <label htmlFor="notes" className="sub">
                Anything from the call, or why you passed.
              </label>
              <textarea id="notes" name="notes" defaultValue={lead.notes ?? ''} />
            </div>
            <button type="submit" className="btn btn-secondary">
              Save notes
            </button>
          </form>
        </section>

        {/* --- convert -------------------------------------------------- */}
        {!lead.clientId && (
          <section className="card card-pad">
            <div className="section-title">
              <h2>Convert to client</h2>
            </div>
            <p className="sub" style={{ marginTop: 0 }}>
              Creates a client from these details and links the two. The package is
              taken from what they picked on the form where that&apos;s clear, and left
              unset otherwise. This lead stays here, so the original enquiry is never
              lost.
            </p>
            <form action={convertLeadToClient}>
              <input type="hidden" name="id" value={lead.id} />
              <button type="submit" className="btn btn-primary">
                Convert to client
              </button>
            </form>
          </section>
        )}

        {/* --- delete --------------------------------------------------- */}
        <section className="notice notice-bad">
          <div className="section-title" style={{ marginBottom: '0.5rem' }}>
            <strong>Delete this lead</strong>
            <div className="spacer" />
            <form action={deleteLead}>
              <input type="hidden" name="id" value={lead.id} />
              <button type="submit" className="btn btn-danger">
                Delete permanently
              </button>
            </form>
          </div>
          <p className="sub" style={{ margin: 0 }}>
            For spam only. Archiving keeps the record and is almost always what you
            want — the enquiry is also in the <code>info@</code> inbox either way.
          </p>
        </section>
      </div>
    </main>
  );
}
