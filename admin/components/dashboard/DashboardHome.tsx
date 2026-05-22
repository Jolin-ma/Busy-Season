'use client';
import { Memorial } from '@/types/profile';
import { useAuth } from '@/context/AuthContext';
import MemorialCard from './MemorialCard';
import PlaqueStatusCard from './PlaqueStatusCard';
import PlansSection from './PlansSection';

interface Props {
  memorials: Memorial[];
  onEdit: (id: string) => void;
  onNewMemorial: () => void;
  onPrivacyChange: (id: string, isPrivate: boolean, privacyPin: string) => void;
}

export default function DashboardHome({ memorials, onEdit, onNewMemorial, onPrivacyChange }: Props) {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  // Show the status card for the first memorial that hasn't been delivered yet.
  const activeMemorial = memorials.find(m => m.plaqueStatus !== 'delivered') ?? memorials[0];

  return (
    <div className="min-h-full bg-stone-50">
      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* Welcome Banner */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-800">Welcome back, {firstName}</h1>
          <p className="text-stone-500 text-sm mt-1">Manage your memorial profiles and QR plaques.</p>
        </div>

        {/* Plaque status card */}
        {activeMemorial && (
          <PlaqueStatusCard
            memorial={activeMemorial}
            onSetupProfile={() => onEdit(activeMemorial.id)}
          />
        )}

        {/* Plans */}
        <PlansSection />

        {/* Memorials list */}
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
              <MemorialCard
                key={m.id}
                memorial={m}
                onEdit={() => onEdit(m.id)}
                onPrivacyChange={(isPrivate, pin) => onPrivacyChange(m.id, isPrivate, pin)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
