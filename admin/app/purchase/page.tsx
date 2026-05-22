'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const MATERIALS = [
  {
    id: 'steel',
    name: 'Stainless Steel',
    price: 169,
    description: 'Ultra-durable, brushed satin finish, weather-resistant',
    popular: true,
  },
  {
    id: 'bronze',
    name: 'Brushed Bronze',
    price: 189,
    description: 'Warm heritage tone, museum quality',
    popular: false,
  },
] as const;

export default function PurchasePage() {
  const [selected, setSelected] = useState<string>('steel');
  const [placing, setPlacing]   = useState(false);

  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth');
  }, [user, isLoading, router]);

  const handleOrder = () => {
    setPlacing(true);
    // Mark as purchased so the dashboard gate opens
    try { localStorage.setItem('ll_has_purchased', 'true'); } catch { /* ignore */ }
    setTimeout(() => router.push('/'), 900);
  };

  if (isLoading || !user) return null;

  const selectedMaterial = MATERIALS.find(m => m.id === selected)!;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center py-14 px-6">

      {/* Logo */}
      <div className="w-full max-w-md flex items-center gap-3 mb-10">
        <div className="w-8 h-8 bg-stone-900 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">LL</span>
        </div>
        <span
          className="text-stone-800 font-semibold"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          LegacyLink
        </span>
      </div>

      {/* Header */}
      <div className="w-full max-w-md mb-8">
        <h1
          className="text-2xl font-semibold text-stone-800 mb-2"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Choose your memorial plaque
        </h1>
        <p className="text-stone-400 text-sm leading-relaxed">
          A laser-engraved QR plaque links the physical memorial to a permanent digital profile.
          3&Prime;&nbsp;&times;&nbsp;2&Prime;, fully weatherproof, with free standard shipping.
        </p>
      </div>

      {/* Material options */}
      <div className="w-full max-w-md space-y-3 mb-8">
        {MATERIALS.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelected(m.id)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4
              ${selected === m.id
                ? 'border-stone-800 bg-white shadow-md'
                : 'border-stone-200 bg-white hover:border-stone-300'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                ${selected === m.id ? 'border-stone-800' : 'border-stone-300'}`}
              >
                {selected === m.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-800" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-800">{m.name}</span>
                  {m.popular && (
                    <span className="text-[10px] font-semibold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                      Most popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400 mt-0.5">{m.description}</p>
              </div>
            </div>
            <span className="text-base font-semibold text-stone-800 shrink-0">${m.price}</span>
          </button>
        ))}
      </div>

      {/* What's included */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
          What&apos;s included
        </p>
        <ul className="space-y-2.5">
          {[
            'Laser-engraved QR code + personalized name',
            'Permanent digital memorial profile',
            'Scan analytics dashboard for family',
            'Privacy controls — PIN-protect at any time',
            'Free profile updates forever',
            'Free USPS standard shipping',
          ].map(item => (
            <li key={item} className="flex items-center gap-3 text-sm text-stone-600">
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-stone-400 shrink-0">
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
          onClick={handleOrder}
          disabled={placing}
          className="w-full bg-stone-900 text-white py-4 rounded-2xl text-sm font-semibold hover:bg-stone-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {placing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Placing order…
            </>
          ) : (
            `Place Order — $${selectedMaterial.price}`
          )}
        </button>
        <p className="text-center text-xs text-stone-400 mt-4">
          Secure checkout &middot; No card required for demo
        </p>
      </div>
    </div>
  );
}
