'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const MATERIALS = [
  { id: 'steel',  name: 'Marine-Grade Stainless Steel', price: 169, description: 'Ultra-durable, brushed satin finish, weather-resistant', popular: true  },
  { id: 'bronze', name: 'Marine Brushed Bronze',       price: 189, description: 'Warm heritage tone, museum quality',                    popular: false },
] as const;

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
  'Location pinning & sharing',
  'Family tree integration',
  'Priority support',
];

const PLAQUE_INCLUDES = [
  'Laser-engraved QR code + personalized name',
  'Permanent digital memorial profile',
  'Scan analytics dashboard for family',
  'Privacy controls — PIN-protect at any time',
  'Free profile updates forever',
  'Free USPS standard shipping',
];

type PlanId = 'basic' | 'monthly' | 'lifetime';

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className ?? 'w-4 h-4'}>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
      ${checked ? 'border-stone-800' : 'border-stone-300'}`}>
      {checked && <div className="w-2.5 h-2.5 rounded-full bg-stone-800" />}
    </div>
  );
}

function RadioDark({ checked }: { checked: boolean }) {
  return (
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
      ${checked ? 'border-white' : 'border-stone-500'}`}>
      {checked && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
    </div>
  );
}

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Plaque', 'Plan', 'Review'];
  return (
    <div className="flex items-start w-full max-w-md mb-8">
      {steps.map((label, i) => {
        const num = (i + 1) as 1 | 2 | 3;
        const done = num < current;
        const active = num === current;
        return (
          <div key={label} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${done || active ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-400'}`}>
                {done ? '✓' : num}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap
                ${active ? 'text-stone-700' : 'text-stone-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mt-3.5 mx-2 ${done ? 'bg-stone-800' : 'bg-stone-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1 ────────────────────────────────────────────────────────────────────
function StepPlaque({ selected, onSelect, onNext, onBack }: {
  selected: string;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="w-full max-w-md mb-6">
        <h1 className="text-2xl font-semibold text-stone-800 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
          Choose your memorial plaque
        </h1>
        <p className="text-stone-400 text-sm leading-relaxed">
          Laser-engraved, 3″ × 3″, fully weatherproof — with free standard shipping.
        </p>
      </div>

      <div className="w-full max-w-md space-y-3 mb-6">
        {MATERIALS.map(m => (
          <button key={m.id} type="button" onClick={() => onSelect(m.id)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4
              ${selected === m.id ? 'border-stone-800 bg-white shadow-md' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
            <div className="flex items-center gap-4">
              <Radio checked={selected === m.id} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-800">{m.name}</span>
                  {m.popular && (
                    <span className="text-[10px] font-semibold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">Most popular</span>
                  )}
                </div>
                <p className="text-xs text-stone-400 mt-0.5">{m.description}</p>
              </div>
            </div>
            <span className="text-base font-semibold text-stone-800 shrink-0">${m.price}</span>
          </button>
        ))}
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">Included with every plaque</p>
        <ul className="space-y-2.5">
          {PLAQUE_INCLUDES.map(item => (
            <li key={item} className="flex items-center gap-3 text-sm text-stone-600">
              <CheckIcon className="w-4 h-4 text-stone-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full max-w-md space-y-3">
        <button type="button" onClick={onNext}
          className="w-full bg-stone-900 text-white py-4 rounded-2xl text-sm font-semibold hover:bg-stone-700 transition-all">
          Continue — Choose Your Plan →
        </button>
        <button type="button" onClick={onBack}
          className="w-full py-3 rounded-2xl text-sm font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors">
          ← Back to Dashboard
        </button>
      </div>
    </>
  );
}

// ── Step 2 ────────────────────────────────────────────────────────────────────
function StepPlan({ selected, onSelect, onNext, onBack }: {
  selected: PlanId;
  onSelect: (id: PlanId) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isPremiumSelected = selected === 'monthly' || selected === 'lifetime';
  const billing: 'monthly' | 'lifetime' = selected === 'lifetime' ? 'lifetime' : 'monthly';

  const setBilling = (b: 'monthly' | 'lifetime') => onSelect(b);
  const selectPremium = () => onSelect(billing);

  return (
    <>
      <div className="w-full max-w-md mb-6">
        <h1 className="text-2xl font-semibold text-stone-800 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
          Choose your digital legacy plan
        </h1>
        <p className="text-stone-400 text-sm leading-relaxed">
          Basic is included free. Upgrade to Premium for richer media and collaborative features.
        </p>
      </div>

      <div className="w-full max-w-md space-y-4 mb-8">

        {/* Basic */}
        <button type="button" onClick={() => onSelect('basic')}
          className={`w-full text-left p-5 rounded-2xl border-2 transition-all
            ${selected === 'basic' ? 'border-stone-800 bg-white shadow-md' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Radio checked={selected === 'basic'} />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-stone-800">Basic</span>
                <span className="text-[10px] font-semibold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">Included free</span>
              </div>
            </div>
            <span className="text-base font-semibold text-stone-800">$0</span>
          </div>
          <ul className="space-y-1.5 pl-8">
            {BASIC_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 text-xs text-stone-500">
                <CheckIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </button>

        {/* Premium */}
        <div className={`rounded-2xl border-2 overflow-hidden transition-all
          ${isPremiumSelected ? 'border-stone-800 shadow-md' : 'border-stone-200'}`}>

          {/* Dark header */}
          <div className="bg-stone-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={selectPremium} className="flex items-center gap-3">
                <RadioDark checked={isPremiumSelected} />
                <span className="text-sm font-semibold text-white">Premium — Living Legacy</span>
              </button>
              {/* Billing toggle */}
              <div className="flex bg-stone-700/60 rounded-lg p-0.5">
                {(['monthly', 'lifetime'] as const).map(b => (
                  <button key={b} type="button"
                    onClick={() => setBilling(b)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all
                      ${billing === b ? 'bg-stone-600 text-white' : 'text-stone-400 hover:text-stone-200'}`}>
                    {b === 'monthly' ? 'Monthly' : 'One-Time'}
                  </button>
                ))}
              </div>
            </div>
            <div className="pl-8">
              {billing === 'monthly' ? (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">$15</span>
                    <span className="text-sm text-stone-400">/ month for 24 months</span>
                  </div>
                </>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">$199</span>
                  <span className="text-sm text-stone-400">one-time</span>
                </div>
              )}
            </div>
          </div>

          {/* Feature list */}
          <button type="button" onClick={selectPremium} className="w-full bg-white p-5 text-left">
            <ul className="space-y-2">
              {PREMIUM_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-stone-600">
                  <CheckIcon className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </button>
        </div>
      </div>

      <div className="w-full max-w-md space-y-3">
        <button type="button" onClick={onNext}
          className="w-full bg-stone-900 text-white py-4 rounded-2xl text-sm font-semibold hover:bg-stone-700 transition-all">
          Continue — Review Order →
        </button>
        <button type="button" onClick={onBack}
          className="w-full py-3 rounded-2xl text-sm font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors">
          ← Back
        </button>
      </div>
    </>
  );
}

// ── Step 3 ────────────────────────────────────────────────────────────────────
function StepReview({ material, plan, onPlace, onBack, placing }: {
  material: typeof MATERIALS[number];
  plan: PlanId;
  onPlace: () => void;
  onBack: () => void;
  placing: boolean;
}) {
  const planLabel =
    plan === 'basic'    ? 'Basic (included free)' :
    plan === 'monthly'  ? 'Premium Monthly (24 months)' :
                          'Premium One-Time';
  const planPrice = plan === 'basic' ? 0 : plan === 'monthly' ? 15 : 199;
  const planSuffix = plan === 'monthly' ? '/mo' : '';

  const totalLabel =
    plan === 'monthly'
      ? `$${material.price} + $15/mo`
      : `$${material.price + planPrice}`;

  return (
    <>
      <div className="w-full max-w-md mb-6">
        <h1 className="text-2xl font-semibold text-stone-800 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
          Review your order
        </h1>
        <p className="text-stone-400 text-sm leading-relaxed">
          Everything looks good? Place your order to get started.
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Order Summary</p>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-stone-800">{material.name} Plaque</p>
              <p className="text-xs text-stone-400 mt-0.5">{material.description}</p>
            </div>
            <span className="text-sm font-semibold text-stone-800 shrink-0">${material.price}</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-stone-800">Digital Legacy Plan</p>
              <p className="text-xs text-stone-400 mt-0.5">{planLabel}</p>
            </div>
            <span className="text-sm font-semibold text-stone-800 shrink-0">
              {plan === 'basic' ? 'Free' : `$${planPrice}${planSuffix}`}
            </span>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-sm font-bold text-stone-800">Total today</span>
            <span className="text-lg font-bold text-stone-800">{totalLabel}</span>
          </div>

          {plan === 'monthly' && (
            <p className="text-xs text-stone-400 -mt-1">
              Plaque is a one-time charge. Subscription billed monthly for 24 months.
            </p>
          )}
        </div>
      </div>

      <div className="w-full max-w-md space-y-3">
        <button type="button" onClick={onPlace} disabled={placing}
          className="w-full bg-stone-900 text-white py-4 rounded-2xl text-sm font-semibold hover:bg-stone-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          {placing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Placing order…
            </>
          ) : (
            `Place Order — ${totalLabel}`
          )}
        </button>
        <p className="text-center text-xs text-stone-400">Secure checkout · No card required for demo</p>
        <button type="button" onClick={onBack}
          className="w-full py-3 rounded-2xl text-sm font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors">
          ← Back
        </button>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PurchasePage() {
  const [step, setStep]       = useState<1 | 2 | 3>(1);
  const [material, setMaterial] = useState<string>('steel');
  const [plan, setPlan]       = useState<PlanId>('basic');
  const [placing, setPlacing] = useState(false);

  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth');
  }, [user, isLoading, router]);

  const handleOrder = () => {
    setPlacing(true);
    try {
      localStorage.setItem('ll_has_purchased', 'true');
      localStorage.setItem('ll_plan', plan === 'basic' ? 'basic' : 'premium');
    } catch { /* ignore */ }
    setTimeout(() => router.push('/'), 900);
  };

  if (isLoading || !user) return null;

  const selectedMaterial = MATERIALS.find(m => m.id === material)!;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center py-4 px-6">
      <div className="w-full max-w-md mb-6">
        <img src="/legacy_link_logo.png" alt="LegacyLink" className="h-40 w-auto mx-auto" />
      </div>

      <StepIndicator current={step} />

      {step === 1 && (
        <StepPlaque
          selected={material}
          onSelect={setMaterial}
          onNext={() => setStep(2)}
          onBack={() => router.push('/')}
        />
      )}
      {step === 2 && (
        <StepPlan
          selected={plan}
          onSelect={setPlan}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StepReview
          material={selectedMaterial}
          plan={plan}
          onPlace={handleOrder}
          onBack={() => setStep(2)}
          placing={placing}
        />
      )}
    </div>
  );
}
