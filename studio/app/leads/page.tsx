import { db } from '@/lib/db';
import { LEAD_STATUSES, formatDate } from '@/lib/domain';

export const dynamic = 'force-dynamic';

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const { show } = await searchParams;
  // Archived and converted leads are hidden by default — the inbox is meant to
  // be a list of things still needing a reply, not an archive to scroll past.
  const showAll = show === 'all';

  const leads = await db.lead.findMany({
    where: showAll ? {} : { status: { in: ['NEW', 'CONTACTED'] } },
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { id: true, businessName: true } } },
  });

  const newCount = await db.lead.count({ where: { status: 'NEW' } });

  return (
    <main>
      <div className="page-head">
        <div>
          <p className="eyebrow">Back office</p>
          <h1>Leads</h1>
          <p>Enquiries from the quote form on the marketing site.</p>
        </div>
        <div className="spacer" />
        <a href={showAll ? '/leads' : '/leads?show=all'} className="btn btn-secondary">
          {showAll ? 'Show open only' : 'Show all'}
        </a>
      </div>

      {newCount > 0 && (
        <div className="notice notice-warn" style={{ marginBottom: '1.5rem' }}>
          <strong>
            {newCount} new {newCount === 1 ? 'lead' : 'leads'}
          </strong>{' '}
          waiting on a first reply.
        </div>
      )}

      {leads.length === 0 ? (
        <div className="card empty">
          <h3>{showAll ? 'No leads yet.' : 'Nothing waiting.'}</h3>
          <p>
            {showAll
              ? 'Quote-form submissions will appear here once the marketing site is configured to forward them.'
              : 'Every lead has been dealt with. Converted and archived ones are still here under “Show all”.'}
          </p>
          {!showAll && (
            <a href="/leads?show=all" className="btn btn-secondary">
              Show all
            </a>
          )}
        </div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Contact</th>
                <th>Interested in</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const status = LEAD_STATUSES[lead.status];
                return (
                  <tr key={lead.id}>
                    <td>
                      <a href={`/leads/${lead.id}`} className="row-link">
                        {lead.business}
                      </a>
                      {(lead.service ?? lead.location) && (
                        <div className="sub">{lead.service ?? lead.location}</div>
                      )}
                    </td>
                    <td className="sub">
                      {lead.name}
                      <br />
                      {lead.email}
                    </td>
                    <td className="sub">{lead.packageInterest ?? '—'}</td>
                    <td>
                      <span className={`badge badge-${status.tone}`}>{status.label}</span>
                      {lead.client && (
                        <div className="sub" style={{ marginTop: '0.25rem' }}>
                          <a href={`/clients/${lead.client.id}`}>{lead.client.businessName}</a>
                        </div>
                      )}
                    </td>
                    <td className="sub nowrap">{formatDate(lead.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
