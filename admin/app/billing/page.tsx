'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';

const PLAN = {
  name: 'Premium Monthly',
  price: '$15 / month',
  term: '24-month term',
  status: 'Active',
  monthsUsed: 3,
  totalMonths: 24,
  nextBilling: 'June 30, 2026',
};

const CARD = {
  brand: 'Visa',
  last4: '4242',
  expiry: '12 / 27',
  name: 'Sarah Whitfield',
};

export default function BillingPage() {
  const router = useRouter();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelled, setCancelled]                 = useState(false);
  const [showCardForm, setShowCardForm]           = useState(false);
  const [cardSaved, setCardSaved]                 = useState(false);
  const [switchedToOneTime, setSwitchedToOneTime] = useState(false);

  const [cardName,   setCardName]   = useState(CARD.name);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc,    setCardCvc]    = useState('');

  const handleSaveCard = () => {
    setCardSaved(true);
    setShowCardForm(false);
    setTimeout(() => setCardSaved(false), 3000);
  };

  const progress = Math.round((PLAN.monthsUsed / PLAN.totalMonths) * 100);

  return (
    <AppShell>
      <div className="min-h-full bg-stone-50 px-6 py-10 max-w-2xl mx-auto">

        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors mb-4"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-semibold text-stone-800" style={{ fontFamily: 'var(--font-playfair)' }}>Manage Billing</h1>
          <p className="text-stone-400 text-sm mt-1">Manage your subscription and payment details.</p>
        </div>

        {/* ── Subscription ── */}
        <section id="subscription" className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Subscription</h2>

          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-stone-800">{PLAN.name}</p>
                <span className="text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
                  {PLAN.status}
                </span>
              </div>
              <p className="text-xs text-stone-400">{PLAN.price} · {PLAN.term}</p>
              <p className="text-xs text-stone-400 mt-0.5">Next billing: {PLAN.nextBilling}</p>
            </div>
            <svg viewBox="0 0 20 20" fill="none" className="w-7 h-7 text-amber-400 shrink-0 mt-0.5">
              <path d="M10 2l1.8 5.4H17l-4.5 3.3 1.7 5.3L10 13l-4.2 3 1.7-5.3L3 7.4h5.2L10 2z" fill="currentColor" />
            </svg>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-[10px] text-stone-400 mb-1.5">
              <span>{PLAN.monthsUsed} of {PLAN.totalMonths} months used</span>
              <span>{PLAN.totalMonths - PLAN.monthsUsed} remaining</span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-stone-800 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Switch to one-time */}
          {switchedToOneTime ? (
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Switched to one-time payment. No further monthly charges.
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-stone-700 mb-1">Switch to one-time payment</p>
              <p className="text-xs text-stone-400 mb-3">
                Pay $199 now and skip the remaining {PLAN.totalMonths - PLAN.monthsUsed} monthly charges.
                Your access continues uninterrupted.
              </p>
              <button
                onClick={() => setSwitchedToOneTime(true)}
                className="text-xs font-semibold text-stone-800 border border-stone-300 px-4 py-2 rounded-xl hover:bg-stone-100 transition-colors"
              >
                Switch to $199 one-time payment
              </button>
            </div>
          )}

          {/* Cancel */}
          {cancelled ? (
            <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-stone-400">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Subscription cancelled. Premium access ends June 30, 2026.
            </div>
          ) : !showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-xs text-stone-400 hover:text-red-500 transition-colors"
            >
              Cancel subscription
            </button>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-700 mb-1">Cancel subscription?</p>
              <p className="text-xs text-stone-500 mb-3">
                Your Premium access will end at the current billing period. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="text-xs font-semibold text-stone-600 border border-stone-200 px-4 py-2 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  Keep subscription
                </button>
                <button
                  onClick={() => { setCancelled(true); setShowCancelConfirm(false); }}
                  className="text-xs font-semibold text-white bg-red-500 px-4 py-2 rounded-xl hover:bg-red-600 transition-colors"
                >
                  Yes, cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Payment Method ── */}
        <section id="payment" className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Payment Method</h2>

          {cardSaved && (
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Payment method updated.
            </div>
          )}

          {/* Current card */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 bg-stone-100 rounded-md flex items-center justify-center">
                <svg viewBox="0 0 32 20" className="w-7 h-5">
                  <rect width="32" height="20" rx="3" fill="#1A1F71" />
                  <path d="M13.5 14.5H11l1.5-9h2.5l-1.5 9zM20.2 5.7c-.5-.2-1.3-.4-2.2-.4-2.4 0-4.1 1.2-4.1 3 0 1.3 1.2 2 2.1 2.4.9.4 1.2.7 1.2 1.1 0 .6-.7.9-1.4.9-.9 0-1.4-.1-2.1-.4l-.3-.1-.3 1.8c.5.2 1.4.4 2.4.4 2.6 0 4.2-1.2 4.2-3.1 0-1-.6-1.8-2-2.5-.8-.4-1.3-.7-1.3-1.1 0-.4.4-.8 1.3-.8.7 0 1.2.1 1.6.3l.2.1.3-1.6zM26 5.6h-1.9c-.6 0-1 .2-1.3.7L19.5 14.5H22l.5-1.4h3l.3 1.4H28l-2-8.9zm-3 5.6l.9-2.5.3-.8.1.7.5 2.6h-1.8z" fill="white" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-stone-700">{CARD.brand} •••• {CARD.last4}</p>
                <p className="text-xs text-stone-400">Expires {CARD.expiry} · {CARD.name}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCardForm(v => !v)}
              className="text-xs font-semibold text-stone-600 border border-stone-200 px-4 py-2 rounded-xl hover:bg-stone-50 transition-colors"
            >
              {showCardForm ? 'Cancel' : 'Update card'}
            </button>
          </div>

          {/* Card update form */}
          {showCardForm && (
            <div className="border-t border-stone-100 pt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Name on Card</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  placeholder="Full name"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Expiry</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    placeholder="MM / YY"
                    maxLength={7}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">CVC</label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={e => setCardCvc(e.target.value)}
                    placeholder="•••"
                    maxLength={4}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveCard}
                className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-stone-700 transition-colors"
              >
                Save Payment Method
              </button>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
