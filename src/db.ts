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
