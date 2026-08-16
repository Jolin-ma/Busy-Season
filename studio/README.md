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
| `proxy.ts` | Auth gate on every route. **Default-deny** — the matcher excludes only the login page, the login endpoint, and static assets, so a new page is protected without anyone remembering to protect it. |
| `lib/auth.ts` | Password check and HMAC-signed session cookie. Web Crypto throughout so the same code runs in the Edge proxy and in Node route handlers. |
| `lib/db.ts` | Prisma 7 driver adapter. Client construction is **lazy** so `next build` doesn't need a live database. |
| `lib/domain.ts` | Stage order, plan pricing, date helpers. The pricing here must match the marketing site. |
| `app/actions.ts` | Every mutation, as form actions — the whole tool works without client-side JS. |
| `prisma/schema.prisma` | `Client` and `Job`. |

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

## Deploying

A separate Vercel project, Root Directory `studio`.

`studio/vercel.json` exists specifically to override the repo-root
`vercel.json`'s `outputDirectory: website`. Without it every route 404s despite
a green build, because Next.js builds into `.next`, not `website`. This has
already bitten two previous subprojects in this repo — don't remove it.

Set `DATABASE_URL`, `DIRECT_URL`, `STUDIO_PASSWORD`, and
`STUDIO_SESSION_SECRET` on the Vercel project. Changing the session secret
invalidates existing sessions, which is the way to force a sign-out everywhere.

If it goes on a `legacylinkstudio.com` subdomain, the CNAME has to be added
manually at Namecheap — DNS is not delegated to Vercel.

## Staged after this

Agreed scope, in order:

1. **Clients + pipeline status** — this stage.
2. **Leads inbox** — quote-form submissions land here instead of only reaching
   `info@`. Means editing `website/api/quote.js` to POST alongside the Resend
   send, keeping the email as a fallback so a lead is never lost if the write
   fails.
3. **Payments** — the deposit/balance split on Starter, and $500 + $500 + the
   recurring $1,000 on Growth, with what's outstanding.
4. **Growth batch scheduling** — biweekly batches of 3 with due dates, so a
   retainer never silently slips.
