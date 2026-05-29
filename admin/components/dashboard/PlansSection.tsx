'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BASIC_FEATURES = [
  'Core text biography',
  'Up to 20 photos',
  'Permanently hosted',
  'QR scan analytics',
  'Privacy PIN protection',
  'Virtual flowers, candles & memory sharing',
];

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

export default function PlansSection() {
  const [billing, setBilling] = useState<'annual' | 'lifetime'>('annual');
  const router = useRouter();

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Hosting Plan</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Basic */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">Basic</span>
              <p className="text-xl font-semibold text-stone-800 mt-1" style={{ fontFamily: 'var(--font-playfair)' }}>
                Core Memorial
              </p>
            </div>
            <span className="text-[11px] font-semibold bg-stone-100 text-stone-500 px-2.5 py-1 rounded-full shrink-0 mt-0.5">
              Current plan
            </span>
          </div>

          <p className="text-sm text-stone-400 mb-5 leading-relaxed">
            Included with every plaque purchase. Everything you need to preserve a life story.
          </p>

          <ul className="space-y-2.5 flex-1 mb-6">
            {BASIC_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-stone-600">
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-stone-400 shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-stone-50">
            <p className="text-xs text-stone-400 font-medium">
              Included — no additional cost
            </p>
          </div>
        </div>

        {/* Premium */}
        <div className="bg-[#FDF6EE] rounded-2xl border border-amber-200/60 shadow-sm p-6 flex flex-col relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute -bottom-5 -right-5 w-28 h-28 rounded-full bg-amber-100/50 pointer-events-none" />

          <div className="relative flex flex-col flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-700">Premium</span>
                <p className="text-xl font-semibold text-stone-800 mt-1" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Living Legacy
                </p>
              </div>
              <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full shrink-0 mt-0.5">
                Upgrade
              </span>
            </div>

            <p className="text-sm text-stone-500 mb-4 leading-relaxed">
              Richer media, more memories, and a space where family can contribute together.
            </p>

            {/* Billing toggle */}
            <div className="flex bg-amber-100/60 rounded-xl p-1 mb-5 self-start">
              {(['annual', 'lifetime'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all
                    ${billing === b
                      ? 'bg-white text-stone-800 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'}`}
                >
                  {b === 'annual' ? 'Monthly' : 'Lifetime'}
                </button>
              ))}
            </div>

            <div className="mb-5">
              {billing === 'annual' ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-stone-800">$19</span>
                  <span className="text-sm text-stone-400">/ month</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-stone-800">$199</span>
                  <span className="text-sm text-stone-400">one-time</span>
                </div>
              )}
              {billing === 'annual' && (
                <p className="text-xs text-stone-400 mt-0.5">or $199 once for lifetime access</p>
                <p className="text-xs text-stone-400">billed monthly — cancel any time</p>
              )}
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {PREMIUM_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-stone-600">
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-amber-500 shrink-0">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => router.push('/upgrade')}
              className="w-full bg-stone-800 text-white text-sm font-semibold py-3 rounded-xl hover:bg-stone-700 transition-colors"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
