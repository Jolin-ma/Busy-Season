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
Auth: `bcryptjs` (cost 12) + `@fastify/jwt` (30-day tokens)

---

## ✅ Phase 1 — Day 1 Non-Negotiables (COMPLETE)

These are in production. Do not revisit without a strong reason.

### Data integrity
- [x] **Stripe idempotency** — `Transaction.id` IS the Stripe charge ID (`@id`). Duplicate webhooks rejected at DB level. No application-layer check needed.
- [x] **Soft delete only** — `Profile.deleted_at`. The `db` Prisma extension silently appends `deleted_at: null` to every read. Hard delete is a manual admin-only operation.
- [x] **`short_id` immutability** — `@unique @db.VarChar(8)`, generated before insert, never updated. Engraved on physical plaques.
- [x] **Guestbook moderation gate** — `GuestbookEntry.is_approved` defaults to `false`. Public queries must always filter `is_approved: true`.

### Auth & security
- [x] **bcrypt passwords** — `User.password_hash`, cost 12. Raw passwords never stored.
- [x] **bcrypt privacy PIN** — `Profile.privacy_pin`, same cost. PIN verified via `bcrypt.compare` on every unlock attempt.
- [x] **JWT auth routes** — `POST /auth/login` and `POST /auth/signup` fully wired. Tokens expire in 30 days.
- [x] **`auth_version` column** — `User.auth_version Int @default(1)`. Exists on the model. Enables token revocation without a session table.

### Ownership & isolation
- [x] **User → Profile ownership** — `Profile.user_id` FK. Every profile query can verify ownership in one hop.
- [x] **JWT-first profile creation** — Both `POST /admin/link` and `POST /admin/profile` read `userId` from the JWT first, fall back to `SEED_USER_ID` only in dev.

### Schema optimisations (done this session)
- [x] **`MediaAsset.original_key` / `processed_key`** — Deterministic S3/R2 keys required for orphan cleanup.
- [x] **`ScanLog.id` → BigInt autoincrement** — Sequential IDs keep the clustered index tight on the highest-write table.
- [x] **`ScanLog` composite index** — `[profile_id, scanned_at DESC]` covers the analytics dashboard hot path.

---

## 🔜 Phase 2 — Near-Term (Build When You Add the Feature)

Infrastructure exists; logic not yet written. These are not emergencies but should ship before public launch.

### Token revocation (auth_version enforcement)
The `auth_version` column is on the model but the JWT middleware doesn't check it.

**What to build:**
1. In the JWT verify middleware, after decoding the token, fetch the user's current `auth_version` from DB and compare against the value encoded in the token.
2. Add a `POST /auth/logout-all` route that increments `auth_version` by 1 — this silently invalidates every active token for that user.
3. Increment `auth_version` automatically on `POST /auth/change-password`.

**Cost:** ~50 lines. One DB lookup per authenticated request (negligible — see Redis note in Phase 3).

### Media orphan cleanup
`original_key` and `processed_key` are stored. No job yet deletes the S3/R2 objects.

**What to build:**
1. A Fastify route (or nightly cron) that queries `MediaAsset WHERE moderation_status = 'REJECTED'` or `Profile.deleted_at IS NOT NULL` and issues `DeleteObject` calls to R2 using the stored keys.
2. Hook into the soft-delete flow so a profile purge enqueues its media keys for deletion.

### PIN hashing note (already done — for reference)
PIN is stored as a bcrypt hash. The PATCH `/admin/link/:shortId/privacy` response echoes the raw PIN back to the caller (`privacyPin: isPrivate ? privacyPin : ''`). This is safe (it was just sent in by the same admin session) but worth noting if the API ever becomes multi-user.

### Scan history persistence
`getScanHistory()` in `src/db.ts` is still in-memory. Fine for dev; loses data on restart.

**What to build:** A `GET /admin/stats/:shortId/history` route that queries `ScanLog` directly. No queue needed until you have >10k scans/day.

---

## ⏳ Phase 3 — Defer (Premature Optimisations)

Build only when telemetry proves you need them. Building early adds complexity with no benefit.

### Redis caching for auth_version
**Why defer:** A Prisma lookup on `users WHERE id = $userId` with a PK hit runs in ~1 ms. PostgreSQL handles thousands of these per second without issue. Move to Redis only when server costs rise or p99 latency degrades.

### ScanLog partitioning
**Why defer:** PostgreSQL handles flat tables with hundreds of thousands of rows instantly. The BigInt PK and composite index already cover the analytics query pattern. Partition by month only when you are seeing tens of thousands of scans per day.

### Materialized views / stored procedures for QR marker health
**Why defer:** A nightly cron that runs one bulk `UPDATE qr_markers SET status = CASE ... END FROM profiles ...` via `rawPrisma.$executeRaw` completes in milliseconds at current scale. Add a stored procedure only if the nightly window starts exceeding a few minutes.

### Organisation / tenant layer
**Why defer:** LegacyLink's access model is flat: one user owns 1–3 profiles. The User → Profile FK is sufficient. Add an `Organisation` model only if B2B (funeral homes managing hundreds of profiles under one billing account) becomes a real roadmap item. Migration is straightforward when that time comes.

### Message queue (SQS / Kafka) for scan events
**Why defer:** `recordScanAsync` uses `setImmediate` fire-and-forget. Acceptable until scan volume is high enough that in-process async writes cause measurable latency. SQS integration is a one-file change in `src/analytics.ts` when needed.

### CDN / edge caching for profile pages
**Why defer:** Profile HTML is rendered server-side per request. Add `Cache-Control` headers or move rendering to a CDN edge function only once profile traffic is high enough to stress the Fastify process.

---

## Decision log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-05 | R2 over S3 for media storage | Zero egress fees; SDK is S3-compatible, same code |
| 2026-06-05 | BigInt PK on ScanLog | Sequential IDs reduce B-tree write amplification on append-only table |
| 2026-06-05 | auth_version as Int on User, not a session table | Simpler; one column achieves token revocation without statefulness |
| 2026-06-05 | No Organisation model yet | Current business model is flat; migration is easy if B2B materialises |
