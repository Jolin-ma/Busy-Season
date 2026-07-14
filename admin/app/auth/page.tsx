'use client';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type Mode = 'signup' | 'signin';

export default function AuthPage() {
  const [mode, setMode]         = useState<Mode>('signup');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPass]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);
  const nameRef                 = useRef<HTMLInputElement>(null);
  const emailRef                = useRef<HTMLInputElement>(null);

  const { signup, login, logout, user } = useAuth();
  const router = useRouter();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { logout(); }, []);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setShowPass(false);
    setTimeout(() => {
      (m === 'signup' ? nameRef : emailRef).current?.focus();
    }, 60);
  };

  const hasPurchased = () => localStorage.getItem('ll_has_purchased') === 'true';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) { setError('Please enter your full name.'); setBusy(false); return; }
        const created = await signup(name, email, password);
        if (created) {
          router.push('/purchase');
        } else {
          // Duplicate email — switch to sign-in so they can authenticate.
          setBusy(false);
          switchMode('signin');
        }
      } else {
        await login(email, password);
        router.push(hasPurchased() ? '/' : '/purchase');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-4">

      {/* Logo */}
      <div className="mb-6">
        <img src="/legacy_link_logo.png" alt="LegacyLink" className="h-48 w-auto mx-auto" />
      </div>

      <div className="w-full max-w-sm">

        {/* Heading */}
        <div className="text-center mb-6">
          <h1
            className="text-2xl font-semibold text-stone-800"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-stone-400 text-sm mt-1.5 leading-relaxed">
            {mode === 'signup'
              ? 'Honor their memory. Forever.'
              : 'Sign in to manage your memorial profiles.'}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex bg-stone-100 rounded-2xl p-1 mb-6">
          {(['signup', 'signin'] as Mode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                ${mode === m
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-400 hover:text-stone-600'}`}
            >
              {m === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Name — slides in on signup, collapses on signin */}
          <div
            style={{
              display: 'grid',
              gridTemplateRows: mode === 'signup' ? '1fr' : '0fr',
              transition: 'grid-template-rows 260ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          >
            <div style={{ overflow: 'hidden' }}>
              <div className="pb-3">
                <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
                  Full Name
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  autoComplete="name"
                  tabIndex={mode === 'signup' ? 0 : -1}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 placeholder:text-stone-300 shadow-sm hover:border-stone-300 transition-all duration-150"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
              Email Address
            </label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 placeholder:text-stone-300 shadow-sm hover:border-stone-300 transition-all duration-150"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400">
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  tabIndex={-1}
                  className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPass(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                minLength={mode === 'signup' ? 12 : 1}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 pr-11 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 placeholder:text-stone-300 shadow-sm hover:border-stone-300 transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-300 hover:text-stone-500 transition-colors"
              >
                {showPass ? (
                  /* eye-slash */
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.98 8.223A10.477 10.477 0 001.934 10C3.226 13.338 6.28 15.75 10 15.75c.993 0 1.953-.138 2.863-.395M6.228 6.228A3 3 0 0110 5.25c1.538 0 2.84.86 3.501 2.124M6.228 6.228L3 3m3.228 3.228 3.65 3.65m7.894 7.894L18 18m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  /* eye */
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 6.97 5.25 10 5.25c3.03 0 6.577 2.26 7.964 6.433.07.218.07.453 0 .671C16.577 16.49 13.03 18.75 10 18.75c-3.03 0-6.577-2.26-7.964-6.428z" />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl py-3 px-4">
              <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-red-600 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-stone-900 text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-stone-700 active:scale-[0.98] transition-all duration-150 mt-1 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Please wait…
              </>
            ) : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}
