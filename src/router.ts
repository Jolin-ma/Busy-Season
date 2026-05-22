import Fastify from 'fastify';
import { generateLegacyQR } from './qrGenerator';
import { generateShortId } from './shortId';
import { createLink, lookupLink } from './db';
import { recordScanAsync } from './analytics';
import { renderProfile } from './profileTemplate';
import { MOCK_PROFILE } from './mockProfile';


export function buildServer() {
  const app = Fastify({ logger: true });

  // ── Scan Entry Point ─────────────────────────────────────────────────────────
  // This is the URL burned into every physical plaque: /p/:shortId
  // Critical path: resolve → redirect → analytics (async, non-blocking).
  app.get<{ Params: { shortId: string } }>('/p/:shortId', async (req, reply) => {
    const { shortId } = req.params;
    const link = lookupLink(shortId);

    if (!link) {
      // 404 rather than a generic error — allows the front-end to show a
      // "plaque not yet activated" page instead of a broken experience.
      return reply.code(404).send({ error: 'QR destination not found.' });
    }

    // Analytics fires after reply.redirect() is called — zero impact on TTFB.
    recordScanAsync({
      shortId,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    // 301 Permanent: browsers and CDNs cache this after the first scan on a
    // device, making all subsequent scans instant. Use 302 only if you need
    // to A/B test profile destinations without cache poisoning.
    // Fastify v5: redirect(url, statusCode) — 301 Permanent is cached by browsers
    // and CDNs after the first scan, making all subsequent scans on that device instant.
    // Read lazily so the LAN IP set in index.ts is always current at request time.
    const profileBaseUrl = process.env.PROFILE_BASE_URL ?? 'http://localhost:3000/profile';
    return reply.redirect(`${profileBaseUrl}/${link.profileId}`, 301);
  });

  // ── Admin: Provision a New Short Link ────────────────────────────────────────
  app.post<{ Body: { profileId: string } }>('/admin/link', async (req, reply) => {
    const { profileId } = req.body;
    if (!profileId) {
      return reply.code(400).send({ error: 'profileId is required.' });
    }

    const shortId = generateShortId();
    const record = createLink(shortId, profileId);

    return reply.code(201).send({
      shortId,
      shortUrl: `https://lglk.to/p/${shortId}`,
      profileId: record.profileId,
      createdAt: record.createdAt,
    });
  });

  // ── Admin: Export QR SVG for Manufacturing ───────────────────────────────────
  // Returns a raw SVG file download — plug directly into laser engraving or
  // ceramic printing workflows. The vector scales without any raster fuzziness.
  app.get<{ Params: { shortId: string } }>('/admin/qr/:shortId', async (req, reply) => {
    const { shortId } = req.params;

    if (!lookupLink(shortId)) {
      return reply.code(404).send({ error: 'Short ID not registered.' });
    }

    const svg = await generateLegacyQR(shortId);

    return reply
      .header('Content-Type', 'image/svg+xml')
      .header('Content-Disposition', `attachment; filename="legacylink-${shortId}.svg"`)
      .send(svg);
  });

  // ── Memorial Profile Page ─────────────────────────────────────────────────────
  // Public-facing page visitors land on after scanning a plaque QR code.
  // In production: look up real profile data from DB by profileId.
  // For now: serves the mock profile for any profileId so the full flow is testable.
  app.get<{ Params: { profileId: string } }>('/profile/:profileId', async (req, reply) => {
    const html = renderProfile(MOCK_PROFILE);
    return reply.header('Content-Type', 'text/html; charset=utf-8').send(html);
  });

  // ── Admin: Scan Stats ────────────────────────────────────────────────────────
  app.get<{ Params: { shortId: string } }>('/admin/stats/:shortId', async (req, reply) => {
    const link = lookupLink(req.params.shortId);
    if (!link) return reply.code(404).send({ error: 'Not found.' });

    return reply.send({
      shortId: req.params.shortId,
      profileId: link.profileId,
      scansCount: link.scansCount,
      createdAt: link.createdAt,
    });
  });

  return app;
}
