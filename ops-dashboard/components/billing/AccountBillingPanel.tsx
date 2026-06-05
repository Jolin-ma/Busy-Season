'use client';

import { useState } from 'react';
import TransactionRow from './TransactionRow';
import type { MockBillingAccount } from '@/lib/mock-data';

interface Props {
  account: MockBillingAccount;
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function totalPaid(account: MockBillingAccount): number {
  return account.transactions
    .filter(t => t.status === 'PAID' || t.status === 'PARTIALLY_REFUNDED')
    .reduce((s, t) => s + t.amount - t.refundedAmount, 0);
}

function dupeCount(account: MockBillingAccount): number {
  return account.transactions.filter(t => t.isPotentialDup).length;
}

export default function AccountBillingPanel({ account }: Props) {
  const [txList, setTxList] = useState(account.transactions);

  function refresh() {
    // In production: re-fetch from /ops/billing/account/:id
    // For mock: re-sort to surface any status changes
    setTxList(prev => [...prev]);
  }

  const paid     = totalPaid(account);
  const dupes    = dupeCount(account);
  const isPremium = account.plan === 'PREMIUM';

  return (
    <div className="flex flex-col h-full">

      {/* ── Account Details Header ── */}
      <div className="px-6 py-5 border-b border-stone-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">{account.name}</h2>
            <p className="text-xs text-stone-400 mt-0.5">{account.email}</p>
          </div>
          {dupes > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
              ⚠️ {dupes} duplicate{dupes > 1 ? 's' : ''} detected
            </span>
          )}
        </div>

        {/* Status strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-stone-50 rounded-xl px-4 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-0.5">Status</p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {account.status.charAt(0) + account.status.slice(1).toLowerCase()}
            </span>
          </div>
          <div className="bg-stone-50 rounded-xl px-4 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-0.5">Markers</p>
            <p className="text-sm font-bold text-stone-800">{account.profileCount}</p>
          </div>
          <div className="bg-stone-50 rounded-xl px-4 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-0.5">Plan</p>
            <span className={`text-xs font-bold ${isPremium ? 'text-indigo-700' : 'text-stone-600'}`}>
              {isPremium ? '★ Premium' : 'Basic'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Financial Sub-Ledger ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Ledger summary bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-stone-50">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-0.5">
              Financial Sub-Ledger
            </p>
            <div className="flex items-baseline gap-4">
              <div>
                <span className="text-lg font-extrabold text-stone-900 tabular-nums">{fmt(paid)}</span>
                <span className="text-xs text-stone-400 ml-1">CAD total paid</span>
              </div>
              <div className="h-4 w-px bg-stone-200" />
              <div>
                <span className="text-sm font-bold text-stone-600">
                  {isPremium ? '$15.00/mo' : 'Included'}
                </span>
                <span className="text-xs text-stone-400 ml-1">current sub</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-stone-400">Stripe ID</p>
            <p className="font-mono text-[10px] text-stone-500">{account.stripeCustomerId}</p>
          </div>
        </div>

        {/* Transaction table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-stone-100">
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400">Invoice / Date</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400">Amount</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400">Status</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-stone-400">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {txList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-xs text-stone-400">
                    No transactions on record.
                  </td>
                </tr>
              )}
              {txList.map(tx => (
                <TransactionRow key={tx.id} tx={tx} onRefresh={refresh} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
