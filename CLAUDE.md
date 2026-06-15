# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Two processes, two package.json files

This repo contains two independent Node.js projects that must both be running for the full app to work:

| Project | Root | Port | Start command |
|---|---|---|---|
| Fastify QR engine | `/` (repo root) | 3000 | `npm run dev` |
| Next.js admin UI  | `admin/`        | 3001 | `npm run dev` (from inside `admin/`) |

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
       verify PIN                 (still MOCK_PROFILE — not wired to DB yet)
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
- **`context/AuthContext.tsx`** — localStorage-only auth (no real session). Demo bypass: log in with `demo@legacylink.com` (any password). Auth routes on the Fastify side are currently stubs.
- **Purchase gate** — `AppShell` checks `localStorage.getItem('ll_has_purchased') === 'true'`. Set this manually to bypass in development.
- **`admin/app/api/qr/[shortId]/route.ts`** — the only Next.js API route; proxies QR SVG requests to Fastify to avoid CORS.

### Key invariants

- **`short_id` is immutable.** Once written to a plaque and engraved, it can never change. The Prisma schema marks it `@unique @db.VarChar(8)`. Never update this field.
- **Soft delete only.** Deleting a profile sets `deleted_at = now()`. The `db` client extension makes this invisible to all standard reads. Hard deletion is a separate admin-only operation. Use `rawPrisma` to see tombstoned records.
- **Guestbook entries are unapproved by default** (`is_approved: false`). Public profile queries must always filter on `is_approved: true`.
- **The demo `short_id` `a5trneuj`** is hardcoded in both `src/index.ts` (Fastify seed) and `admin/app/page.tsx` (Next.js dashboard mock). Both must stay in sync.

## Pending / stub areas

- **Auth routes** (`POST /auth/login`, `POST /auth/signup`) — Fastify stubs that return 401/201 without touching the DB. `bcrypt` not yet integrated.
- **Privacy PIN** — stored as plaintext in the DB. Needs bcrypt hashing before any public-facing use.
- **`POST /admin/link`** — uses `SEED_USER_ID` (set at startup) as the profile owner. Needs real auth token once sessions are wired.
- **Scan history** — in-memory only, lost on restart. Designed to be replaced with a message queue (SQS/Kafka).
