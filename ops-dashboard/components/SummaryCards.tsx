import { SUMMARY } from '@/lib/mock-data';

interface CardProps {
  title:  string;
  value:  string | number;
  trend:  number;
  sub:    string;
  icon:   React.ReactNode;
  accent: string;
}

function Card({ title, value, trend, sub, icon, accent }: CardProps) {
  const up = trend >= 0;
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{title}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>

      <div>
        <p className="text-3xl font-bold text-stone-900 tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-stone-400 mt-1">{sub}</p>
      </div>

      <div className={`flex items-center gap-1.5 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
        <span>{up ? '▲' : '▼'}</span>
        <span>{Math.abs(trend)}% vs last week</span>
      </div>
    </div>
  );
}

export default function SummaryCards() {
  return (
    <section id="overview" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card
        title="Live Profiles"
        value={SUMMARY.totalProfiles}
        trend={SUMMARY.profilesTrend}
        sub="Total active memorials"
        accent="bg-stone-100 text-stone-600"
        icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>}
      />
      <Card
        title="QR Scans"
        value={SUMMARY.totalScans}
        trend={SUMMARY.scansTrend}
        sub="Cumulative all-time scans"
        accent="bg-amber-50 text-amber-600"
        icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM11 13a1 1 0 011-1h1v1h-1v1h1v1h-1v1h-1v-1h-1v-1h1v-1zm3 0h1v1h-1v-1zm1 2h1v1h-1v-1zm-3 1h1v1h-1v-1z" clipRule="evenodd" /></svg>}
      />
      <Card
        title="Pending Orders"
        value={SUMMARY.pendingOrders}
        trend={SUMMARY.pendingTrend}
        sub="Awaiting print & fulfillment"
        accent="bg-orange-50 text-orange-500"
        icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /></svg>}
      />
      <Card
        title="Top Location"
        value={SUMMARY.topLocation}
        trend={+8}
        sub={`${SUMMARY.topLocationScans.toLocaleString()} scans this period`}
        accent="bg-emerald-50 text-emerald-600"
        icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>}
      />
    </section>
  );
}
