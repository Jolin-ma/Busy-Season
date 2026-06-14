'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import MemorialCard from '@/components/dashboard/MemorialCard';
import GuestbookPanel  from '@/components/premium/GuestbookPanel';
import GeotagPanel     from '@/components/premium/GeotagPanel';
import InstitutionalHistoryPanel from '@/components/premium/InstitutionalHistoryPanel';
import SupportPanel    from '@/components/premium/SupportPanel';
import MediaPanel      from '@/components/premium/MediaPanel';
import { Memorial } from '@/types/profile';

const VICTORIA_BENCH: Memorial = {
  id: 'mem-003',
  shortId: 'vctbnch1',
  name: 'Victoria Park Memorial Bench',
  dateOfBirth: 'Established 2024',
  dateOfDeath: '',
  location: 'Victoria Park, Hamilton, ON',
  portraitUrl: 'https://placehold.co/200x200/c8c0b4/6e6860?text=🏛',
  plaqueStatus: 'order_received',
  scansCount: 0,
  isPrivate: false,
  privacyPin: '',
  type: 'monument',
};

type Tab = 'media' | 'guestbook' | 'geo' | 'history' | 'support';


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
    description: 'Public tributes & memories',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 3V5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'geo',
    label: 'Location & Sharing',
    description: 'Pin, share & find the site',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <circle cx="10" cy="9" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M10 3C7.24 3 5 5.24 5 8c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'Institutional History',
    description: 'Timeline & connections',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <path d="M3 17V7l7-5 7 5v10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 17v-5h4v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'support',
    label: 'Priority Support',
    description: '2-hour SLA, concierge',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <path d="M10 2l1.8 5.4H17l-4.5 3.3 1.7 5.3L10 13l-4.2 3 1.7-5.3L3 7.4h5.2L10 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function MonumentsPage() {
  const [monuments, setMonuments] = useState<Memorial[]>([VICTORIA_BENCH]);
  const [activeTab, setActiveTab] = useState<Tab>('media');
  const [isPremium, setIsPremium] = useState(false);
  const [profileId, setProfileId] = useState('vctbnch1');
  const router = useRouter();

  useEffect(() => {
    try {
      setIsPremium(localStorage.getItem('ll_plan') === 'premium');
      const stored = localStorage.getItem('ll_profile_id');
      if (stored) setProfileId(stored);
    } catch { /* ignore */ }
  }, []);

  const handlePrivacyChange = (id: string, isPrivate: boolean, privacyPin: string) => {
    setMonuments(prev => prev.map(m => m.id === id ? { ...m, isPrivate, privacyPin } : m));
  };

  return (
    <AppShell>
      <div className="min-h-full bg-stone-50">
        <div className="max-w-3xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-1.5">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-stone-500 shrink-0">
                <path d="M3 21h18M6 21V10M18 21V10M12 21V5M9 5h6M12 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 10H3l3-4M18 10h3l-3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h1 className="text-2xl font-semibold text-stone-800">Monuments</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPremium ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'}`}>
                {isPremium ? 'Premium active' : 'Basic'}
              </span>
            </div>
            <p className="text-stone-500 text-sm">
              Buildings, benches, statues and civic memorials — manage your public plaques and archives.
            </p>
          </div>

          {/* Monument cards */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Your Monuments</h2>
            <button className="text-sm font-medium text-stone-700 border border-stone-300 rounded-xl px-4 py-2 hover:bg-stone-100 transition-colors">
              + New Monument
            </button>
          </div>
          <div className="space-y-4 mb-10">
            {monuments.map(m => (
              <MemorialCard
                key={m.id}
                memorial={m}
                onEdit={() => {}}
                onPrivacyChange={(isPrivate, pin) => handlePrivacyChange(m.id, isPrivate, pin)}
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
              <h2 className="text-lg font-semibold text-stone-800 mb-2">Upgrade to unlock monument features</h2>
              <p className="text-stone-400 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                Document & media uploads, collaborative guestbook, GPS location, institutional history timeline, and priority support.
              </p>
              <button
                onClick={() => router.push('/upgrade')}
                className="bg-stone-900 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors"
              >
                Upgrade — $15/mo × 24 months or $199 one-time
              </button>
            </div>
          )}

          {/* Feature tabs */}
          <div className="grid grid-cols-5 gap-2 mb-8">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={!isPremium && tab.id !== 'media'}
                className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed
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
          {activeTab === 'media'    && <MediaPanel />}
          {isPremium && (
            <>
              {activeTab === 'guestbook' && <GuestbookPanel profileId={profileId} />}
              {activeTab === 'geo'       && <GeotagPanel    profileId={profileId} />}
              {activeTab === 'history'   && <InstitutionalHistoryPanel />}
              {activeTab === 'support'   && <SupportPanel profileId={profileId} />}
            </>
          )}

        </div>
      </div>
    </AppShell>
  );
}
