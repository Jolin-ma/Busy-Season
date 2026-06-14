'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [purchased, setPurchased] = useState<boolean | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('ll_has_purchased', 'true');
      setPurchased(true);
    } else {
      setPurchased(localStorage.getItem('ll_has_purchased') === 'true');
    }
  }, []);

  useEffect(() => {
    if (isLoading || purchased === null) return;
    if (!user) {
      router.replace('/auth');
    } else if (!purchased) {
      router.replace('/purchase');
    }
  }, [user, isLoading, purchased, router]);

  if (isLoading || purchased === null || !user || !purchased) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50">
        <div className="w-5 h-5 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
