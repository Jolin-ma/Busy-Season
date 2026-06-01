'use client';
import { useState, useEffect, useCallback } from 'react';

interface Entry {
  id:            string;
  author_name:   string;
  author_email?: string | null;
  message:       string;
  created_at:    string;
}

interface Contributor {
  id:    string;
  name:  string;
  email: string;
}

interface Props {
  profileId?: string;
}

const BASE = 'http://localhost:3000';

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <span className="text-sm text-stone-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-stone-800' : 'bg-stone-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  );
}

export default function GuestbookPanel({ profileId = 'a5trneuj' }: Props) {
  const [pending,     setPending]     = useState<Entry[]>([]);
  const [trusted,     setTrusted]     = useState<Contributor[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [preApproval, setPreApproval] = useState(true);
  const [enabled,     setEnabled]     = useState(true);
  const [newName,     setNewName]     = useState('');
  const [newEmail,    setNewEmail]    = useState('');
  const [moderating,  setModerating]  = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/v1/premium/guestbook/${profileId}/pending`);
      if (res.ok) {
        const data = await res.json();
        setPending(data.entries ?? []);
      }
    } catch { /* backend unreachable */ }
    setLoading(false);
  }, [profileId]);

  const fetchTrusted = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/v1/premium/guestbook/${profileId}/trusted`);
      if (res.ok) {
        const data = await res.json();
        setTrusted(data.contributors ?? []);
      }
    } catch { /* backend unreachable */ }
  }, [profileId]);

  useEffect(() => {
    fetchPending();
    fetchTrusted();
  }, [fetchPending, fetchTrusted]);

  const moderate = async (id: string, action: 'approve' | 'reject') => {
    setModerating(id);
    try {
      await fetch(`${BASE}/api/v1/premium/guestbook/moderate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ entryId: id, action }),
      });
    } catch { /* optimistic */ }
    setPending(prev => prev.filter(e => e.id !== id));
    setModerating(null);
  };

  const addTrusted = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    try {
      const res = await fetch(`${BASE}/api/v1/premium/guestbook/${profileId}/trusted`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: newName.trim(), email: newEmail.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setTrusted(prev => [...prev, data.contributor]);
      }
    } catch {
      setTrusted(prev => [...prev, { id: Date.now().toString(), name: newName.trim(), email: newEmail.trim() }]);
    }
    setNewName(''); setNewEmail('');
  };

  const removeTrusted = async (id: string) => {
    try {
      await fetch(`${BASE}/api/v1/premium/guestbook/${profileId}/trusted/${id}`, { method: 'DELETE' });
    } catch { /* optimistic */ }
    setTrusted(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-8">

      {/* Settings */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Settings</h3>
        <div className="space-y-4">
          <Toggle checked={enabled}     onChange={setEnabled}     label="Guestbook enabled" />
          <div className="h-px bg-stone-100" />
          <Toggle checked={preApproval} onChange={setPreApproval} label="Require pre-approval before publishing" />
        </div>
      </div>

      {/* Moderation queue */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Pending Approval</h3>
          <div className="flex items-center gap-2">
            {pending.length > 0 && (
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {pending.length} waiting
              </span>
            )}
            <button
              onClick={fetchPending}
              className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
              title="Refresh"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 rounded-full border-2 border-stone-200 border-t-stone-600 animate-spin" />
          </div>
        ) : pending.length === 0 ? (
          <p className="text-sm text-stone-400 py-4 text-center">No entries awaiting approval.</p>
        ) : (
          <div className="space-y-4">
            {pending.map(entry => (
              <div key={entry.id} className="border border-stone-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{entry.author_name}</p>
                    {entry.author_email && (
                      <p className="text-xs text-stone-400">{entry.author_email}</p>
                    )}
                  </div>
                  <span className="text-xs text-stone-400 shrink-0">
                    {new Date(entry.created_at).toLocaleDateString('en-CA')}
                  </span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed mb-4 line-clamp-3">{entry.message}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => moderate(entry.id, 'approve')}
                    disabled={moderating === entry.id}
                    className="text-xs font-semibold bg-stone-800 text-white px-4 py-2 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50"
                  >
                    {moderating === entry.id ? '…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => moderate(entry.id, 'reject')}
                    disabled={moderating === entry.id}
                    className="text-xs font-semibold text-stone-500 border border-stone-200 px-4 py-2 rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trusted contributors */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Trusted Contributors</h3>
        <p className="text-xs text-stone-400 mb-5">These people can post without approval.</p>

        {trusted.length > 0 && (
          <div className="space-y-2 mb-5">
            {trusted.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-4 py-2.5 px-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-800">{c.name}</p>
                  <p className="text-xs text-stone-400">{c.email}</p>
                </div>
                <button
                  onClick={() => removeTrusted(c.id)}
                  className="text-xs text-stone-400 hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Full name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="flex-1 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
          <input
            type="email"
            placeholder="Email address"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTrusted()}
            className="flex-1 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
          <button
            onClick={addTrusted}
            className="text-sm font-semibold bg-stone-800 text-white px-4 py-2.5 rounded-xl hover:bg-stone-700 transition-colors shrink-0"
          >
            Add
          </button>
        </div>
      </div>

    </div>
  );
}
