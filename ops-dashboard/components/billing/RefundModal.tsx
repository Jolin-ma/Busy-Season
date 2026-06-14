'use client';

import { useEffect, useRef, useState } from 'react';
import type { BillingTransaction } from '@/app/billing/page';

interface Props {
  tx:       BillingTransaction;
  onClose:  () => void;
  onConfirm: (reason: string) => Promise<void>;
}

const REASONS = [
  { value: 'duplicate',             label: 'Duplicate charge' },
  { value: 'requested_by_customer', label: 'Requested by customer' },
  { value: 'fraudulent',            label: 'Fraudulent transaction' },
];

export default function RefundModal({ tx, onClose, onConfirm }: Props) {
  const [reason,   setReason]   = useState('duplicate');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function submit() {
    setLoading(true);
    setError('');
    try {
      await onConfirm(reason);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Refund failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const amountDisplay = `$${(tx.amount / 100).toFixed(2)} CAD`;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </span>
              <h2 className="text-sm font-bold text-stone-900">Confirm Refund</h2>
            </div>
            <p className="text-xs text-stone-500">This action will issue a full refund via Stripe and cannot be undone.</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 ml-4 mt-0.5">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Transaction summary */}
          <div className="bg-stone-50 rounded-xl p-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">Charge ID</span>
              <span className="font-mono text-stone-700 text-[11px]">{tx.id.slice(0, 24)}…</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">Date</span>
              <span className="text-stone-700">{new Date(tx.createdAt).toLocaleString('en-CA', { timeZone: 'America/Toronto' })}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-stone-500">Refund amount</span>
              <span className="text-base font-bold text-rose-600">{amountDisplay}</span>
            </div>
          </div>

          {/* Reason selector */}
          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-1.5">Refund reason</label>
            <div className="space-y-1.5">
              {REASONS.map(r => (
                <label key={r.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="accent-rose-500"
                  />
                  <span className="text-xs text-stone-700">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading && (
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            )}
            {loading ? 'Processing…' : `Issue Refund · ${amountDisplay}`}
          </button>
        </div>
      </div>
    </div>
  );
}
