'use client';
import ScanTrendsChart from '@/components/ScanTrendsChart';
import DeviceChart from '@/components/DeviceChart';
import TopScanLocationSection from '@/components/TopScanLocationSection';
import { SUMMARY, BILLING_ACCOUNTS } from '@/lib/mock-data';

const premiumCount = BILLING_ACCOUNTS.filter(a => a.plan === 'PREMIUM').length;
const basicCount   = BILLING_ACCOUNTS.filter(a => a.plan === 'BASIC').length;
const totalUsers   = BILLING_ACCOUNTS.length;

const FUNNEL = [
  { label: 'QR Scans (30d)',      value: 7_820, pct: 100 },
  { label: 'Profile Page Views',  value: 7_241, pct: 92.6 },
  { label: 'Guestbook Opened',    value: 2_104, pct: 26.9 },
  { label: 'Guestbook Submitted', value:   438, pct:  5.6 },
  { label: 'Account Created',     value:    31, pct:  0.4 },
];

const TOP_PROFILES = [
  { name: 'Margaret Eleanor Whitfield', id: 'a5trneuj', scans: 763 },
  { name: 'Harold James Foster',        id: 'b7kwmnpq', scans: 541 },
  { name: 'Dorothy Mae Chen',           id: 'c2xvrtyu', scans: 387 },
  { name: 'Florence Anna Park',         id: 'e4stuijk', scans: 312 },
  { name: 'Robert Lee Thompson',        id: 'f1ghijkl', scans: 198 },
];

export default function AnalyticsTab() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Scans (all time)', value: SUMMARY.totalScans.toLocaleString(), sub: `+${SUMMARY.scansTrend}% this week` },
          { label: 'Premium Accounts',       value: premiumCount,                        sub: `${basicCount} basic` },
          { label: 'Top City',               value: SUMMARY.topLocation,                 sub: `${SUMMARY.topLocationScans} scans` },
          { label: 'Avg Scans / Profile',    value: Math.round(SUMMARY.totalScans / SUMMARY.totalProfiles), sub: 'all-time mean' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-stone-100 rounded-2xl px-5 py-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">{k.label}</p>
            <p className="text-2xl font-bold text-stone-900">{k.value}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Scan trends chart */}
      <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Scan Trends</p>
          <p className="text-sm font-semibold text-stone-800">QR code scans over time</p>
        </div>
        <div className="p-5">
          <ScanTrendsChart />
        </div>
      </div>

      {/* Device + Funnel row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Device breakdown */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Device Breakdown</p>
            <p className="text-sm font-semibold text-stone-800">iOS vs Android</p>
          </div>
          <div className="p-5">
            <DeviceChart />
          </div>
        </div>

        {/* Conversion funnel */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Conversion Funnel</p>
            <p className="text-sm font-semibold text-stone-800">Scan → Account</p>
          </div>
          <div className="p-5 space-y-3">
            {FUNNEL.map((step, i) => (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-stone-700 font-medium">{step.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{step.value.toLocaleString()}</span>
                    <span className="text-[10px] text-stone-400">{step.pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${step.pct}%`,
                      background: i === 0 ? '#1c1917' : i === 1 ? '#44403c' : i === 2 ? '#6366f1' : i === 3 ? '#818cf8' : '#a5b4fc',
                    }}
                  />
                </div>
                {i < FUNNEL.length - 1 && (
                  <p className="text-[9px] text-stone-300 mt-0.5 text-right">
                    {((FUNNEL[i + 1].value / step.value) * 100).toFixed(1)}% → next step
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top profiles + geographic map */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top profiles */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Top Profiles</p>
            <p className="text-sm font-semibold text-stone-800">Most scanned (all time)</p>
          </div>
          <div className="divide-y divide-stone-50">
            {TOP_PROFILES.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                <span className="text-[11px] font-bold text-stone-300 w-5 text-center shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-stone-800 truncate">{p.name}</p>
                  <code className="text-[10px] font-mono text-stone-400">{p.id}</code>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-1.5 w-20 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-stone-900 rounded-full"
                      style={{ width: `${(p.scans / TOP_PROFILES[0].scans) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-stone-700 w-10 text-right">{p.scans}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan distribution */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Account Mix</p>
            <p className="text-sm font-semibold text-stone-800">Plan distribution</p>
          </div>
          <div className="p-5 flex flex-col gap-5">
            {[
              { label: 'Premium',  count: premiumCount, color: '#f59e0b', bg: '#fef3c7', text: '#92400e' },
              { label: 'Basic',    count: basicCount,   color: '#6b7280', bg: '#f3f4f6', text: '#374151' },
            ].map(plan => (
              <div key={plan.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full`} style={{ background: plan.bg, color: plan.text }}>
                    {plan.label}
                  </span>
                  <span className="text-xs font-bold text-stone-700">
                    {plan.count} / {totalUsers} ({Math.round((plan.count / totalUsers) * 100)}%)
                  </span>
                </div>
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(plan.count / totalUsers) * 100}%`, background: plan.color }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-stone-100 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">Revenue Breakdown</p>
              {[
                { label: 'Premium MRR', value: `$${(premiumCount * 1500 / 100).toFixed(2)}` },
                { label: 'Basic ARR',   value: `$${(basicCount * 16900 / 100).toFixed(2)}` },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-xs">
                  <span className="text-stone-500">{r.label}</span>
                  <span className="font-bold text-stone-800">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Geographic section */}
      <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Geographic Distribution</p>
          <p className="text-sm font-semibold text-stone-800">Scan activity by location</p>
        </div>
        <div className="p-2">
          <TopScanLocationSection />
        </div>
      </div>
    </div>
  );
}
