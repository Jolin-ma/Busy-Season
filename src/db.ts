import bcrypt from 'bcryptjs';
import { db, rawPrisma } from './lib/db';

// Reads  → `db`         (soft-delete extension silently adds deleted_at: null)
// Writes → `rawPrisma`  (manually guard deleted_at: null to avoid touching tombstones)

export interface LinkRecord {
  profileId:  string;   // Profile.id (UUID)
  createdAt:  Date;
  scansCount: number;
  isPrivate:  boolean;
  privacyPin: string;
  isQrActive: boolean;
}

export interface RoutingRecord extends LinkRecord {
  plan:           'BASIC' | 'PREMIUM';
  hasCoordinates: boolean;
  fullName:       string;
}


// ---------------------------------------------------------------------------
// Profile / link operations
// ---------------------------------------------------------------------------

export async function createLink(
  shortId:  string,
  userId:   string,
  fullName: string,
): Promise<LinkRecord> {
  const profile = await rawPrisma.profile.upsert({
    where:  { short_id: shortId },
    update: {},
    create: { short_id: shortId, user_id: userId, full_name: fullName },
  });
  return toRecord(profile);
}

export async function lookupLink(shortId: string): Promise<LinkRecord | null> {
  // `db` applies the soft-delete filter automatically.
  const profile = await db.profile.findFirst({ where: { short_id: shortId } });
  return profile ? toRecord(profile) : null;
}

// Extended lookup for the smart QR routing layer — includes plan and whether
// coordinates have been saved so the traffic cop can decide which page to render.
export async function lookupLinkForRouting(shortId: string): Promise<RoutingRecord | null> {
  const profile = await rawPrisma.profile.findFirst({
    where:   { short_id: shortId, deleted_at: null },
    include: { coordinates: { select: { id: true } } },
  });
  if (!profile) return null;
  return {
    ...toRecord(profile),
    plan:           profile.plan as 'BASIC' | 'PREMIUM',
    hasCoordinates: !!profile.coordinates,
    fullName:       profile.full_name,
  };
}

export async function setPrivacy(
  shortId:    string,
  isPrivate:  boolean,
  privacyPin: string,
): Promise<boolean> {
  const hashedPin = isPrivate && privacyPin ? await bcrypt.hash(privacyPin, 12) : null;
  const result = await rawPrisma.profile.updateMany({
    where: { short_id: shortId, deleted_at: null },
    data:  { is_private: isPrivate, privacy_pin: hashedPin },
  });
  return result.count > 0;
}

// ---------------------------------------------------------------------------
// Scan analytics
// ---------------------------------------------------------------------------

export async function incrementScanCount(shortId: string): Promise<void> {
  await rawPrisma.profile.updateMany({
    where: { short_id: shortId, deleted_at: null },
    data:  { scans_count: { increment: 1 } },
  });
}

// ---------------------------------------------------------------------------
// Scan log (persisted, GeoIP-enriched)
// ---------------------------------------------------------------------------

export interface ScanLogInput {
  profileId:  string;
  ip?:        string;
  userAgent?: string;
  city?:      string;
  region?:    string;
  country?:   string;
  latitude?:  number;
  longitude?: number;
}

export async function writeScanLog(input: ScanLogInput): Promise<void> {
  await rawPrisma.scanLog.create({
    data: {
      profile_id: input.profileId,
      ip:         input.ip,
      user_agent: input.userAgent,
      city:       input.city,
      region:     input.region,
      country:    input.country,
      latitude:   input.latitude,
      longitude:  input.longitude,
    },
  });
}

export async function getScanHistory(profileId: string, limit = 100) {
  const rows = await rawPrisma.scanLog.findMany({
    where:   { profile_id: profileId },
    orderBy: { scanned_at: 'desc' },
    take:    limit,
    select: {
      scanned_at: true,
      city:       true,
      region:     true,
      country:    true,
      latitude:   true,
      longitude:  true,
      user_agent: true,
    },
  });
  return rows.map(r => ({
    scannedAt:  r.scanned_at.toISOString(),
    city:       r.city       ?? undefined,
    region:     r.region     ?? undefined,
    country:    r.country    ?? undefined,
    latitude:   r.latitude   ?? undefined,
    longitude:  r.longitude  ?? undefined,
    userAgent:  r.user_agent ?? undefined,
  }));
}

// Returns the top N cities by scan count within the last `days` days.
export async function getTopScanLocations(days = 30, limit = 20) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await rawPrisma.scanLog.groupBy({
    by:      ['city', 'region', 'country', 'latitude', 'longitude'],
    where:   { scanned_at: { gte: since }, city: { not: null } },
    _count:  { id: true },
    orderBy: { _count: { id: 'desc' } },
    take:    limit,
  });
  return rows.map(r => ({
    city:      r.city!,
    region:    r.region ?? '',
    country:   r.country ?? '',
    latitude:  r.latitude ?? 0,
    longitude: r.longitude ?? 0,
    scans:     r._count.id,
  }));
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function toRecord(p: {
  id:            string;
  created_at:    Date;
  scans_count:   number;
  is_private:    boolean;
  privacy_pin:   string | null;
  is_qr_active:  boolean;
}): LinkRecord {
  return {
    profileId:  p.id,
    createdAt:  p.created_at,
    scansCount: p.scans_count,
    isPrivate:  p.is_private,
    privacyPin: p.privacy_pin ?? '',
    isQrActive: p.is_qr_active,
  };
}
