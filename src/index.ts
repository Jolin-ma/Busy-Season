import 'dotenv/config';
import os   from 'os';
import { buildServer }    from './router';
import { rawPrisma }      from './lib/db';

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '0.0.0.0';

function getLanIp(): string {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

if (!process.env.QR_BASE_URL || !process.env.PROFILE_BASE_URL) {
  const lanIp = getLanIp();
  if (!process.env.QR_BASE_URL)      process.env.QR_BASE_URL      = `http://${lanIp}:${PORT}/r`;
  if (!process.env.PROFILE_BASE_URL) process.env.PROFILE_BASE_URL = `http://${lanIp}:${PORT}/profile`;
}
console.log(`[config] QR codes will encode: ${process.env.QR_BASE_URL}/<shortId>`);

// ---------------------------------------------------------------------------
// Seed demo data
// Creates a system user + Margaret's profile on first run. Safe to re-run —
// upsert is a no-op if the records already exist.
// ---------------------------------------------------------------------------
const DEMO_SHORT_ID     = 'a5trneuj';
const PET_DEMO_SHORT_ID = 'biscuit8';

async function seedDemo(): Promise<string> {
  const seedUser = await rawPrisma.user.upsert({
    where:  { email: 'seed@legacylink.app' },
    update: {},
    create: {
      email:         'seed@legacylink.app',
      name:          'Demo Admin',
      // Placeholder — real auth (bcrypt) wired separately
      password_hash: 'PLACEHOLDER',
    },
  });

  await rawPrisma.profile.upsert({
    where:  { short_id: DEMO_SHORT_ID },
    update: {},
    create: {
      short_id:      DEMO_SHORT_ID,
      user_id:       seedUser.id,
      full_name:     'Margaret Eleanor Whitfield',
      date_of_birth: new Date('1945-10-14'),
      date_of_death: new Date('2026-05-22'),
      epitaph:       'She carried kindness like a lantern in every room she entered.',
      portrait_url:  'https://placehold.co/200x200/d6cfc4/7a7166?text=M.W.',
      scans_count:   12,
      plaque_status: 'ORDER_RECEIVED',
    },
  });

  await rawPrisma.profile.upsert({
    where:  { short_id: PET_DEMO_SHORT_ID },
    update: {},
    create: {
      short_id:      PET_DEMO_SHORT_ID,
      user_id:       seedUser.id,
      full_name:     'Biscuit',
      date_of_birth: new Date('2010-03-12'),
      date_of_death: new Date('2026-01-04'),
      epitaph:       'He greeted every single day — and every single person — like a gift.',
      portrait_url:  'https://placehold.co/400x400/c4a882/6b5a3e?text=🐾',
      scans_count:   0,
      plaque_status: 'ORDER_RECEIVED',
    },
  });

  console.log(`[seed] User:    ${seedUser.email} (${seedUser.id})`);
  console.log(`[seed] Profile: ${DEMO_SHORT_ID} → http://localhost:${PORT}/p/${DEMO_SHORT_ID}`);
  console.log(`[seed] QR SVG:  http://localhost:${PORT}/admin/qr/${DEMO_SHORT_ID}`);
  console.log(`[seed] Pet:     ${PET_DEMO_SHORT_ID} → http://localhost:${PORT}/pet/${PET_DEMO_SHORT_ID}`);
  console.log(`[seed] Pet QR:  http://localhost:${PORT}/admin/qr/${PET_DEMO_SHORT_ID}`);

  return seedUser.id;
}

async function main() {
  const app = buildServer();

  // Seed the demo profile and expose the seed user ID so unauthenticated
  // profile creation via /admin/link has a valid user_id to reference.
  try {
    const seedUserId = await seedDemo();
    process.env.SEED_USER_ID = seedUserId;
  } catch (err) {
    console.warn('[seed] Database unavailable — running without persistent data.', err);
  }

  try {
    await app.listen({ port: PORT, host: HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
