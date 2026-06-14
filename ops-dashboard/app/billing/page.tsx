'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import AccountBillingPanel from '@/components/billing/AccountBillingPanel';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface BillingAccountSummary {
  id:                 string;
  name:               string;
  email:              string;
  stripeCustomerId:   string | null;
  plan:               'PREMIUM' | 'BASIC';
  profileCount:       number;
  hasDuplicate:       boolean;
  totalPaidCents:     number;
  totalRefundedCents: number;
  createdAt:          string;
  lastTxAt:           string | null;
}

export interface BillingTransaction {
  id:              string;
  amount:          number;
  currency:        string;
  status:          'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  isPotentialDup:  boolean;
  stripeInvoiceId: string | null;
  refunded:        boolean;
  refundedAmount:  number;
  refundReason:    string | null;
  createdAt:       string;
}

export interface BillingAccountDetail extends BillingAccountSummary {
  transactions: BillingTransaction[];
}

function fmtCAD(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function timeAgo(iso: string | null) {
  if (!iso) return null;
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1)  return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function BillingPage() {
  const [accounts, setAccounts] = useState<BillingAccountSummary[]>([]);
  const [selected, setSelected] = useState<BillingAccountDetail | null>(null);
  const [listLoading,   setListLoading]   = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');

  const now = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  useEffect(() => {
    fetch(`${API}/ops/billing/accounts`)
      .then(r => r.json())
      .then(d => {
        const accs: BillingAccountSummary[] = d.accounts ?? [];
        setAccounts(accs);
        if (accs.length > 0) fetchDetail(accs[0].id);
      })
      .catch(() => {})
      .finally(() => setListLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDetail = useCallback(async (userId: string) => {
    setDetailLoading(true);
    try {
      const res  = await fetch(`${API}/ops/billing/account/${userId}`);
      const data = await res.json();
      if (data.account) {
        const acct = data.account as BillingAccountDetail;
        // merge summary fields (hasDuplicate, totalPaidCents, etc.) from local list
        const summary = accounts.find(a => a.id === userId);
        setSelected({ ...acct, ...(summary ?? {}) });
      }
    } finally {
      setDetailLoading(false);
    }
  }, [accounts]);

  const handleSelectAccount = (summary: BillingAccountSummary) => {
    fetchDetail(summary.id);
  };

  const handleRefresh = () => {
    if (selected) fetchDetail(selected.id);
  };

  const filtered = useMemo(() =>
    accounts.filter(a =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.stripeCustomerId ?? '').toLowerCase().includes(search.toLowerCase()),
    ),
  [accounts, search]);

  const totalRevenue  = accounts.reduce((s, a) => s + a.totalPaidCents, 0);
  const dupAccounts   = accounts.filter(a => a.hasDuplicate).length;
  const totalRefunded = accounts.reduce((s, a) => s + a.totalRefundedCents, 0);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f7f6f3' }}>
      <Sidebar />

      <main className="flex-1 overflow-hidden flex flex-col">

        {/* Page header */}
        <div className="px-6 py-5 flex items-start justify-between shrink-0 border-b border-stone-100 bg-white">
          <div>
            <h1 className="text-xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Account Billing
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">{now}</p>
          </div>
          {dupAccounts > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              ⚠️ {dupAccounts} account{dupAccounts > 1 ? 's' : ''} with duplicate charges
            </span>
          )}
        </div>

        {/* Summary cards */}
        <div className="px-6 py-4 grid grid-cols-3 gap-4 shrink-0">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Total Revenue</p>
            <p className="text-2xl font-extrabold text-stone-900 tabular-nums">{fmtCAD(totalRevenue)}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">CAD · all time</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Duplicate Flags</p>
            <p className="text-2xl font-extrabold text-amber-600 tabular-nums">{dupAccounts}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">account{dupAccounts !== 1 ? 's' : ''} · needs review</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Total Refunded</p>
            <p className="text-2xl font-extrabold text-rose-600 tabular-nums">{fmtCAD(totalRefunded)}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">CAD · all time</p>
          </div>
        </div>

        {/* Split view: account list + billing panel */}
        <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-4">

          {/* Account list (left) */}
          <div className="w-72 shrink-0 bg-white rounded-2xl border border-stone-100 shadow-sm flex flex-col overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-stone-100 shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Accounts</p>
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search accounts…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-stone-300 placeholder:text-stone-400 text-stone-800"
                />
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto divide-y divide-stone-50">
              {listLoading && (
                <li className="px-4 py-8 text-center text-xs text-stone-400">Loading…</li>
              )}
              {!listLoading && filtered.map(a => {
                const isSelected = selected?.id === a.id;
                const ago = timeAgo(a.lastTxAt);
                return (
                  <li key={a.id}>
                    <button
                      onClick={() => handleSelectAccount(a)}
                      className={`w-full text-left px-4 py-3.5 transition-colors ${
                        isSelected ? 'bg-stone-900 text-white' : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-0.5">
                        <p className={`text-xs font-semibold truncate flex-1 ${isSelected ? 'text-white' : 'text-stone-800'}`}>
                          {a.name}
                        </p>
                        {a.hasDuplicate && <span className="shrink-0 ml-1 text-amber-500 text-[11px]">⚠️</span>}
                      </div>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-stone-400' : 'text-stone-400'}`}>
                        {a.email}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={`text-[10px] font-semibold ${
                          a.plan === 'PREMIUM'
                            ? (isSelected ? 'text-indigo-300' : 'text-indigo-600')
                            : (isSelected ? 'text-stone-400' : 'text-stone-400')
                        }`}>
                          {a.plan === 'PREMIUM' ? '★ Premium' : 'Basic'}
                        </span>
                        {ago && (
                          <span className={`text-[9px] ${isSelected ? 'text-stone-400' : 'text-stone-300'}`}>
                            {ago}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
              {!listLoading && filtered.length === 0 && (
                <li className="px-4 py-8 text-center text-xs text-stone-400">No accounts match.</li>
              )}
            </ul>
          </div>

          {/* Billing detail panel (right) */}
          <div className="flex-1 bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {detailLoading ? (
              <div className="flex items-center justify-center h-full text-stone-400 text-sm">Loading…</div>
            ) : selected ? (
              <AccountBillingPanel key={selected.id} account={selected} onRefresh={handleRefresh} />
            ) : (
              <div className="flex items-center justify-center h-full text-stone-400 text-sm">Select an account</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
