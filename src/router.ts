import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyJwt       from '@fastify/jwt';
import fastifyCors      from '@fastify/cors';
import bcrypt           from 'bcryptjs';
import { generateLegacyQR } from './qrGenerator';
import { generateShortId }  from './shortId';
import { createLink, lookupLink, lookupLinkForRouting, getScanHistory, setPrivacy, getTopScanLocations } from './db';
import { rawPrisma } from './lib/db';
import { storeEntry, getPending } from './guestbookStore';
import { recordScanAsync }  from './analytics';
import { renderProfile }    from './profileTemplate';
import { renderPetProfile } from './petProfileTemplate';
import { MOCK_PET_PROFILE } from './mockPetProfile';
import { renderPinGate }    from './pinGateTemplate';
import { renderAuthPage }       from './authTemplate';
import { renderActivationPage } from './activationTemplate';
import { MOCK_PROFILE }     from './mockProfile';
import { premiumRoutes }    from './routes/premium';
import { billingRoutes }    from './routes/billing';
import { registerClient }   from './wsHub';

export function buildServer() {
  const app = Fastify({ logger: true });

  app.register(fastifyCors, {
    origin: [
      'http://localhost:3001',
      'http://localhost:3002',
      process.env.ADMIN_URL ?? '',
      process.env.OPS_URL  ?? '',
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  });

  app.register(fastifyWebsocket);
  app.register(premiumRoutes);
  app.register(billingRoutes);

  // ── Auth Pages ──────────────────────────────────────────────────────────────
  app.get('/login', async (_req, reply) =>
    reply.header('Content-Type', 'text/html; charset=utf-8').send(renderAuthPage())
  );
  app.get('/signup', async (_req, reply) =>
    reply.redirect('/login', 302)
  );

  app.post<{ Body: { email: string; password: string } }>('/auth/login', async (req, reply) => {
    const { email, password } = req.body;
    if (!email || !password)
      return reply.code(400).send({ error: 'Email and password are required.' });

    const user = await rawPrisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) return reply.code(401).send({ error: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return reply.code(401).send({ error: 'Invalid email or password.' });

    const token = app.jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      { expiresIn: '30d' }
    );
    return reply.send({ token, user: { id: user.id, name: user.name, email: user.email } });
  });

  app.post<{ Body: { name: string; email: string; password: string } }>('/auth/signup', async (req, reply) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return reply.code(400).send({ error: 'All fields are required.' });
    if (password.length < 8)
      return reply.code(400).send({ error: 'Password must be at least 8 characters.' });

    const existing = await rawPrisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) return reply.code(409).send({ error: 'An account with that email already exists.' });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await rawPrisma.user.create({
      data: {
        name:          name.trim(),
        email:         email.toLowerCase().trim(),
        password_hash,
      },
    });

    const token = app.jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      { expiresIn: '30d' }
    );
    return reply.code(201).send({ token, user: { id: user.id, name: user.name, email: user.email } });
  });

  // ── Smart QR Router ─────────────────────────────────────────────────────────
  // This is the canonical URL burned into every new physical plaque.
  // A single static URL must serve two completely different lifecycles:
  //   State A (no coordinates) → activation page   — admin first scan
  //   State B (coordinates set) → public profile   — all future visitor scans
  app.get<{ Params: { shortId: string } }>('/r/:shortId', async (req, reply) => {
    const { shortId } = req.params;

    let link = null;
    let dbError = false;
    try {
      link = await lookupLinkForRouting(shortId);
    } catch {
      dbError = true;
    }

    // DB unavailable — serve the profile page directly (renders mock profile in dev).
    if (dbError) {
      const profileBaseUrl = process.env.PROFILE_BASE_URL ?? 'http://localhost:3000/profile';
      return reply.redirect(`${profileBaseUrl}/${shortId}`, 302);
    }

    if (!link) return reply.code(404).send({ error: 'QR destination not found.' });

    recordScanAsync({
      shortId,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip:        req.ip,
    });

    // Premium profile that has never been pinned → activation flow
    if (link.plan === 'PREMIUM' && !link.hasCoordinates) {
      return reply.redirect(`/activate/${shortId}`, 302);
    }

    // Private profile → PIN gate (applies to both plans)
    if (link.isPrivate) {
      return reply
        .header('Content-Type', 'text/html; charset=utf-8')
        .send(renderPinGate(shortId, false));
    }

    const profileBaseUrl = process.env.PROFILE_BASE_URL ?? 'http://localhost:3000/profile';
    return reply.redirect(`${profileBaseUrl}/${link.profileId}`, 302);
  });

  // ── Activation Page ──────────────────────────────────────────────────────────
  // Served when a premium profile's QR is scanned for the first time (no coordinates).
  // Renders the GPS capture UI; the page JS POSTs to /api/v1/premium/navigation/activate.
  app.get<{ Params: { shortId: string } }>('/activate/:shortId', async (req, reply) => {
    const { shortId } = req.params;
    const link = await lookupLinkForRouting(shortId);

    if (!link)
      return reply.code(404).send({ error: 'Profile not found.' });
    if (link.plan !== 'PREMIUM')
      return reply.code(403).send({ error: 'GPS activation requires a Premium plan.' });

    return reply
      .header('Content-Type', 'text/html; charset=utf-8')
      .send(renderActivationPage(shortId, link.fullName));
  });

  // ── Scan Entry Point (legacy /p/ path — kept for already-printed plaques) ────
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

    // DB check is best-effort — if the DB is unreachable (e.g. local dev without
    // Postgres), skip the guard rather than blocking QR generation entirely.
    // Auth protects this route in production.
    try {
      const link = await lookupLink(shortId);
      if (link === null) return reply.code(404).send({ error: 'Short ID not registered.' });
    } catch {
      // DB unavailable — proceed to generation
    }

    const svg = await generateLegacyQR(shortId);
    return reply
      .header('Content-Type', 'image/svg+xml')
      .header('Content-Disposition', `attachment; filename="legacylink-${shortId}.svg"`)
      .send(svg);
  });

  // ── PIN Gate Preview (dev only) ──────────────────────────────────────────────
  app.get('/dev/pin-gate', async (_req, reply) =>
    reply.header('Content-Type', 'text/html; charset=utf-8').send(renderPinGate('dev-preview', false))
  );
  app.get('/dev/pin-gate-error', async (_req, reply) =>
    reply.header('Content-Type', 'text/html; charset=utf-8').send(renderPinGate('dev-preview', true))
  );
  app.post<{ Params: { shortId: string }; Body: { pin: string } }>(
    '/p/dev-preview/unlock',
    async (req, reply) => {
      if (req.body.pin === '1234') {
        return reply.send({ redirectUrl: '/profile/demo' });
      }
      return reply.code(401).send({ error: 'Incorrect PIN.' });
    }
  );

  // ── Memorial Profile Page ───────────────────────────────────────────────────
  app.get<{ Params: { profileId: string } }>('/profile/:profileId', async (req, reply) =>
    reply.header('Content-Type', 'text/html; charset=utf-8').send(renderProfile(MOCK_PROFILE, req.params.profileId))
  );

  // ── Pet Memorial Profile Page ────────────────────────────────────────────────
  app.get<{ Params: { shortId: string } }>('/pet/:shortId', async (req, reply) =>
    reply.header('Content-Type', 'text/html; charset=utf-8').send(renderPetProfile(MOCK_PET_PROFILE, req.params.shortId))
  );

  // ── Public Guestbook Submission ──────────────────────────────────────────────
  // Called by the "Share a Memory" form on the public profile page.
  // Entries land with is_approved: false — visible only in the admin moderation queue.
  app.post<{
    Params: { profileId: string };
    Body:   { author_name: string; message: string; author_email?: string };
  }>('/guestbook/:profileId', async (req, reply) => {
    const { profileId } = req.params;
    const { author_name, message, author_email } = req.body;

    if (!author_name?.trim() || !message?.trim())
      return reply.code(400).send({ error: 'author_name and message are required.' });

    try {
      // Accept short_id (≤8 chars from QR fallback) or UUID
      const where = profileId.length <= 8
        ? { short_id: profileId, deleted_at: null }
        : { id: profileId,       deleted_at: null };

      const profile = await rawPrisma.profile.findFirst({ where });
      if (!profile) return reply.code(404).send({ error: 'Profile not found.' });

      await rawPrisma.guestbookEntry.create({
        data: {
          profile_id:   profile.id,
          author_name:  author_name.trim(),
          message:      message.trim(),
          author_email: author_email?.trim() || null,
          is_approved:  false,
        },
      });

      return reply.code(201).send({ status: 'pending_approval' });
    } catch {
      // DB unavailable — store in memory so the admin panel can still see it.
      storeEntry(profileId, author_name.trim(), message.trim(), author_email?.trim() || null);
      return reply.code(201).send({ status: 'pending_approval' });
    }
  });

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

  // ── Ops: Top Scan Locations ─────────────────────────────────────────────────
  // Returns top scan cities with lat/lng for map rendering.
  // Uses Prisma _count to avoid loading raw scan rows.
  app.get<{ Querystring: { days?: string; limit?: string } }>('/ops/scan-locations', async (req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    const days  = Math.min(parseInt(req.query.days  ?? '30',  10) || 30,  365);
    const limit = Math.min(parseInt(req.query.limit ?? '20',  10) || 20,  100);
    const rows  = await getTopScanLocations(days, limit);
    return reply.send({ rows });
  });

  // ── Ops: QR Marker Map Data ─────────────────────────────────────────────────
  // Returns all QRMarker rows for the ops map.  Optimised with _count on
  // scan_logs so the client receives precomputed scan volumes in one query.
  app.get('/ops/markers', async (_req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    const markers = await rawPrisma.qRMarker.findMany({
      include: {
        profile: {
          select: {
            short_id:    true,
            full_name:   true,
            scans_count: true,
            _count:      { select: { scan_logs: true } },
          },
        },
      },
      orderBy: { updated_at: 'desc' },
    });
    return reply.send({ markers });
  });

  // ── Ops: Live Scan WebSocket ────────────────────────────────────────────────
  // The ops dashboard connects here to receive real-time scan events.
  // Each message is { type: 'scan', data: EnrichedScanEvent }.
  app.get('/ops/ws', { websocket: true }, (socket) => {
    registerClient(socket);
  });

  return app;
}
