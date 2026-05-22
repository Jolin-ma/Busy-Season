'use client';
import { useState } from 'react';
import DashboardHome from '@/components/dashboard/DashboardHome';
import ProfileWizard from '@/components/wizard/ProfileWizard';
import { Memorial } from '@/types/profile';

const MOCK_MEMORIALS: Memorial[] = [
  {
    id: 'mem-001',
    shortId: 'a5trneuj',
    name: 'Margaret Eleanor Whitfield',
    dateOfBirth: 'October 14, 1945',
    dateOfDeath: 'May 22, 2026',
    portraitUrl: 'https://placehold.co/200x200/d6cfc4/7a7166?text=M.W.',
    plaqueStatus: 'engraving',
    scansCount: 12,
  },
];

export default function AdminPage() {
  const [view, setView] = useState<'dashboard' | 'wizard'>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setView('wizard');
  };

  const handleDone = () => {
    setEditingId(null);
    setView('dashboard');
  };

  if (view === 'wizard') {
    return <ProfileWizard memorialId={editingId} onComplete={handleDone} onCancel={handleDone} />;
  }

  return (
    <DashboardHome
      memorials={MOCK_MEMORIALS}
      onEdit={handleEdit}
      onNewMemorial={() => setView('wizard')}
    />
  );
}
