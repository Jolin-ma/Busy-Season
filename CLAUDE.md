# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo currently holds

Two unrelated things live here. Know which one you're in before changing anything.

| | What it is | Status |
|---|---|---|
| **LegacyLink Studio** (`website/`, back office) | AI-produced video ads sold to roofing and home-service companies. The live business. Spec: `LegacyLink_Studio_Master_Build_Brief.md`. | Active — marketing site is in production |
| **QR memorial product** (`src/`, `client/`, `prisma/`, `lambda/`, `infra/`) | An earlier, separate product: QR plaques → memorial profiles. Predates the domain's repurposing. | Dormant — API code only, no UI in this repo |

The two share a repo and a domain for historical reasons, not by design. They are **not** the same business and must not reference each other in anything a visitor can see (brief §5).

**Both Next.js front-ends of the QR product were deleted on 2026-08-16** — `admin/` (customer UI, was `app.legacylinkstudio.com`) and `ops-dashboard/` (internal back office, was `ops.legacylinkstudio.com`). The founder retired that concept as not well planned. The back office for the ad business is being built fresh; it is not a fork of either. Recover the old code from git history if ever needed (commit before their deletion).

Consequences of that deletion, all live:

- The Fastify API still serves every `/admin/*` and `/ops/*` route those apps called. **Nothing calls them now.** Treat them as dead code, not as an interface to preserve.
- `OPS_API_KEY` still guards routes on the API, but the only client that ever sent `x-ops-key` is gone.
- `ADMIN_URL` (Railway) pointed at the deleted admin app for CORS; `NEXT_PUBLIC_API_URL` was set on its Vercel project.
- **The Vercel projects for both still exist and still serve their last build.** Deleting the source does not undeploy them — see "Outstanding cleanup" below.

## Three processes, three package.json files

Historically three; **currently one** (`/`), plus the static marketing site and whatever the back office becomes. Each project has its own `package.json` and never shares `node_modules` — run `npm install` separately in each.

| Project | Root | Port | Start command |
|---|---|---|---|
| Fastify QR engine | `/` (repo root) | 3000 | `npm run dev` |
| Marketing site | `website/` | — | static HTML; open the files, no build step |

## Commands

**Fastify (repo root)**
```bash
npm run dev          # ts-node, hot-ish reload (does NOT watch client/ — see below)
npm run build        # tsc → dist/, then bundles client/ via build:client
npm run start        # node dist/index.js

npm run build:client # esbuild client/background-entry.tsx → public/static/background-paths.js
npm run dev:client   # same, with --watch — run in a second terminal while editing client/*.tsx

npm run db:generate  # regenerate Prisma client after schema changes
npm run db:migrate   # create + apply a new migration (needs DATABASE_URL)
npm run db:push      # push schema without migration history (dev shortcut)
npm run db:studio    # open Prisma Studio GUI
npm run db:reset     # wipe and re-apply all migrations
```

**Marketing site (`website/`)** — plain static HTML/CSS/JS, no build step and no `package.json`. Open a file directly or serve the folder. See `website/progress.md` for the running build log and founder decisions.

## Architecture

### Marketing site (`website/`)

Static HTML, one page per route, sharing `styles.css` and `script.js`. The design system is brief §8; the copy tracks the pricing and positioning decisions in brief §2 — when those change, the figures on `index.html`, `pricing.html`, and `quote.html` all move together, and `website/progress.md` records why.

The one dynamic piece is **`website/api/quote.js`**, the serverless function behind the quote form — see "Production deployment" for its constraints.

`terms.html` deliberately states money in **percentages, never dollar figures** ("50% of the first month's fee"), so repricing the packages never touches the legal text. Keep it that way.

### Request flow for a QR scan (dormant product)

```
Physical plaque QR  →  Fastify /p/:shortId
                           │
                    lookup Profile by short_id (Prisma)
                           │
              ┌────────────┴────────────┐
           private?                  public
              │                         │
       render PIN gate HTML      302 → /profile/:profileId
       POST /p/:shortId/unlock          │
              │                  render profile HTML
       verify PIN                 render profile HTML (real DB — Prisma query in router.ts:/profile/:profileId)
```

### Fastify data layer (`src/`)

- **`src/lib/db.ts`** — exports two Prisma clients:
  - `db` — has a `$extends` soft-delete filter; every Profile read automatically appends `deleted_at: null`
  - `rawPrisma` — unfiltered; use for writes and admin operations
- **`src/db.ts`** — the interface the router uses. Wraps Prisma in domain functions (`lookupLink`, `setPrivacy`, `createLink`, `incrementScanCount`). Scan history stays in-memory here (designed for a queue in production).
- **`src/analytics.ts`** — fire-and-forget scan recording via `setImmediate`. Never awaited by routes.
- **`src/router.ts`** — all Fastify routes. All db calls are async/await.
- **`src/index.ts`** — entry point. Seeds demo user + Margaret's profile via Prisma upsert at startup; stores `SEED_USER_ID` in `process.env` for unauthenticated profile creation.

### Client-side bundle (`client/`)

The only React/JSX in this repo now. Isolated on purpose from the server's TypeScript build:
- **`client/tsconfig.client.json`** — separate `jsx`-enabled tsconfig, `include: ["**/*"]` scoped to `client/`. The root `tsconfig.json` (`include: ["src/**/*"]`) never touches these files, so `npm run build`'s `tsc` step is unaffected.
- **`client/BackgroundPaths.tsx`** + **`client/background-entry.tsx`** — the animated line background behind the profile hero (framer-motion), mounted into `#bg-paths-root` in `src/profileTemplate.ts`.
- Bundled by **esbuild** (`npm run build:client` / `dev:client`, see Commands above) into `public/static/background-paths.js`, served by a second `@fastify/static` registration in `src/router.ts` (`prefix: '/static/'`, deliberately no sandbox CSP — unlike `/uploads/`, this directory only ever holds the server's own build output and must execute as JS).

### Prisma (Prisma 7)

Prisma 7 is a breaking change from earlier versions:
- **No `url` in `schema.prisma`** — connection is configured in `prisma.config.ts` via the `@prisma/adapter-pg` driver adapter pattern
- **`prisma.config.ts`** at repo root is the CLI entry point for migrate/studio
- Schema lives at `prisma/schema.prisma`

When modifying the schema, always run `npm run db:generate` before TypeScript compilation.

### Key invariants (QR product)

- **`short_id` is immutable.** Once written to a plaque and engraved, it can never change. The Prisma schema marks it `@unique @db.VarChar(8)`. Never update this field.
- **Soft delete only.** Deleting a profile sets `deleted_at = now()`. The `db` client extension makes this invisible to all standard reads. Hard deletion is a separate admin-only operation. Use `rawPrisma` to see tombstoned records.
- **Guestbook entries are unapproved by default** (`is_approved: false`). Public profile queries must always filter on `is_approved: true`.
- **The demo `short_id` `a5trneuj`** is hardcoded in `src/index.ts` (Fastify seed). It used to also live in `admin/app/page.tsx`; that file is gone, so the sync requirement no longer applies.
- **The demo profile is pinned to `plan: 'BASIC'`** in the seed upsert (`src/index.ts`). If it's ever `PREMIUM` with no `GraveCoordinates` row, scanning its QR redirects to the one-time GPS `/activate/:shortId` flow instead of the profile — this bit the demo once already.

## Pending / stub areas

- **PIN gate is currently disabled** — the `if (link.isPrivate)` checks in both `/r/:shortId` and `/p/:shortId` (`src/router.ts`) are commented out (not deleted), so every profile scan goes straight through regardless of `is_private`. Re-enable by uncommenting those two blocks before treating private profiles as actually gated.
- **Scan history** — in-memory only, lost on restart. Designed to be replaced with a message queue (SQS/Kafka).
- **`/admin/*` and `/ops/*` on the Fastify API have no caller.** Both front-ends were deleted. The pre-existing gaps there (no per-user ownership check on `/api/v1/premium/*`, `/admin/link/:shortId/privacy`, `/admin/plan`, `/admin/profile`, `/admin/upload*`; `/ops/ws` exempt from the ops guard) are unreachable from any UI now, but the routes are still live on the deployed API. If that API stays up, they remain publicly hittable by anyone who knows a `shortId`.

## Production deployment

| App | Root Directory | Host | Domain |
|---|---|---|---|
| Marketing site (`website/`) | `website` (own `website/vercel.json` — **not** the repo-root one, see below) | Vercel | `legacylinkstudio.com` |
| Fastify API (`src/`) | `.` (repo root) | Railway | `api.legacylinkstudio.com` |

- **DNS** is managed at Namecheap (not delegated to Vercel), so every subdomain needs a manual CNAME record added there, even though the apex domain is a Vercel project.
- **Database**: Neon project `legacylink`, branch `prod-railway`. Root `.env`/local dev points at a separate branch — never at prod.
- **The marketing site's Vercel config lives at `website/vercel.json`, not the repo root.** Its Vercel project has Root Directory `website`, and Vercel reads `vercel.json` from the Root Directory — so the repo-root `vercel.json` is never consulted by that project. This is easy to get wrong because the *symptom* is silent: the site keeps serving `website/` correctly either way, and only routing config (`redirects`, `headers`, `rewrites`) quietly does nothing. A `/contact.html` → `/quote.html` redirect was added to the repo-root file first and 404'd in production despite a green deploy. Put any redirect/header/rewrite for the marketing site in `website/vercel.json`.
- **The marketing site is static except for one serverless function: `website/api/quote.js`**, which backs the quote form. Vercel zero-config picks up the `api/` directory under the project's Root Directory (`website`) and builds it as a Node function — nothing in `website/vercel.json` declares it. It's deliberately **CommonJS with global `fetch` and no dependencies**, because `website/` has no `package.json` and adding one to pull in the Resend SDK would give the static site an install step for a single HTTP call. If you add a dependency here, you're also adding a build step — reconsider first.
  - Env vars on the **marketing site's** Vercel project: **`RESEND_API_KEY`** is required — the function logs and 500s without it. **`LEAD_INBOX`** (default `info@legacylinkstudio.com`) and **`LEAD_FROM`** (default `leads@legacylinkstudio.com`) are optional overrides. `LEAD_FROM` must be on a Resend-verified domain or every send 422s.
  - **Failure paths log the full lead payload** to the Vercel function log before returning 502. That's deliberate and load-bearing: it's the recovery path if Resend is down or the domain falls out of verification, so a lead is never silently lost. Don't "clean up" those `console.error` calls to drop the payload.
- **The repo-root `vercel.json`** (`outputDirectory: website`) is not used by the marketing site, and the two subprojects that were configured around it are deleted. It is now almost certainly vestigial — but confirm nothing else reads it before removing it.
- **Any new Vercel subproject from this repo needs its own `vercel.json`** overriding the repo-root `outputDirectory: website`. That setting bit the deleted admin project once — Next.js builds into `.next`, not `website`, so inheriting it causes a 404 on every route despite a successful build. The back office will need this.
- **Vercel blocks deploys of pinned-vulnerable Next.js versions** ("Vulnerable version of Next.js detected") — this isn't a build error, it shows up as a deployment-level failure above the build log, easy to miss while scrolling build output looking for the actual error. Check `npm view next versions` for the latest patch on the same major before bumping.
- **`JWT_SECRET`** (Railway env var, Fastify API) is mandatory in production — the server refuses to start without it rather than falling back to the dev secret.
- **Session cookie is `sameSite: 'strict'`** (`src/router.ts`), so anything authenticating against the API must share the `legacylinkstudio.com` root domain. Applies to the new back office too.
- **`OPS_API_KEY`** gates internal-only routes on the Fastify API (`/ops/*` except `/ops/ws`, `/admin/fulfillment*`, `/admin/directory`, `/admin/media*`, `/admin/analytics/*`, `/admin/support/*`, `/admin/billing/*`, plus the media-cleanup and Lambda-webhook endpoints). Callers send `x-ops-key: <key>`. **When unset the guard is disabled** so local dev works with zero config. Still set on Railway, but the dashboard that sent it is deleted, so nothing exercises it.
  - The pattern is worth reusing if the new back office needs a shared internal secret: the key is read **server-side only** and attached by a proxy route, never shipped to the browser in a `NEXT_PUBLIC_*` var.

## Outstanding cleanup (not code — someone has to do these in a dashboard)

1. **Delete or disconnect the two Vercel projects** for `admin/` and `ops-dashboard/`. Removing the source does not take down the deployment: `app.legacylinkstudio.com` and `ops.legacylinkstudio.com` still serve their last successful build. Until that's done, a pet-memorial admin UI is publicly reachable on the ad studio's domain — the exact cross-business visibility brief §5 forbids.
2. **Remove their CNAME records** at Namecheap once the projects are gone.
3. **`info@legacylinkstudio.com` was published as the contact address by the deleted admin app** (`admin/app/contact/page.tsx`, `admin/app/terms/page.tsx`, `admin/app/api/contact/route.ts`). It is also the destination for marketing-site quote-form leads. Mail sent from the old UI may still arrive in that inbox.
4. **Decide the fate of the QR product's API.** `api.legacylinkstudio.com` is still up on Railway with no front-end. Its unauthenticated `/admin/*` routes are reachable by anyone who knows a `shortId`.
