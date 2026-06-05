import { db, rawPrisma } from './lib/db';

// Reads  → `db`         (soft-delete extension silently adds deleted_at: null)
// Writes → `rawPrisma`  (manually guard deleted_at: null to avoid touching tombstones)

export interface LinkRecord {
  profileId:  string;   // Profile.id (UUID)
  createdAt:  Date;
  scansCount: number;
  isPrivate:  boolean;
  privacyPin: string;
}

export interface RoutingRecord extends LinkRecord {
  plan:           'BASIC' | 'PREMIUM';
  hasCoordinates: boolean;
  fullName:       string;
}

export interface ScanEvent {
  shortId:   string;
  timestamp: string;
  userAgent?: string;
  ip?:       string;
}

// Scan history is fire-and-forget in-memory (designed for a queue in production).
const scanHistory = new Map<string, ScanEvent[]>();
const HISTORY_CAP = 500;

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
  scanHistory.set(shortId, []);
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
  const result = await rawPrisma.profile.updateMany({
    where: { short_id: shortId, deleted_at: null },
    data:  { is_private: isPrivate, privacy_pin: isPrivate ? privacyPin : null },
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

export function appendScanEvent(event: ScanEvent): void {
  const history = scanHistory.get(event.shortId) ?? [];
  history.push(event);
  if (history.length > HISTORY_CAP) history.shift();
  scanHistory.set(event.shortId, history);
}

export function getScanHistory(shortId: string): ScanEvent[] {
  return scanHistory.get(shortId) ?? [];
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
  id:          string;
  created_at:  Date;
  scans_count: number;
  is_private:  boolean;
  privacy_pin: string | null;
}): LinkRecord {
  return {
    profileId:  p.id,
    createdAt:  p.created_at,
    scansCount: p.scans_count,
    isPrivate:  p.is_private,
    privacyPin: p.privacy_pin ?? '',
  };
}
