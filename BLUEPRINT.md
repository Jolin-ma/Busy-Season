# LegacyLink — Engineering Blueprint

A living reference for what's built, what's next, and what to defer.
Update this file when a phase moves, not after every commit.

---

## Architecture snapshot

```
Physical plaque QR
  → Fastify /r/:shortId          (port 3000 — QR engine, Prisma, auth)
       │
       ├─ no coordinates → activation page
       └─ coordinates set → /profile/:profileId (HTML, real DB)

Admin UI (port 3001)             Customer-facing: manage own profiles
Ops Dashboard (port 3002)        Internal: Jolin manages all accounts
```

Database: PostgreSQL on Neon (Prisma 7, `@prisma/adapter-pg`)
Storage:  S3-compatible (R2 preferred — zero egress fees)
Auth:     `bcryptjs` (cost 12) + `@fastify/jwt` (30-day tokens, authVersion-gated,
          delivered via HttpOnly `ll_session` cookie — never in localStorage)

---

## ✅ Phase 1 — Non-Negotiables (COMPLETE)

These are in production. Do not revisit without a strong reason.

### Data integrity
- [x] **Stripe idempotency** — `Transaction.id` IS the Stripe charge ID (`@id`). Duplicate webhooks rejected at DB level.
- [x] **Soft delete only** — `Profile.deleted_at`. The `db` Prisma extension silently appends `deleted_at: null` to every read. Hard delete is a manual admin-only operation after a configurable retention window.
- [x] **`short_id` immutability** — `@unique @db.VarChar(8)`, generated before insert, never updated. Engraved on physical plaques.
- [x] **Guestbook moderation gate** — `GuestbookEntry.is_approved` defaults to `false`. Public queries must always filter `is_approved: true`.

### Auth & security
- [x] **bcrypt passwords** — `User.password_hash`, cost 12.
- [x] **bcrypt privacy PIN** — `Profile.privacy_pin`, cost 12. Verified via `bcrypt.compare` on every unlock.
- [x] **JWT auth routes** — `POST /auth/login` and `POST /auth/signup` fully wired. Tokens expire in 30 days and embed `authVersion`.
- [x] **`auth_version` enforcement** — `resolveUserId()` in `router.ts` verifies JWT signature AND checks `User.auth_version` against the value encoded in the token on every authenticated request. Stale tokens are rejected immediately.
- [x] **`POST /auth/logout-all`** — increments `auth_version`, invalidating every active token for that user instantly, and clears the current device's session cookie.

### Ownership & isolation
- [x] **User → Profile ownership** — `Profile.user_id` FK. Every profile query can verify ownership in one hop.
- [x] **JWT-first profile creation** — Both `POST /admin/link` and `POST /admin/profile` use `resolveUserId()` first, fall back to `SEED_USER_ID` only in dev.

### Schema
- [x] **`User.auth_version`** — `Int @default(1)`. Token revocation without a session table.
- [x] **`MediaAsset.original_key` / `processed_key`** — Deterministic S3/R2 keys for orphan cleanup.
- [x] **`MediaAsset.upload_status`** — `UploadStatus` state machine (PENDING_UPLOAD → PROCESSING → READY | MARKED_FOR_DELETION). Separate from `ModerationStatus` — file lifecycle and content review are different concerns.
- [x] **`ScanLog.id` → BigInt autoincrement** — Sequential IDs keep the clustered index tight on the highest-write table.
- [x] **`ScanLog` composite index** — `[profile_id, scanned_at DESC]` covers the analytics dashboard hot path.
- [x] **`Profile.is_qr_active`** — `Boolean @default(true)`. Gates the physical QR entry point without touching `short_id` or soft-deleting the profile.

### Connection hardening
- [x] **Statement timeout** — `SET statement_timeout = 3000` applied to every pool connection via `pool.on('connect')`. Kills runaway queries before they cascade.
- [x] **`DIRECT_URL` split** — `prisma.config.ts` uses `DIRECT_URL` for migrations (bypasses PgBouncer — advisory locks don't survive connection hand-offs). App queries use the pooled `DATABASE_URL`.

### Media lifecycle
- [x] **`UploadStatus` state machine** — Lambda webhook sets `READY` on success or `MARKED_FOR_DELETION` on `REJECTED`, and stores `original_key` / `processed_key` for cleanup.
- [x] **Media orphan cleanup cron** — `src/jobs/mediaCleanup.ts`. Runs at startup + every 6 hours via `setInterval`. Phase 0 marks stale PENDING_UPLOAD rows (Lambda timeout, > 2 h). Phase 1 cascade-marks assets from soft-deleted profiles. Phase 2 deletes from S3 then hard-deletes the DB row. S3 failures leave the row intact for the next run. Manual trigger: `POST /admin/jobs/cleanup-media` (returns `{ stale, marked, purged, errors }`).
- [x] **Entry bucket key prefix** — `processing-stage/<uuid>.<ext>`. Enables the R2/S3 lifecycle policy in `infra/entry-bucket-lifecycle.json` to expire ghost uploads after 3 days.

### R2 bucket setup (do once per environment)
1. Create two R2 buckets: `legacylink-entry-<env>` and `legacylink-delivery-<env>`
2. Enable public access on the delivery bucket → set `CDN_BASE_URL`
3. Apply `infra/entry-bucket-lifecycle.json` to the **entry** bucket (ghost upload expiry)
4. Create an R2 API token with Object Read & Write on both buckets
5. Update the Lambda S3 trigger prefix filter to `processing-stage/`
6. Fill in all `AWS_*`, `S3_*`, and `CDN_BASE_URL` vars — see `.env.example` for the full checklist

---

## ✅ Phase 2 — Near-Term (COMPLETE)

### QR active gate (`is_qr_active`)
- [x] **Schema** — `Profile.is_qr_active Boolean @default(true)`.
- [x] **Scan routing** — `/r/:shortId` and `/p/:shortId` return HTTP 410 and skip scan recording when `is_qr_active = false`. No other behaviour changes.
- [x] **Backend route** — `PATCH /admin/profile/:shortId/qr-active` accepts `{ isQrActive: boolean }`.
- [x] **Billing endpoint** — `GET /ops/billing/account/:userId` includes `profiles: [{ shortId, isQrActive }]` so the ops dashboard can render per-plaque status.
- [x] **Ops dashboard** — Accounts page Settings tab has a "QR Code Status" section: pill toggle per shortId, optimistic UI with automatic revert on API error.

### Scan history — real DB
- [x] **`GET /admin/stats/:shortId`** returns scan history from a live `ScanLog` Prisma query (`[profile_id, scanned_at DESC]` index). No longer in-memory.

### Ops dashboard pages — all real data
All six pages are fully wired to live Prisma/backend data. No mocks remain.

| Route | Real data source |
|---|---|
| `/` | `GET /admin/analytics/summary` (4 tabs) |
| `/geographic` | Ontario scan map + scan locations |
| `/fulfillment` | QR generation, shipping sub-tabs |
| `/accounts` | `?shortId=` URL param, profile detail |
| `/billing` | Duplicate charge detection, per-account billing |
| `/support` | Priority ticket queue |

Sidebar badge counts (`pendingMediaCount`, `priorityTicketCount`) come from `GET /admin/analytics/summary`.

### Auth security hardening
- [x] **HttpOnly session cookie** — JWT delivered as `ll_session` cookie (`httpOnly`, `secure` in prod, `sameSite=strict`, 30-day `maxAge`). Token never touches `localStorage` or client-side JS.
- [x] **`resolveUserId()` cookie-first** — checks `ll_session` cookie first, falls back to `Authorization: Bearer` header so the ops-dashboard and API clients keep working without changes.
- [x] **`POST /auth/logout`** — clears the session cookie server-side (device-local sign-out).
- [x] **`POST /auth/logout-all`** — increments `auth_version` (revokes all tokens globally) AND clears the current device's cookie in the same request.
- [x] **CORS `credentials: true`** — required for the admin (port 3001) to send cookies cross-port to the API (port 3000).
- [x] **Zod input validation** — `SignupSchema` enforces email format/max/lowercase and password min 12 / max 72 / uppercase / lowercase / digit / special-char. `LoginSchema` enforces email format and password max 72 (bcrypt truncation guard). Validation errors return 422 with the first human-readable message.
- [x] **Account enumeration defence** — signup returns HTTP 200 `{ ok: true }` whether the email is new or already registered. The session cookie is set only for genuinely new accounts. The 409 "email already exists" leak is eliminated.
- [x] **IP rate limiting** — login: 5 attempts/min per IP; signup: 10 attempts/min per IP. Applied per-route via `@fastify/rate-limit` (in-memory). QR scan and profile routes are unaffected.
- [x] **Admin client cleaned up** — `ll_token` removed from `localStorage` entirely. `ProfileWizard` and `SupportPanel` switched to `credentials: 'include'`. Signup form `minLength` bumped to 12.

### Succession planning (Legacy Executor)
- [x] **`ExecutorStatus` enum** — `PENDING_VERIFICATION → VERIFIED → CLAIMED | REVOKED`. Tracks the full executor lifecycle in the DB.
- [x] **`LegacyExecutor` model** — `profile_id` FK (cascade delete), `name`, `email`, `relationship`, `verification_token` (unique, 40-char hex), `token_expires_at` (7-day window), `verified_at`, `claim_initiated_at`, `claim_notes`, `ops_notes`. Indexed on `[profile_id]`, `[verification_token]`, `[status]`.
- [x] **`Profile.executors` relation** — One Profile → many LegacyExecutors.
- [x] **`src/routes/succession.ts`** — 10 routes registered via `successionRoutes`:
  - `GET  /api/v1/succession/:profileId` — list non-REVOKED executors
  - `POST /api/v1/succession/:profileId` — invite executor (3-max + duplicate-email guard, logs verify URL)
  - `DELETE /api/v1/succession/:profileId/:executorId` — revoke (sets status, does not hard-delete)
  - `POST /api/v1/succession/:profileId/:executorId/resend` — re-issue token (PENDING_VERIFICATION only)
  - `GET  /succession/verify/:token` — public executor lookup (for landing page, no auth)
  - `POST /succession/verify/:token` — confirm verification → status becomes VERIFIED
  - `POST /succession/claim/:executorId` — VERIFIED executor initiates claim → CLAIMED
  - `GET  /ops/succession/claims` — ops queue of all CLAIMED executors with profile join
  - `PATCH /ops/succession/claims/:executorId` — approve (no status change, ops_notes set) or reject (clear claim fields, ops_notes set)
- [x] **Settings UI** — "Succession Planning" section in `admin/app/settings/page.tsx`: executor list with VERIFIED/PENDING status pills, Remove button, inline add-executor form (name/email/relationship), 3-executor hard cap, amber info callout. No real API call yet — UI-only mock state.
- [x] **Executor verify page** — `admin/app/succession/verify/[token]/page.tsx`: standalone public page (no AppShell), 4 states (loading, error/expired, confirm, success), fetches GET then POST to Fastify `/succession/verify/:token`.
- [x] **ToS Section 12 expanded** — "Account Ownership, Succession Planning & Inheritance" now covers Legacy Executor tool, manual transfer process, death-of-account-holder, and visitor access. TOC label updated.
- [x] **Ops succession claims page** — `ops-dashboard/app/succession/page.tsx`. Lists all `CLAIMED` executors from `GET /ops/succession/claims`. Each row shows executor name/email/relationship, linked memorial name + shortId, time-ago, and expandable claim statement. Inline approve/reject panel with optional ops notes textarea; row fades out 800ms after resolution. Empty, loading, and error states. Sidebar "Succession" nav item added under Premium section with indigo badge count fetched on mount.

---

## ⏳ Phase 3 — Defer Until Needed

Build only when telemetry proves you need them. Each item lists its trigger condition.

### Argon2id password migration
**What:** Replace bcrypt with Argon2id (memory-hard, GPU-resistant). Bcrypt at cost 12 is adequate today but vulnerable to GPU acceleration if a DB leak ever occurs.
**Why defer:** Existing password hashes are bcrypt. A hard cutover locks out every current user. The correct migration is re-hash on next successful login: verify the existing bcrypt hash, then re-store as Argon2id. That's a week of careful work with a rollback plan.
**Trigger:** Before first paid production users, or after a security audit recommends it.
**How:** Install `argon2` package; update `bcrypt.hash` calls in signup and PIN creation; update `bcrypt.compare` calls with a detect-algorithm wrapper that handles both hash formats during the transition window.

### Email-based rate limiting (per-target login)
**What:** In addition to IP-based limits (already live), track failed login attempts per email address. Stops credential-stuffing attacks from distributed proxy networks.
**Why defer:** In-memory per-IP limiting (already live) handles the common case. Per-email limiting requires a persistent counter that survives server restarts and works across multiple instances.
**Trigger:** When server moves to multiple instances OR when bot traffic is observed targeting specific known email addresses.
**How:** Add Redis (Upstash or Railway Redis); replace `@fastify/rate-limit` in-memory store with the Redis adapter; add a second limiter keyed on `req.body.email` (3 failures/min per address).

### Read replica routing
**What:** Route all Prisma reads to a Neon read replica, writes to the primary. Public profile loads (95% of traffic) hit the replica; signups and billing updates hit the primary.
**Why defer:** Neon read replicas require a paid plan. At current scale a single Neon instance handles the load. The extension is a 3-line change when ready.
**Trigger:** DB CPU consistently above 60% on the primary, or Neon instance costs justify a replica.
**How:**
```typescript
// src/lib/db.ts — add when DATABASE_REPLICA_URL is set
import { readReplicas } from '@prisma/extension-read-replicas';

const prismaBase = new PrismaClient();
export const db = DATABASE_REPLICA_URL
  ? prismaBase.$extends(readReplicas({ url: DATABASE_REPLICA_URL }))
  : prismaBase;
```
Add `DATABASE_REPLICA_URL` to `.env.example`. Verify `@prisma/extension-read-replicas` compatibility with Prisma 7 before installing.

### `relationMode = "prisma"` for migration safety
**What:** Move FK enforcement from PostgreSQL to application code so ALTER TABLE migrations don't acquire exclusive locks that block scan traffic.
**Why defer:** At current scale, migration-caused lock contention is theoretical. The FK lock scenario requires concurrent write-heavy scan traffic that doesn't exist yet.
**Important correction:** `relationMode` is a **datasource-level setting** in Prisma — it applies to all models or none. It cannot be applied selectively to just `ScanLog`. Switching globally removes referential integrity enforcement from every table, trading a theoretical performance concern for a real data-safety risk. Only adopt this if migrations are visibly causing timeouts in production.
**Trigger:** Migrations routinely cause observable query timeouts on the public profile page during deploy windows.
**How:** Set `relationMode = "prisma"` in `schema.prisma` datasource block, then re-run `db:generate`. All cascade deletes and FK lookups move to Prisma's query layer. Audit every `onDelete` relation for correctness before enabling.

### Edge KV cache for QR short-URL routing
**What:** Cache `short_id → profileId` mappings at the CDN edge (Cloudflare KV or Vercel Edge Config). QR scans resolve without hitting the Fastify origin or Neon at all on cache hits.
**Why defer:** Fastify + Neon handles the current scan volume in well under 50 ms. Edge caching adds deployment complexity and a cache invalidation problem (what triggers a purge when `is_qr_active` changes?).
**Trigger:** p95 scan-to-redirect latency exceeds 300 ms, or Fastify hosting costs rise noticeably from scan traffic.
**How:** On every `/r/:shortId` hit, write `{ profileId, isQrActive, isPrivate }` to KV with a 5-minute TTL. Add a cache-bust call to the KV key in `PATCH /admin/profile/:shortId/qr-active`. The edge function short-circuits to the profile URL on a cache hit; misses fall through to Fastify as today.

### Redis caching for `auth_version`
**Why defer:** `resolveUserId()` does one PK lookup on `users`. PostgreSQL handles thousands of these per second. Move to Redis only when server costs rise or p99 latency degrades.

### ScanLog partitioning
**Why defer:** The BigInt PK and composite index already cover the analytics query pattern at current scale. Partition by month only when seeing tens of thousands of scans per day.

### Materialized views / stored procedures for QR marker health
**Why defer:** A nightly cron with one bulk `rawPrisma.$executeRaw` UPDATE completes in milliseconds at current scale. Add a stored procedure only if the nightly window starts taking minutes.

### Organisation / tenant layer
**Why defer:** LegacyLink's access model is flat: one user owns 1–3 profiles. Add an `Organisation` model only if B2B (funeral homes managing hundreds of profiles under one billing account) becomes a real roadmap item.

### Message queue (SQS / Kafka) for scan events
**Why defer:** `recordScanAsync` uses `setImmediate` fire-and-forget. SQS integration is a one-file change in `src/analytics.ts` when volume demands it.

### CDN / edge caching for profile pages
**Why defer:** Add `Cache-Control` headers or move to a CDN edge function only once profile traffic is high enough to stress the Fastify process.

---

## Decision log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-05 | R2 over S3 for media storage | Zero egress fees; SDK is S3-compatible, same code |
| 2026-06-14 | BigInt PK on ScanLog | Sequential IDs reduce B-tree write amplification on append-only table |
| 2026-06-14 | `auth_version` as Int on User, not a session table | Simpler; one column achieves token revocation without statefulness |
| 2026-06-14 | No Organisation model yet | Current business model is flat; migration is easy if B2B materialises |
| 2026-06-14 | `UploadStatus` enum separate from `ModerationStatus` | File lifecycle (where is the file?) and content review (is it safe?) are independent concerns — a file can be READY but still FLAGGED |
| 2026-06-14 | `setInterval` for cleanup cron, no external scheduler | No new dependency; 6-hour interval is sufficient and the startup run catches anything missed during downtime |
| 2026-06-14 | `statement_timeout` via `pool.on('connect')` | Cleanest approach — applies to every connection without modifying the DATABASE_URL format |
| 2026-06-14 | `is_qr_active` on Profile, not a separate table | Simplest toggle; one boolean, one PATCH route. No need for an activation/deactivation event log at this scale |
| 2026-06-14 | HTTP 410 (Gone) for inactive QR scans | Semantically correct — the resource existed but is intentionally deactivated. 404 would mislead; 403 would suggest a permissions issue |
| 2026-06-14 | Scan history from live ScanLog DB query | Removed in-memory fallback; `[profile_id, scanned_at DESC]` index makes the query fast enough that no cache is needed yet |
| 2026-06-15 | HttpOnly cookie for JWT, not localStorage | XSS cannot steal a token that JS cannot read. `sameSite=strict` mitigates CSRF. Cookie falls back to Authorization header so ops-dashboard keeps working |
| 2026-06-15 | Signup returns HTTP 200 for both new and duplicate email | Eliminates the 409 enumeration leak. Duplicate-email path returns no session cookie; new-account path sets one. Frontend distinguishes by presence of `data.user` |
| 2026-06-15 | Zod validation at API boundary, min password 12 chars | Never trust raw request body. Max 72 guards bcrypt's silent truncation limit. Complexity rules enforced at signup only so existing shorter passwords still work at login |
| 2026-06-15 | IP rate limiting in-memory (no Redis yet) | `@fastify/rate-limit` default store is sufficient for a single-instance server. Redis store is a drop-in swap when multi-instance deployment happens |
| 2026-06-15 | Defer `relationMode = "prisma"` | Cannot be applied per-model — it's datasource-wide. Removing global FK constraints trades a theoretical lock concern for a real integrity risk at current scale |
| 2026-06-15 | Defer Argon2id | Bcrypt cost 12 is adequate. Migration requires a re-hash-on-next-login strategy to avoid locking out existing users — a separate, careful piece of work |
| 2026-06-15 | `verification_token` as 40-char hex (crypto.randomBytes), not nanoid | Node built-in, no dependency. 160 bits of entropy is more than sufficient for a 7-day email token |
| 2026-06-15 | Claim approval leaves status as VERIFIED, doesn't add a new enum value | Account transfer is completed manually (outside the system) — no need for a TRANSFER_COMPLETED state at this scale. ops_notes records the decision |
| 2026-06-15 | 3-executor limit at application layer, not DB constraint | Simpler than a check constraint; consistent with how other per-profile limits are handled |
| 2026-06-16 | No terminal state after claim approval — executor returns to VERIFIED | Account transfer is manual; a TRANSFER_COMPLETED state would require a separate ops action with no current workflow to back it. Revisit if ops reports re-submission confusion |
| 2026-06-16 | verification_token not nulled after verify | Token is inert once status leaves PENDING_VERIFICATION (GET + POST verify both filter on status). Scrubbing it is a cosmetic improvement deferred until there's a reason to add the extra write |
