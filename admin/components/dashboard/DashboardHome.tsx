'use client';
import { Memorial } from '@/types/profile';
import MemorialCard from './MemorialCard';

interface Props {
  memorials: Memorial[];
  onEdit: (id: string) => void;
  onNewMemorial: () => void;
}

export default function DashboardHome({ memorials, onEdit, onNewMemorial }: Props) {
  const totalScans = memorials.reduce((sum, m) => sum + m.scansCount, 0);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top Nav */}
      <nav className="bg-stone-900 px-6 py-4 flex items-center justify-between">
        <span className="text-white text-lg tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
          LegacyLink
        </span>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stone-600 flex items-center justify-center text-white text-xs font-semibold">
            JM
          </div>
          <span className="text-stone-300 text-sm hidden sm:block">Jolin Ma</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Welcome Banner */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-800">Welcome back, Jolin</h1>
          <p className="text-stone-500 text-sm mt-1">Manage your memorial profiles and QR plaques.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Memorials', value: memorials.length },
            { label: 'Total Scans', value: totalScans },
            { label: 'Active Plaques', value: memorials.filter(m => m.plaqueStatus !== 'order_received').length },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm text-center">
              <p className="text-2xl font-semibold text-stone-800">{stat.value}</p>
              <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Memorials Section */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Your Memorials</h2>
          <button
            onClick={onNewMemorial}
            className="text-sm font-medium text-stone-700 border border-stone-300 rounded-xl px-4 py-2 hover:bg-stone-100 transition-colors"
          >
            + New Memorial
          </button>
        </div>

        {memorials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center">
            <p className="text-stone-400 text-sm">No memorials yet.</p>
            <button
              onClick={onNewMemorial}
              className="mt-4 bg-stone-800 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors"
            >
              Create Your First Memorial
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {memorials.map(m => (
              <MemorialCard key={m.id} memorial={m} onEdit={() => onEdit(m.id)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
