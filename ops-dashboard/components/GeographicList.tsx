import { GEO_DATA } from '@/lib/mock-data';

export default function GeographicList() {
  const max = GEO_DATA[0].scans;

  return (
    <section id="geographic" className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Top Scan Locations</h2>
      <p className="text-sm font-semibold text-stone-800 mb-5">Sorted by scan volume · current period</p>

      <div className="space-y-3">
        {GEO_DATA.map((row, i) => (
          <div key={row.city} className="grid grid-cols-[24px_1fr_auto] items-center gap-4">
            <span className="text-xs font-bold text-stone-300 tabular-nums">{i + 1}</span>

            <div className="min-w-0">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-semibold text-stone-700 truncate">{row.city}</span>
                <span className="text-[10px] text-stone-400 ml-2 shrink-0">{row.country}</span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-stone-900 transition-all duration-500"
                  style={{ width: `${(row.scans / max) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs font-semibold text-stone-700 tabular-nums">{row.scans.toLocaleString()}</p>
              <p className="text-[10px] text-stone-400">{row.pct}%</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
