'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function BasicBanner({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="mb-10">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Hosting Plan</h2>
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex items-start gap-5">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 mt-0.5">
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-amber-500">
            <path d="M10 2l1.8 5.4H17l-4.5 3.3 1.7 5.3L10 13l-4.2 3 1.7-5.3L3 7.4h5.2L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-stone-800">Basic Plan</p>
            <span className="text-[10px] font-semibold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">Current plan</span>
          </div>
          <p className="text-sm text-stone-400 leading-relaxed mb-4">
            Want to add audio memories, video galleries, or a collaborative guestbook?
            Upgrade to Premium to unlock the full legacy experience.
          </p>
          <button
            type="button"
            onClick={onUpgrade}
            className="bg-stone-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-stone-700 transition-colors"
          >
            Upgrade to Premium
          </button>
          <p className="text-xs text-stone-400 mt-2">$15 / month &middot; or $199 once for lifetime access</p>
        </div>
      </div>
    </div>
  );
}

function PremiumManagement({ onBuyPlaque }: { onBuyPlaque: () => void }) {
  return (
    <div className="mb-10">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Hosting Plan</h2>
      <div className="bg-stone-900 rounded-2xl border border-stone-700/60 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">Premium</span>
                <span className="text-[10px] font-semibold bg-stone-700 text-stone-300 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
                Living Legacy
              </p>
            </div>
            <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6 text-amber-400 shrink-0 mt-0.5">
              <path d="M10 2l1.8 5.4H17l-4.5 3.3 1.7 5.3L10 13l-4.2 3 1.7-5.3L3 7.4h5.2L10 2z" fill="currentColor" />
            </svg>
          </div>

          <p className="text-xs text-stone-400 mb-5">Monthly · Next renewal Jun 30, 2026</p>

          <div className="flex flex-wrap gap-2 mb-5">
            <button
              type="button"
              className="text-xs font-semibold text-white border border-stone-600 px-4 py-2 rounded-xl hover:bg-stone-700 transition-colors"
            >
              Manage Subscription
            </button>
            <button
              type="button"
              className="text-xs font-semibold text-stone-300 border border-stone-700 px-4 py-2 rounded-xl hover:bg-stone-800 transition-colors"
            >
              Update Billing Info
            </button>
          </div>

          <button
            type="button"
            onClick={onBuyPlaque}
            className="text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1"
          >
            + Buy a plaque for another family member
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlansSection() {
  const [isPremium, setIsPremium] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      setIsPremium(localStorage.getItem('ll_plan') === 'premium');
    } catch { /* ignore */ }
  }, []);

  if (isPremium) {
    return <PremiumManagement onBuyPlaque={() => router.push('/purchase')} />;
  }

  return <BasicBanner onUpgrade={() => router.push('/upgrade')} />;
}
