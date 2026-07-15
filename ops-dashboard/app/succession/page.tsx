'use client';
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClaimProfile {
  id:        string;
  short_id:  string;
  full_name: string;
}

interface Claim {
  id:                 string;
  name:               string;
  email:              string;
  relationship:       string;
  status:             'CLAIMED';
  claim_initiated_at: string;
  claim_notes:        string | null;
  ops_notes:          string | null;
  verified_at:        string | null;
  profile_id:         string;
  profile:            ClaimProfile | null;
}

type ActionType = 'approve' | 'reject';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1)  return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ── Claim row ─────────────────────────────────────────────────────────────────

function ClaimRow({
  claim,
  onResolved,
}: {
  claim:      Claim;
  onResolved: (id: string) => void;
}) {
  const [expanded,  setExpanded]  = useState(false);
  const [action,    setAction]    = useState<ActionType | null>(null);
  const [opsNotes,  setOpsNotes]  = useState('');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function submit() {
    if (!action) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/gw/ops/succession/claims/${claim.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action, opsNotes: opsNotes.trim() || undefined }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? 'Request failed.');
      onResolved(claim.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setSaving(false);
    }
  }

  const initiateAction = (a: ActionType) => {
    setAction(a);
    setOpsNotes('');
    setError(null);
  };

  return (
    <div className="border border-stone-100 rounded-2xl bg-white overflow-hidden">
      {/* Main row */}
      <div className="p-5 flex items-start gap-4">

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 text-xs font-bold shrink-0 mt-0.5">
          {claim.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
        </div>

        {/* Executor info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-stone-800">{claim.name}</p>
            <span className="text-xs text-stone-400">·</span>
            <p className="text-xs text-stone-500">{claim.relationship}</p>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">{claim.email}</p>

          {/* Memorial */}
          {claim.profile && (
            <div className="mt-2 flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-stone-300 shrink-0">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-stone-600 font-medium truncate">{claim.profile.full_name}</p>
              <span className="font-mono text-[10px] text-stone-400 bg-stone-50 border border-stone-100 px-1.5 py-0.5 rounded shrink-0">
                {claim.profile.short_id}
              </span>
            </div>
          )}

          {/* Claim notes toggle */}
          {claim.claim_notes && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-2 text-[11px] text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-2"
            >
              {expanded ? 'Hide claim notes' : 'View claim notes'}
            </button>
          )}
        </div>

        {/* Right meta + actions */}
        <div className="shrink-0 text-right">
          <p className="text-[11px] text-stone-400 mb-1">{timeAgo(claim.claim_initiated_at)}</p>
          <p className="text-[10px] text-stone-300">{fmtDate(claim.claim_initiated_at)}</p>
          {claim.verified_at && (
            <p className="text-[10px] text-stone-300 mt-0.5">Verified {fmtDate(claim.verified_at)}</p>
          )}

          {!action && (
            <div className="flex items-center gap-2 mt-3 justify-end">
              <button
                onClick={() => initiateAction('reject')}
                className="text-[11px] font-semibold text-red-500 border border-red-100 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => initiateAction('approve')}
                className="text-[11px] font-semibold text-emerald-700 border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
              >
                Approve
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded claim notes */}
      {expanded && claim.claim_notes && (
        <div className="px-5 pb-4">
          <div className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">Executor&apos;s Statement</p>
            <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap">{claim.claim_notes}</p>
          </div>
        </div>
      )}

      {/* Action panel */}
      {action && (
        <div className={`border-t px-5 py-4 ${action === 'approve' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <p className="text-xs font-semibold text-stone-700 mb-3">
            {action === 'approve'
              ? 'Approve this claim — the executor will receive full account access.'
              : 'Reject this claim — executor status returns to Verified with no account transfer.'}
          </p>
          <textarea
            value={opsNotes}
            onChange={e => setOpsNotes(e.target.value)}
            placeholder="Internal notes (optional) — not shown to the executor"
            rows={2}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-700 bg-white placeholder:text-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none mb-3"
          />
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAction(null)}
              disabled={saving}
              className="text-xs text-stone-500 hover:text-stone-700 transition-colors px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={saving}
              className={`text-xs font-semibold px-4 py-1.5 rounded-xl transition-colors disabled:opacity-50 ${
                action === 'approve'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {saving ? 'Saving…' : action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SuccessionPage() {
  const [claims,  setClaims]  = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('/api/gw/ops/succession/claims')
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((d: { claims: Claim[] }) => setClaims(d.claims))
      .catch(() => setError('Failed to load claims. Is the Fastify server running?'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleResolved = (id: string) => {
    setResolved(prev => new Set(prev).add(id));
    // Remove from list after a short delay so the user sees the row disappear
    setTimeout(() => setClaims(prev => prev.filter(c => c.id !== id)), 800);
  };

  const visible = claims.filter(c => !resolved.has(c.id));

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-stone-900">Succession Claims</h1>
              <p className="text-sm text-stone-400 mt-1">
                Review executor claim requests. Approved claims transfer full account control.
              </p>
            </div>
            <button
              onClick={load}
              className="text-xs text-stone-500 border border-stone-200 bg-white hover:bg-stone-50 px-3 py-2 rounded-xl transition-colors shrink-0"
            >
              Refresh
            </button>
          </div>

          {/* How-it-works callout */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 mb-6">
            <p className="text-xs font-semibold text-amber-800 mb-1">Review process</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              A Legacy Executor with <strong>Verified</strong> status initiated a claim request.
              Before approving, confirm their identity and relationship to the account holder.
              You may request a death certificate or letter of administration by contacting them directly.
              Approval sets their executor status to <strong>Verified</strong> and records your internal notes —
              account access transfer must still be completed manually (profile ownership reassignment).
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-stone-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-stone-400">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-medium text-stone-700">No pending claims</p>
              <p className="text-xs text-stone-400 mt-1">All succession claims have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-stone-400 mb-1">
                {visible.length} pending claim{visible.length !== 1 ? 's' : ''}
              </p>
              {visible.map(claim => (
                <ClaimRow
                  key={claim.id}
                  claim={claim}
                  onResolved={handleResolved}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
