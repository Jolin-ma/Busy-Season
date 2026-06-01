'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import GuestbookPanel  from '@/components/premium/GuestbookPanel';
import GeotagPanel     from '@/components/premium/GeotagPanel';
import FamilyTreePanel from '@/components/premium/FamilyTreePanel';
import SupportPanel    from '@/components/premium/SupportPanel';

type Tab = 'guestbook' | 'geo' | 'family' | 'support';

const TABS: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'guestbook',
    label: 'Guestbook',
    description: 'Moderation, trusted contributors',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 3V5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'geo',
    label: 'Geotagging',
    description: 'GPS pin, walking path nav',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <circle cx="10" cy="9" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M10 3C7.24 3 5 5.24 5 8c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: 'family',
    label: 'Family Tree',
    description: 'Members, interlinks, GEDCOM',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <circle cx="10" cy="4"  r="2" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="4"  cy="14" r="2" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="16" cy="14" r="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M10 6v4M10 10l-4 3M10 10l4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'support',
    label: 'Priority Support',
    description: '2-hour SLA, concierge onboarding',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <path d="M10 2l1.8 5.4H17l-4.5 3.3 1.7 5.3L10 13l-4.2 3 1.7-5.3L3 7.4h5.2L10 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function PremiumPage() {
  const [activeTab, setActiveTab] = useState<Tab>('guestbook');
  const [isPremium, setIsPremium] = useState(false);
  const [profileId, setProfileId] = useState('a5trneuj');
  const router = useRouter();

  useEffect(() => {
    try {
      setIsPremium(localStorage.getItem('ll_plan') === 'premium');
      const stored = localStorage.getItem('ll_profile_id');
      if (stored) setProfileId(stored);
    } catch { /* ignore */ }
  }, []);

  return (
    <AppShell>
      <div className="min-h-full bg-stone-50">
        <div className="max-w-3xl mx-auto px-6 py-10">

          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-semibold text-stone-800">Premium Features</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPremium ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'}`}>
                {isPremium ? 'Active' : 'Not active'}
              </span>
            </div>
            <p className="text-stone-500 text-sm">Living Legacy — manage your advanced memorial features.</p>
          </div>

          {/* Not-premium gate */}
          {!isPremium && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 mb-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6 text-amber-500">
                  <path d="M10 2l1.8 5.4H17l-4.5 3.3 1.7 5.3L10 13l-4.2 3 1.7-5.3L3 7.4h5.2L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-stone-800 mb-2">Upgrade to unlock these features</h2>
              <p className="text-stone-400 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                Collaborative guestbook, GPS navigation, family tree, and priority support are all part of the Premium Living Legacy plan.
              </p>
              <button
                onClick={() => router.push('/upgrade')}
                className="bg-stone-900 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors"
              >
                Upgrade — $15/mo or $199 lifetime
              </button>
            </div>
          )}

          {/* Tab nav */}
          <div className="grid grid-cols-4 gap-2 mb-8">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={!isPremium}
                className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed
                  ${activeTab === tab.id
                    ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                    : 'bg-white border-stone-100 text-stone-700 hover:border-stone-300'}`}
              >
                <span className={`mb-2 ${activeTab === tab.id ? 'text-white' : 'text-stone-400'}`}>
                  {tab.icon}
                </span>
                <span className="text-xs font-semibold block leading-tight mb-0.5">{tab.label}</span>
                <span className={`text-[10px] leading-tight ${activeTab === tab.id ? 'text-stone-400' : 'text-stone-400'}`}>
                  {tab.description}
                </span>
              </button>
            ))}
          </div>

          {/* Active panel */}
          {isPremium && (
            <>
              {activeTab === 'guestbook' && <GuestbookPanel profileId={profileId} />}
              {activeTab === 'geo'       && <GeotagPanel profileId={profileId} />}
              {activeTab === 'family'    && <FamilyTreePanel />}
              {activeTab === 'support'   && <SupportPanel />}
            </>
          )}

        </div>
      </div>
    </AppShell>
  );
}
