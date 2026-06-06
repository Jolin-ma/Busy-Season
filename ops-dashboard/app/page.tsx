'use client';
import { useState } from 'react';
import Sidebar       from '@/components/Sidebar';
import AtAGlance     from '@/components/tabs/AtAGlance';
import DirectoryTab  from '@/components/tabs/DirectoryTab';
import ModerationTab from '@/components/tabs/ModerationTab';
import AnalyticsTab  from '@/components/tabs/AnalyticsTab';
import { FLAGGED_ITEMS } from '@/lib/mock-data';

const TABS = [
  { id: 'glance',     label: 'At a Glance'              },
  { id: 'directory',  label: 'User & Profile Directory'  },
  { id: 'moderation', label: 'Content Moderation'        },
  { id: 'analytics',  label: 'Analytics & Performance'   },
] as const;

type TabId = typeof TABS[number]['id'];

const pendingFlags = FLAGGED_ITEMS.filter(i => i.status === 'PENDING').length;

function tabBadge(id: TabId): number | null {
  if (id === 'moderation') return pendingFlags > 0 ? pendingFlags : null;
  return null;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('glance');

  const now = new Date('2026-06-05').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f7f6f3' }}>
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-7 space-y-5">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
                Operations Overview
              </h1>
              <p className="text-xs text-stone-400 mt-1">{now}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-100 rounded-xl shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-stone-600">Live</span>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 bg-white border border-stone-100 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
            {TABS.map(tab => {
              const badge = tabBadge(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0',
                    activeTab === tab.id
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800',
                  ].join(' ')}
                >
                  {tab.label}
                  {badge !== null && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {activeTab === 'glance'     && <AtAGlance />}
          {activeTab === 'directory'  && <DirectoryTab />}
          {activeTab === 'moderation' && <ModerationTab />}
          {activeTab === 'analytics'  && <AnalyticsTab />}

          <p className="text-center text-[10px] text-stone-300 pb-2">
            LegacyLink Internal · Ops Dashboard · All times UTC
          </p>
        </div>
      </main>
    </div>
  );
}
