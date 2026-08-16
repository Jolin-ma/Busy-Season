# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

**LegacyLink Studio** — a small studio selling AI-produced video ads to roofing and home-service companies. Spec: `LegacyLink_Studio_Master_Build_Brief.md`.

| Project | Root | Port | Start command |
|---|---|---|---|
| Marketing site | `website/` | — | static HTML; open the files, no build step |
| Studio back office | `studio/` | 3001 | `npm run dev` (from inside `studio/`) |

Two independent projects. `studio/` has its own `package.json`; `website/` has none at all. There is no build step and no `node_modules` at the repo root, and nothing needs to be running for the marketing site to work.

> **A separate QR-memorial product used to live here** (`src/`, `client/`, `prisma/`, `lambda/`, `infra/`, plus two Next.js front-ends in `admin/` and `ops-dashboard/`). The founder retired that concept. All of its code was deleted on 2026-08-16, and its two Vercel projects (`legacy-link-admin`, `legacy-link-dashboard`) were deleted the same day. Recover from git history if ever needed — but treat it as gone, not dormant. Anything in an old commit referencing `short_id`, plaques, profiles, guestbooks, or `OPS_API_KEY` belongs to that product and not to this business.
>
> **Railway is gone too** — the trial ended, so the Fastify API is no longer served. `api.legacylinkstudio.com` and the underlying `*.up.railway.app` host both answer 404 as of 2026-08-16, which closes the unauthenticated `/admin/*` exposure that API used to carry.
>
> **DNS is cleaned up too.** The four dead records (`CNAME app`, `CNAME ops`, `CNAME api`, `TXT _railway-verify.api`) were removed from Namecheap on 2026-08-16 and confirmed gone against the authoritative nameserver. Nothing from the retired product is left running anywhere.

**The DNS zone for `legacylinkstudio.com` now holds only records that matter — do not remove any of them:**

| Record | Why it exists |
|---|---|
| `A @` → `216.198.79.1`, `CNAME www` | the marketing site on Vercel |
| `MX @` ×3 → `*.zohocloud.ca` | the `info@` inbox |
| `TXT @` (zoho-verification + `v=spf1 include:zohocloud.ca`), `TXT zmail._domainkey`, `TXT _dmarc` | Zoho mail auth |
| `TXT resend._domainkey`, `TXT send` (`v=spf1 include:amazonses.com`), `MX send` | **Resend — this is what delivers quote-form leads.** Breaking these silently kills the lead path. |

Note Zoho is on **Canada-region** infrastructure (`zohocloud.ca`, not the generic `mx.zoho.com`), which most setup guides get wrong for this account.

## Commands

**Studio back office (`studio/`)**
```bash
npm run dev          # Next.js dev server on port 3001
npm run build        # prisma generate && next build
npm run db:migrate   # create + apply a migration (needs DIRECT_URL)
npm run db:studio    # Prisma Studio GUI
npm run db:generate  # regenerate the client after schema edits
```
Full setup and deploy steps: `studio/README.md`.

**Marketing site (`website/`)** — plain static HTML/CSS/JS. Open a file directly or serve the folder. See `website/progress.md` for the running build log and the founder decisions behind the copy.

## Architecture

### Marketing site (`website/`)

Static HTML, one page per route, sharing `styles.css` and `script.js`. The design system is brief §8; the copy tracks the pricing and positioning decisions in brief §2 — when those change, the figures on `index.html`, `pricing.html`, and `quote.html` all move together, and `website/progress.md` records why.

`terms.html` deliberately states money in **percentages, never dollar figures** ("50% of the first month's fee"), so repricing the packages never touches the legal text. Keep it that way — it has already paid off through one reprice.

The one dynamic piece is **`website/api/quote.js`**, the serverless function behind the quote form.

### Studio back office (`studio/`)

Next.js App Router + Prisma 7 against a Neon Postgres database (`legacylink-studio`, branch `production`, AWS us-east-1 — chosen to match Vercel's default `iad1` function region, since every page render is a DB round trip).

- **`studio/proxy.ts`** — the auth gate, Next 16's rename of `middleware`. **Default-deny**: the matcher excludes only `/login`, the login endpoint, `/api/leads/ingest`, and static assets, so any page added later is protected without anyone remembering to protect it. **Every exemption must do its own auth.**
- **Auth is a single shared password** (`STUDIO_PASSWORD`) plus an HMAC-signed cookie (`STUDIO_SESSION_SECRET`). It **fails closed** — if either env var is unset nobody can sign in. There is no per-user identity, so it cannot tell two people apart; replace it rather than sharing the password if a second person needs access.
- **`studio/lib/db.ts` constructs Prisma lazily**, behind a proxy. `next build` evaluates page modules to collect config, so an eager client (or an eager throw on a missing `DATABASE_URL`) makes the build require a live database. Keep it lazy.
- **`studio/lib/domain.ts` holds the pricing figures**, which must agree with the marketing site and the brief. Change the brief first, then the site, then here.
- All mutations are **form actions** (`studio/app/actions.ts`) — the tool works with client-side JS disabled.
- Deleting a client is a **hard** delete that cascades to its jobs.

**Data model.** A `Client` is a business; a `Job` is one batch of work (a Starter order of 2 videos, or one Growth biweekly batch of 3), moving through the six stages from brief §5; a `Lead` is an enquiry from the quote form, before it's a client. Video count is stored per job rather than derived from the package, because spec ads and one-offs break the standard sizes.

### The leads path crosses both projects

`website/api/quote.js` emails a lead to `info@` and **then** posts a copy to studio's `/api/leads/ingest`. The order is load-bearing and easy to break:

- **The email is the system of record.** The ingest post happens only after a successful send, and every failure of it — 401, 500, timeout, network down — is logged and swallowed so the visitor still sees success. Their lead did arrive; it just arrived by email only.
- **Unset `LEAD_INGEST_URL`/`LEAD_INGEST_KEY` skips the post entirely**, which is the state until the back office is deployed. The quote form is unaffected.
- Therefore **a lead missing from the `leads` table is never proof nobody enquired.** Check the inbox. Don't make the table authoritative without first making the write reliable.
- The same `LEAD_INGEST_KEY` value goes on **two** Vercel projects: the marketing site (which sends it) and studio (which checks it).

## Production deployment

| App | Root Directory | Host | Domain |
|---|---|---|---|
| Marketing site (`website/`) | `website` | Vercel project `legacy-link` | `legacylinkstudio.com` |
| Studio back office (`studio/`) | `studio` (own `studio/vercel.json`) | Vercel project `legacylink-studio` | `legacylink-studio.vercel.app` |

- **Deploy the back office by pushing to `main`.** The project is git-connected with Root Directory `studio`, so a push builds it automatically — same as the marketing site.
- ⚠️ **`vercel --prod` from inside `studio/` now FAILS**, with *"The specified Root Directory 'studio' does not exist"*. That's not a broken project: the CLI uploads `studio/` **as** the deployment root, so Vercel then looks for `studio/studio`. The two ways to deploy are mutually exclusive, and git-connected is the one this project uses. If you ever need a CLI deploy, run it from the **repo root**, not from `studio/`.

- **DNS** is managed at Namecheap (not delegated to Vercel), so every subdomain needs a manual CNAME record added there, even though the apex domain is a Vercel project.
- **Vercel reads `vercel.json` from the project's Root Directory.** The marketing site's Root Directory is `website`, so its config is **`website/vercel.json`** — a redirect or header put anywhere else silently does nothing. This is easy to get wrong because the symptom is invisible: the site keeps serving correctly and only the routing config is ignored. A `/contact.html` → `/quote.html` redirect was once added to a repo-root file and 404'd in production despite a green deploy.
  - The repo-root `vercel.json` was deleted on 2026-08-16 after confirming Root Directory is `website`. Note the marketing project also has an **Output Directory override set to `website` in the Vercel dashboard**, independent of any file — don't be confused by it, and don't "fix" it while the site is working.
- **Any new Vercel subproject from this repo needs its own `vercel.json`.** `studio/vercel.json` exists for this reason. Historically the repo-root config's `outputDirectory` was inherited by subprojects and 404'd every route despite a successful build, because Next.js builds into `.next`.
- **The marketing site is static except for `website/api/quote.js`.** Vercel zero-config picks up the `api/` directory under the Root Directory and builds it as a Node function — nothing in `website/vercel.json` declares it. It's deliberately **CommonJS with global `fetch` and no dependencies**, because `website/` has no `package.json` and adding one to pull in the Resend SDK would give the static site an install step for a single HTTP call. Adding a dependency here means adding a build step — reconsider first.
  - Env vars on the **marketing site's** Vercel project: **`RESEND_API_KEY`** is required — the function logs and 500s without it. **`LEAD_INBOX`** (default `info@legacylinkstudio.com`) and **`LEAD_FROM`** (default `leads@legacylinkstudio.com`) are optional overrides; `LEAD_FROM` must be on a Resend-verified domain or every send 422s. **`LEAD_INGEST_URL`** / **`LEAD_INGEST_KEY`** are optional and enable the back-office copy.
  - **Failure paths log the full lead payload** before returning 502. That's deliberate and load-bearing: it's the recovery path if Resend is down or the domain falls out of verification, so a lead is never silently lost. Don't "clean up" those `console.error` calls to drop the payload.
- **Vercel blocks deploys of pinned-vulnerable Next.js versions** ("Vulnerable version of Next.js detected") — not a build error; it appears as a deployment-level failure *above* the build log, easy to miss while scrolling. Check `npm view next versions` for the latest patch on the same major before bumping.
- **`pg` deprecation to know about:** the driver warns that `sslmode=require` is currently treated as `verify-full`, and will adopt weaker libpq semantics in `pg` v9. Neon's connection strings use `sslmode=require`. On any major `pg` bump, make it `sslmode=verify-full` explicitly or the check silently weakens.
