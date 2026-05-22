'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';

interface Toggle {
  label: string;
  description: string;
  key: string;
}

const NOTIFICATION_TOGGLES: Toggle[] = [
  { key: 'scanAlerts',    label: 'Scan Notifications',   description: 'Email me when a memorial is scanned for the first time each day' },
  { key: 'orderUpdates',  label: 'Plaque Order Updates',  description: 'Receive shipping and engraving status updates' },
  { key: 'weeklyDigest',  label: 'Weekly Analytics',      description: 'A weekly summary of scan activity across all memorials' },
  { key: 'memoryWall',    label: 'New Memory Alerts',      description: 'Notify me when someone leaves a tribute on a profile' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName]   = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    scanAlerts: true,
    orderUpdates: true,
    weeklyDigest: false,
    memoryWall: true,
  });

  const [qrEngine, setQrEngine] = useState('http://localhost:3000');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggle = (key: string) =>
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <AppShell>
    <div className="min-h-full bg-stone-50 px-6 py-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">Settings</h1>
        <p className="text-stone-400 text-sm mt-1">Manage your account and platform preferences.</p>
      </div>

      {/* Account */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Account</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
            />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Notifications</h2>
        <div className="divide-y divide-stone-50">
          {NOTIFICATION_TOGGLES.map(item => (
            <div key={item.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="pr-4">
                <p className="text-sm font-medium text-stone-700">{item.label}</p>
                <p className="text-xs text-stone-400 mt-0.5">{item.description}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 focus:outline-none
                  ${notifications[item.key] ? 'bg-stone-800' : 'bg-stone-200'}`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform
                    ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* QR Engine */}
      <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">QR Engine</h2>
        <p className="text-xs text-stone-400 mb-5">
          The Fastify routing server that handles QR scans. In production, this will be your deployed edge URL.
        </p>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Server URL</label>
          <input
            type="url"
            value={qrEngine}
            onChange={e => setQrEngine(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
          />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-stone-400">Engine reachable at {qrEngine}</span>
        </div>
      </section>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-2xl text-sm font-semibold transition-all
          ${saved
            ? 'bg-green-600 text-white'
            : 'bg-stone-800 text-white hover:bg-stone-700'}`}
      >
        {saved ? '✓ Changes Saved' : 'Save Changes'}
      </button>
    </div>
    </AppShell>
  );
}
