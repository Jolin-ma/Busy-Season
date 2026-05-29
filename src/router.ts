import Fastify from 'fastify';
import { generateLegacyQR } from './qrGenerator';
import { generateShortId }  from './shortId';
import { createLink, lookupLink, getScanHistory, setPrivacy } from './db';
import { recordScanAsync }  from './analytics';
import { renderProfile }    from './profileTemplate';
import { renderPinGate }    from './pinGateTemplate';
import { renderAuthPage }   from './authTemplate';
import { MOCK_PROFILE }     from './mockProfile';

export function buildServer() {
  const app = Fastify({ logger: true });

  // ── Auth Pages ──────────────────────────────────────────────────────────────
  app.get('/login', async (_req, reply) =>
    reply.header('Content-Type', 'text/html; charset=utf-8').send(renderAuthPage())
  );
  app.get('/signup', async (_req, reply) =>
    reply.redirect('/login', 302)
  );

  // Stub — replace with session + bcrypt when auth is wired
  app.post<{ Body: { email: string; password: string } }>('/auth/login', async (req, reply) => {
    const { email, password } = req.body;
    if (!email || !password)
      return reply.code(400).send({ error: 'Email and password are required.' });
    return reply.code(401).send({ error: 'Invalid email or password.' });
  });
  app.post<{ Body: { name: string; email: string; password: string } }>('/auth/signup', async (req, reply) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return reply.code(400).send({ error: 'All fields are required.' });
    if (password.length < 8)
      return reply.code(400).send({ error: 'Password must be at least 8 characters.' });
    return reply.code(201).send({ message: 'Account created.' });
  });

  // ── Scan Entry Point ────────────────────────────────────────────────────────
  app.get<{ Params: { shortId: string } }>('/p/:shortId', async (req, reply) => {
    const { shortId } = req.params;
    const link = await lookupLink(shortId);

    if (!link) return reply.code(404).send({ error: 'QR destination not found.' });

    recordScanAsync({
      shortId,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    if (link.isPrivate) {
      return reply
        .header('Content-Type', 'text/html; charset=utf-8')
        .send(renderPinGate(shortId, false));
    }

    const profileBaseUrl = process.env.PROFILE_BASE_URL ?? 'http://localhost:3000/profile';
    return reply.redirect(`${profileBaseUrl}/${link.profileId}`, 302);
  });

  // ── PIN Unlock ──────────────────────────────────────────────────────────────
  app.post<{ Params: { shortId: string }; Body: { pin: string } }>(
    '/p/:shortId/unlock',
    async (req, reply) => {
      const { shortId } = req.params;
      const { pin } = req.body;
      const link = await lookupLink(shortId);

      if (!link) return reply.code(404).send({ error: 'Not found.' });
      if (!link.isPrivate) return reply.code(400).send({ error: 'Profile is not private.' });
      if (!pin || pin !== link.privacyPin)
        return reply.code(401).send({ error: 'Incorrect PIN.' });

      const profileBaseUrl = process.env.PROFILE_BASE_URL ?? 'http://localhost:3000/profile';
      return reply.send({ redirectUrl: `${profileBaseUrl}/${link.profileId}` });
    }
  );

  // ── Admin: Update Privacy Settings ──────────────────────────────────────────
  app.patch<{ Params: { shortId: string }; Body: { isPrivate: boolean; privacyPin: string } }>(
    '/admin/link/:shortId/privacy',
    async (req, reply) => {
      reply.header('Access-Control-Allow-Origin', '*');
      const { shortId } = req.params;
      const { isPrivate, privacyPin } = req.body;
      const ok = await setPrivacy(shortId, isPrivate, privacyPin ?? '');
      if (!ok) return reply.code(404).send({ error: 'Short ID not found.' });
      return reply.send({ shortId, isPrivate, privacyPin: isPrivate ? privacyPin : '' });
    }
  );

  app.options('/admin/link/:shortId/privacy', async (_req, reply) => {
    reply
      .header('Access-Control-Allow-Origin', '*')
      .header('Access-Control-Allow-Methods', 'PATCH, OPTIONS')
      .header('Access-Control-Allow-Headers', 'Content-Type')
      .code(204).send();
  });

  // ── Admin: Provision a New Short Link ───────────────────────────────────────
  app.post<{ Body: { profileId?: string; name?: string } }>('/admin/link', async (req, reply) => {
    const fullName = req.body.name ?? req.body.profileId ?? 'Unnamed Profile';
    const userId   = process.env.SEED_USER_ID;

    if (!userId) {
      return reply.code(503).send({ error: 'Server is still initialising. Try again shortly.' });
    }

    const shortId = generateShortId();
    const record  = await createLink(shortId, userId, fullName);

    return reply.code(201).send({
      shortId,
      shortUrl:  `https://lglk.to/p/${shortId}`,
      profileId: record.profileId,
      createdAt: record.createdAt,
    });
  });

  // ── Admin: Export QR SVG ────────────────────────────────────────────────────
  app.get<{ Params: { shortId: string } }>('/admin/qr/:shortId', async (req, reply) => {
    const { shortId } = req.params;
    if (!(await lookupLink(shortId)))
      return reply.code(404).send({ error: 'Short ID not registered.' });

    const svg = await generateLegacyQR(shortId);
    return reply
      .header('Content-Type', 'image/svg+xml')
      .header('Content-Disposition', `attachment; filename="legacylink-${shortId}.svg"`)
      .send(svg);
  });

  // ── Memorial Profile Page ───────────────────────────────────────────────────
  app.get<{ Params: { profileId: string } }>('/profile/:profileId', async (_req, reply) =>
    reply.header('Content-Type', 'text/html; charset=utf-8').send(renderProfile(MOCK_PROFILE))
  );

  // ── Admin: Scan Stats ───────────────────────────────────────────────────────
  app.get<{ Params: { shortId: string } }>('/admin/stats/:shortId', async (req, reply) => {
    const link = await lookupLink(req.params.shortId);
    if (!link) return reply.code(404).send({ error: 'Not found.' });
    return reply.send({
      shortId:    req.params.shortId,
      profileId:  link.profileId,
      scansCount: link.scansCount,
      createdAt:  link.createdAt,
      isPrivate:  link.isPrivate,
    });
  });

  // ── Admin: Scan History ─────────────────────────────────────────────────────
  app.get<{ Params: { shortId: string } }>('/admin/stats/:shortId/history', async (req, reply) => {
    const link = await lookupLink(req.params.shortId);
    if (!link) return reply.code(404).send({ error: 'Not found.' });
    return reply.send({ shortId: req.params.shortId, events: getScanHistory(req.params.shortId) });
  });

  return app;
}
