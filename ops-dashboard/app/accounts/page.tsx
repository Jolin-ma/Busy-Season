'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import {
  BILLING_ACCOUNTS, SUPPORT_TICKETS,
  MockBillingAccount, MockTransaction,
} from '@/lib/mock-data';

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
function lastPaymentStatus(txs: MockTransaction[]) {
  const paid = [...txs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return paid[0] ?? null;
}
function openTickets(accountName: string) {
  return SUPPORT_TICKETS.filter(
    t => t.name === accountName && t.status !== 'RESOLVED'
  ).length;
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
const TX_STATUS = {
  PAID:                { bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  FAILED:              { bg: 'bg-red-50',      text: 'text-red-700'     },
  REFUNDED:            { bg: 'bg-amber-50',    text: 'text-amber-700'   },
  PARTIALLY_REFUNDED:  { bg: 'bg-amber-50',    text: 'text-amber-600'   },
};

type DetailTab = 'overview' | 'billing' | 'support' | 'settings';

// ── Detail panel ──────────────────────────────────────────────────────────────
function AccountDetail({
  account,
  onClose,
}: {
  account: MockBillingAccount;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>('overview');
  const [status, setStatus] = useState(account.status);
  const tickets = SUPPORT_TICKETS.filter(t => t.name === account.name);
  const totalPaid = account.transactions
    .filter(t => t.status === 'PAID')
    .reduce((s, t) => s + t.amount - t.refundedAmount, 0);
  const dupCount = account.transactions.filter(t => t.isPotentialDup).length;

  const TABS: { key: DetailTab; label: string }[] = [
    { key: 'overview',  label: 'Overview'  },
    { key: 'billing',   label: 'Billing'   },
    { key: 'support',   label: 'Support'   },
    { key: 'settings',  label: 'Settings'  },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-stone-100 shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: avatarColor(account.id), color: avatarText(account.id) }}
            >
              {initials(account.name)}
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">{account.name}</p>
              <p className="text-xs text-stone-400">{account.email}</p>
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
              <Row label="Account ID"   value={account.id} mono />
              <Row label="Stripe ID"    value={account.stripeCustomerId} mono />
              <Row label="Member since" value={fmtDate(account.createdAt)} />
              {account.shortIds.length > 0 && (
                <Row label="Profile IDs">
                  <div className="flex flex-wrap gap-1 justify-end">
                    {account.shortIds.map(sid => (
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
                <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border ${PLAN_STYLE[account.plan].bg} ${PLAN_STYLE[account.plan].text} ${PLAN_STYLE[account.plan].border}`}>
                  {account.plan}
                </span>
              </Row>
              <Row label="Profiles"      value={`${account.profileCount} active`} />
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
          <Section title={`Transactions (${account.transactions.length})`}>
            <div className="space-y-2">
              {account.transactions.map(tx => {
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
          <Section title={`Tickets (${tickets.length})`}>
            {tickets.length === 0 && (
              <p className="text-xs text-stone-400 py-4 text-center">No support tickets on this account.</p>
            )}
            <div className="space-y-2">
              {tickets.map(t => (
                <div key={t.id} className="rounded-xl border border-stone-100 bg-stone-50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-stone-400">{t.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.status === 'NEW'         ? 'bg-red-50 text-red-600'     :
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
              <p className="text-xs text-stone-500 mb-3">
                Current plan: <strong className="text-stone-800">{account.plan}</strong>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(['BASIC', 'PREMIUM'] as const).map(p => (
                  <button
                    key={p}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      account.plan === p
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Danger Zone">
              <button className="w-full py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-100 hover:bg-red-50 transition-colors">
                Delete Account
              </button>
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
  const [search,       setSearch]       = useState('');
  const [planFilter,   setPlanFilter]   = useState<'ALL' | 'PREMIUM' | 'BASIC'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [selected,     setSelected]     = useState<MockBillingAccount | null>(null);

  // Auto-open account when arriving from a map popup link
  useEffect(() => {
    const shortId = searchParams.get('shortId');
    if (!shortId) return;
    const match = BILLING_ACCOUNTS.find(a => a.shortIds.includes(shortId));
    if (match) setSelected(match);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return BILLING_ACCOUNTS.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.id.includes(q);
      const matchPlan   = planFilter   === 'ALL' || a.plan   === planFilter;
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      return matchSearch && matchPlan && matchStatus;
    });
  }, [search, planFilter, statusFilter]);

  const totalRevenue = BILLING_ACCOUNTS.reduce((sum, a) =>
    sum + a.transactions.filter(t => t.status === 'PAID').reduce((s, t) => s + t.amount - t.refundedAmount, 0), 0
  );
  const dupFlags = BILLING_ACCOUNTS.reduce((sum, a) =>
    sum + a.transactions.filter(t => t.isPotentialDup).length, 0
  );
  const premiumCount = BILLING_ACCOUNTS.filter(a => a.plan === 'PREMIUM').length;

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
                <p className="text-xs text-stone-400 mt-1">{BILLING_ACCOUNTS.length} registered accounts</p>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Accounts',  value: BILLING_ACCOUNTS.length,             sub: 'all time'         },
                { label: 'Premium',         value: premiumCount,                          sub: 'paying customers' },
                { label: 'Total Revenue',   value: fmt(totalRevenue),                    sub: 'net of refunds'   },
                { label: 'Flagged Charges', value: dupFlags, warn: dupFlags > 0,         sub: 'needs review'     },
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
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
                className="text-xs bg-white border border-stone-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-stone-300 text-stone-700"
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
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
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 hidden lg:table-cell">Tickets</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400">Status</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 hidden md:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-xs text-stone-400">
                        No accounts match your search.
                      </td>
                    </tr>
                  )}
                  {filtered.map(a => {
                    const lastTx  = lastPaymentStatus(a.transactions);
                    const tickets = openTickets(a.name);
                    const hasDup  = a.transactions.some(t => t.isPotentialDup);
                    const isSelected = selected?.id === a.id;

                    return (
                      <tr
                        key={a.id}
                        onClick={() => setSelected(isSelected ? null : a)}
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
                          {lastTx ? (
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TX_STATUS[lastTx.status].bg} ${TX_STATUS[lastTx.status].text}`}>
                                {lastTx.status.replace('_', ' ')}
                              </span>
                              {hasDup && (
                                <span className="text-[10px] font-bold text-amber-600" title="Duplicate charge flagged">!</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-stone-300">—</span>
                          )}
                        </td>

                        {/* Tickets */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {tickets > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-600">
                              {tickets} open
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-300">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${ACCT_STATUS[a.status].bg} ${ACCT_STATUS[a.status].text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${ACCT_STATUS[a.status].dot}`} />
                            {a.status}
                          </span>
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
            width: selected ? 360 : 0,
            minWidth: selected ? 360 : 0,
            transition: 'width 280ms cubic-bezier(0.23,1,0.32,1), min-width 280ms cubic-bezier(0.23,1,0.32,1)',
            overflow: 'hidden',
          }}
          className="bg-white border-l border-stone-100 h-screen sticky top-0 shrink-0"
        >
          {selected && (
            <AccountDetail
              account={selected}
              onClose={() => setSelected(null)}
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
