'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API = 'http://localhost:3000';

interface Executor {
  id: string;
  name: string;
  email: string;
  relationship: string;
  profileId: string;
}

type PageState = 'loading' | 'error' | 'ready' | 'success';

export default function VerifyExecutorPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<PageState>('loading');
  const [executor, setExecutor] = useState<Executor | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/succession/verify/${token}`)
      .then(r => {
        if (!r.ok) throw new Error('not_found');
        return r.json();
      })
      .then(data => {
        setExecutor(data.executor);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [token]);

  async function handleConfirm() {
    setConfirming(true);
    try {
      const r = await fetch(`${API}/succession/verify/${token}`, { method: 'POST' });
      if (!r.ok) throw new Error('failed');
      setState('success');
    } catch {
      setErrorMsg('Something went wrong. Please try again or contact info@legacylinkstudio.com.');
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-100 shadow-sm p-8">

        {state === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-stone-600 animate-spin" />
            <p className="text-sm text-stone-400">Verifying link…</p>
          </div>
        )}

        {state === 'error' && (
          <>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-400">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-stone-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Link Expired or Invalid
            </h1>
            <p className="text-sm text-stone-500 leading-relaxed">
              This verification link has expired or has already been used. Please contact the memorial account holder to request a new invitation.
            </p>
          </>
        )}

        {state === 'ready' && executor && (
          <>
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mb-5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-stone-600">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-stone-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Confirm Your Role as Legacy Executor
            </h1>
            <p className="text-sm text-stone-500 leading-relaxed mb-6">
              You&apos;ve been designated as a Legacy Executor for this memorial. By confirming below, you verify that you are{' '}
              <strong className="text-stone-700">{executor.name}</strong> and that you agree to act as a trusted custodian of this memorial in accordance with LegacyLink&apos;s Terms of Service.
            </p>

            <div className="bg-stone-50 rounded-xl p-4 space-y-3 mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Name</p>
                <p className="text-sm text-stone-700">{executor.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Email</p>
                <p className="text-sm text-stone-700">{executor.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Relationship</p>
                <p className="text-sm text-stone-700">{executor.relationship}</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full py-3 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirming ? 'Confirming…' : 'Confirm & Verify My Identity'}
            </button>

            <p className="text-xs text-stone-400 text-center mt-3 leading-relaxed">
              By confirming, you agree to LegacyLink&apos;s Terms of Service and acknowledge your responsibility as a Legacy Executor.
            </p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-stone-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Identity Verified
            </h1>
            <p className="text-sm text-stone-500 leading-relaxed">
              You are now a verified Legacy Executor for this memorial. If the account holder passes away, you may log into LegacyLink and submit a claim request from the memorial&apos;s settings page. Our team will review all claims within 10 business days.
            </p>
          </>
        )}

      </div>
    </div>
  );
}
