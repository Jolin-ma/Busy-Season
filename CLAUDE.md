# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

**LegacyLink Studio** — a small studio that produces AI-assisted video ads for home service businesses **and runs them** as Meta campaigns on the client's own ad account. Spec: `LegacyLink_Studio_Master_Build_Brief.md`, currently at **v2**, which supersedes v1 entirely.

| Project | Root | Port | Start command |
|---|---|---|---|
| Marketing site | `website/` | — | static HTML; open the files, no build step |
| Back office | `studio/` | 3001 | `npm install && npm run dev` — needs a database, see below |

`website/` has no `package.json`, no build step, and no `node_modules` — nothing needs to be running for the site to work. `studio/` is the opposite: Next.js + Prisma, with its own `package.json` and `node_modules`. It is **restored code that is not deployed and has no database**, so `npm run dev` needs a `.env` before it does anything useful. Read the back-office note below before touching it.

> **The v1 → v2 change that drives everything:** v1 sold video creative only while promising an outcome ("we get your phone ringing") that depended on distribution the studio wasn't touching. v2 closes that gap — the studio produces *and* runs the ads. Copy claiming "we only sell creative" is v1 and is wrong.

> **The custom back office (`studio/`) is back in the repo as of 2026-08-18 — but it is not deployed and has no database.** Clients, production pipeline, leads inbox; Next.js + Prisma. It was deleted on 2026-08-17 under **brief v2 §7, which is explicit that there is no custom admin build at launch** (pipeline and delivery go in one shared tracker instead), and the founder overruled that on 2026-08-18 and had the code restored from `8c16ec0^`. **§7's argument was never refuted — it was overruled**, so don't "fix" the repo back into agreement with the brief; the founder's call is the newer decision. The same disagreement already happened once, on 2026-08-16.
>
> **What exists vs. what doesn't**, because this is the easy thing to get wrong:
>
> | | State |
> |---|---|
> | `studio/` code | **restored**, installs, builds, typechecks clean |
> | Vercel project `legacylink-studio` | **gone** — deleted 2026-08-17, `legacylink-studio.vercel.app` 404s |
> | Neon database | **gone** — project `polished-sea-32397117`, endpoint `ep-red-salad-avqhvica`, reported deleted by the founder and never independently verifiable from this toolchain |
> | `LEAD_INGEST_URL` / `LEAD_INGEST_KEY` on the marketing project | **not set** — so the ingest post is skipped and leads arrive by email only |
>
> So the back office is code-only right now: nothing hosts it, nothing stores its data, and the quote form does not feed it. `studio/README.md` has a step-by-step **"Redeploying from scratch"** checklist covering the Neon project, the five Sensitive env vars, `prisma migrate deploy` (not `migrate dev` — there are already two migrations), and the two env vars that switch ingest on. Anything referencing `STUDIO_PASSWORD`, `STUDIO_SESSION_SECRET`, `LEAD_INGEST_URL`, `LEAD_INGEST_KEY`, Prisma, or Neon belongs to this app.

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

**Marketing site (`website/`)** has none — plain static HTML/CSS/JS, so open a file directly or serve the folder. See `website/progress.md` for the running build log and the founder decisions behind the copy.

**Back office (`studio/`)** — run from `studio/`:

| Command | What it does |
|---|---|
| `npm run dev` | dev server on port 3001 |
| `npm run build` | `prisma generate && next build` — works **without** a live database, because `lib/db.ts` constructs the client lazily |
| `npx prisma migrate deploy` | apply the existing migrations to a fresh database — use this, **not** `migrate dev`, which tries to author a new one |
| `npm run db:studio` | Prisma Studio GUI |

`npm audit` reports 3 high-severity advisories in `deepmerge-ts`, reached through the `prisma` CLI devDependency. **Do not run `npm audit fix --force`** — it downgrades Prisma to 6.12.0, which breaks the Prisma 7 driver adapter in `lib/db.ts`. Next.js itself is not affected.

## Architecture

### Marketing site (`website/`)

Static HTML, one page per route, sharing `styles.css` and `script.js`. The design system is brief §8; the copy tracks the pricing and positioning decisions in brief §2 — when those change, the figures on `index.html`, `pricing.html`, and `quote.html` all move together, and `website/progress.md` records why.

`terms.html` deliberately states money in **percentages, never dollar figures** ("50% of the first month's fee"), so repricing the packages never touches the legal text. Keep it that way — it has already paid off through one reprice.

The one dynamic piece is **`website/api/quote.js`**, the serverless function behind the quote form.

### The leads path

`website/api/quote.js` emails each lead to `info@` via Resend. **That email is the only record of a lead** — there is no database and no back office behind it. Leads get copied into the shared tracker by hand.

- The endpoint POSTs a best-effort copy to the back office's ingest API after a successful send. That code was removed on 2026-08-17 with the app and **restored on 2026-08-18**. It is inert until **both** `LEAD_INGEST_URL` and `LEAD_INGEST_KEY` are set on the marketing project, which they currently are not — so today the email really is the only record. The post is strictly secondary: it happens only after the email succeeds, every failure is logged and swallowed, and it has a 3s timeout so a hanging back office can't leave a visitor on a spinner. **Don't reorder that to make the database authoritative without first making the write reliable.**
- **Failure paths log the full lead payload** before returning 502. That is deliberate and load-bearing: with the email being the only record, the Vercel function log is the sole recovery path if Resend is down or the domain falls out of verification. Don't "clean up" those `console.error` calls to drop the payload.

## Production deployment

| App | Root Directory | Host | Domain |
|---|---|---|---|
| Marketing site (`website/`) | `website` | Vercel project `legacy-link` | `legacylinkstudio.com` |
| Back office (`studio/`) | `studio` | **no project — deleted 2026-08-17** | — |

- **Deploy by pushing to `main`.** The project is git-connected with Root Directory `website`, so a push builds it automatically.

- **DNS** is managed at Namecheap (not delegated to Vercel), so every subdomain needs a manual CNAME record added there, even though the apex domain is a Vercel project.
- **Vercel reads `vercel.json` from the project's Root Directory.** The marketing site's Root Directory is `website`, so its config is **`website/vercel.json`** — a redirect or header put anywhere else silently does nothing. This is easy to get wrong because the symptom is invisible: the site keeps serving correctly and only the routing config is ignored. A `/contact.html` → `/quote.html` redirect was once added to a repo-root file and 404'd in production despite a green deploy.
  - The repo-root `vercel.json` was deleted on 2026-08-16 after confirming Root Directory is `website`. Note the marketing project also has an **Output Directory override set to `website` in the Vercel dashboard**, independent of any file — don't be confused by it, and don't "fix" it while the site is working.
- **Any new Vercel subproject from this repo needs its own `vercel.json`** in its own Root Directory, for the same reason. Historically the repo-root config's `outputDirectory` was inherited by subprojects and 404'd every route despite a successful build, because Next.js builds into `.next`.
- **The marketing site is static except for `website/api/quote.js`.** Vercel zero-config picks up the `api/` directory under the Root Directory and builds it as a Node function — nothing in `website/vercel.json` declares it. It's deliberately **CommonJS with global `fetch` and no dependencies**, because `website/` has no `package.json` and adding one to pull in the Resend SDK would give the static site an install step for a single HTTP call. Adding a dependency here means adding a build step — reconsider first.
  - Env vars on the **marketing site's** Vercel project: **`RESEND_API_KEY`** is required — the function logs and 500s without it. **`LEAD_INBOX`** (default `info@legacylinkstudio.com`) and **`LEAD_FROM`** (default `leads@legacylinkstudio.com`) are optional overrides; `LEAD_FROM` must be on a Resend-verified domain or every send 422s. That is the whole set — `LEAD_INGEST_URL` / `LEAD_INGEST_KEY` belonged to the deleted back office and were removed from the project on 2026-08-17.
  - **Failure paths log the full lead payload** before returning 502. That's deliberate and load-bearing: it's the recovery path if Resend is down or the domain falls out of verification, so a lead is never silently lost. Don't "clean up" those `console.error` calls to drop the payload.
- **Vercel blocks deploys of pinned-vulnerable Next.js versions** ("Vulnerable version of Next.js detected") — not a build error; it appears as a deployment-level failure *above* the build log, easy to miss while scrolling. Nothing here uses Next.js today; this matters only if a framework project is ever added back.
