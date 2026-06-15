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
Storage: S3-compatible (R2 preferred — zero egress fees)
Auth: `bcryptjs` (cost 12) + `@fastify/jwt` (30-day tokens, authVersion-gated)

---

## ✅ Phase 1 — Non-Negotiables (COMPLETE)

These are in production. Do not revisit without a strong reason.

### Data integrity
- [x] **Stripe idempotency** — `Transaction.id` IS the Stripe charge ID (`@id`). Duplicate webhooks rejected at DB level.
- [x] **Soft delete only** — `Profile.deleted_at`. The `db` Prisma extension silently appends `deleted_at: null` to every read. Hard delete is a manual admin-only operation.
- [x] **`short_id` immutability** — `@unique @db.VarChar(8)`, generated before insert, never updated. Engraved on physical plaques.
- [x] **Guestbook moderation gate** — `GuestbookEntry.is_approved` defaults to `false`. Public queries must always filter `is_approved: true`.

### Auth & security
- [x] **bcrypt passwords** — `User.password_hash`, cost 12.
- [x] **bcrypt privacy PIN** — `Profile.privacy_pin`, cost 12. Verified via `bcrypt.compare` on every unlock.
- [x] **JWT auth routes** — `POST /auth/login` and `POST /auth/signup` fully wired. Tokens expire in 30 days and embed `authVersion`.
- [x] **auth_version enforcement** — `resolveUserId()` in `router.ts` verifies JWT signature AND checks `User.auth_version` against the value encoded in the token on every authenticated request. Stale tokens are rejected immediately.
- [x] **`POST /auth/logout-all`** — increments `auth_version`, invalidating every active token for that user instantly.

### Ownership & isolation
- [x] **User → Profile ownership** — `Profile.user_id` FK. Every profile query can verify ownership in one hop.
- [x] **JWT-first profile creation** — Both `POST /admin/link` and `POST /admin/profile` use `resolveUserId()` first, fall back to `SEED_USER_ID` only in dev.

### Schema
- [x] **`User.auth_version`** — `Int @default(1)`. Token revocation without a session table.
- [x] **`MediaAsset.original_key` / `processed_key`** — Deterministic S3/R2 keys for orphan cleanup.
- [x] **`MediaAsset.upload_status`** — `UploadStatus` state machine (PENDING_UPLOAD → PROCESSING → READY | MARKED_FOR_DELETION). Separate from `ModerationStatus` — file lifecycle and content review are different concerns.
- [x] **`ScanLog.id` → BigInt autoincrement** — Sequential IDs keep the clustered index tight on the highest-write table.
- [x] **`ScanLog` composite index** — `[profile_id, scanned_at DESC]` covers the analytics dashboard hot path.

### Connection hardening
- [x] **Statement timeout** — `SET statement_timeout = 3000` applied to every pool connection via `pool.on('connect')`. Kills runaway queries before they cascade.
- [x] **`DIRECT_URL` split** — `prisma.config.ts` uses `DIRECT_URL` for migrations (bypasses PgBouncer — advisory locks don't survive connection hand-offs). App queries use the pooled `DATABASE_URL`.

### Media lifecycle
- [x] **`UploadStatus` state machine** — Lambda webhook sets `READY` on success or `MARKED_FOR_DELETION` on `REJECTED`, and stores `original_key` / `processed_key` for cleanup.
- [x] **Media orphan cleanup cron** — `src/jobs/mediaCleanup.ts`. Runs at startup + every 6 hours via `setInterval`. Phase 1 cascade-marks assets from soft-deleted profiles. Phase 2 deletes from S3 then hard-deletes the DB row. S3 failures leave the row intact for the next run. Manual trigger: `POST /admin/jobs/cleanup-media` (returns `{ marked, purged, errors }`).

---

## 🔜 Phase 2 — Near-Term

One item remaining. Not an emergency, but should ship before heavy user traffic.

### Scan history persistence
`getScanHistory()` in `src/db.ts` is still in-memory — data is lost on server restart.

**What to build:** Replace with a `GET /admin/stats/:shortId/history` route that queries `ScanLog` directly using the `[profile_id, scanned_at DESC]` composite index. No queue needed until you have >10k scans/day.

---

## ⏳ Phase 3 — Defer (Premature Optimisations)

Build only when telemetry proves you need them.

### Redis caching for auth_version
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
