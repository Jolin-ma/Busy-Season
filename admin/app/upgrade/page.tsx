'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const PLANS = [
  {
    id: 'annual',
    name: 'Monthly',
    price: 15,
    priceLabel: '$15 / month',
    description: 'Billed monthly — cancel any time',
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 199,
    priceLabel: '$199 one-time',
    description: 'Pay once, keep access forever',
    popular: false,
  },
] as const;

const PREMIUM_FEATURES = [
  'Everything in Basic',
  'Video hosting',
  'Audio clips & voice memories',
  'Expanded storage',
  'Collaborative guestbook',
  'Geotagging & cemetery navigation',
  'Family tree integration',
  'Priority support',
];

export default function UpgradePage() {
  const [selected, setSelected] = useState<string>('annual');
  const [upgrading, setUpgrading] = useState(false);

  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth');
  }, [user, isLoading, router]);

  const handleUpgrade = () => {
    setUpgrading(true);
    try { localStorage.setItem('ll_plan', 'premium'); } catch { /* ignore */ }
    setTimeout(() => router.push('/'), 900);
  };

  if (isLoading || !user) return null;

  const selectedPlan = PLANS.find(p => p.id === selected)!;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center py-4 px-6">

      {/* Logo */}
      <div className="w-full max-w-md mb-4">
        <img src="/legacy_link_logo.png" alt="LegacyLink" className="h-40 w-auto mx-auto" />
      </div>

      {/* Header */}
      <div className="w-full max-w-md mb-8">
        <h1
          className="text-2xl font-semibold text-stone-800 mb-2"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Upgrade to Premium
        </h1>
        <p className="text-stone-400 text-sm leading-relaxed">
          Unlock richer media, collaborative memories, and advanced features — so every life story
          can be shared in full.
        </p>
      </div>

      {/* Plan options */}
      <div className="w-full max-w-md space-y-3 mb-8">
        {PLANS.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(p.id)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4
              ${selected === p.id
                ? 'border-stone-800 bg-white shadow-md'
                : 'border-stone-200 bg-white hover:border-stone-300'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                ${selected === p.id ? 'border-stone-800' : 'border-stone-300'}`}
              >
                {selected === p.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-800" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-800">{p.name}</span>
                  {p.popular && (
                    <span className="text-[10px] font-semibold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                      Most popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400 mt-0.5">{p.description}</p>
              </div>
            </div>
            <span className="text-base font-semibold text-stone-800 shrink-0">{p.priceLabel}</span>
          </button>
        ))}
      </div>

      {/* What's included */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
          What&apos;s included
        </p>
        <ul className="space-y-2.5">
          {PREMIUM_FEATURES.map(item => (
            <li key={item} className="flex items-center gap-3 text-sm text-stone-600">
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-amber-500 shrink-0">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={handleUpgrade}
          disabled={upgrading}
          className="w-full bg-stone-900 text-white py-4 rounded-2xl text-sm font-semibold hover:bg-stone-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {upgrading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Upgrading…
            </>
          ) : (
            `Upgrade to Premium — ${selectedPlan.priceLabel}`
          )}
        </button>
        <p className="text-center text-xs text-stone-400 mt-4">
          Secure checkout &middot; No card required for demo
        </p>

        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full mt-3 py-3 rounded-2xl text-sm font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
