'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import ScanSparkline from '@/components/analytics/ScanSparkline';

interface MemorialStat {
  id: string;
  shortId: string;
  name: string;
  portraitUrl: string;
  scansCount: number;
  createdAt: string;
  dailyScans: number[];   // last 30 days
  lastScan: string | null;
}

// Seed 30 days of realistic mock history for the demo memorial.
function mockDailyScans(): number[] {
  return Array.from({ length: 30 }, () => Math.floor(Math.random() * 8));
}

const MOCK_STATS: MemorialStat[] = [
  {
    id: 'mem-001',
    shortId: 'a5trneuj',
    name: 'Margaret Eleanor Whitfield',
    portraitUrl: 'https://placehold.co/64x64/d6cfc4/7a7166?text=M.W.',
    scansCount: 12,
    createdAt: '2026-05-01T00:00:00Z',
    dailyScans: mockDailyScans(),
    lastScan: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
  },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<MemorialStat[]>(MOCK_STATS);
  const [loading, setLoading] = useState(true);

  // Try to hydrate from the live Fastify stats endpoint.
  useEffect(() => {
    Promise.all(
      MOCK_STATS.map(async m => {
        try {
          const [statsRes, histRes] = await Promise.all([
            fetch(`http://localhost:3000/admin/stats/${m.shortId}`),
            fetch(`http://localhost:3000/admin/stats/${m.shortId}/history`),
          ]);
          if (!statsRes.ok) return m;
          const s = await statsRes.json();
          const h = histRes.ok ? await histRes.json() : { events: [] };

          // Bucket events into 30 daily counts.
          const buckets = Array(30).fill(0);
          const now = Date.now();
          (h.events as { timestamp: string }[]).forEach(e => {
            const daysAgo = Math.floor((now - new Date(e.timestamp).getTime()) / 86400000);
            if (daysAgo < 30) buckets[29 - daysAgo]++;
          });

          const lastEvent = h.events.at(-1);
          return {
            ...m,
            scansCount: s.scansCount,
            createdAt: s.createdAt,
            dailyScans: buckets,
            lastScan: lastEvent?.timestamp ?? null,
          };
        } catch {
          return m;
        }
      })
    ).then(updated => { setStats(updated); setLoading(false); });
  }, []);

  const totalScans = stats.reduce((s, m) => s + m.scansCount, 0);
  const totalDailyScans = stats.reduce(
    (acc, m) => acc.map((v, i) => v + (m.dailyScans[i] ?? 0)),
    Array(30).fill(0) as number[]
  );

  return (
    <AppShell>
    <div className="min-h-full bg-stone-50 px-6 py-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">Analytics</h1>
        <p className="text-stone-400 text-sm mt-1">Scan activity across all memorials — last 30 days</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Scans', value: loading ? '…' : totalScans },
          { label: 'Memorials', value: stats.length },
          { label: 'Avg / Day', value: loading ? '…' : (totalScans / 30).toFixed(1) },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm text-center">
            <p className="text-2xl font-semibold text-stone-800">{s.value}</p>
            <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Overall trend */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">All Memorials — Daily Scans</p>
          <span className="text-xs text-stone-400">30 days</span>
        </div>
        <ScanSparkline data={totalDailyScans} height={56} />
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-stone-300">30 days ago</span>
          <span className="text-[10px] text-stone-300">Today</span>
        </div>
      </div>

      {/* Per-memorial breakdown */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">Per Memorial</h2>
      <div className="space-y-4">
        {stats.map(m => (
          <div key={m.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <div className="flex items-center gap-4 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.portraitUrl} alt="" className="w-10 h-10 rounded-full object-cover bg-stone-100" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">{m.name}</p>
                <p className="text-xs text-stone-400 font-mono">lglk.to/p/{m.shortId}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-semibold text-stone-800">{m.scansCount}</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest">scans</p>
              </div>
            </div>

            <ScanSparkline data={m.dailyScans} height={40} />

            <div className="flex justify-between mt-3 pt-3 border-t border-stone-50">
              <span className="text-[10px] text-stone-400">
                Last scan: {m.lastScan ? timeAgo(m.lastScan) : 'never'}
              </span>
              <a
                href={`http://localhost:3000/profile/${m.shortId}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-stone-500 hover:text-stone-700 underline underline-offset-2"
              >
                View profile →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
    </AppShell>
  );
}
