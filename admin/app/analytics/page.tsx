'use client';
import { useMemo, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import ScanLineChart from '@/components/analytics/ScanLineChart';
import ScanSparkline from '@/components/analytics/ScanSparkline';

// ── Mock data ──────────────────────────────────────────────────────────────────
// 90 days of daily scan counts. Day 0 = 90 days ago, day 89 = today.
// Margaret spikes around day 60 (memorial service ~30 days ago).

function seed(base: number, spike: { day: number; mag: number } | null, len = 90): number[] {
  return Array.from({ length: len }, (_, i) => {
    const weekend = i % 7 >= 5 ? 1.6 : 1;
    const spikeMag = spike && Math.abs(i - spike.day) < 4
      ? spike.mag * Math.exp(-0.8 * Math.abs(i - spike.day))
      : 0;
    return Math.round(Math.max(0, (Math.random() * base + spikeMag) * weekend));
  });
}

const MEMORIALS = [
  {
    id: 'mem-001',
    shortId: 'a5trneuj',
    name: 'Margaret Eleanor Whitfield',
    initials: 'M.W.',
    portraitBg: '#d6cfc4',
    portraitFg: '#7a7166',
    dailyScans: seed(3.2, { day: 60, mag: 28 }),
    lastScanMinsAgo: 47,
    memoriesCount: 4,
  },
  {
    id: 'mem-002',
    shortId: 'b7kwmnpq',
    name: 'Harold James Foster',
    initials: 'H.F.',
    portraitBg: '#c8d4c4',
    portraitFg: '#5a7166',
    dailyScans: seed(1.4, { day: 75, mag: 14 }),
    lastScanMinsAgo: 320,
    memoriesCount: 2,
  },
  {
    id: 'mem-003',
    shortId: 'c9mnpqrs',
    name: 'Eleanor Grace Kim',
    initials: 'E.K.',
    portraitBg: '#d4c8d4',
    portraitFg: '#7a6677',
    dailyScans: seed(0.6, null),
    lastScanMinsAgo: 1440,
    memoriesCount: 1,
  },
];

const DAYS_MAP: Record<string, number> = { '7D': 7, '30D': 30, '90D': 90 };
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function timeAgo(mins: number): string {
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

function fmt(n: number, dec = 1): string {
  return n % 1 === 0 ? String(n) : n.toFixed(dec);
}

function trend(curr: number, prev: number): { pct: number; up: boolean } {
  if (prev === 0) return { pct: 0, up: true };
  const pct = Math.round(((curr - prev) / prev) * 100);
  return { pct: Math.abs(pct), up: pct >= 0 };
}

// Build a fake recent activity feed
const ACTIVITY = [
  { name: 'Margaret Eleanor Whitfield', shortId: 'a5trneuj', minsAgo: 47,   city: 'Toronto, ON' },
  { name: 'Harold James Foster',        shortId: 'b7kwmnpq', minsAgo: 320,  city: 'Ottawa, ON' },
  { name: 'Margaret Eleanor Whitfield', shortId: 'a5trneuj', minsAgo: 390,  city: 'Halifax, NS' },
  { name: 'Eleanor Grace Kim',          shortId: 'c9mnpqrs', minsAgo: 1440, city: 'Vancouver, BC' },
  { name: 'Margaret Eleanor Whitfield', shortId: 'a5trneuj', minsAgo: 1560, city: 'Toronto, ON' },
  { name: 'Margaret Eleanor Whitfield', shortId: 'a5trneuj', minsAgo: 2880, city: 'Toronto, ON' },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('30D');
  const days = DAYS_MAP[range];

  const sliced = useMemo(() =>
    MEMORIALS.map(m => ({ ...m, dailyScans: m.dailyScans.slice(90 - days) })),
  [days]);

  const combined = useMemo(() =>
    Array.from({ length: days }, (_, i) =>
      sliced.reduce((s, m) => s + (m.dailyScans[i] ?? 0), 0)
    ),
  [sliced, days]);

  const totalScans = combined.reduce((s, v) => s + v, 0);
  const prevHalf   = combined.slice(0, Math.floor(days / 2)).reduce((s, v) => s + v, 0);
  const currHalf   = combined.slice(Math.floor(days / 2)).reduce((s, v) => s + v, 0);
  const { pct: trendPct, up: trendUp } = trend(currHalf, prevHalf);
  const avgDay = totalScans / days;
  const totalMemories = MEMORIALS.reduce((s, m) => s + m.memoriesCount, 0);

  // Peak day of week (across all 90 days for stability)
  const byDow = Array(7).fill(0);
  MEMORIALS.forEach(m => m.dailyScans.forEach((v, i) => { byDow[i % 7] += v; }));
  const peakDow = WEEKDAYS[byDow.indexOf(Math.max(...byDow))];

  // Top city (mock)
  const topCity = 'Toronto, ON';

  return (
    <AppShell>
      <div className="min-h-full bg-stone-50">
        <div className="max-w-4xl mx-auto px-6 py-10">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-stone-900">Analytics</h1>
              <p className="text-stone-400 text-sm mt-1">Scan activity across all your memorials</p>
            </div>
            {/* Timeframe toggle */}
            <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1 shadow-sm">
              {(['7D', '30D', '90D'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    range === r
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* ── Summary cards ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Total Scans',
                value: totalScans,
                sub: `${trendUp ? '↑' : '↓'} ${trendPct}% vs prior period`,
                subColor: trendUp ? 'text-emerald-600' : 'text-rose-500',
              },
              {
                label: 'Avg / Day',
                value: fmt(avgDay),
                sub: `over ${days} days`,
                subColor: 'text-stone-400',
              },
              {
                label: 'Memorials',
                value: MEMORIALS.length,
                sub: 'active profiles',
                subColor: 'text-stone-400',
              },
              {
                label: 'Memories',
                value: totalMemories,
                sub: 'shared by visitors',
                subColor: 'text-stone-400',
              },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">{c.label}</p>
                <p className="text-2xl font-bold text-stone-900 tabular-nums">{c.value}</p>
                <p className={`text-[10px] mt-1 ${c.subColor}`}>{c.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Main line chart ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 pt-5 pb-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-stone-800">All Memorials — Daily Scans</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Combined across {MEMORIALS.length} profiles</p>
              </div>
              <span className="text-xs font-semibold text-stone-400">{range}</span>
            </div>
            <ScanLineChart data={combined} height={100} />
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-stone-300">{days} days ago</span>
              <span className="text-[10px] text-stone-300">Today</span>
            </div>
          </div>

          {/* ── Activity + Insights ─────────────────────────────────────────── */}
          <div className="grid grid-cols-5 gap-4 mb-8">

            {/* Recent activity */}
            <div className="col-span-3 bg-white rounded-2xl border border-stone-100 shadow-sm">
              <div className="px-5 pt-5 pb-3 border-b border-stone-50">
                <p className="text-sm font-semibold text-stone-800">Recent Scans</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Latest visitor activity</p>
              </div>
              <ul className="divide-y divide-stone-50">
                {ACTIVITY.map((a, i) => (
                  <li key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-700 truncate">{a.name}</p>
                      <p className="text-[10px] text-stone-400">{a.city}</p>
                    </div>
                    <span className="text-[10px] text-stone-300 shrink-0">{timeAgo(a.minsAgo)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Insights */}
            <div className="col-span-2 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Insights</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500">Peak day</span>
                    <span className="text-xs font-bold text-stone-800">{peakDow}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500">Peak time</span>
                    <span className="text-xs font-bold text-stone-800">2 – 4 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500">Top city</span>
                    <span className="text-xs font-bold text-stone-800">{topCity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500">Most active</span>
                    <span className="text-xs font-bold text-stone-800 truncate ml-2 max-w-[100px]">Margaret E. W.</span>
                  </div>
                </div>
              </div>

              {/* Day-of-week breakdown */}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">By Day of Week</p>
                <div className="flex items-end gap-1 h-10">
                  {byDow.map((v, i) => {
                    const h = Math.max(4, (v / Math.max(...byDow)) * 40);
                    const isPeak = v === Math.max(...byDow);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          style={{ height: `${h}px` }}
                          className={`w-full rounded-sm ${isPeak ? 'bg-stone-700' : 'bg-stone-200'}`}
                        />
                        <span className="text-[8px] text-stone-400">{WEEKDAYS[i][0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Per-memorial breakdown ──────────────────────────────────────── */}
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Per Memorial</h2>
          <div className="space-y-4">
            {sliced.map(m => {
              const total   = m.dailyScans.reduce((s, v) => s + v, 0);
              const prevH   = m.dailyScans.slice(0, Math.floor(days / 2)).reduce((s, v) => s + v, 0);
              const currH   = m.dailyScans.slice(Math.floor(days / 2)).reduce((s, v) => s + v, 0);
              const { pct, up } = trend(currH, prevH);
              return (
                <div key={m.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: m.portraitBg, color: m.portraitFg }}
                    >
                      {m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">{m.name}</p>
                      <p className="text-[10px] text-stone-400 font-mono">lglk.to/p/{m.shortId}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-stone-900 tabular-nums">{total}</p>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest">scans</p>
                    </div>
                  </div>

                  <ScanSparkline data={m.dailyScans} height={36} />

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-50">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-stone-400">
                        Last scan: {timeAgo(m.lastScanMinsAgo)}
                      </span>
                      {pct > 0 && (
                        <span className={`text-[10px] font-semibold ${up ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {up ? '↑' : '↓'} {pct}%
                        </span>
                      )}
                    </div>
                    <a
                      href={`http://localhost:3000/profile/${m.shortId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-stone-500 hover:text-stone-800 underline underline-offset-2 transition-colors"
                    >
                      View profile →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </AppShell>
  );
}
