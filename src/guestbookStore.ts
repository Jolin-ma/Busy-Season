// In-memory guestbook queue — active when the database is unavailable.
// Keyed by whatever profileId the caller passes (shortId in demo, UUID in production).
// Lost on restart; replace with a persistent queue in production.

export interface MemoryEntry {
  id:           string;
  profile_id:   string;
  author_name:  string;
  author_email: string | null;
  message:      string;
  is_approved:  boolean;
  is_flagged:   boolean;
  created_at:   string;
}

const store = new Map<string, MemoryEntry[]>();

export function storeEntry(
  profileId:   string,
  author_name: string,
  message:     string,
  author_email: string | null,
): MemoryEntry {
  const entry: MemoryEntry = {
    id:           Math.random().toString(36).slice(2, 10),
    profile_id:   profileId,
    author_name,
    message,
    author_email,
    is_approved:  false,
    is_flagged:   false,
    created_at:   new Date().toISOString(),
  };
  const list = store.get(profileId) ?? [];
  list.push(entry);
  store.set(profileId, list);
  return entry;
}

export function getPending(profileId: string): MemoryEntry[] {
  return (store.get(profileId) ?? []).filter(e => !e.is_approved && !e.is_flagged);
}

export function moderateEntry(entryId: string, action: 'approve' | 'reject' | 'flag'): boolean {
  for (const [key, list] of store.entries()) {
    const entry = list.find(e => e.id === entryId);
    if (!entry) continue;
    if (action === 'approve') entry.is_approved = true;
    else                      entry.is_flagged  = true;
    store.set(key, list);
    return true;
  }
  return false;
}
