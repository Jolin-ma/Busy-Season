// In production: replace with Redis + Postgres. Short-link resolution must stay
// under 5ms at p99 — a grieving family scanning a headstone should never wait.

export interface LinkRecord {
  profileId: string;
  createdAt: Date;
  scansCount: number;
  isPrivate: boolean;
  privacyPin: string;
}

export interface ScanEvent {
  shortId: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

const store = new Map<string, LinkRecord>();
const scanHistory = new Map<string, ScanEvent[]>();
const HISTORY_CAP = 500;

export function createLink(shortId: string, profileId: string): LinkRecord {
  const record: LinkRecord = {
    profileId,
    createdAt: new Date(),
    scansCount: 0,
    isPrivate: false,
    privacyPin: '',
  };
  store.set(shortId, record);
  scanHistory.set(shortId, []);
  return record;
}

export function lookupLink(shortId: string): LinkRecord | undefined {
  return store.get(shortId);
}

export function incrementScanCount(shortId: string): void {
  const record = store.get(shortId);
  if (record) record.scansCount += 1;
}

export function setPrivacy(shortId: string, isPrivate: boolean, privacyPin: string): boolean {
  const record = store.get(shortId);
  if (!record) return false;
  record.isPrivate = isPrivate;
  record.privacyPin = isPrivate ? privacyPin : '';
  return true;
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

export function getAllLinks(): Map<string, LinkRecord> {
  return store;
}
