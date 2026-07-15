# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Three processes, three package.json files

This repo contains three independent Node.js projects. The first two must both be running for the customer-facing app to work; the ops dashboard is optional for local dev unless you're touching back-office features:

| Project | Root | Port | Start command |
|---|---|---|---|
| Fastify QR engine | `/` (repo root) | 3000 | `npm run dev` |
| Next.js admin UI  | `admin/`        | 3001 | `npm run dev` (from inside `admin/`) |
| Next.js ops dashboard | `ops-dashboard/` | 3002 | `npm run dev` (from inside `ops-dashboard/`) |

They never share `node_modules`. Run `npm install` separately in each.

## Commands

**Fastify (repo root)**
```bash
npm run dev          # ts-node, hot-ish reload
npm run build        # tsc → dist/
npm run start        # node dist/index.js

npm run db:generate  # regenerate Prisma client after schema changes
npm run db:migrate   # create + apply a new migration (needs DATABASE_URL)
npm run db:push      # push schema without migration history (dev shortcut)
npm run db:studio    # open Prisma Studio GUI
npm run db:reset     # wipe and re-apply all migrations
```

**Next.js admin (`admin/`)**
```bash
npm run dev          # Next.js dev server on port 3001
npm run build        # production build
npm run lint         # ESLint
```

**Next.js ops dashboard (`ops-dashboard/`)**
```bash
npm run dev          # Next.js dev server on port 3002
npm run build        # production build
npm run lint         # ESLint
```

## Architecture

### Request flow for a QR scan

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

### Admin UI flow

```
Next.js admin (port 3001)
  AppShell  →  gate 1: no user     → redirect /auth
            →  gate 2: no purchase → redirect /purchase
            →  render dashboard
                    │
         fetch() to Fastify (port 3000) for:
           - PATCH /admin/link/:shortId/privacy
           - POST  /admin/link  (create profile)
           - GET   /admin/stats/:shortId
         Next.js API proxy for:
           - GET   /api/qr/[shortId]  → proxies to Fastify /admin/qr/:shortId
```

### Ops dashboard flow

```
Next.js ops dashboard (port 3002) — internal staff only, no login of its own yet
  Client components  →  fetch('/api/gw/<fastify-path>')
                              │
                    ops-dashboard/app/api/gw/[...path]/route.ts
                    (server-side; reads OPS_API_KEY — never sent to the browser)
                              │
                    attaches x-ops-key header  →  Fastify /admin/* and /ops/* routes
```

- **`ops-dashboard/app/api/gw/[...path]/route.ts`** is the only place `OPS_API_KEY` is read on this side. Every client component that needs a guarded Fastify route calls `/api/gw/<path>` (same-origin) instead of `NEXT_PUBLIC_API_URL` directly — see `CLAUDE.md`'s `OPS_API_KEY` bullet below for why (client components here have no session of their own, so a `NEXT_PUBLIC_*` key would be extractable from the page).
- **`/admin/link/:shortId/privacy`** and `/admin/qr/:shortId` are the two Fastify routes the ops dashboard calls that are *not* behind `OPS_API_KEY` — they're shared with the admin app (see `OPS_API_KEY` bullet) and called directly via `NEXT_PUBLIC_API_URL`, not through `/api/gw/`.
- **`ops-dashboard/app/api/manufacturing/route.ts`** and **`ops-dashboard/app/api/qr/route.ts`** are older, narrower server-side proxies (predate `/api/gw/`) — `manufacturing/route.ts` attaches `x-ops-key` itself for the one guarded route it calls.
- Pinned to **Next.js 15.5.x** — separately from `admin/`, which is on Next 16.2.x. Don't assume the two Next.js projects are on the same major version or share upgrade timing.

### Fastify data layer (`src/`)

- **`src/lib/db.ts`** — exports two Prisma clients:
  - `db` — has a `$extends` soft-delete filter; every Profile read automatically appends `deleted_at: null`
  - `rawPrisma` — unfiltered; use for writes and admin operations
- **`src/db.ts`** — the interface the router uses. Wraps Prisma in domain functions (`lookupLink`, `setPrivacy`, `createLink`, `incrementScanCount`). Scan history stays in-memory here (designed for a queue in production).
- **`src/analytics.ts`** — fire-and-forget scan recording via `setImmediate`. Never awaited by routes.
- **`src/router.ts`** — all Fastify routes. All db calls are async/await.
- **`src/index.ts`** — entry point. Seeds demo user + Margaret's profile via Prisma upsert at startup; stores `SEED_USER_ID` in `process.env` for unauthenticated profile creation.

### Prisma (Prisma 7)

Prisma 7 is a breaking change from earlier versions:
- **No `url` in `schema.prisma`** — connection is configured in `prisma.config.ts` via the `@prisma/adapter-pg` driver adapter pattern
- **`prisma.config.ts`** at repo root is the CLI entry point for migrate/studio
- Schema lives at `prisma/schema.prisma`

When modifying the schema, always run `npm run db:generate` before TypeScript compilation.

### Next.js admin (`admin/`)

- **App Router** with all pages in `admin/app/`
- **`context/AuthContext.tsx`** — calls real Fastify auth endpoints; JWT token stored in `localStorage`.
- **Purchase gate** — `AppShell` checks `localStorage.getItem('ll_has_purchased') === 'true'`. Set this manually to bypass in development.
- **`admin/app/api/qr/[shortId]/route.ts`** — the only Next.js API route; proxies QR SVG requests to Fastify to avoid CORS.

### Key invariants

- **`short_id` is immutable.** Once written to a plaque and engraved, it can never change. The Prisma schema marks it `@unique @db.VarChar(8)`. Never update this field.
- **Soft delete only.** Deleting a profile sets `deleted_at = now()`. The `db` client extension makes this invisible to all standard reads. Hard deletion is a separate admin-only operation. Use `rawPrisma` to see tombstoned records.
- **Guestbook entries are unapproved by default** (`is_approved: false`). Public profile queries must always filter on `is_approved: true`.
- **The demo `short_id` `a5trneuj`** is hardcoded in both `src/index.ts` (Fastify seed) and `admin/app/page.tsx` (Next.js dashboard mock). Both must stay in sync.

## Pending / stub areas

- **Scan history** — in-memory only, lost on restart. Designed to be replaced with a message queue (SQS/Kafka).
- **Ops dashboard has no login of its own.** Anyone with the URL can view it; the only real protection is that `OPS_API_KEY` (server-side only) gates the Fastify calls it proxies. `/ops/ws` isn't even gated by that (see below). Add real auth before treating this as more than a soft barrier.
- **No per-user ownership check on customer-facing premium/admin-link routes** (`/api/v1/premium/*`, `/admin/link/:shortId/privacy`, `/admin/plan`, `/admin/profile`, `/admin/upload*`) — the admin app calls these with no session header at all right now. Anyone who knows or guesses a `shortId`/`profileId` can currently hit them. Needs `resolveUserId` + an ownership check tied to the profile, not the shared ops key (see `OPS_API_KEY` bullet — that key is wrong for this because these are customer routes, not internal-ops routes).

## Production deployment

Four independent deployments from this one repo, each its own host/project:

| App | Root Directory | Host | Domain |
|---|---|---|---|
| Marketing site (`website/`) | `.` (repo root `vercel.json`, `outputDirectory: website`) | Vercel | `legacylinkstudio.com` |
| Admin UI (`admin/`) | `admin` (own `admin/vercel.json`) | Vercel (separate project) | `app.legacylinkstudio.com` |
| Fastify API (`src/`) | `.` (repo root) | Railway | `api.legacylinkstudio.com` |
| Ops dashboard (`ops-dashboard/`) | `ops-dashboard` (own `ops-dashboard/vercel.json`) | Vercel (separate project) | `ops.legacylinkstudio.com` |

- **DNS** is managed at Namecheap (not delegated to Vercel), so every subdomain needs a manual CNAME record added there, even though the apex domain is a Vercel project.
- **Database**: Neon project `legacylink`, branch `prod-railway`. Root `.env`/local dev points at a separate branch — never at prod.
- **`admin/vercel.json`** and **`ops-dashboard/vercel.json`** each exist specifically so those projects don't inherit the repo-root `vercel.json`'s `outputDirectory: website` setting (that bit the admin project once, then would have bitten ops-dashboard too — Next.js builds into `.next`, not `website`, so the wrong setting causes a 404 on every route despite a successful build). Any future subproject deployed to Vercel from this repo needs the same override.
- **Vercel blocks deploys of pinned-vulnerable Next.js versions** ("Vulnerable version of Next.js detected") — this isn't a build error, it shows up as a deployment-level failure above the build log, easy to miss while scrolling build output looking for the actual error. Check `npm view next versions` for the latest patch on the same major before bumping.
- **`ADMIN_URL`** (Railway env var) and **`NEXT_PUBLIC_API_URL`** (Vercel admin project env var) must point at each other's production domain, or CORS/signup breaks. `NEXT_PUBLIC_API_URL` is baked in at build time — changing it requires a fresh deploy, not just a dashboard save.
- **Session cookie is `sameSite: 'strict'`** (`src/router.ts`), so the admin app and API must share a root domain (`legacylinkstudio.com`) — if either ever moves to an unrelated domain, login breaks silently.
- **`JWT_SECRET`** (Railway env var, Fastify API) is mandatory in production — the server refuses to start without it rather than falling back to the dev secret.
- **`OPS_API_KEY`** gates internal-only back-office routes on the Fastify API (`/ops/*` except `/ops/ws`, `/admin/fulfillment*`, `/admin/directory`, `/admin/media*`, `/admin/analytics/*`, `/admin/support/*`, `/admin/billing/*`, plus the media-cleanup and Lambda-webhook endpoints). Callers send `x-ops-key: <key>`. **When unset the guard is disabled** so local dev works with zero config. **Currently set in production** on both the Railway Fastify service and the ops-dashboard Vercel project — the guard is live, not hypothetical.
  - **`/api/v1/premium/*` is deliberately NOT gated by this key** (`src/routes/premium.ts`), even though it lives next to the ops-only routes. It backs customer-facing premium features (guestbook moderation, priority support, geotagging, family tree) called directly from the **admin app's** browser code by the paying customers who own the profile — not internal ops staff. It was gated once by mistake, which 401'd those features in production for every admin-app user until reverted. If you're tempted to add auth here, it needs a per-user session check (`resolveUserId` + an ownership check tied to `profileId`), not a shared ops secret — an ops secret would either have to ship to every customer's browser (defeating its purpose) or be proxied per-request with no way to distinguish which customer is asking.
  - Set the **same** `OPS_API_KEY` value in two places: on the **Fastify API host (Railway)**, which checks it, and on the **ops dashboard's Vercel project**, which sends it.
  - `ops-dashboard`'s browser code never touches this key directly — it isn't safe to ship a secret into a `NEXT_PUBLIC_*` var since these client components render with no login of their own. Instead, `ops-dashboard/app/api/gw/[...path]/route.ts` is a server-side catch-all proxy: the browser calls same-origin `/api/gw/<fastify-path>`, and that Next.js route (running server-side, reading the plain `OPS_API_KEY` env var — no `NEXT_PUBLIC_` prefix) attaches `x-ops-key` and forwards to Fastify. All ops-dashboard client components that hit a guarded route go through `/api/gw/...` rather than calling `NEXT_PUBLIC_API_URL` directly.
  - `/ops/ws` (the live-scan WebSocket) is deliberately **exempt** from the guard — browsers can't set custom headers on a WS upgrade, and putting the key in a query string would mean shipping it to the browser, undermining the guard everywhere else. Known gap until the ops dashboard has its own login and can mint scoped, short-lived tickets.
  - Before gating any *new* route with this key, check whether the admin app (customer-facing) calls it too — grep `admin/` for the path first. Everything currently gated was cross-checked against admin's actual fetch calls (see git history on this file), except `/api/v1/premium/*`, which was missed the first time.
