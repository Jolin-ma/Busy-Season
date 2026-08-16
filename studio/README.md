# Studio back office

Internal tool for the LegacyLink Studio video-ad business. Tracks clients and
where each piece of work sits in the production pipeline.

Spec: `LegacyLink_Studio_Master_Build_Brief.md` §5 (the six production steps)
and §7 (what the tracker needs to hold).

> §7 of the brief argues *against* building this at launch, in favour of a
> spreadsheet. The founder decided otherwise on 2026-08-16. Noting it here so
> the disagreement between the brief and the repo isn't mistaken for drift.

Nothing here is shared with the QR memorial product — separate database,
separate schema, separate app.

## Setup

### 1. Create a database

A new Neon project (or a new branch — **not** the QR product's database). You
need two connection strings from it:

- the **pooled** one (`...-pooler...`) for `DATABASE_URL`
- the **direct** one for `DIRECT_URL`

Migrations need the direct connection: they take advisory locks that PgBouncer
drops between statements, so running them through the pooler fails in ways that
look like random hangs.

### 2. Configure

```bash
cd studio
cp .env.example .env
```

Fill in all four values. For the session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`STUDIO_PASSWORD` is the single password that unlocks the tool. If either auth
variable is missing the login page says so and **nobody can sign in** — it fails
closed rather than open.

### 3. Install and create the tables

```bash
npm install
npm run db:migrate -- --name init   # first run only; creates the tables
npm run dev                         # http://localhost:3001
```

## Commands

```bash
npm run dev          # dev server on port 3001
npm run build        # prisma generate && next build
npm run start        # serve the production build
npm run db:migrate   # create + apply a migration (needs DIRECT_URL)
npm run db:push      # push schema with no migration history (dev shortcut)
npm run db:studio    # Prisma Studio GUI
npm run db:generate  # regenerate the client after schema edits
```

## How it's put together

| Path | What it does |
|---|---|
| `proxy.ts` | Auth gate on every route. **Default-deny** — the matcher excludes only the login page, the login endpoint, the lead ingest, and static assets, so a new page is protected without anyone remembering to protect it. Every exemption does its own auth. |
| `lib/auth.ts` | Password check, HMAC-signed session cookie, and the ingest-key check. Web Crypto throughout so the same code runs in the Edge proxy and in Node route handlers. |
| `lib/db.ts` | Prisma 7 driver adapter. Client construction is **lazy** so `next build` doesn't need a live database. |
| `lib/domain.ts` | Stage order, plan pricing, date helpers. The pricing here must match the marketing site. |
| `app/actions.ts` | Every mutation, as form actions — the whole tool works without client-side JS. |
| `app/api/leads/ingest` | Where the marketing site posts quote-form submissions. |
| `prisma/schema.prisma` | `Client`, `Job`, `Lead`. |

### Data model

A **Client** is a business. A **Job** is one batch of work for them — a Starter
order of 2 videos, or one of a Growth client's biweekly batches of 3. Jobs move
through the six stages from brief §5: Intake → Concept → Production → QA →
Client review → Delivered.

Video count per job is stored, not derived from the package, because spec ads
and one-off batches don't follow the standard sizes.

Deleting a client is a **hard** delete and cascades to its jobs — deliberately
unlike the QR product's soft-delete rule, since nothing here is engraved on a
physical object.

A **Lead** is an enquiry from the quote form, before it's a client. Converting
one creates a Client and links the two; the lead is kept so the original
enquiry text survives next to the client record.

## Leads: the email is still the system of record

`website/api/quote.js` emails every lead to `info@` and *then* posts a copy
here. That order is load-bearing:

- The post happens only after a successful send.
- Every failure of the post — 401, 500, timeout, network down — is logged and
  swallowed. The visitor still sees success, because their lead did arrive.
- With `LEAD_INGEST_URL` / `LEAD_INGEST_KEY` unset, the post is skipped
  entirely. That is the normal state until this app is deployed.

So **a lead missing from this table is possible, and is never proof nobody
enquired** — check the inbox. Don't invert the order to make the table
authoritative without also making the write reliable.

To turn it on, set the same secret in two places:

| Where | Variable |
|---|---|
| This app's Vercel project | `LEAD_INGEST_KEY` |
| **Marketing site's** Vercel project | `LEAD_INGEST_KEY`, plus `LEAD_INGEST_URL` pointing at `https://<this-app>/api/leads/ingest` |

`/api/leads/ingest` is exempt from the session gate — its caller is a
serverless function with no cookie — so it checks that shared secret itself,
and **fails closed**: unset key means every request is rejected.

## Deploying

**Live at https://legacylink-studio.vercel.app** — Vercel project
`legacylink-studio`, Root Directory `studio`, git-connected to this repo.

**Push to `main` and it deploys.** That's the only supported route.

> ⚠️ `vercel --prod` run from inside `studio/` **fails** with *"The specified
> Root Directory 'studio' does not exist"*. Nothing is broken: the CLI uploads
> `studio/` **as** the deployment root, so Vercel then looks for
> `studio/studio`. Root Directory and CLI-from-subdirectory are mutually
> exclusive. If you must deploy from the CLI, do it from the **repo root**.

All five env vars are set on the project as **Sensitive** (write-only):
`DATABASE_URL`, `DIRECT_URL`, `STUDIO_PASSWORD`, `STUDIO_SESSION_SECRET`,
`LEAD_INGEST_KEY`. Changing the session secret invalidates existing sessions,
which is how you force a sign-out everywhere.

`studio/vercel.json` is kept even though the repo-root `vercel.json` is gone —
any Vercel project built from this repo should pin its own framework/output
settings rather than inherit whatever lands at the root later.

To put it on a `legacylinkstudio.com` subdomain, add the CNAME manually at
Namecheap — DNS is not delegated to Vercel.

## Staged after this

Agreed scope, in order:

1. ~~**Clients + pipeline status**~~ — done.
2. ~~**Leads inbox**~~ — done. Needs the two env vars above to actually receive
   anything.
3. **Payments** — the deposit/balance split on Starter, and $500 + $500 + the
   recurring $1,000 on Growth, with what's outstanding.
4. **Growth batch scheduling** — biweekly batches of 3 with due dates, so a
   retainer never silently slips.
