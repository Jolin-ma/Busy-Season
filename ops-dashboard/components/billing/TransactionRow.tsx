'use client';

import { useState } from 'react';
import RefundModal from './RefundModal';
import type { MockTransaction, TxStatus } from '@/lib/mock-data';

interface Props {
  tx:        MockTransaction;
  onRefresh: () => void;
}

const STATUS_STYLE: Record<TxStatus, { dot: string; text: string; label: string }> = {
  PAID:                { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Paid'               },
  FAILED:              { dot: 'bg-red-500',     text: 'text-red-600',     label: 'Failed'             },
  REFUNDED:            { dot: 'bg-slate-400',   text: 'text-slate-500',   label: 'Refunded'           },
  PARTIALLY_REFUNDED:  { dot: 'bg-amber-500',   text: 'text-amber-600',   label: 'Partial Refund'     },
};

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)} CAD`;
}

export default function TransactionRow({ tx, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const canRefund = tx.status === 'PAID' || tx.status === 'PARTIALLY_REFUNDED';
  const { dot, text, label } = STATUS_STYLE[tx.status];

  async function handleConfirm(reason: string) {
    const res = await fetch('http://localhost:3000/admin/billing/refund', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ transactionId: tx.id, reason }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? 'Refund failed');
    }
    onRefresh();
  }

  return (
    <>
      {/* Amber border + background when duplicate */}
      <tr className={`transition-colors ${
        tx.isPotentialDup
          ? 'bg-amber-50/60 border-l-2 border-amber-400'
          : 'hover:bg-stone-50/70'
      }`}>

        {/* Invoice ID + date */}
        <td className="px-4 py-3.5 align-top">
          <p className="font-mono text-[11px] text-stone-700 leading-none mb-1">
            {tx.id.slice(0, 22)}…
          </p>
          <p className="text-[10px] text-stone-400">
            {new Date(tx.createdAt).toLocaleString('en-CA', {
              timeZone:    'America/Toronto',
              year:        'numeric',
              month:       '2-digit',
              day:         '2-digit',
              hour:        '2-digit',
              minute:      '2-digit',
            })}
          </p>
        </td>

        {/* Amount */}
        <td className="px-4 py-3.5 align-middle">
          <p className="text-sm font-semibold text-stone-900 tabular-nums">{fmt(tx.amount)}</p>
          {tx.refundedAmount > 0 && (
            <p className="text-[10px] text-slate-400 tabular-nums">−{fmt(tx.refundedAmount)} refunded</p>
          )}
        </td>

        {/* Status + duplicate badge */}
        <td className="px-4 py-3.5 align-middle">
          <div className="flex flex-wrap items-center gap-1.5">
            {tx.isPotentialDup && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                ⚠️ Potential Duplicate
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              {label}
            </span>
          </div>
        </td>

        {/* Quick actions */}
        <td className="px-4 py-3.5 align-middle text-right">
          {canRefund ? (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-300 rounded-lg transition"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 8h8M6 4l-4 4 4 4" />
              </svg>
              Issue Refund
            </button>
          ) : (
            <span className="text-[10px] text-stone-300 italic">—</span>
          )}
        </td>
      </tr>

      {showModal && (
        <tr>
          <td colSpan={4} className="p-0">
            <RefundModal
              tx={tx}
              onClose={() => setShowModal(false)}
              onConfirm={handleConfirm}
            />
          </td>
        </tr>
      )}
    </>
  );
}
