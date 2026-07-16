import 'dotenv/config';
import os   from 'os';
import { buildServer }          from './router';
import { rawPrisma }            from './lib/db';
import { scheduleMediaCleanup } from './jobs/mediaCleanup';

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

  const margaret = await rawPrisma.profile.upsert({
    where:  { short_id: DEMO_SHORT_ID },
    // Demo profile must stay on BASIC so scanning its QR goes straight to the
    // profile page, not the one-time PREMIUM GPS "pin this location" activation flow.
    update: { plan: 'BASIC' },
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
      plan:          'BASIC',
    },
  });

  // Demo timeline/gallery/guestbook content — only backfilled once, so re-running
  // the seed on an existing profile doesn't pile up duplicate rows.
  const timelineCount  = await rawPrisma.timelineMilestone.count({ where: { profile_id: margaret.id } });
  const mediaCount     = await rawPrisma.mediaAsset.count({ where: { profile_id: margaret.id } });
  const guestbookCount = await rawPrisma.guestbookEntry.count({ where: { profile_id: margaret.id } });

  if (timelineCount === 0) {
    await rawPrisma.timelineMilestone.createMany({
      data: [
        { profile_id: margaret.id, occurred_at: new Date('1963-06-08'), title: 'Married Robert Whitfield', description: 'Exchanged vows in a small chapel overlooking the bay, promising fifty years before either of them could imagine it.' },
        { profile_id: margaret.id, occurred_at: new Date('1968-03-22'), title: "Welcomed her daughter, Eleanor", description: 'Motherhood arrived like a second heartbeat — one she never stopped listening for.' },
        { profile_id: margaret.id, occurred_at: new Date('1975-09-02'), title: 'Began teaching third grade at Lincoln Elementary', description: 'Thirty years of chalk dust, spelling bees, and children she called "her kids" long after they had grown.' },
        { profile_id: margaret.id, occurred_at: new Date('2001-06-15'), title: 'Retired after three decades in the classroom', description: "Her final class surprised her with a garden bench engraved with all their names." },
        { profile_id: margaret.id, occurred_at: new Date('2013-06-08'), title: 'Celebrated 50 years of marriage', description: 'Robert renewed his vows to her in the same small chapel, cane and all.' },
      ],
    });
  }

  if (mediaCount === 0) {
    await rawPrisma.mediaAsset.createMany({
      data: [
        { profile_id: margaret.id, type: 'PHOTO', url: 'https://placehold.co/600x600/e8dfd3/7a7166?text=1963', caption: 'Wedding day, 1963', sort_order: 0, upload_status: 'READY', moderation_status: 'APPROVED' },
        { profile_id: margaret.id, type: 'PHOTO', url: 'https://placehold.co/600x600/d6cfc4/7a7166?text=1969', caption: "Eleanor's first birthday", sort_order: 1, upload_status: 'READY', moderation_status: 'APPROVED' },
        { profile_id: margaret.id, type: 'PHOTO', url: 'https://placehold.co/600x600/c9bfae/6b5a3e?text=1980', caption: 'Mrs. Whitfield’s third-grade class, 1980', sort_order: 2, upload_status: 'READY', moderation_status: 'APPROVED' },
        { profile_id: margaret.id, type: 'PHOTO', url: 'https://placehold.co/600x600/e2d5c3/7a7166?text=2001', caption: 'Retirement day', sort_order: 3, upload_status: 'READY', moderation_status: 'APPROVED' },
        { profile_id: margaret.id, type: 'PHOTO', url: 'https://placehold.co/600x600/d9cdb8/6b5a3e?text=2013', caption: 'Fiftieth anniversary', sort_order: 4, upload_status: 'READY', moderation_status: 'APPROVED' },
        { profile_id: margaret.id, type: 'PHOTO', url: 'https://placehold.co/600x600/ded2c0/7a7166?text=2018', caption: 'With her grandchildren, 2018', sort_order: 5, upload_status: 'READY', moderation_status: 'APPROVED' },
      ],
    });
  }

  if (guestbookCount === 0) {
    await rawPrisma.guestbookEntry.createMany({
      data: [
        { profile_id: margaret.id, author_name: 'Eleanor Whitfield', message: 'Mom, you taught me that kindness is a decision you make every morning. I make it every day because of you.', is_approved: true, created_at: new Date('2026-05-30') },
        { profile_id: margaret.id, author_name: 'James Torres', message: 'Mrs. Whitfield was my third-grade teacher in 1982. Forty years later I still remember the way she made every kid feel like the smartest person in the room.', is_approved: true, created_at: new Date('2026-06-02') },
        { profile_id: margaret.id, author_name: 'Robert Whitfield', message: "Fifty years wasn't enough. I'll see you again, my love.", is_approved: true, created_at: new Date('2026-06-10') },
        { profile_id: margaret.id, author_name: 'The Lincoln Elementary PTA', message: 'A lantern in every room she entered — we will carry that forward in her name.', is_approved: true, created_at: new Date('2026-06-20') },
      ],
    });
  }

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
  const app = await buildServer();

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

  // Start media orphan cleanup — runs immediately then every 6 hours.
  scheduleMediaCleanup();
}

main();
