'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import DashboardHome from '@/components/dashboard/DashboardHome';
import ProfileWizard from '@/components/wizard/ProfileWizard';
import { Memorial } from '@/types/profile';

const MARGARET: Memorial = {
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
  const [memorials, setMemorials] = useState<Memorial[]>([MARGARET]);

  const handlePrivacyChange = (id: string, isPrivate: boolean, privacyPin: string) => {
    setMemorials(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, isPrivate, privacyPin } : m);
      try { localStorage.setItem('ll_memorials', JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
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
