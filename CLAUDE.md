# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Removed 2026-10-02: the back office (`studio/`) and the Simplified Chinese pages (`_parked/zh-hans/`).** Both were deleted at the founder's request. Lead tracking will move to a Formspree form instead of a custom app. The `/zh/*` → `/` redirects in `website/vercel.json` stay so old links don't 404. Recover either from git history if ever needed, but treat both as gone. Still to do outside the repo: delete the `busyseason-studio` Vercel project and Neon database, and remove the `LEAD_INGEST_URL` / `LEAD_INGEST_KEY` env vars from the `busyseason` Vercel project.

## What this repo is

**Busy Season** — a small studio that produces AI-assisted video ads for home service businesses **and launches them** as a Meta campaign on the client's own ad account (ongoing management is quoted case by case, not a published offer). Spec: `BusySeason_Master_Build_Brief_v3.md`, currently at **v3** — it dropped the $1,500/mo Growth plan. Paid offers are a $250 Single Video (paid on delivery, no ad-account access) and the $750 Launch Pack; recommended ad spend is $200–300, ≈ $1,000 all in (changed 2026-09-18, see the note at the top of the brief). It supersedes v2 and v1 entirely.

> **Renamed from LegacyLink Studio, 2026-08-21 — migration to Busy Season / `busyseason.ca` is complete.** The founder reversed the 2026-08-17 decision to keep the old name (brief §0/§11). `legacylinkstudio.com` is being **fully retired, not redirected**. Everything below is done:
> - **DNS/Zoho/Resend**: `busyseason.ca` registered at Namecheap; A/CNAME records point it at Vercel; Zoho Mail domain added with MX, SPF, and DKIM all **verified**; Resend domain **verified** (so `LEAD_FROM`/`LEAD_INBOX` defaulting to `@busyseason.ca` in `website/api/quote.js` is safe to run in production).
> - **Vercel renames**: marketing project `legacy-link` → `busyseason`; back office project `legacylink-studio` → `busyseason-studio` (back office since removed). Neither rename changed the project's attached domains/hostnames (Vercel carries those over), so no env vars needed updating.
> - **Neon rename**: back office database project `legacylink-studio` → `busyseason-studio` (id `late-voice-91531833`; back office since removed).
> - **GitHub rename**: repo `Jolin-ma/Legacy-Link` → `Jolin-ma/Busy-Season`; local `origin` remote updated to match.
> - **Code pushed**: commit `f7b1b69` rebranding the repo is on `main` and deployed.
>
> **`legacylinkstudio.com`'s DNS was fully decommissioned at Namecheap on 2026-08-24** — every record (A/CNAME, all TXT, all MX) was deleted and Mail Settings switched to "No Email Service." The domain now resolves nothing and receives no mail; `info@legacylinkstudio.com` no longer works even though the alias still exists inside Zoho, because there's no MX to route to it. `busyseason.ca`'s own DNS is a separate zone and is unaffected. See `website/progress.md`'s 2026-08-24 entry for the full record list and why the last MX record needed the Mail Settings mode switched instead of a direct delete.

| Project | Root | Port | Start command |
|---|---|---|---|
| Marketing site | `website/` | — | static HTML; open the files, no build step |

`website/` has no `package.json`, no build step, and no `node_modules` — nothing needs to be running for the site to work.

> **The v1 → v2 change that drives everything:** v1 sold video creative only while promising an outcome ("we get your phone ringing") that depended on distribution the studio wasn't touching. v2 closes that gap — the studio produces *and* runs the ads. Copy claiming "we only sell creative" is v1 and is wrong.

> **A separate QR-memorial product used to live here** (`src/`, `client/`, `prisma/`, `lambda/`, `infra/`, plus two Next.js front-ends in `admin/` and `ops-dashboard/`). The founder retired that concept. All of its code was deleted on 2026-08-16, and its two Vercel projects (`legacy-link-admin`, `legacy-link-dashboard`) were deleted the same day. Recover from git history if ever needed — but treat it as gone, not dormant. Anything in an old commit referencing `short_id`, plaques, profiles, guestbooks, or `OPS_API_KEY` belongs to that product and not to this business.
>
> **Railway is gone too** — the trial ended, so the Fastify API is no longer served. `api.legacylinkstudio.com` and the underlying `*.up.railway.app` host both answer 404 as of 2026-08-16, which closes the unauthenticated `/admin/*` exposure that API used to carry.
>
> **DNS is cleaned up too.** The four dead records (`CNAME app`, `CNAME ops`, `CNAME api`, `TXT _railway-verify.api`) were removed from Namecheap on 2026-08-16 and confirmed gone against the authoritative nameserver. Nothing from the retired product is left running anywhere.

**`legacylinkstudio.com`'s DNS zone is empty — decommissioned 2026-08-24.** It used to hold the marketing site's `A @`/`CNAME www`, three Zoho `MX @` records for the `info@` inbox, Zoho mail-auth TXT records, and Resend TXT/MX records. All of it is gone; do not assume any of it still routes anything. Production mail and lead delivery run on `busyseason.ca`'s own DNS zone, which was untouched by this.

Zoho itself is on **Canada-region** infrastructure (`zohocloud.ca`, not the generic `mx.zoho.com`), which most setup guides get wrong for this account — relevant if `busyseason.ca`'s Zoho records ever need reconstructing.

## Commands

**Marketing site (`website/`)** has none — plain static HTML/CSS/JS, so open a file directly or serve the folder. See `website/progress.md` for the running build log and the founder decisions behind the copy.

## Architecture

### Marketing site (`website/`)

Static HTML, one page per route, sharing `styles.css` and `script.js`. The design system is brief §8; the copy tracks the pricing and positioning decisions in brief §2 — when those change, the figures on `index.html`, `pricing.html`, and `quote.html` all move together, and `website/progress.md` records why.

`terms.html` deliberately states money in **percentages, never dollar figures** ("50% of the first month's fee"), so repricing the packages never touches the legal text. Keep it that way — it has already paid off through one reprice.

The one dynamic piece is **`website/api/quote.js`**, the serverless function behind the quote form.

### The leads path

`website/api/quote.js` emails each lead to `info@` via Resend. **The email is the only record.**

- **Failure paths log the full lead payload** before returning 502. That is deliberate and load-bearing: with the email being the only record, the Vercel function log is the sole recovery path if Resend is down or the domain falls out of verification. Don't "clean up" those `console.error` calls to drop the payload.

## Production deployment

| App | Root Directory | Host | Domain |
|---|---|---|---|
| Marketing site (`website/`) | `website` | Vercel project `busyseason` (renamed 2026-08-21, was `legacy-link`) | `legacylinkstudio.com` (also serving `busyseason.ca`) |

- **Deploy by pushing to `main`.** The project is git-connected with Root Directory `website`, so a push builds it automatically.

- **DNS** is managed at Namecheap (not delegated to Vercel), so every subdomain needs a manual CNAME record added there, even though the apex domain is a Vercel project.
- **Vercel reads `vercel.json` from the project's Root Directory.** The marketing site's Root Directory is `website`, so its config is **`website/vercel.json`** — a redirect or header put anywhere else silently does nothing. This is easy to get wrong because the symptom is invisible: the site keeps serving correctly and only the routing config is ignored. A `/contact.html` → `/quote.html` redirect was once added to a repo-root file and 404'd in production despite a green deploy.
  - The repo-root `vercel.json` was deleted on 2026-08-16 after confirming Root Directory is `website`. Note the marketing project also has an **Output Directory override set to `website` in the Vercel dashboard**, independent of any file — don't be confused by it, and don't "fix" it while the site is working.
- **Any new Vercel subproject from this repo needs its own `vercel.json`** in its own Root Directory, for the same reason. Historically the repo-root config's `outputDirectory` was inherited by subprojects and 404'd every route despite a successful build, because Next.js builds into `.next`.
- **The marketing site is static except for `website/api/quote.js`.** Vercel zero-config picks up the `api/` directory under the Root Directory and builds it as a Node function — nothing in `website/vercel.json` declares it. It's deliberately **CommonJS with global `fetch` and no dependencies**, because `website/` has no `package.json` and adding one to pull in the Resend SDK would give the static site an install step for a single HTTP call. Adding a dependency here means adding a build step — reconsider first.
  - Env vars on the **marketing site's** Vercel project: **`RESEND_API_KEY`** is required — the function logs and 500s without it. **This key is domain-restricted in Resend, not just permission-scoped** — it was rotated on 2026-08-24 to a `Sending access` key restricted to `busyseason.ca` (named `busyseason-website`), replacing one restricted to `legacylinkstudio.com` (named `legacylinkstudio-website`, created when the site still used that domain). The old key had been silently 403ing every quote-form submission since the `busyseason.ca` rebrand, because `LEAD_FROM` defaults to `@busyseason.ca` but the key could only send from the old domain. **If `RESEND_API_KEY` is ever rotated again, its restricted domain must match whatever `LEAD_FROM` actually sends from, or every submission 502s** — check both the Resend dashboard's API key detail page (it shows a `DOMAIN` field) and `website/api/quote.js`'s `LEAD_FROM` default together, not just one or the other. **`LEAD_INBOX`** (default `info@busyseason.ca`) and **`LEAD_FROM`** (default `leads@busyseason.ca`) are optional overrides; `LEAD_FROM` must be on a Resend-verified domain or every send 422s. **`LEAD_INGEST_URL` and `LEAD_INGEST_KEY` may still be set on this project** — leftovers from the removed back office. `quote.js` no longer reads them; delete them from the dashboard.
  - **Failure paths log the full lead payload** before returning 502. That's deliberate and load-bearing: it's the recovery path if Resend is down or the domain falls out of verification, so a lead is never silently lost. Don't "clean up" those `console.error` calls to drop the payload.
- **Vercel blocks deploys of pinned-vulnerable Next.js versions** ("Vulnerable version of Next.js detected") — not a build error; it appears as a deployment-level failure *above* the build log, easy to miss while scrolling. Nothing here uses Next.js today; this matters only if a framework project is ever added back.
