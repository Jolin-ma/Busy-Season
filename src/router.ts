import path   from 'path';
import fs     from 'fs';
import { pipeline } from 'stream/promises';
import Fastify from 'fastify';
import fastifyWebsocket  from '@fastify/websocket';
import fastifyJwt        from '@fastify/jwt';
import fastifyCors       from '@fastify/cors';
import fastifyMultipart  from '@fastify/multipart';
import fastifyStatic     from '@fastify/static';
import bcrypt            from 'bcryptjs';
import { generateLegacyQR } from './qrGenerator';
import { generateShortId }  from './shortId';
import { createLink, lookupLink, lookupLinkForRouting, getScanHistory, setPrivacy, getTopScanLocations } from './db';
import { db, rawPrisma } from './lib/db';
import { storeEntry, getPending } from './guestbookStore';
import { USE_CLOUD, presignUpload } from './lib/storage';
import { recordScanAsync }  from './analytics';
import { renderProfile, ProfileData } from './profileTemplate';
import { renderPetProfile } from './petProfileTemplate';
import { MOCK_PET_PROFILE } from './mockPetProfile';
import { renderPinGate }    from './pinGateTemplate';
import { renderAuthPage }       from './authTemplate';
import { renderActivationPage } from './activationTemplate';
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

  const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  app.register(fastifyStatic, {
    root:   UPLOADS_DIR,
    prefix: '/uploads/',
  });

  app.register(fastifyMultipart, { limits: { fileSize: 20 * 1024 * 1024 } }); // 20 MB

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
      const pinValid = link.privacyPin && await bcrypt.compare(pin ?? '', link.privacyPin);
      if (!pin || !pinValid)
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

  // ── Admin: File Upload ──────────────────────────────────────────────────────
  // Accepts a single file via multipart/form-data.
  // Returns { url } pointing to /uploads/<uuid>.<ext> served by @fastify/static.
  app.post('/admin/upload', async (req, reply) => {
    const part = await req.file();
    if (!part) return reply.code(400).send({ error: 'No file provided.' });

    const ext      = path.extname(part.filename).toLowerCase() || '.bin';
    const filename = `${crypto.randomUUID()}${ext}`;
    const dest     = path.join(UPLOADS_DIR, filename);

    await pipeline(part.file, fs.createWriteStream(dest));

    const base = process.env.SERVER_BASE_URL ?? 'http://localhost:3000';
    return reply.send({ url: `${base}/uploads/${filename}` });
  });

  // ── Admin: Presigned Upload URL (cloud mode) ────────────────────────────────
  // Issues a 5-min signed S3 PUT URL so the browser uploads raw files directly
  // to the entry bucket, bypassing this server entirely.
  // The Lambda optimizer picks up the raw file and writes the final WebP to the
  // delivery bucket at the returned deliveryUrl.
  app.post<{ Body: { filename: string; contentType: string } }>(
    '/admin/upload/sign',
    async (req, reply) => {
      if (!USE_CLOUD) {
        return reply.code(400).send({ error: 'Cloud storage not configured. Use /admin/upload instead.' });
      }
      const { filename, contentType } = req.body;
      const result = await presignUpload(filename, contentType);
      return reply.send(result);
    },
  );

  // ── Admin: Lambda processing webhook ────────────────────────────────────────
  // Called by the Lambda after it has optimised the asset and run moderation.
  // Updates the MediaAsset record with the final thumbnail URL and status.
  app.post<{
    Body: {
      deliveryUrl:      string;
      thumbnailUrl:     string;
      moderationStatus: 'APPROVED' | 'FLAGGED' | 'REJECTED';
    };
  }>('/admin/upload/webhook', async (req, reply) => {
    const { deliveryUrl, thumbnailUrl, moderationStatus } = req.body;
    await rawPrisma.mediaAsset.updateMany({
      where: { url: deliveryUrl },
      data:  { thumbnail_url: thumbnailUrl, moderation_status: moderationStatus },
    });
    return reply.send({ ok: true });
  });

  // ── Admin: Create Full Profile ───────────────────────────────────────────────
  // Single call that creates Profile + TimelineMilestones + MediaAssets + privacy.
  app.post<{
    Body: {
      name:        string;
      epitaph:     string;
      dateOfBirth: string;
      dateOfDeath: string;
      portraitUrl: string;
      timeline:    { year: string; title: string; description: string }[];
      gallery:     { url: string; caption?: string }[];
      isPrivate:   boolean;
      privacyPin:  string;
    };
  }>('/admin/profile', async (req, reply) => {
    const { name, epitaph, dateOfBirth, dateOfDeath, portraitUrl, timeline, gallery, isPrivate, privacyPin } = req.body;

    // Resolve owner: prefer authenticated user from JWT, fall back to seed
    let userId = process.env.SEED_USER_ID;
    try {
      const auth = req.headers.authorization;
      if (auth?.startsWith('Bearer ')) {
        const payload = app.jwt.verify<{ userId: string }>(auth.slice(7));
        userId = payload.userId;
      }
    } catch { /* invalid token — keep seed fallback */ }

    if (!userId) return reply.code(503).send({ error: 'Server not ready.' });

    const shortId     = generateShortId();
    const hashedPin   = isPrivate && privacyPin ? await bcrypt.hash(privacyPin, 12) : null;

    const profile = await rawPrisma.profile.create({
      data: {
        short_id:      shortId,
        user_id:       userId,
        full_name:     name.trim(),
        epitaph:       epitaph.trim() || null,
        date_of_birth: dateOfBirth ? new Date(dateOfBirth) : null,
        date_of_death: dateOfDeath ? new Date(dateOfDeath) : null,
        portrait_url:  portraitUrl || null,
        is_private:    isPrivate,
        privacy_pin:   hashedPin,
        timeline: {
          create: timeline
            .filter(t => t.title.trim())
            .map(t => ({
              title:       t.title.trim(),
              description: t.description.trim() || null,
              occurred_at: new Date(`${t.year}-07-01`), // mid-year keeps UTC safe
            })),
        },
        media: {
          create: gallery.map((g, i) => ({
            type:       'PHOTO' as const,
            url:        g.url,
            caption:    g.caption || null,
            sort_order: i,
          })),
        },
      },
    });

    return reply.code(201).send({
      shortId,
      profileId: profile.id,
      shortUrl:  `${process.env.QR_BASE_URL ?? 'http://localhost:3000/r'}/${shortId}`,
    });
  });

  // ── Admin: Fulfillment — list all orders ───────────────────────────────────
  app.get('/admin/fulfillment', async (_req, reply) => {
    const profiles = await rawPrisma.profile.findMany({
      where:   { deleted_at: null },
      orderBy: { created_at: 'desc' },
      select: {
        short_id:      true,
        full_name:     true,
        plaque_status: true,
        created_at:    true,
        user: { select: { name: true, email: true } },
        shipping_order: {
          select: {
            address:         true,
            city:            true,
            plaque_style:    true,
            tracking_number: true,
            shipped_at:      true,
          },
        },
      },
    });

    const orders = profiles.map(p => ({
      shortId:        p.short_id,
      profileName:    p.full_name,
      customerName:   p.user.name,
      customerEmail:  p.user.email,
      plaqueStatus:   p.plaque_status,
      createdAt:      p.created_at.toISOString(),
      address:        p.shipping_order?.address        ?? null,
      city:           p.shipping_order?.city           ?? null,
      plaqueStyle:    p.shipping_order?.plaque_style   ?? null,
      trackingNumber: p.shipping_order?.tracking_number ?? null,
      shippedAt:      p.shipping_order?.shipped_at?.toISOString() ?? null,
    }));

    return reply.send({ orders });
  });

  // ── Admin: Fulfillment — mark as shipped ───────────────────────────────────
  app.patch<{ Params: { shortId: string }; Body: { trackingNumber: string } }>(
    '/admin/fulfillment/:shortId/ship',
    async (req, reply) => {
      const { shortId }       = req.params;
      const { trackingNumber } = req.body;

      const profile = await rawPrisma.profile.findUnique({ where: { short_id: shortId } });
      if (!profile) return reply.code(404).send({ error: 'Profile not found' });

      await rawPrisma.$transaction([
        rawPrisma.profile.update({
          where: { short_id: shortId },
          data:  { plaque_status: 'SHIPPED' },
        }),
        rawPrisma.shippingOrder.upsert({
          where:  { profile_id: profile.id },
          create: { profile_id: profile.id, tracking_number: trackingNumber, shipped_at: new Date() },
          update: { tracking_number: trackingNumber, shipped_at: new Date() },
        }),
      ]);

      return reply.send({ ok: true });
    },
  );

  // ── Admin: Fulfillment — update plaque status ──────────────────────────────
  app.patch<{ Params: { shortId: string }; Body: { status: string } }>(
    '/admin/fulfillment/:shortId/status',
    async (req, reply) => {
      const { shortId } = req.params;
      const { status  } = req.body;

      const validStatuses = ['ORDER_RECEIVED', 'ENGRAVING', 'SHIPPED', 'DELIVERED'];
      if (!validStatuses.includes(status))
        return reply.code(400).send({ error: 'Invalid status' });

      await rawPrisma.profile.update({
        where: { short_id: shortId },
        data:  { plaque_status: status as any },
      });

      return reply.send({ ok: true });
    },
  );

  // ── Admin: Analytics summary ──────────────────────────────────────────────
  app.get('/admin/analytics/summary', async (_req, reply) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalProfiles, scanAggregate, users, topProfiles, topCityRows] = await Promise.all([
      rawPrisma.profile.count({ where: { deleted_at: null } }),
      rawPrisma.profile.aggregate({ where: { deleted_at: null }, _sum: { scans_count: true } }),
      rawPrisma.user.findMany({
        select: { profiles: { select: { plan: true }, where: { deleted_at: null } } },
      }),
      rawPrisma.profile.findMany({
        where:   { deleted_at: null },
        orderBy: { scans_count: 'desc' },
        take:    5,
        select:  { short_id: true, full_name: true, scans_count: true },
      }),
      rawPrisma.scanLog.groupBy({
        by:      ['city'],
        where:   { city: { not: null }, scanned_at: { gte: thirtyDaysAgo } },
        _count:  { city: true },
        orderBy: { _count: { city: 'desc' } },
        take:    1,
      }),
    ]);

    const totalUsers   = users.length;
    const premiumCount = users.filter(u => u.profiles.some(p => p.plan === 'PREMIUM')).length;
    const basicCount   = totalUsers - premiumCount;
    const topCityRow   = topCityRows[0];

    return reply.send({
      totalProfiles,
      totalScans:    scanAggregate._sum.scans_count ?? 0,
      totalUsers,
      premiumCount,
      basicCount,
      topProfiles:   topProfiles.map(p => ({
        shortId:    p.short_id,
        name:       p.full_name,
        scansCount: p.scans_count,
      })),
      topCity:       topCityRow?.city ?? null,
      topCityScans:  topCityRow?._count.city ?? 0,
    });
  });

  // ── Admin: Profile directory (with owner info) ────────────────────────────
  app.get('/admin/directory', async (_req, reply) => {
    const profiles = await rawPrisma.profile.findMany({
      where:   { deleted_at: null },
      orderBy: { created_at: 'desc' },
      select: {
        id:           true,
        short_id:     true,
        full_name:    true,
        plaque_status: true,
        plan:         true,
        created_at:   true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return reply.send({
      profiles: profiles.map(p => ({
        id:           p.id,
        shortId:      p.short_id,
        profileName:  p.full_name,
        plaqueStatus: p.plaque_status,
        plan:         p.plan,
        createdAt:    p.created_at,
        ownerId:      p.user?.id ?? null,
        ownerName:    p.user?.name ?? null,
        ownerEmail:   p.user?.email ?? null,
      })),
    });
  });

  // ── Admin: List all media assets (ops dashboard) ────────────────────────────
  app.get('/admin/media', async (_req, reply) => {
    const assets = await rawPrisma.mediaAsset.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id:                true,
        type:              true,
        url:               true,
        thumbnail_url:     true,
        size_bytes:        true,
        moderation_status: true,
        created_at:        true,
        profile: {
          select: {
            id:            true,
            short_id:      true,
            full_name:     true,
            plaque_status: true,
            user:          { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return reply.send({
      assets: assets.map(a => ({
        id:               a.id,
        type:             a.type,
        url:              a.url,
        thumbnailUrl:     a.thumbnail_url,
        sizeBytes:        Number(a.size_bytes ?? 0),
        moderationStatus: a.moderation_status,
        createdAt:        a.created_at,
        profileId:        a.profile.id,
        profileShortId:   a.profile.short_id,
        profileName:      a.profile.full_name,
        plaqueStatus:     a.profile.plaque_status,
        ownerId:          a.profile.user?.id ?? null,
        ownerName:        a.profile.user?.name ?? null,
        ownerEmail:       a.profile.user?.email ?? null,
      })),
    });
  });

  // ── Admin: Update media moderation status ─────────────────────────────────
  app.patch<{
    Params: { id: string };
    Body:   { status: 'APPROVED' | 'REJECTED' };
  }>('/admin/media/:id/status', async (req, reply) => {
    const { id }     = req.params;
    const { status } = req.body;
    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return reply.code(400).send({ error: 'status must be APPROVED or REJECTED' });
    }
    const asset = await rawPrisma.mediaAsset.update({
      where: { id },
      data:  { moderation_status: status },
      select: { id: true, moderation_status: true },
    });
    return reply.send({ asset });
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
  app.get<{ Params: { profileId: string } }>('/profile/:profileId', async (req, reply) => {
    const { profileId } = req.params;

    // Accept UUID (normal path from /r/:shortId redirect) or short_id (dev/legacy)
    const where = profileId.length <= 8
      ? { short_id: profileId }
      : { id: profileId };

    const profile = await db.profile.findFirst({
      where,
      include: {
        timeline: { orderBy: { occurred_at: 'asc' } },
        media:    { where: { type: 'PHOTO' }, orderBy: { sort_order: 'asc' } },
        guestbook: {
          where:   { is_approved: true },
          orderBy: { created_at: 'desc' },
          take:    20,
        },
      },
    });

    if (!profile) {
      return reply.code(404).header('Content-Type', 'text/html; charset=utf-8').send(
        `<!DOCTYPE html><html><head><title>Not Found — LegacyLink</title></head>
         <body style="font-family:sans-serif;text-align:center;padding:80px 24px">
           <h1 style="font-size:1.5rem;color:#1c1917">Memorial not found</h1>
           <p style="color:#78716c;margin-top:8px">This profile may have been removed or the link is incorrect.</p>
         </body></html>`
      );
    }

    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

    const data: ProfileData = {
      name:       profile.full_name,
      birthDate:  profile.date_of_birth ? fmt(profile.date_of_birth) : '',
      deathDate:  profile.date_of_death ? fmt(profile.date_of_death) : '',
      epitaph:    profile.epitaph    ?? '',
      portraitUrl: profile.portrait_url ?? 'https://placehold.co/400x400/d6cfc4/7a7166?text=LL',
      timeline: profile.timeline.map(t => ({
        year:        t.occurred_at.getUTCFullYear(),
        title:       t.title,
        description: t.description ?? '',
      })),
      gallery: profile.media.map(m => ({
        url:     m.url,
        caption: m.caption ?? undefined,
      })),
      memories: profile.guestbook.map(g => ({
        message: g.message,
        author:  g.author_name,
        date:    fmt(g.created_at),
      })),
    };

    return reply.header('Content-Type', 'text/html; charset=utf-8').send(renderProfile(data, profileId));
  });

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

  // ── Admin: Support tickets ────────────────────────────────────────────────
  app.get('/admin/support/tickets', async (_req, reply) => {
    const tickets = await rawPrisma.supportTicket.findMany({
      orderBy: { created_at: 'asc' },
      select: {
        id:               true,
        subject:          true,
        message:          true,
        status:           true,
        priority:         true,
        response_due_at:  true,
        resolved_at:      true,
        created_at:       true,
        profile: {
          select: {
            short_id:      true,
            full_name:     true,
            plan:          true,
            plaque_status: true,
            user:          { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return reply.send({
      tickets: tickets.map(t => ({
        id:              t.id,
        subject:         t.subject,
        message:         t.message,
        status:          t.status,
        priority:        t.priority,
        createdAt:       t.created_at,
        responseDueAt:   t.response_due_at,
        resolvedAt:      t.resolved_at,
        profileShortId:  t.profile.short_id,
        profileName:     t.profile.full_name,
        plaqueStatus:    t.profile.plaque_status,
        plan:            t.profile.plan,
        userId:          t.profile.user?.id ?? null,
        customerName:    t.profile.user?.name ?? null,
        customerEmail:   t.profile.user?.email ?? null,
      })),
    });
  });

  app.patch<{
    Params: { id: string };
    Body:   { status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' };
  }>('/admin/support/tickets/:id/status', async (req, reply) => {
    const { id }     = req.params;
    const { status } = req.body;
    const valid = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!valid.includes(status)) return reply.code(400).send({ error: 'Invalid status.' });
    const ticket = await rawPrisma.supportTicket.update({
      where: { id },
      data:  { status, ...(status === 'RESOLVED' ? { resolved_at: new Date() } : {}) },
      select: { id: true, status: true },
    });
    return reply.send({ ticket });
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
