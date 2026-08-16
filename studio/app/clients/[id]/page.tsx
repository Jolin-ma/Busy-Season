import { notFound } from 'next/navigation';
import type { Job } from '@prisma/client';
import { db } from '@/lib/db';
import { createJob, deleteClient, deleteJob, setJobStage, updateClient } from '@/app/actions';
import { ClientForm } from '@/components/ClientForm';
import {
  CLIENT_STATUSES,
  PLANS,
  STAGES,
  daysUntil,
  defaultVideoCount,
  formatDate,
  stageIndex,
} from '@/lib/domain';

export const dynamic = 'force-dynamic';

/**
 * The six production steps as clickable buttons. Each is its own form post, so
 * moving a job forward (or back, after a mis-click) is one click and needs no
 * client-side JavaScript.
 */
function StageStepper({ job }: { job: Job }) {
  const current = stageIndex(job.stage);

  return (
    <div className="stages">
      {STAGES.map((stage, index) => (
        <form key={stage.value} action={setJobStage}>
          <input type="hidden" name="id" value={job.id} />
          <input type="hidden" name="clientId" value={job.clientId} />
          <input type="hidden" name="stage" value={stage.value} />
          <button
            type="submit"
            className="stage-step"
            style={{ width: '100%' }}
            data-state={index === current ? 'current' : index < current ? 'done' : 'todo'}
            title={stage.hint}
            aria-current={index === current ? 'step' : undefined}
          >
            {stage.label}
          </button>
        </form>
      ))}
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const days = daysUntil(job.dueDate);
  const overdue = job.stage !== 'DELIVERED' && days !== null && days < 0;

  return (
    <div className="card card-pad">
      <div className="section-title">
        <div>
          <h3>{job.title}</h3>
          <p className="sub" style={{ margin: '0.25rem 0 0' }}>
            {job.videoCount} video{job.videoCount === 1 ? '' : 's'}
            {' · '}
            {job.stage === 'DELIVERED' ? (
              <>Delivered {formatDate(job.deliveredAt)}</>
            ) : job.dueDate ? (
              <span style={{ color: overdue ? 'var(--red)' : undefined, fontWeight: overdue ? 600 : 400 }}>
                Due {formatDate(job.dueDate)}
                {overdue && ` · ${Math.abs(days)}d overdue`}
              </span>
            ) : (
              'No due date'
            )}
          </p>
        </div>
        <div className="spacer" />
        <form action={deleteJob}>
          <input type="hidden" name="id" value={job.id} />
          <input type="hidden" name="clientId" value={job.clientId} />
          <button type="submit" className="btn btn-danger">
            Delete
          </button>
        </form>
      </div>

      <StageStepper job={job} />
      <p className="stage-hint">{STAGES[stageIndex(job.stage)]?.hint}</p>

      {job.notes && (
        <>
          <hr className="divider" />
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{job.notes}</p>
        </>
      )}
    </div>
  );
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await db.client.findUnique({
    where: { id },
    include: { jobs: { orderBy: [{ createdAt: 'desc' }] } },
  });

  if (!client) notFound();

  const open = client.jobs.filter((j) => j.stage !== 'DELIVERED');
  const delivered = client.jobs.filter((j) => j.stage === 'DELIVERED');
  const status = CLIENT_STATUSES[client.status];

  return (
    <main>
      <div className="page-head">
        <div>
          <p className="eyebrow">
            <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              ← Clients
            </a>
          </p>
          <h1>{client.businessName}</h1>
          <p>
            <span className={`badge badge-${status.tone}`}>{status.label}</span>{' '}
            {client.plan && (
              <span className="badge badge-neutral">
                {PLANS[client.plan].label} — {PLANS[client.plan].summary}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="stack">
        {/* --- contact -------------------------------------------------- */}
        <section className="card card-pad">
          <div className="section-title">
            <h2>Details</h2>
          </div>
          <div className="grid-2">
            <div>
              <p className="sub" style={{ margin: 0 }}>
                Contact
              </p>
              <p style={{ margin: '0.125rem 0 0.75rem' }}>{client.contactName ?? '—'}</p>

              <p className="sub" style={{ margin: 0 }}>
                Email
              </p>
              <p style={{ margin: '0.125rem 0 0.75rem' }}>
                {client.email ? <a href={`mailto:${client.email}`}>{client.email}</a> : '—'}
              </p>
            </div>
            <div>
              <p className="sub" style={{ margin: 0 }}>
                Phone
              </p>
              <p style={{ margin: '0.125rem 0 0.75rem' }}>
                {client.phone ? <a href={`tel:${client.phone}`}>{client.phone}</a> : '—'}
              </p>

              <p className="sub" style={{ margin: 0 }}>
                Location
              </p>
              <p style={{ margin: '0.125rem 0 0.75rem' }}>{client.location ?? '—'}</p>
            </div>
          </div>

          {client.notes && (
            <>
              <hr className="divider" />
              <p className="sub" style={{ margin: 0 }}>
                Notes
              </p>
              <p style={{ margin: '0.25rem 0 0', whiteSpace: 'pre-wrap' }}>{client.notes}</p>
            </>
          )}

          <hr className="divider" />
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem' }}>
              Edit details
            </summary>
            <div style={{ marginTop: '1.25rem' }}>
              <ClientForm action={updateClient} client={client} submitLabel="Save changes" />
            </div>
          </details>
        </section>

        {/* --- jobs ----------------------------------------------------- */}
        <section>
          <div className="section-title">
            <h2>Jobs</h2>
            <span className="sub">
              {open.length} open{delivered.length > 0 && `, ${delivered.length} delivered`}
            </span>
          </div>

          <div className="stack">
            {client.jobs.length === 0 && (
              <div className="card empty">
                <h3>No jobs yet.</h3>
                <p>
                  A job is one batch of work — a Starter order of 2 videos, or one of a
                  Growth client&apos;s biweekly batches of 3.
                </p>
              </div>
            )}

            {open.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}

            {delivered.length > 0 && (
              <details>
                <summary
                  style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', padding: '0.5rem 0' }}
                >
                  {delivered.length} delivered job{delivered.length === 1 ? '' : 's'}
                </summary>
                <div className="stack" style={{ marginTop: '1rem' }}>
                  {delivered.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </details>
            )}
          </div>
        </section>

        {/* --- add a job ------------------------------------------------ */}
        <section className="card card-pad">
          <div className="section-title">
            <h2>Add a job</h2>
          </div>
          <form action={createJob}>
            <input type="hidden" name="clientId" value={client.id} />
            <div className="field-row">
              <div className="field">
                <label htmlFor="title">What is it?</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder={client.plan === 'GROWTH' ? 'March — batch 1' : 'Starter batch'}
                />
              </div>
              <div className="field">
                <label htmlFor="videoCount">Videos</label>
                <input
                  id="videoCount"
                  name="videoCount"
                  type="number"
                  min={1}
                  max={99}
                  defaultValue={defaultVideoCount(client.plan)}
                />
              </div>
              <div className="field">
                <label htmlFor="dueDate">
                  Due <span className="hint">(optional)</span>
                </label>
                <input id="dueDate" name="dueDate" type="date" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="jobNotes">
                Notes <span className="hint">(the angle, the offer, anything to remember)</span>
              </label>
              <textarea id="jobNotes" name="notes" />
            </div>
            <button type="submit" className="btn btn-primary">
              Add job
            </button>
          </form>
        </section>

        {/* --- danger zone ---------------------------------------------- */}
        <section className="notice notice-bad">
          <div className="section-title" style={{ marginBottom: '0.5rem' }}>
            <strong>Delete this client</strong>
            <div className="spacer" />
            <form action={deleteClient}>
              <input type="hidden" name="id" value={client.id} />
              <button type="submit" className="btn btn-danger">
                Delete permanently
              </button>
            </form>
          </div>
          <p className="sub" style={{ margin: 0 }}>
            Removes {client.businessName} and all {client.jobs.length} of its jobs. This cannot be
            undone.
          </p>
        </section>
      </div>
    </main>
  );
}
