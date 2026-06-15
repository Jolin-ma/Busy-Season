'use client';
import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ── types ─────────────────────────────────────────────────────────────────────
interface AccountSummary {
  id:                string;
  name:              string;
  email:             string;
  stripeCustomerId:  string | null;
  plan:              'PREMIUM' | 'BASIC';
  profileCount:      number;
  hasDuplicate:      boolean;
  totalPaidCents:    number;
  totalRefundedCents: number;
  shortIds:          string[];
  lastTxStatus:      string | null;
  createdAt:         string;
  lastTxAt:          string | null;
}

interface AccountTx {
  id:              string;
  amount:          number;
  currency:        string;
  status:          'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  isPotentialDup:  boolean;
  refunded:        boolean;
  refundedAmount:  number;
  createdAt:       string;
}

interface AccountTicket {
  id:          string;
  subject:     string;
  status:      string;
  priority:    string;
  submittedAt: string;
}

interface AccountProfile {
  shortId:    string;
  isQrActive: boolean;
}

interface AccountDetail extends AccountSummary {
  transactions: AccountTx[];
  tickets:      AccountTicket[];
  profiles:     AccountProfile[];
}

// ── helpers ───────────────────────────────────────────────────────────────────
function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)} CAD`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
function avatarColor(id: string) {
  const palette = ['#3d2f1e', '#1e2a3d', '#1e3d2a', '#3d2a1e', '#2a1e3d', '#2e2e32'];
  return palette[parseInt(id.replace(/\D/g, '').slice(-1) || '0') % palette.length];
}
function avatarText(id: string) {
  const palette = ['#d4b896', '#96b4d4', '#96d4b4', '#d4a896', '#c4a6e8', '#b4b4c8'];
  return palette[parseInt(id.replace(/\D/g, '').slice(-1) || '0') % palette.length];
}

// ── status + plan tokens ──────────────────────────────────────────────────────
const ACCT_STATUS = {
  ACTIVE:    { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  SUSPENDED: { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500'     },
};
const PLAN_STYLE = {
  PREMIUM: { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-100' },
  BASIC:   { bg: 'bg-stone-100',  text: 'text-stone-600',   border: 'border-stone-200'  },
};
const TX_STATUS: Record<AccountTx['status'], { bg: string; text: string }> = {
  PAID:                { bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  FAILED:              { bg: 'bg-red-50',      text: 'text-red-700'     },
  REFUNDED:            { bg: 'bg-amber-50',    text: 'text-amber-700'   },
  PARTIALLY_REFUNDED:  { bg: 'bg-amber-50',    text: 'text-amber-600'   },
};

type DetailTab = 'overview' | 'billing' | 'support' | 'settings';

// ── Detail panel ──────────────────────────────────────────────────────────────
function AccountDetail({
  detail,
  loading,
  onClose,
  onDelete,
}: {
  detail:   AccountDetail | null;
  loading:  boolean;
  onClose:  () => void;
  onDelete: () => void;
}) {
  const [tab,        setTab]        = useState<DetailTab>('overview');
  const [status,     setStatus]     = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [qrStates,   setQrStates]   = useState<Record<string, boolean>>({});
  const [qrSaving,   setQrSaving]   = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [planOverride,  setPlanOverride]  = useState<'BASIC' | 'PREMIUM' | null>(null);
  const [planSaving,    setPlanSaving]    = useState(false);

  const currentPlan = planOverride ?? detail?.plan ?? 'BASIC';

  // Reset tab + QR state when account changes
  useEffect(() => {
    setTab('overview');
    setStatus('ACTIVE');
    setQrStates({});
    setConfirmDelete(false);
    setPlanOverride(null);
  }, [detail?.id]);

  async function handleDeleteAccount() {
    if (!detail) return;
    setDeleting(true);
    try {
      await fetch(`${API}/ops/account/${detail.id}`, { method: 'DELETE' });
      onDelete();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handlePlanChange(plan: 'BASIC' | 'PREMIUM') {
    if (!detail) return;
    setPlanSaving(true);
    try {
      await fetch(`${API}/ops/account/${detail.id}/plan`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan }),
      });
      setPlanOverride(plan);
    } finally {
      setPlanSaving(false);
    }
  }

  // Populate QR state when detail loads
  useEffect(() => {
    if (!detail) return;
    const initial: Record<string, boolean> = {};
    for (const p of detail.profiles ?? []) initial[p.shortId] = p.isQrActive;
    setQrStates(initial);
  }, [detail]);

  async function toggleQr(shortId: string) {
    const next = !qrStates[shortId];
    setQrStates(s => ({ ...s, [shortId]: next }));
    setQrSaving(s => ({ ...s, [shortId]: true }));
    try {
      await fetch(`${API}/admin/profile/${shortId}/qr-active`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isQrActive: next }),
      });
    } catch {
      setQrStates(s => ({ ...s, [shortId]: !next }));
    } finally {
      setQrSaving(s => ({ ...s, [shortId]: false }));
    }
  }

  const TABS: { key: DetailTab; label: string }[] = [
    { key: 'overview',  label: 'Overview'  },
    { key: 'billing',   label: 'Billing'   },
    { key: 'support',   label: 'Support'   },
    { key: 'settings',  label: 'Settings'  },
  ];

  if (loading || !detail) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 pt-5 pb-4 border-b border-stone-100 shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 bg-stone-100 rounded animate-pulse" />
                <div className="h-2.5 w-36 bg-stone-50 rounded animate-pulse" />
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-400 hover:bg-stone-200 transition-colors text-lg leading-none">×</button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xs text-stone-300">Loading…</div>
        </div>
      </div>
    );
  }

  const totalPaid = detail.transactions
    .filter(t => t.status === 'PAID' || t.status === 'PARTIALLY_REFUNDED')
    .reduce((s, t) => s + t.amount - t.refundedAmount, 0);
  const dupCount = detail.transactions.filter(t => t.isPotentialDup).length;
  const openTickets = detail.tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-stone-100 shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: avatarColor(detail.id), color: avatarText(detail.id) }}
            >
              {initials(detail.name)}
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">{detail.name}</p>
              <p className="text-xs text-stone-400">{detail.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-400 hover:bg-stone-200 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                tab === t.key
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              {t.label}
              {t.key === 'support' && openTickets > 0 && (
                <span className="ml-1 text-[9px] font-bold bg-red-500 text-white px-1 py-0.5 rounded-full">{openTickets}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <>
            <Section title="Account Info">
              <Row label="Account ID"   value={detail.id} mono />
              <Row label="Stripe ID"    value={detail.stripeCustomerId ?? '—'} mono />
              <Row label="Member since" value={fmtDate(detail.createdAt)} />
              {detail.shortIds.length > 0 && (
                <Row label="Profile IDs">
                  <div className="flex flex-wrap gap-1 justify-end">
                    {detail.shortIds.map(sid => (
                      <a
                        key={sid}
                        href={`http://localhost:3000/p/${sid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono bg-stone-100 hover:bg-indigo-50 hover:text-indigo-700 text-stone-600 px-1.5 py-0.5 rounded transition-colors"
                      >
                        {sid}
                      </a>
                    ))}
                  </div>
                </Row>
              )}
              <Row label="Status">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${ACCT_STATUS[status].bg} ${ACCT_STATUS[status].text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${ACCT_STATUS[status].dot}`} />
                  {status}
                </span>
              </Row>
            </Section>

            <Section title="Plan & Usage">
              <Row label="Plan">
                <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border ${PLAN_STYLE[currentPlan].bg} ${PLAN_STYLE[currentPlan].text} ${PLAN_STYLE[currentPlan].border}`}>
                  {currentPlan}
                </span>
              </Row>
              <Row label="Profiles"      value={`${detail.profileCount} active`} />
              <Row label="Total revenue" value={fmt(totalPaid)} />
              {dupCount > 0 && (
                <div className="flex items-center gap-2 mt-1 p-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                  <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-[11px] text-amber-700 font-medium">{dupCount} potential duplicate charge{dupCount > 1 ? 's' : ''} flagged</p>
                </div>
              )}
            </Section>
          </>
        )}

        {/* ── Billing ── */}
        {tab === 'billing' && (
          <Section title={`Transactions (${detail.transactions.length})`}>
            <div className="space-y-2">
              {detail.transactions.length === 0 && (
                <p className="text-xs text-stone-400 py-4 text-center">No transactions yet.</p>
              )}
              {detail.transactions.map(tx => {
                const s = TX_STATUS[tx.status];
                return (
                  <div key={tx.id} className={`rounded-xl border p-3 ${tx.isPotentialDup ? 'border-amber-200 bg-amber-50' : 'border-stone-100 bg-stone-50'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-mono text-stone-500 truncate">{tx.id}</p>
                        <p className="text-xs font-semibold text-stone-800 mt-0.5">{fmt(tx.amount)}</p>
                        {tx.refundedAmount > 0 && (
                          <p className="text-[10px] text-amber-600">Refunded {fmt(tx.refundedAmount)}</p>
                        )}
                        <p className="text-[10px] text-stone-400 mt-0.5">{fmtDate(tx.createdAt)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                          {tx.status.replace('_', ' ')}
                        </span>
                        {tx.isPotentialDup && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            DUP FLAG
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Support ── */}
        {tab === 'support' && (
          <Section title={`Tickets (${detail.tickets.length})`}>
            {detail.tickets.length === 0 && (
              <p className="text-xs text-stone-400 py-4 text-center">No support tickets on this account.</p>
            )}
            <div className="space-y-2">
              {detail.tickets.map(t => (
                <div key={t.id} className="rounded-xl border border-stone-100 bg-stone-50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-stone-400">{t.id.slice(0, 8)}…</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.status === 'OPEN'        ? 'bg-red-50 text-red-600'     :
                      t.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-stone-800 leading-snug">{t.subject}</p>
                  <p className="text-[10px] text-stone-400 mt-1">{fmtDate(t.submittedAt)}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Settings ── */}
        {tab === 'settings' && (
          <>
            <Section title="QR Code Status">
              <p className="text-xs text-stone-500 mb-3">
                Deactivating a QR code shows a &ldquo;no longer active&rdquo; page to anyone who scans the physical plaque.
                The memorial profile and all its data remain intact.
              </p>
              {(detail.profiles ?? []).length === 0 && (
                <p className="text-xs text-stone-400 py-2 text-center">No profiles on this account.</p>
              )}
              <div className="space-y-2">
                {(detail.profiles ?? []).map(p => {
                  const active  = qrStates[p.shortId] ?? p.isQrActive;
                  const saving  = qrSaving[p.shortId] ?? false;
                  return (
                    <div key={p.shortId} className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                        {p.shortId}
                      </span>
                      <button
                        onClick={() => toggleQr(p.shortId)}
                        disabled={saving}
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                          active ? 'bg-emerald-500' : 'bg-stone-300'
                        }`}
                        title={active ? 'Deactivate QR' : 'Activate QR'}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            active ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <span className={`text-[10px] font-semibold w-16 ${active ? 'text-emerald-600' : 'text-stone-400'}`}>
                        {saving ? 'Saving…' : active ? 'Active' : 'Deactivated'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Section>

            <Section title="Account Status">
              <p className="text-xs text-stone-500 mb-3">
                {status === 'ACTIVE'
                  ? 'This account is active. The customer can log in and access all features.'
                  : 'This account is suspended. Access is blocked for the customer.'}
              </p>
              <button
                onClick={() => setStatus(s => s === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors ${
                  status === 'ACTIVE'
                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                }`}
              >
                {status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
              </button>
            </Section>

            <Section title="Plan">
              <Row label="Current plan">
                <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border ${PLAN_STYLE[currentPlan].bg} ${PLAN_STYLE[currentPlan].text} ${PLAN_STYLE[currentPlan].border}`}>
                  {currentPlan}
                </span>
              </Row>
              <p className="text-xs text-stone-500 mt-2 mb-3">
                Changing the plan updates all active profiles on this account.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePlanChange('BASIC')}
                  disabled={planSaving || currentPlan === 'BASIC'}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors border disabled:opacity-50 ${
                    currentPlan === 'BASIC'
                      ? 'bg-stone-100 text-stone-600 border-stone-200 cursor-default'
                      : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  Downgrade to Basic
                </button>
                <button
                  onClick={() => handlePlanChange('PREMIUM')}
                  disabled={planSaving || currentPlan === 'PREMIUM'}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors border disabled:opacity-50 ${
                    currentPlan === 'PREMIUM'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-100 cursor-default'
                      : 'border-indigo-100 text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {planSaving ? 'Saving…' : 'Upgrade to Premium'}
                </button>
              </div>
            </Section>

            <Section title="Danger Zone">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-100 hover:bg-red-50 transition-colors"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-red-600 leading-snug">
                    This will soft-delete all profiles for this account. Are you sure?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {deleting ? 'Deleting…' : 'Confirm Delete'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">{title}</p>
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 space-y-2">
        {children}
      </div>
    </div>
  );
}
function Row({
  label, value, mono, children,
}: {
  label: string; value?: string; mono?: boolean; children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-stone-500 shrink-0">{label}</span>
      {children ?? (
        <span className={`text-xs font-medium text-stone-800 text-right truncate ${mono ? 'font-mono text-[10px]' : ''}`}>
          {value}
        </span>
      )}
    </div>
  );
}

// ── Inner page (needs useSearchParams inside Suspense) ────────────────────────
function AccountsInner() {
  const searchParams = useSearchParams();
  const [accounts,     setAccounts]     = useState<AccountSummary[]>([]);
  const [detail,       setDetail]       = useState<AccountDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [search,       setSearch]       = useState('');
  const [planFilter,   setPlanFilter]   = useState<'ALL' | 'PREMIUM' | 'BASIC'>('ALL');

  // Fetch account list
  useEffect(() => {
    fetch(`${API}/ops/billing/accounts`)
      .then(r => r.json())
      .then((d: { accounts?: AccountSummary[] }) => setAccounts(d.accounts ?? []))
      .catch(() => {});
  }, []);

  // Fetch detail when selection changes
  const fetchDetail = useCallback((id: string) => {
    setDetailLoading(true);
    setDetail(null);
    fetch(`${API}/ops/billing/account/${id}`)
      .then(r => r.json())
      .then((d: { account?: AccountDetail }) => {
        if (d.account) setDetail(d.account);
      })
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  }, []);

  // Auto-open via ?shortId= URL param
  useEffect(() => {
    const shortId = searchParams.get('shortId');
    if (!shortId || accounts.length === 0) return;
    const match = accounts.find(a => a.shortIds.includes(shortId));
    if (match && match.id !== selectedId) {
      setSelectedId(match.id);
      fetchDetail(match.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, accounts]);

  function selectAccount(id: string) {
    if (id === selectedId) {
      setSelectedId(null);
      setDetail(null);
    } else {
      setSelectedId(id);
      fetchDetail(id);
    }
  }

  const filtered = useMemo(() => {
    return accounts.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.id.includes(q);
      const matchPlan   = planFilter === 'ALL' || a.plan === planFilter;
      return matchSearch && matchPlan;
    });
  }, [accounts, search, planFilter]);

  const totalRevenue  = accounts.reduce((s, a) => s + a.totalPaidCents, 0);
  const dupFlags      = accounts.filter(a => a.hasDuplicate).length;
  const premiumCount  = accounts.filter(a => a.plan === 'PREMIUM').length;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f7f6f3' }}>
      <Sidebar />

      <div className="flex flex-1 overflow-hidden">

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-7 space-y-5">

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Account Management
                </h1>
                <p className="text-xs text-stone-400 mt-1">{accounts.length} registered accounts</p>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Accounts',  value: accounts.length,   sub: 'all time'         },
                { label: 'Premium',         value: premiumCount,       sub: 'paying customers' },
                { label: 'Total Revenue',   value: fmt(totalRevenue),  sub: 'net of refunds'   },
                { label: 'Flagged Charges', value: dupFlags, warn: dupFlags > 0, sub: 'needs review' },
              ].map(c => (
                <div key={c.label} className={`bg-white border rounded-2xl px-4 py-3.5 shadow-sm ${c.warn ? 'border-amber-200' : 'border-stone-100'}`}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">{c.label}</p>
                  <p className={`text-xl font-bold ${c.warn ? 'text-amber-600' : 'text-stone-900'}`}>{c.value}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[180px]">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, or ID…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-stone-300 placeholder:text-stone-300"
                />
              </div>
              <select
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value as typeof planFilter)}
                className="text-xs bg-white border border-stone-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-stone-300 text-stone-700"
              >
                <option value="ALL">All plans</option>
                <option value="PREMIUM">Premium</option>
                <option value="BASIC">Basic</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400">Account</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 hidden sm:table-cell">Plan</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 hidden md:table-cell">Profiles</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 hidden lg:table-cell">Last Payment</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 hidden lg:table-cell">Flags</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 hidden md:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-xs text-stone-400">
                        {accounts.length === 0 ? 'Loading…' : 'No accounts match your search.'}
                      </td>
                    </tr>
                  )}
                  {filtered.map(a => {
                    const isSelected = selectedId === a.id;
                    const txStyle = a.lastTxStatus ? TX_STATUS[a.lastTxStatus as AccountTx['status']] : null;

                    return (
                      <tr
                        key={a.id}
                        onClick={() => selectAccount(a.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-stone-50' : 'hover:bg-stone-50/70'}`}
                      >
                        {/* Account */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                              style={{ background: avatarColor(a.id), color: avatarText(a.id) }}
                            >
                              {initials(a.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-stone-800 truncate">{a.name}</p>
                              <p className="text-[10px] text-stone-400 truncate">{a.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PLAN_STYLE[a.plan].bg} ${PLAN_STYLE[a.plan].text} ${PLAN_STYLE[a.plan].border}`}>
                            {a.plan}
                          </span>
                        </td>

                        {/* Profiles */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs font-medium text-stone-700">{a.profileCount}</span>
                        </td>

                        {/* Last payment */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {txStyle ? (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${txStyle.bg} ${txStyle.text}`}>
                              {a.lastTxStatus!.replace('_', ' ')}
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-300">—</span>
                          )}
                        </td>

                        {/* Flags */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {a.hasDuplicate ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">
                              ⚠ Dup
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-300">—</span>
                          )}
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-[10px] text-stone-400">{fmtDate(a.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-4 py-2.5 border-t border-stone-50">
                <p className="text-[10px] text-stone-300">
                  {filtered.length} account{filtered.length !== 1 ? 's' : ''} · click a row to view details
                </p>
              </div>
            </div>

          </div>
        </main>

        {/* ── Detail panel ── */}
        <div
          style={{
            width: selectedId ? 360 : 0,
            minWidth: selectedId ? 360 : 0,
            transition: 'width 280ms cubic-bezier(0.23,1,0.32,1), min-width 280ms cubic-bezier(0.23,1,0.32,1)',
            overflow: 'hidden',
          }}
          className="bg-white border-l border-stone-100 h-screen sticky top-0 shrink-0"
        >
          {selectedId && (
            <AccountDetail
              detail={detail}
              loading={detailLoading}
              onClose={() => { setSelectedId(null); setDetail(null); }}
              onDelete={() => {
                setAccounts(a => a.filter(acc => acc.id !== selectedId));
                setSelectedId(null);
                setDetail(null);
              }}
            />
          )}
        </div>

      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AccountsPage() {
  return (
    <Suspense>
      <AccountsInner />
    </Suspense>
  );
}
