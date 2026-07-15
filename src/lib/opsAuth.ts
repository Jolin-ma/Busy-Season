import crypto from 'crypto';
import { FastifyReply, FastifyRequest } from 'fastify';

// Back-office guard for ops-dashboard / internal routes.
//
// Active only when OPS_API_KEY is set (set it on Railway in production).
// When unset (local dev), guarded routes stay open so the ops dashboard and
// admin UI keep working without configuration — buildServer() logs a warning.
//
// Callers authenticate with the `x-ops-key` header (or `?key=` for the
// WebSocket route, handled in router.ts).
export const OPS_API_KEY = process.env.OPS_API_KEY ?? '';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function requireOpsKey(req: FastifyRequest, reply: FastifyReply) {
  if (!OPS_API_KEY) return; // dev mode — guard disabled
  const provided = req.headers['x-ops-key'];
  if (typeof provided === 'string' && safeEqual(provided, OPS_API_KEY)) return;
  return reply.code(401).send({ error: 'Unauthorised.' });
}
