'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type Mode = 'signup' | 'signin';

export default function AuthPage() {
  const [mode, setMode]       = useState<Mode>('signup');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState('');
  const [busy, setBusy]       = useState(false);

  const { user, isLoading, signup, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) router.replace('/');
  }, [user, isLoading, router]);

  const switchMode = (m: Mode) => { setMode(m); setError(''); };

  const hasPurchased = () => localStorage.getItem('ll_has_purchased') === 'true';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) { setError('Please enter your full name.'); setBusy(false); return; }
        signup(name, email, password);
        router.push('/purchase');
      } else {
        await login(email, password);
        router.push(hasPurchased() ? '/' : '/purchase');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-16">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-9 h-9 bg-stone-900 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-bold">LL</span>
        </div>
        <span
          className="text-stone-800 text-xl font-semibold tracking-wide"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          LegacyLink
        </span>
      </div>

      <div className="w-full max-w-sm">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-semibold text-stone-800"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-stone-400 text-sm mt-2 leading-relaxed">
            {mode === 'signup'
              ? 'Honor their memory. Forever.'
              : 'Sign in to manage your memorial profiles.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-stone-100 rounded-2xl p-1 mb-8">
          {(['signup', 'signin'] as Mode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all
                ${mode === m
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-400 hover:text-stone-600'}`}
            >
              {m === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 placeholder:text-stone-300 transition-shadow"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 placeholder:text-stone-300 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPass(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 placeholder:text-stone-300 transition-shadow"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center bg-red-50 border border-red-100 rounded-xl py-3 px-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-stone-900 text-white py-4 rounded-2xl text-sm font-semibold hover:bg-stone-700 transition-colors mt-2 disabled:opacity-50"
          >
            {busy
              ? 'Please wait…'
              : mode === 'signup'
                ? 'Create Account'
                : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-400 mb-3">Just exploring?</p>
          <button
            type="button"
            onClick={async () => {
              setBusy(true);
              await login('demo@legacylink.com', '');
              router.push(hasPurchased() ? '/' : '/purchase');
            }}
            className="text-sm font-medium text-stone-500 underline underline-offset-4 hover:text-stone-800 transition-colors"
          >
            Continue with demo account
          </button>
        </div>
      </div>
    </div>
  );
}
