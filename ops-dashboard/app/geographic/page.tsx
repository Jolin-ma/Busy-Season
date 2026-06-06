import Sidebar from '@/components/Sidebar';
import TopScanLocationSection from '@/components/TopScanLocationSection';

export default function GeographicPage() {
  const now = new Date('2026-06-05').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f7f6f3' }}>
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-7 space-y-6">

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
                Geographic Overview
              </h1>
              <p className="text-xs text-stone-400 mt-1">{now}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-100 rounded-xl shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-stone-600">Live</span>
            </div>
          </div>

          <TopScanLocationSection />

          <p className="text-center text-[10px] text-stone-300 pb-2">
            LegacyLink Internal · Ops Dashboard · All times UTC
          </p>
        </div>
      </main>
    </div>
  );
}
