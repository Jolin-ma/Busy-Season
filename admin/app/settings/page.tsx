'use client';
import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Toggle {
  label: string;
  description: string;
  key: string;
}

const NOTIFICATION_TOGGLES: Toggle[] = [
  { key: 'scanAlerts',    label: 'Scan Notifications',   description: 'Email me when a memorial is scanned for the first time each day' },
  { key: 'orderUpdates',  label: 'Plaque Order Updates',  description: 'Receive shipping and engraving status updates' },
  { key: 'weeklyDigest',  label: 'Weekly Analytics',      description: 'A weekly summary of scan activity across all memorials' },
  { key: 'memoryWall',    label: 'New Memory Alerts',      description: 'Notify me when someone leaves a tribute on a profile' },
];

interface Executor {
  id: string;
  name: string;
  email: string;
  relationship: string;
  status: 'VERIFIED' | 'PENDING_VERIFICATION' | 'CLAIMED' | 'REVOKED';
}

interface Profile {
  id: string;
  shortId: string;
  fullName: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName]   = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    scanAlerts: true,
    orderUpdates: true,
    weeklyDigest: false,
    memoryWall: true,
  });

  const [qrEngine, setQrEngine] = useState('http://localhost:3000');

  // ── Succession state ───────────────────────────────────────────────────────
  const [profiles,        setProfiles]        = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [executors,       setExecutors]       = useState<Executor[]>([]);
  const [exLoading,       setExLoading]       = useState(false);
  const [exError,         setExError]         = useState<string | null>(null);
  const [exName,          setExName]          = useState('');
  const [exEmail,         setExEmail]         = useState('');
  const [exRelationship,  setExRelationship]  = useState('');
  const [exSubmitting,    setExSubmitting]    = useState(false);
  const [exSubmitError,   setExSubmitError]   = useState<string | null>(null);
  const [removingId,      setRemovingId]      = useState<string | null>(null);

  // Fetch user's profiles on mount
  useEffect(() => {
    fetch(`${API}/admin/profiles`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((d: { profiles: Profile[] }) => {
        setProfiles(d.profiles);
        if (d.profiles.length > 0) setActiveProfileId(d.profiles[0].id);
      })
      .catch(() => {});
  }, []);

  // Fetch executors whenever the active profile changes
  const loadExecutors = useCallback((profileId: string) => {
    setExLoading(true);
    setExError(null);
    fetch(`${API}/api/v1/succession/${profileId}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((d: { executors: Executor[] }) => setExecutors(d.executors))
      .catch(() => setExError('Failed to load executors.'))
      .finally(() => setExLoading(false));
  }, []);

  useEffect(() => {
    if (activeProfileId) loadExecutors(activeProfileId);
  }, [activeProfileId, loadExecutors]);

  const removeExecutor = async (executorId: string) => {
    if (!activeProfileId) return;
    setRemovingId(executorId);
    try {
      const res = await fetch(`${API}/api/v1/succession/${activeProfileId}/${executorId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Failed to remove executor.');
      }
      setExecutors(prev => prev.filter(e => e.id !== executorId));
    } catch {
      // silently ignore — list stays unchanged
    } finally {
      setRemovingId(null);
    }
  };

  const addExecutor = async () => {
    if (!activeProfileId || !exName.trim() || !exEmail.trim()) return;
    setExSubmitting(true);
    setExSubmitError(null);
    try {
      const res = await fetch(`${API}/api/v1/succession/${activeProfileId}`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ name: exName.trim(), email: exEmail.trim(), relationship: exRelationship.trim() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? 'Failed to send invitation.');
      setExecutors(prev => [...prev, d.executor as Executor]);
      setExName('');
      setExEmail('');
      setExRelationship('');
    } catch (err: unknown) {
      setExSubmitError(err instanceof Error ? err.message : 'Failed to send invitation.');
    } finally {
      setExSubmitting(false);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggle = (key: string) =>
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <AppShell>
    <div className="min-h-full bg-stone-50 px-6 py-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">Settings</h1>
        <p className="text-stone-400 text-sm mt-1">Manage your account and platform preferences.</p>
      </div>

      {/* Account */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Account</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
            />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Notifications</h2>
        <div className="divide-y divide-stone-50">
          {NOTIFICATION_TOGGLES.map(item => (
            <div key={item.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="pr-4">
                <p className="text-sm font-medium text-stone-700">{item.label}</p>
                <p className="text-xs text-stone-400 mt-0.5">{item.description}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 focus:outline-none
                  ${notifications[item.key] ? 'bg-stone-800' : 'bg-stone-200'}`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform
                    ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Succession Planning */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Succession Planning</h2>
        <p className="text-xs text-stone-400 mb-5">Designate trusted individuals who can claim account control on your behalf.</p>

        {/* Profile selector — shown only when user has multiple profiles */}
        {profiles.length > 1 && (
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Memorial</label>
            <select
              value={activeProfileId ?? ''}
              onChange={e => setActiveProfileId(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} ({p.shortId})</option>
              ))}
            </select>
          </div>
        )}

        {/* Executor list */}
        {exLoading ? (
          <p className="text-xs text-stone-400 mb-5">Loading…</p>
        ) : exError ? (
          <p className="text-xs text-red-400 mb-5">{exError}</p>
        ) : executors.length > 0 ? (
          <div className="divide-y divide-stone-50 mb-5">
            {executors.map(ex => (
              <div key={ex.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">
                    {ex.name}{ex.relationship ? ` · ${ex.relationship}` : ''}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5 truncate">{ex.email}</p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  {ex.status === 'VERIFIED' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100">
                      Verified
                    </span>
                  ) : ex.status === 'CLAIMED' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      Claim Pending
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                      Pending
                    </span>
                  )}
                  <button
                    onClick={() => removeExecutor(ex.id)}
                    disabled={removingId === ex.id}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    {removingId === ex.id ? '…' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : activeProfileId ? (
          <p className="text-xs text-stone-400 mb-5">No executors designated yet.</p>
        ) : null}

        {/* Info callout */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed mb-4">
          Legacy Executors receive an email invitation to verify their identity. They can only initiate a claim request after verification. All claims are reviewed by our team before any account transfer occurs.
        </div>

        {/* Add executor form or limit message */}
        {!activeProfileId ? (
          <p className="text-xs text-stone-400">No memorial found. Create a profile first.</p>
        ) : executors.length >= 3 ? (
          <p className="text-xs text-stone-400">You&apos;ve reached the maximum of 3 Legacy Executors.</p>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Name</label>
              <input
                type="text"
                value={exName}
                onChange={e => setExName(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Email</label>
              <input
                type="email"
                value={exEmail}
                onChange={e => setExEmail(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Relationship</label>
              <input
                type="text"
                value={exRelationship}
                onChange={e => setExRelationship(e.target.value)}
                placeholder="e.g. Spouse, Child, Attorney"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white placeholder:text-stone-300"
              />
            </div>
            {exSubmitError && (
              <p className="text-xs text-red-500">{exSubmitError}</p>
            )}
            <button
              onClick={addExecutor}
              disabled={exSubmitting || !exName.trim() || !exEmail.trim()}
              className="w-full py-2 rounded-xl text-sm font-semibold bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              {exSubmitting ? 'Sending…' : 'Send Invitation'}
            </button>
          </div>
        )}
      </section>

      {/* QR Engine */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">QR Engine</h2>
        <p className="text-xs text-stone-400 mb-5">
          The Fastify routing server that handles QR scans. In production, this will be your deployed edge URL.
        </p>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Server URL</label>
          <input
            type="url"
            value={qrEngine}
            onChange={e => setQrEngine(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
          />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-stone-400">Engine reachable at {qrEngine}</span>
        </div>
      </section>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-2xl text-sm font-semibold transition-all
          ${saved
            ? 'bg-green-600 text-white'
            : 'bg-stone-800 text-white hover:bg-stone-700'}`}
      >
        {saved ? '✓ Changes Saved' : 'Save Changes'}
      </button>
    </div>
    </AppShell>
  );
}
