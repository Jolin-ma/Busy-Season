// In production: replace with a Redis GET (sub-millisecond) backed by a Postgres
// table for durability. Short-link resolution must stay under 5ms at p99 —
// a grieving family scanning a headstone should never wait for a cold DB boot.

export interface LinkRecord {
  profileId: string;
  createdAt: Date;
  scansCount: number;
}

// In-memory store keyed by shortId. Swap with `redis.get(shortId)` in prod.
const store = new Map<string, LinkRecord>();

export function createLink(shortId: string, profileId: string): LinkRecord {
  const record: LinkRecord = { profileId, createdAt: new Date(), scansCount: 0 };
  store.set(shortId, record);
  return record;
}

export function lookupLink(shortId: string): LinkRecord | undefined {
  return store.get(shortId);
}

// Called after redirect dispatch so it never sits on the hot path.
export function incrementScanCount(shortId: string): void {
  const record = store.get(shortId);
  if (record) record.scansCount += 1;
}

export function getAllLinks(): Map<string, LinkRecord> {
  return store;
}
