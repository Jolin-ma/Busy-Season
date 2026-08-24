# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

**Busy Season** — a small studio that produces AI-assisted video ads for home service businesses **and runs them** as Meta campaigns on the client's own ad account. Spec: `BusySeason_Master_Build_Brief.md`, currently at **v2**, which supersedes v1 entirely.

> **Renamed from LegacyLink Studio, 2026-08-21 — migration to Busy Season / `busyseason.ca` is complete.** The founder reversed the 2026-08-17 decision to keep the old name (brief §0/§11). `legacylinkstudio.com` is being **fully retired, not redirected**. Everything below is done:
> - **DNS/Zoho/Resend**: `busyseason.ca` registered at Namecheap; A/CNAME records point it at Vercel; Zoho Mail domain added with MX, SPF, and DKIM all **verified**; Resend domain **verified** (so `LEAD_FROM`/`LEAD_INBOX` defaulting to `@busyseason.ca` in `website/api/quote.js` is safe to run in production).
> - **Vercel renames**: marketing project `legacy-link` → `busyseason`; back office project `legacylink-studio` → `busyseason-studio`. Neither rename changed the project's attached domains/hostnames (Vercel carries those over), so no env vars needed updating.
> - **Neon rename**: back office database project `legacylink-studio` → `busyseason-studio` (id `late-voice-91531833` unchanged, connection strings still work).
> - **GitHub rename**: repo `Jolin-ma/Legacy-Link` → `Jolin-ma/Busy-Season`; local `origin` remote updated to match.
> - **Code pushed**: commit `f7b1b69` rebranding the repo is on `main` and deployed.
>
> **`legacylinkstudio.com`'s DNS was fully decommissioned at Namecheap on 2026-08-24** — every record (A/CNAME, all TXT, all MX) was deleted and Mail Settings switched to "No Email Service." The domain now resolves nothing and receives no mail; `info@legacylinkstudio.com` no longer works even though the alias still exists inside Zoho, because there's no MX to route to it. `busyseason.ca`'s own DNS is a separate zone and is unaffected. See `website/progress.md`'s 2026-08-24 entry for the full record list and why the last MX record needed the Mail Settings mode switched instead of a direct delete.

| Project | Root | Port | Start command |
|---|---|---|---|
| Marketing site | `website/` | — | static HTML; open the files, no build step |
| Back office | `studio/` | 3001 | `npm install && npm run dev` — needs a database, see below |

`website/` has no `package.json`, no build step, and no `node_modules` — nothing needs to be running for the site to work. `studio/` is the opposite: Next.js + Prisma, with its own `package.json` and `node_modules`. It is **restored code that is not deployed and has no database**, so `npm run dev` needs a `.env` before it does anything useful. Read the back-office note below before touching it.

> **The v1 → v2 change that drives everything:** v1 sold video creative only while promising an outcome ("we get your phone ringing") that depended on distribution the studio wasn't touching. v2 closes that gap — the studio produces *and* runs the ads. Copy claiming "we only sell creative" is v1 and is wrong.

> **The custom back office (`studio/`) is restored, deployed, and live as of 2026-08-18.** Clients, production pipeline, leads inbox; Next.js + Prisma. It was deleted on 2026-08-17 under **brief v2 §7, which is explicit that there is no custom admin build at launch** (pipeline and delivery go in one shared tracker instead), and the founder overruled that on 2026-08-18 and had the code restored from `8c16ec0^`. **§7's argument was never refuted — it was overruled**, so don't "fix" the repo back into agreement with the brief; the founder's call is the newer decision. The same disagreement already happened once, on 2026-08-16.
>
> **What exists vs. what doesn't**, because this is the easy thing to get wrong:
>
> | | State |
> |---|---|
> | `studio/` code | restored, builds, typechecks clean |
> | Vercel project `busyseason-studio` (renamed 2026-08-21, was `legacylink-studio`) | **live** — Root Directory `studio`, git-connected, at `legacylink-studio.vercel.app` (hostname carried over unchanged by the rename; Vercel had earlier reissued it after the delete/restore) |
> | Neon database | **live** — project `busyseason-studio` (renamed 2026-08-21, was `legacylink-studio`), id `late-voice-91531833`, **Postgres 17**, AWS US East 2 |
> | `LEAD_INGEST_URL` / `LEAD_INGEST_KEY` on the marketing project | **both set and working** — the quote form feeds the back office |
>
> The old Neon project (`polished-sea-32397117`) really was deleted — confirmed on 2026-08-18 by opening the account and finding zero projects, which finally settles a claim carried as unverified since 2026-08-17.
>
> **The leads path now has two destinations, and the email is still the system of record.** A submission emails `info@` first, then posts a best-effort copy to the back office; the copy cannot fail the visitor's submission. So a lead missing from `/leads` is never proof nobody enquired — check the inbox. Verified end to end on production on 2026-08-18: a form submission landed in both.
>
> `studio/README.md` carries the full setup detail. Anything referencing `STUDIO_PASSWORD`, `STUDIO_SESSION_SECRET`, `LEAD_INGEST_URL`, `LEAD_INGEST_KEY`, Prisma, or Neon belongs to this app.
>
> **Three Vercel traps cost real time on 2026-08-18 and will again:**
> 1. **The New Project import form can silently fail to submit** — no error, no project, nothing in the list. It succeeded only once the Environment Variables section was left empty. If an import appears to do nothing, **deploy with no env vars, then add them in Settings and redeploy.**
> 2. **An unconfirmed "Redeploy" dialog is indistinguishable from a redeploy that worked.** Check `dep=dpl_...` in the runtime log — if the deployment id has not changed, nothing was redeployed.
> 3. **A Sensitive env var cannot be read back**, so its "Added ‹time›" label is the only evidence an edit saved. Five end-to-end tests failed while it read "Added 3d ago"; the first test after it read "Added 2m ago" passed.

> **A separate QR-memorial product used to live here** (`src/`, `client/`, `prisma/`, `lambda/`, `infra/`, plus two Next.js front-ends in `admin/` and `ops-dashboard/`). The founder retired that concept. All of its code was deleted on 2026-08-16, and its two Vercel projects (`legacy-link-admin`, `legacy-link-dashboard`) were deleted the same day. Recover from git history if ever needed — but treat it as gone, not dormant. Anything in an old commit referencing `short_id`, plaques, profiles, guestbooks, or `OPS_API_KEY` belongs to that product and not to this business.
>
> **Railway is gone too** — the trial ended, so the Fastify API is no longer served. `api.legacylinkstudio.com` and the underlying `*.up.railway.app` host both answer 404 as of 2026-08-16, which closes the unauthenticated `/admin/*` exposure that API used to carry.
>
> **DNS is cleaned up too.** The four dead records (`CNAME app`, `CNAME ops`, `CNAME api`, `TXT _railway-verify.api`) were removed from Namecheap on 2026-08-16 and confirmed gone against the authoritative nameserver. Nothing from the retired product is left running anywhere.

**`legacylinkstudio.com`'s DNS zone is empty — decommissioned 2026-08-24.** It used to hold the marketing site's `A @`/`CNAME www`, three Zoho `MX @` records for the `info@` inbox, Zoho mail-auth TXT records, and Resend TXT/MX records. All of it is gone; do not assume any of it still routes anything. Production mail and lead delivery run on `busyseason.ca`'s own DNS zone, which was untouched by this.

Zoho itself is on **Canada-region** infrastructure (`zohocloud.ca`, not the generic `mx.zoho.com`), which most setup guides get wrong for this account — relevant if `busyseason.ca`'s Zoho records ever need reconstructing.

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

`website/api/quote.js` emails each lead to `info@` via Resend, then posts a best-effort copy to the back office at `legacylink-studio.vercel.app/api/leads/ingest`. **The email is still the system of record** — the copy happens only after a successful send, every failure is logged and swallowed, and it has a 3s timeout, so a lead missing from `/leads` is never proof nobody enquired. Check the inbox.

- The endpoint POSTs a best-effort copy to the back office's ingest API after a successful send. That code was removed on 2026-08-17 with the app and **restored on 2026-08-18**. It is inert until **both** `LEAD_INGEST_URL` and `LEAD_INGEST_KEY` are set on the marketing project, which they currently are not — so today the email really is the only record. The post is strictly secondary: it happens only after the email succeeds, every failure is logged and swallowed, and it has a 3s timeout so a hanging back office can't leave a visitor on a spinner. **Don't reorder that to make the database authoritative without first making the write reliable.**
- **Failure paths log the full lead payload** before returning 502. That is deliberate and load-bearing: with the email being the only record, the Vercel function log is the sole recovery path if Resend is down or the domain falls out of verification. Don't "clean up" those `console.error` calls to drop the payload.

## Production deployment

| App | Root Directory | Host | Domain |
|---|---|---|---|
| Marketing site (`website/`) | `website` | Vercel project `busyseason` (renamed 2026-08-21, was `legacy-link`) | `legacylinkstudio.com` (also serving `busyseason.ca`) |
| Back office (`studio/`) | `studio` | Vercel project `busyseason-studio` (renamed 2026-08-21, was `legacylink-studio`) | `legacylink-studio.vercel.app` (hostname unchanged by the rename) |

- **Deploy by pushing to `main`.** The project is git-connected with Root Directory `website`, so a push builds it automatically.

- **DNS** is managed at Namecheap (not delegated to Vercel), so every subdomain needs a manual CNAME record added there, even though the apex domain is a Vercel project.
- **Vercel reads `vercel.json` from the project's Root Directory.** The marketing site's Root Directory is `website`, so its config is **`website/vercel.json`** — a redirect or header put anywhere else silently does nothing. This is easy to get wrong because the symptom is invisible: the site keeps serving correctly and only the routing config is ignored. A `/contact.html` → `/quote.html` redirect was once added to a repo-root file and 404'd in production despite a green deploy.
  - The repo-root `vercel.json` was deleted on 2026-08-16 after confirming Root Directory is `website`. Note the marketing project also has an **Output Directory override set to `website` in the Vercel dashboard**, independent of any file — don't be confused by it, and don't "fix" it while the site is working.
- **Any new Vercel subproject from this repo needs its own `vercel.json`** in its own Root Directory, for the same reason. Historically the repo-root config's `outputDirectory` was inherited by subprojects and 404'd every route despite a successful build, because Next.js builds into `.next`.
- **The marketing site is static except for `website/api/quote.js`.** Vercel zero-config picks up the `api/` directory under the Root Directory and builds it as a Node function — nothing in `website/vercel.json` declares it. It's deliberately **CommonJS with global `fetch` and no dependencies**, because `website/` has no `package.json` and adding one to pull in the Resend SDK would give the static site an install step for a single HTTP call. Adding a dependency here means adding a build step — reconsider first.
  - Env vars on the **marketing site's** Vercel project: **`RESEND_API_KEY`** is required — the function logs and 500s without it. **This key is domain-restricted in Resend, not just permission-scoped** — it was rotated on 2026-08-24 to a `Sending access` key restricted to `busyseason.ca` (named `busyseason-website`), replacing one restricted to `legacylinkstudio.com` (named `legacylinkstudio-website`, created when the site still used that domain). The old key had been silently 403ing every quote-form submission since the `busyseason.ca` rebrand, because `LEAD_FROM` defaults to `@busyseason.ca` but the key could only send from the old domain. **If `RESEND_API_KEY` is ever rotated again, its restricted domain must match whatever `LEAD_FROM` actually sends from, or every submission 502s** — check both the Resend dashboard's API key detail page (it shows a `DOMAIN` field) and `website/api/quote.js`'s `LEAD_FROM` default together, not just one or the other. **`LEAD_INBOX`** (default `info@busyseason.ca`) and **`LEAD_FROM`** (default `leads@busyseason.ca`) are optional overrides; `LEAD_FROM` must be on a Resend-verified domain or every send 422s. **`LEAD_INGEST_URL` and `LEAD_INGEST_KEY` are also set on this project, and both are stale.** Earlier revisions of this file and of `progress.md` claimed they were removed on 2026-08-17. **That removal never happened** — the Vercel dashboard shows both were added around 2026-08-15 and have been there ever since; this was confirmed by looking at the project on 2026-08-18. Treat any "we deleted the env var" claim in this repo as unverified unless the dashboard was actually checked.

  This matters because `quote.js` gates its ingest post on `if (ingestUrl && ingestKey)`, and both are truthy. Since the restore on 2026-08-18 the post therefore **fires on every submission and fails**, because `LEAD_INGEST_URL` still points at the deleted `legacylink-studio.vercel.app`. Harmless by design — logged, swallowed, and the lead still emails — but it is *failing*, not *skipped*. Both values need replacing when the back office is redeployed: the URL with the new hostname, and the key with the one in `studio/.env`, which is a freshly generated secret that does **not** match the old value sitting in Vercel.
  - **Failure paths log the full lead payload** before returning 502. That's deliberate and load-bearing: it's the recovery path if Resend is down or the domain falls out of verification, so a lead is never silently lost. Don't "clean up" those `console.error` calls to drop the payload.
- **Vercel blocks deploys of pinned-vulnerable Next.js versions** ("Vulnerable version of Next.js detected") — not a build error; it appears as a deployment-level failure *above* the build log, easy to miss while scrolling. Nothing here uses Next.js today; this matters only if a framework project is ever added back.
