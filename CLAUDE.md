# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

**LegacyLink Studio** — a small studio that produces AI-assisted video ads for home service businesses **and runs them** as Meta campaigns on the client's own ad account. Spec: `LegacyLink_Studio_Master_Build_Brief.md`, currently at **v2**, which supersedes v1 entirely.

| Project | Root | Port | Start command |
|---|---|---|---|
| Marketing site | `website/` | — | static HTML; open the files, no build step |

That is the entire repo. `website/` has no `package.json`, there is no build step and no `node_modules` anywhere, and nothing needs to be running for the site to work.

> **The v1 → v2 change that drives everything:** v1 sold video creative only while promising an outcome ("we get your phone ringing") that depended on distribution the studio wasn't touching. v2 closes that gap — the studio produces *and* runs the ads. Copy claiming "we only sell creative" is v1 and is wrong.

> **A custom back office (`studio/`) used to live here** — clients, production pipeline, leads inbox; Next.js + Prisma against a Neon Postgres database, deployed to `legacylink-studio.vercel.app`. **The code and the Vercel project are gone as of 2026-08-17** — `legacylink-studio.vercel.app` answers 404 (`DEPLOYMENT_NOT_FOUND`), confirmed. **The Neon database still exists** (project `polished-sea-32397117`, endpoint `ep-red-salad-avqhvica`) and is still to be deleted; it is empty and nothing connects to it. It was removed because **brief v2 §7 is explicit that there is no custom admin build at launch**: pipeline and delivery go in one shared tracker (spreadsheet, Notion, or Airtable) instead. Recover from git history if ever wanted, but don't rebuild it without re-reading §7 — the whole point is that a bespoke admin solves a problem one person with a handful of clients doesn't have. Anything referencing `STUDIO_PASSWORD`, `STUDIO_SESSION_SECRET`, `LEAD_INGEST_URL`, `LEAD_INGEST_KEY`, Prisma, or Neon belongs to it.

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

There are none. **Marketing site (`website/`)** is plain static HTML/CSS/JS — open a file directly or serve the folder. See `website/progress.md` for the running build log and the founder decisions behind the copy.

## Architecture

### Marketing site (`website/`)

Static HTML, one page per route, sharing `styles.css` and `script.js`. The design system is brief §8; the copy tracks the pricing and positioning decisions in brief §2 — when those change, the figures on `index.html`, `pricing.html`, and `quote.html` all move together, and `website/progress.md` records why.

`terms.html` deliberately states money in **percentages, never dollar figures** ("50% of the first month's fee"), so repricing the packages never touches the legal text. Keep it that way — it has already paid off through one reprice.

The one dynamic piece is **`website/api/quote.js`**, the serverless function behind the quote form.

### The leads path

`website/api/quote.js` emails each lead to `info@` via Resend. **That email is the only record of a lead** — there is no database and no back office behind it. Leads get copied into the shared tracker by hand.

- The endpoint used to also POST a copy to the back office's ingest API. That code was removed on 2026-08-17 along with the app. **`LEAD_INGEST_URL` and `LEAD_INGEST_KEY` are dead variables** — nothing reads them; delete them from the Vercel project rather than leaving them to look meaningful.
- **Failure paths log the full lead payload** before returning 502. That is deliberate and load-bearing: with the email being the only record, the Vercel function log is the sole recovery path if Resend is down or the domain falls out of verification. Don't "clean up" those `console.error` calls to drop the payload.

## Production deployment

| App | Root Directory | Host | Domain |
|---|---|---|---|
| Marketing site (`website/`) | `website` | Vercel project `legacy-link` | `legacylinkstudio.com` |

- **Deploy by pushing to `main`.** The project is git-connected with Root Directory `website`, so a push builds it automatically.

- **DNS** is managed at Namecheap (not delegated to Vercel), so every subdomain needs a manual CNAME record added there, even though the apex domain is a Vercel project.
- **Vercel reads `vercel.json` from the project's Root Directory.** The marketing site's Root Directory is `website`, so its config is **`website/vercel.json`** — a redirect or header put anywhere else silently does nothing. This is easy to get wrong because the symptom is invisible: the site keeps serving correctly and only the routing config is ignored. A `/contact.html` → `/quote.html` redirect was once added to a repo-root file and 404'd in production despite a green deploy.
  - The repo-root `vercel.json` was deleted on 2026-08-16 after confirming Root Directory is `website`. Note the marketing project also has an **Output Directory override set to `website` in the Vercel dashboard**, independent of any file — don't be confused by it, and don't "fix" it while the site is working.
- **Any new Vercel subproject from this repo needs its own `vercel.json`** in its own Root Directory, for the same reason. Historically the repo-root config's `outputDirectory` was inherited by subprojects and 404'd every route despite a successful build, because Next.js builds into `.next`.
- **The marketing site is static except for `website/api/quote.js`.** Vercel zero-config picks up the `api/` directory under the Root Directory and builds it as a Node function — nothing in `website/vercel.json` declares it. It's deliberately **CommonJS with global `fetch` and no dependencies**, because `website/` has no `package.json` and adding one to pull in the Resend SDK would give the static site an install step for a single HTTP call. Adding a dependency here means adding a build step — reconsider first.
  - Env vars on the **marketing site's** Vercel project: **`RESEND_API_KEY`** is required — the function logs and 500s without it. **`LEAD_INBOX`** (default `info@legacylinkstudio.com`) and **`LEAD_FROM`** (default `leads@legacylinkstudio.com`) are optional overrides; `LEAD_FROM` must be on a Resend-verified domain or every send 422s. **`LEAD_INGEST_URL`** / **`LEAD_INGEST_KEY`** are left over from the deleted back office and are read by nothing — remove them.
  - **Failure paths log the full lead payload** before returning 502. That's deliberate and load-bearing: it's the recovery path if Resend is down or the domain falls out of verification, so a lead is never silently lost. Don't "clean up" those `console.error` calls to drop the payload.
- **Vercel blocks deploys of pinned-vulnerable Next.js versions** ("Vulnerable version of Next.js detected") — not a build error; it appears as a deployment-level failure *above* the build log, easy to miss while scrolling. Nothing here uses Next.js today; this matters only if a framework project is ever added back.
