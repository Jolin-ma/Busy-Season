'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import DashboardHome from '@/components/dashboard/DashboardHome';
import ProfileWizard from '@/components/wizard/ProfileWizard';
import { Memorial } from '@/types/profile';

const MARGARET_BASE: Omit<Memorial, 'plan'> = {
  id: 'mem-001',
  shortId: 'a5trneuj',
  name: 'Margaret Eleanor Whitfield',
  dateOfBirth: 'October 14, 1945',
  dateOfDeath: 'May 22, 2026',
  portraitUrl: 'https://placehold.co/200x200/d6cfc4/7a7166?text=M.W.',
  plaqueStatus: 'order_received',
  scansCount: 12,
  isPrivate: false,
  privacyPin: '',
};


export default function AdminPage() {
  const [view, setView]           = useState<'dashboard' | 'wizard'>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [memorials, setMemorials] = useState<Memorial[]>([{ ...MARGARET_BASE, plan: 'BASIC' }]);

  useEffect(() => {
    try {
      const plan: 'BASIC' | 'PREMIUM' = localStorage.getItem('ll_plan') === 'premium' ? 'PREMIUM' : 'BASIC';
      setMemorials([{ ...MARGARET_BASE, plan }]);
    } catch { /* ignore */ }
  }, []);

  // Sync isPrivate from the backend on mount so ops-dashboard PIN resets are reflected.
  // The plaintext PIN is never stored server-side (bcrypt only), so privacyPin stays
  // empty after a reload — it's only visible in the session where it was generated.
  useEffect(() => {
    memorials.forEach(m => {
      if (!m.shortId) return;
      fetch(`http://localhost:3000/admin/stats/${m.shortId}`)
        .then(r => r.ok ? r.json() : null)
        .then((d: { isPrivate?: boolean } | null) => {
          if (d == null || d.isPrivate == null) return;
          setMemorials(prev => prev.map(mem =>
            mem.shortId === m.shortId ? { ...mem, isPrivate: d.isPrivate! } : mem
          ));
        })
        .catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrivacyChange = (id: string, isPrivate: boolean, privacyPin: string) => {
    setMemorials(prev => prev.map(m => m.id === id ? { ...m, isPrivate, privacyPin } : m));
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setView('wizard');
  };

  const handleDone = () => {
    setEditingId(null);
    setView('dashboard');
  };

  if (view === 'wizard') {
    return (
      <AppShell>
        <ProfileWizard memorialId={editingId} onComplete={handleDone} onCancel={handleDone} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <DashboardHome
        memorials={memorials}
        onEdit={handleEdit}
        onNewMemorial={() => setView('wizard')}
        onPrivacyChange={handlePrivacyChange}
      />
    </AppShell>
  );
}
