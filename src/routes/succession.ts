import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { rawPrisma } from '../lib/db';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function cors(reply: any) {
  Object.entries(CORS).forEach(([k, v]) => reply.header(k, v));
  return reply;
}

export async function successionRoutes(app: FastifyInstance) {

  app.options('/api/v1/succession/*', async (_req, reply) =>
    cors(reply).code(204).send()
  );

  app.options('/ops/succession/*', async (_req, reply) =>
    cors(reply).code(204).send()
  );

  // ── GET /api/v1/succession/:profileId ──────────────────────────────────────
  app.get<{ Params: { profileId: string } }>(
    '/api/v1/succession/:profileId',
    async (req, reply) => {
      const executors = await rawPrisma.legacyExecutor.findMany({
        where: {
          profile_id: req.params.profileId,
          status: { not: 'REVOKED' },
        },
        orderBy: { created_at: 'asc' },
      });
      return cors(reply).send({ executors });
    }
  );

  // ── POST /api/v1/succession/:profileId ─────────────────────────────────────
  app.post<{
    Params: { profileId: string };
    Body:   { name: string; email: string; relationship: string };
  }>(
    '/api/v1/succession/:profileId',
    async (req, reply) => {
      const { profileId } = req.params;
      const { name, email, relationship } = req.body;

      const activeCount = await rawPrisma.legacyExecutor.count({
        where: { profile_id: profileId, status: { not: 'REVOKED' } },
      });
      if (activeCount >= 3) {
        return cors(reply).code(409).send({ error: 'A profile may have at most 3 active executors.' });
      }

      const duplicate = await rawPrisma.legacyExecutor.findFirst({
        where: { profile_id: profileId, email, status: { not: 'REVOKED' } },
      });
      if (duplicate) {
        return cors(reply).code(409).send({ error: 'This email is already listed as an executor for this profile.' });
      }

      const token = crypto.randomBytes(20).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const executor = await rawPrisma.legacyExecutor.create({
        data: {
          profile_id:         profileId,
          name,
          email,
          relationship,
          verification_token: token,
          token_expires_at:   tokenExpiresAt,
        },
      });

      const verifyUrl = `/succession/verify/${token}`;
      app.log.info(`[succession] verify URL: ${verifyUrl}`);

      return cors(reply).code(201).send({ executor, verifyUrl });
    }
  );

  // ── DELETE /api/v1/succession/:profileId/:executorId ───────────────────────
  app.delete<{ Params: { profileId: string; executorId: string } }>(
    '/api/v1/succession/:profileId/:executorId',
    async (req, reply) => {
      const { profileId, executorId } = req.params;

      const existing = await rawPrisma.legacyExecutor.findFirst({
        where: { id: executorId, profile_id: profileId },
      });
      if (!existing) return cors(reply).code(404).send({ error: 'Executor not found.' });

      await rawPrisma.legacyExecutor.update({
        where: { id: executorId },
        data:  { status: 'REVOKED' },
      });

      return cors(reply).send({ success: true });
    }
  );

  // ── POST /api/v1/succession/:profileId/:executorId/resend ──────────────────
  app.post<{ Params: { profileId: string; executorId: string } }>(
    '/api/v1/succession/:profileId/:executorId/resend',
    async (req, reply) => {
      const { profileId, executorId } = req.params;

      const existing = await rawPrisma.legacyExecutor.findFirst({
        where: { id: executorId, profile_id: profileId },
      });
      if (!existing) return cors(reply).code(404).send({ error: 'Executor not found.' });
      if (existing.status !== 'PENDING_VERIFICATION') {
        return cors(reply).code(400).send({ error: 'Verification can only be resent for executors with PENDING_VERIFICATION status.' });
      }

      const token = crypto.randomBytes(20).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await rawPrisma.legacyExecutor.update({
        where: { id: executorId },
        data:  { verification_token: token, token_expires_at: tokenExpiresAt },
      });

      const verifyUrl = `/succession/verify/${token}`;
      app.log.info(`[succession] verify URL (resent): ${verifyUrl}`);

      return cors(reply).send({ success: true, verifyUrl });
    }
  );

  // ── GET /succession/verify/:token ──────────────────────────────────────────
  app.get<{ Params: { token: string } }>(
    '/succession/verify/:token',
    async (req, reply) => {
      const executor = await rawPrisma.legacyExecutor.findFirst({
        where: {
          verification_token: req.params.token,
          status:             'PENDING_VERIFICATION',
          token_expires_at:   { gt: new Date() },
        },
      });
      if (!executor) return cors(reply).code(404).send({ error: 'Verification link is invalid or has expired.' });

      return cors(reply).send({
        executor: {
          id:           executor.id,
          name:         executor.name,
          email:        executor.email,
          relationship: executor.relationship,
          profileId:    executor.profile_id,
        },
      });
    }
  );

  // ── POST /succession/verify/:token ─────────────────────────────────────────
  app.post<{ Params: { token: string } }>(
    '/succession/verify/:token',
    async (req, reply) => {
      const executor = await rawPrisma.legacyExecutor.findFirst({
        where: {
          verification_token: req.params.token,
          status:             'PENDING_VERIFICATION',
          token_expires_at:   { gt: new Date() },
        },
      });
      if (!executor) return cors(reply).code(404).send({ error: 'Verification link is invalid or has expired.' });

      const updated = await rawPrisma.legacyExecutor.update({
        where: { id: executor.id },
        data:  { status: 'VERIFIED', verified_at: new Date() },
      });

      return cors(reply).send({
        success: true,
        executor: { id: updated.id, name: updated.name, status: updated.status },
      });
    }
  );

  // ── POST /succession/claim/:executorId ─────────────────────────────────────
  app.post<{
    Params: { executorId: string };
    Body:   { claimNotes?: string };
  }>(
    '/succession/claim/:executorId',
    async (req, reply) => {
      const executor = await rawPrisma.legacyExecutor.findUnique({
        where: { id: req.params.executorId },
      });
      if (!executor) return cors(reply).code(404).send({ error: 'Executor not found.' });
      if (executor.status !== 'VERIFIED') {
        return cors(reply).code(400).send({ error: 'Only verified executors may initiate a claim.' });
      }

      await rawPrisma.legacyExecutor.update({
        where: { id: req.params.executorId },
        data:  {
          status:             'CLAIMED',
          claim_initiated_at: new Date(),
          claim_notes:        req.body.claimNotes ?? null,
        },
      });

      return cors(reply).send({ success: true });
    }
  );

  // ── GET /ops/succession/claims ─────────────────────────────────────────────
  app.get('/ops/succession/claims', async (_req, reply) => {
    const claimed = await rawPrisma.legacyExecutor.findMany({
      where:   { status: 'CLAIMED' },
      orderBy: { claim_initiated_at: 'asc' },
    });

    const profileIds = [...new Set(claimed.map(e => e.profile_id))];
    const profiles = await rawPrisma.profile.findMany({
      where:  { id: { in: profileIds } },
      select: { id: true, short_id: true, full_name: true },
    });
    const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));

    const claims = claimed.map(e => ({
      ...e,
      profile: profileMap[e.profile_id] ?? null,
    }));

    return cors(reply).send({ claims });
  });

  // ── PATCH /ops/succession/claims/:executorId ───────────────────────────────
  app.patch<{
    Params: { executorId: string };
    Body:   { action: 'approve' | 'reject'; opsNotes?: string };
  }>(
    '/ops/succession/claims/:executorId',
    async (req, reply) => {
      const { action, opsNotes } = req.body;
      const executor = await rawPrisma.legacyExecutor.findUnique({
        where: { id: req.params.executorId },
      });
      if (!executor) return cors(reply).code(404).send({ error: 'Executor not found.' });
      if (executor.status !== 'CLAIMED') {
        return cors(reply).code(400).send({ error: 'Executor is not in CLAIMED status.' });
      }

      const data: Record<string, unknown> = {
        status:    'VERIFIED',
        ops_notes: opsNotes ?? null,
      };
      if (action === 'reject') {
        data.claim_initiated_at = null;
      }

      const updated = await rawPrisma.legacyExecutor.update({
        where: { id: req.params.executorId },
        data,
      });

      return cors(reply).send({ success: true, executor: updated });
    }
  );
}
