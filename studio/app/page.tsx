import { db } from '@/lib/db';
import { CLIENT_STATUSES, PLANS, STAGE_LABELS, daysUntil, formatDate } from '@/lib/domain';

export const dynamic = 'force-dynamic';

function DueBadge({ due }: { due: Date | null }) {
  const days = daysUntil(due);
  if (days === null) return <span className="muted">—</span>;

  const tone = days < 0 ? 'bad' : days <= 3 ? 'warn' : 'neutral';
  const label =
    days < 0
      ? `${Math.abs(days)}d overdue`
      : days === 0
        ? 'Due today'
        : days === 1
          ? 'Due tomorrow'
          : `${days}d`;

  return <span className={`badge badge-${tone} badge-due`}>{label}</span>;
}

export default async function DashboardPage() {
  const clients = await db.client.findMany({
    include: { jobs: { orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }] } },
    orderBy: [{ status: 'asc' }, { businessName: 'asc' }],
  });

  const openJobs = clients
    .flatMap((client) => client.jobs.map((job) => ({ job, client })))
    .filter(({ job }) => job.stage !== 'DELIVERED')
    .sort((a, b) => {
      // Dated work first, soonest at the top; undated work sinks to the bottom
      // rather than being silently dropped.
      if (!a.job.dueDate && !b.job.dueDate) return 0;
      if (!a.job.dueDate) return 1;
      if (!b.job.dueDate) return -1;
      return a.job.dueDate.getTime() - b.job.dueDate.getTime();
    });

  const activeClients = clients.filter((c) => c.status === 'ACTIVE').length;
  const overdue = openJobs.filter(({ job }) => (daysUntil(job.dueDate) ?? 99) < 0).length;
  const videosInFlight = openJobs.reduce((sum, { job }) => sum + job.videoCount, 0);

  return (
    <main>
      <div className="page-head">
        <div>
          <p className="eyebrow">Back office</p>
          <h1>Clients</h1>
          <p>Everything in production, and who it belongs to.</p>
        </div>
        <div className="spacer" />
        <a href="/clients/new" className="btn btn-primary">
          Add client
        </a>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="n">{activeClients}</span>
          <span className="k">Active clients</span>
        </div>
        <div className="stat">
          <span className="n">{openJobs.length}</span>
          <span className="k">Jobs in flight</span>
        </div>
        <div className="stat">
          <span className="n">{videosInFlight}</span>
          <span className="k">Videos owed</span>
        </div>
        <div className="stat">
          <span className="n" style={{ color: overdue > 0 ? 'var(--red)' : undefined }}>
            {overdue}
          </span>
          <span className="k">Overdue</span>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="card empty">
          <h3>No clients yet.</h3>
          <p>
            Add the first one and its jobs will show up here. A job is one batch of
            work — a Starter order of 2 videos, or one of a Growth client&apos;s
            biweekly batches of 3.
          </p>
          <a href="/clients/new" className="btn btn-primary">
            Add your first client
          </a>
        </div>
      ) : (
        <div className="stack">
          {openJobs.length > 0 && (
            <section>
              <div className="section-title">
                <h2>In flight</h2>
                <span className="sub">{openJobs.length} open</span>
              </div>
              <div className="card table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Job</th>
                      <th>Client</th>
                      <th>Stage</th>
                      <th>Videos</th>
                      <th>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openJobs.map(({ job, client }) => (
                      <tr key={job.id}>
                        <td>
                          <a href={`/clients/${client.id}`} className="row-link">
                            {job.title}
                          </a>
                        </td>
                        <td className="sub">{client.businessName}</td>
                        <td>
                          <span className="badge badge-steel">{STAGE_LABELS[job.stage]}</span>
                        </td>
                        <td className="nowrap">{job.videoCount}</td>
                        <td className="nowrap">
                          <DueBadge due={job.dueDate} />{' '}
                          <span className="sub">{formatDate(job.dueDate)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section>
            <div className="section-title">
              <h2>All clients</h2>
              <span className="sub">{clients.length} total</span>
            </div>
            <div className="card table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Package</th>
                    <th>Status</th>
                    <th>Open jobs</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                    const open = client.jobs.filter((j) => j.stage !== 'DELIVERED').length;
                    const status = CLIENT_STATUSES[client.status];
                    return (
                      <tr key={client.id}>
                        <td>
                          <a href={`/clients/${client.id}`} className="row-link">
                            {client.businessName}
                          </a>
                          {client.location && <div className="sub">{client.location}</div>}
                        </td>
                        <td className="nowrap">
                          {client.plan ? (
                            <span className="badge badge-neutral">{PLANS[client.plan].label}</span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge badge-${status.tone}`}>{status.label}</span>
                        </td>
                        <td className="nowrap">{open > 0 ? open : <span className="muted">—</span>}</td>
                        <td className="sub">
                          {client.contactName}
                          {client.contactName && client.email && <br />}
                          {client.email}
                          {!client.contactName && !client.email && '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
