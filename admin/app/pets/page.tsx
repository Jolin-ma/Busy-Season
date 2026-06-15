'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import MemorialCard from '@/components/dashboard/MemorialCard';
import GuestbookPanel       from '@/components/premium/GuestbookPanel';
import GeotagPanel          from '@/components/premium/GeotagPanel';
import SupportPanel         from '@/components/premium/SupportPanel';
import PetFamilyStoryPanel  from '@/components/premium/PetFamilyStoryPanel';
import MediaPanel           from '@/components/premium/MediaPanel';
import { Memorial } from '@/types/profile';

const BISCUIT: Memorial = {
  id: 'mem-002',
  shortId: 'biscuit8',
  name: 'Biscuit',
  dateOfBirth: 'March 12, 2010',
  dateOfDeath: 'January 4, 2026',
  portraitUrl: 'https://placehold.co/200x200/c4a882/6b5a3e?text=🐾',
  plaqueStatus: 'delivered',
  scansCount: 3,
  isPrivate: false,
  privacyPin: '',
  type: 'pet',
};

const LUNA: Memorial = {
  id: 'mem-003',
  shortId: 'luna0003',
  name: 'Luna',
  dateOfBirth: 'June 3, 2018',
  dateOfDeath: 'February 10, 2026',
  portraitUrl: 'https://placehold.co/200x200/b8c4d4/4a5568?text=🐱',
  plaqueStatus: 'engraving',
  scansCount: 0,
  isPrivate: false,
  privacyPin: '',
  type: 'pet',
  plan: 'BASIC',
};

type Tab = 'media' | 'guestbook' | 'geo' | 'story' | 'support';

const TABS: { id: Tab; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'media',
    label: 'Documents & Media',
    description: 'Photos, PDFs, videos',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <path d="M4 4a2 2 0 012-2h5l5 5v9a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M11 2v5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'guestbook',
    label: 'Guestbook',
    description: 'Memories from those who loved them',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 3V5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'geo',
    label: 'Resting Place',
    description: 'GPS pin, walking directions',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <circle cx="10" cy="9" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M10 3C7.24 3 5 5.24 5 8c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: 'story',
    label: 'Family Story',
    description: 'Timeline, family connections',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <circle cx="4" cy="10" r="2" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="16" cy="10" r="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M6 10h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="10" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M10 6.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'support',
    label: 'Priority Support',
    description: '2-hour SLA, concierge setup',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <path d="M10 2l1.8 5.4H17l-4.5 3.3 1.7 5.3L10 13l-4.2 3 1.7-5.3L3 7.4h5.2L10 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function PetPremiumPage() {
  const [activeTab, setActiveTab] = useState<Tab>('media');
  const [isPremium, setIsPremium] = useState(false);
  const [profileId, setProfileId] = useState('a5trneuj');
  const [pets, setPets] = useState<Memorial[]>([{ ...BISCUIT, plan: 'BASIC' }, LUNA]);
  const router = useRouter();

  useEffect(() => {
    try {
      const premium = localStorage.getItem('ll_plan') === 'premium';
      setIsPremium(premium);
      setPets([{ ...BISCUIT, plan: premium ? 'PREMIUM' : 'BASIC' }, LUNA]);
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
            <div className="flex items-center gap-2.5 mb-1.5">
              {/* Paw icon */}
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-stone-500 shrink-0">
                <ellipse cx="5"  cy="8.5" rx="2"   ry="2.8" stroke="currentColor" strokeWidth="1.5"/>
                <ellipse cx="10" cy="6"   rx="1.8" ry="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <ellipse cx="15" cy="6"   rx="1.8" ry="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <ellipse cx="20" cy="8.5" rx="2"   ry="2.8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 11c-4 0-7 2.5-7 5.5 0 2 1.5 3.5 3.5 3.5.8 0 1.6-.3 2.2-.8l1.3-1 1.3 1c.6.5 1.4.8 2.2.8 2 0 3.5-1.5 3.5-3.5C19 13.5 16 11 12 11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <h1 className="text-2xl font-semibold text-stone-800">Pet Memorial</h1>
            </div>
            <p className="text-stone-500 text-sm">
              Living Legacy — manage your companion's tribute and premium features.
            </p>
          </div>

          {/* Pet memorials list */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Your Pet Memorials</h2>
            <button className="text-sm font-medium text-stone-700 border border-stone-300 rounded-xl px-4 py-2 hover:bg-stone-100 transition-colors">
              + New Pet Memorial
            </button>
          </div>
          <div className="space-y-4 mb-10">
            {pets.map(p => (
              <MemorialCard
                key={p.id}
                memorial={p}
                onEdit={() => {}}
                onPrivacyChange={() => {}}
              />
            ))}
          </div>

          {/* Upgrade gate */}
          {!isPremium && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 mb-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6 text-amber-500">
                  <path d="M10 2l1.8 5.4H17l-4.5 3.3 1.7 5.3L10 13l-4.2 3 1.7-5.3L3 7.4h5.2L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-stone-800 mb-2">Upgrade to unlock pet memorial features</h2>
              <p className="text-stone-400 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                Collaborative guestbook, GPS resting place navigation, family story integration, and priority support — all part of the Premium Living Legacy plan.
              </p>
              <button
                onClick={() => router.push('/upgrade')}
                className="bg-stone-900 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors"
              >
                Upgrade — $15/mo × 24 months or $199 one-time
              </button>
            </div>
          )}

          {/* Tab nav */}
          <div className="grid grid-cols-5 gap-2 mb-8">
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
                <span className="text-[10px] text-stone-400 leading-tight">{tab.description}</span>
              </button>
            ))}
          </div>

          {/* Active panel */}
          {activeTab === 'media' && <MediaPanel />}
          {isPremium && (
            <>
              {activeTab === 'guestbook' && <GuestbookPanel profileId={profileId} />}
              {activeTab === 'geo'       && <GeotagPanel    profileId={profileId} />}
              {activeTab === 'story'     && <PetFamilyStoryPanel />}
              {activeTab === 'support'   && <SupportPanel profileId={profileId} />}
            </>
          )}

        </div>
      </div>
    </AppShell>
  );
}
