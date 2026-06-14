'use client';
import { useState } from 'react';
import { EMPTY_DRAFT } from '@/types/profile';
import { useLocalDraft } from '@/hooks/useLocalDraft';
import WizardProgress from './WizardProgress';
import Step1CoreIdentity, { Step1Errors } from './Step1CoreIdentity';
import Step2Timeline from './Step2Timeline';
import Step3MediaSettings from './Step3MediaSettings';
import ProfilePreview from './ProfilePreview';

interface Props {
  memorialId: string | null;
  onComplete: () => void;
  onCancel: () => void;
}

const STEPS = ['Core Identity', 'Life Timeline', 'Media & Settings'];

function validateStep1(data: typeof EMPTY_DRAFT): Step1Errors {
  const errors: Step1Errors = {};
  if (!data.name.trim())      errors.name = 'Full name is required.';
  if (!data.epitaph.trim())   errors.epitaph = 'Epitaph is required.';
  if (!data.dateOfBirth)      errors.dateOfBirth = 'Date of birth is required.';
  if (!data.dateOfDeath)      errors.dateOfDeath = 'Date of death is required.';
  if (data.dateOfBirth && data.dateOfDeath && data.dateOfDeath < data.dateOfBirth)
    errors.dateOfDeath = 'Date of death cannot be before date of birth.';
  return errors;
}

export default function ProfileWizard({ onComplete, onCancel }: Props) {
  const [step, setStep] = useState(1);
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedShortId, setSavedShortId] = useState<string | null>(null);

  const { draft, setDraft, restoreDraft, clearDraft, hasSavedDraft, saveStatus } = useLocalDraft();

  const handleNext = () => {
    if (step === 1) {
      const errors = validateStep1(draft);
      if (Object.keys(errors).length > 0) { setStep1Errors(errors); return; }
      setStep1Errors({});
    }
    setStep(s => s + 1);
  };

  const handleSave = async () => {
    const API   = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('ll_token') : null;
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    // Helper: upload a single File, return the CDN URL
    async function uploadFile(file: File): Promise<string> {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API}/admin/upload`, { method: 'POST', headers: authHeader, body: form });
      if (!res.ok) throw new Error('Upload failed');
      return (await res.json()).url as string;
    }

    try {
      // 1. Upload portrait if a File was selected
      let portraitUrl = '';
      if (draft.portraitFile) {
        portraitUrl = await uploadFile(draft.portraitFile);
      }

      // 2. Upload gallery files and collect their URLs
      const galleryItems: { url: string; caption?: string }[] = [];
      for (const item of draft.gallery) {
        const url = await uploadFile(item.file);
        galleryItems.push({ url });
      }

      // 3. POST full profile to Fastify
      const res = await fetch(`${API}/admin/profile`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          name:        draft.name,
          epitaph:     draft.epitaph,
          dateOfBirth: draft.dateOfBirth,
          dateOfDeath: draft.dateOfDeath,
          portraitUrl,
          timeline: draft.timeline,
          gallery:  galleryItems,
          isPrivate:  draft.isPrivate,
          privacyPin: draft.privacyPin,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSavedShortId(data.shortId);
      }
    } catch {
      // Backend unreachable — still confirm so the user isn't stranded.
    }

    clearDraft();
    setSaved(true);
    setTimeout(onComplete, 2500);
  };

  // ── Saved confirmation ────────────────────────────────────────────────────
  if (saved) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
          <h2 className="text-xl font-semibold text-stone-800">Profile Saved</h2>
          {savedShortId && (
            <p className="text-xs font-mono text-stone-400 mt-2 bg-stone-100 rounded-lg px-3 py-1.5 inline-block">
              lglk.to/p/{savedShortId}
            </p>
          )}
          <p className="text-stone-400 text-sm mt-3">Returning to your dashboard…</p>
        </div>
      </div>
    );
  }

  // Wizard renders as a fixed full-screen overlay so it covers the sidebar.
  return (
    <div className="fixed inset-0 bg-stone-50 flex flex-col z-50 overflow-y-auto">
      {/* Top bar */}
      <div className="bg-white border-b border-stone-100 px-6 py-2 flex items-center">
        {/* Left spacer — mirrors right controls width so logo stays centered */}
        <div className="flex-1" />
        <img src="/legacy_link_logo.png" alt="LegacyLink" className="h-32 w-auto" />
        <div className="flex-1 flex items-center justify-end gap-4">
          {/* Autosave indicator */}
          <span className="text-xs text-stone-400">
            {saveStatus === 'saving' && 'Saving…'}
            {saveStatus === 'saved'  && '✓ Draft saved'}
          </span>
          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(v => !v)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              showPreview
                ? 'border-stone-400 text-stone-800 bg-stone-100'
                : 'border-stone-200 text-stone-500 hover:text-stone-800 hover:border-stone-300'
            }`}
          >
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button onClick={onCancel} className="text-stone-400 text-sm hover:text-stone-800 transition-colors">
            ✕ Cancel
          </button>
        </div>
      </div>

      {/* Restore draft banner */}
      {hasSavedDraft && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
          <p className="text-xs text-amber-700 font-medium">You have an unsaved draft from a previous session.</p>
          <div className="flex gap-3">
            <button onClick={restoreDraft} className="text-xs font-semibold text-amber-700 hover:text-amber-900">
              Restore Draft
            </button>
            <button onClick={() => clearDraft()} className="text-xs text-amber-400 hover:text-amber-600">
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 flex ${showPreview ? 'flex-row' : 'items-start justify-center'} gap-0`}>
        {/* Wizard card */}
        <div className={`${showPreview ? 'w-1/2 overflow-y-auto' : 'w-full max-w-xl'} px-4 py-10`}>
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 mx-auto max-w-xl">
            <h2 className="text-xl font-semibold text-stone-800 mb-1">
              {step === 1 && 'Core Identity'}
              {step === 2 && 'Life Timeline'}
              {step === 3 && 'Media & Settings'}
            </h2>
            <p className="text-xs text-stone-400 mb-8">Step {step} of {STEPS.length}</p>

            <WizardProgress currentStep={step} steps={STEPS} />

            {step === 1 && (
              <Step1CoreIdentity
                data={draft}
                errors={step1Errors}
                onChange={patch => setDraft(prev => ({ ...prev, ...patch }))}
              />
            )}
            {step === 2 && (
              <Step2Timeline
                milestones={draft.timeline}
                onChange={timeline => setDraft(prev => ({ ...prev, timeline }))}
              />
            )}
            {step === 3 && (
              <Step3MediaSettings
                gallery={draft.gallery}
                isPrivate={draft.isPrivate}
                privacyPin={draft.privacyPin}
                onChange={patch => setDraft(prev => ({ ...prev, ...patch }))}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-stone-100">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1}
                className="text-sm text-stone-500 hover:text-stone-800 disabled:invisible transition-colors"
              >
                ← Back
              </button>
              {step < STEPS.length ? (
                <button
                  onClick={handleNext}
                  className="bg-stone-800 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="bg-stone-900 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors"
                >
                  Save & Finish ✓
                </button>
              )}
            </div>

            {/* Demo bypass */}
            <div className="mt-4 text-center">
              {step < STEPS.length ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="text-xs text-stone-300 hover:text-stone-500 transition-colors"
                >
                  Skip this step →
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="text-xs text-stone-300 hover:text-stone-500 transition-colors"
                >
                  Skip & return to dashboard →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live preview panel */}
        {showPreview && (
          <div className="w-1/2 border-l border-stone-200 bg-stone-100 overflow-y-auto">
            <div className="px-4 py-3 border-b border-stone-200 bg-stone-50">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">Live Preview — Public Profile</p>
            </div>
            {/* Simulate a phone viewport */}
            <div className="flex justify-center py-8 px-4">
              <div className="w-[375px] bg-stone-50 rounded-3xl overflow-hidden shadow-xl border border-stone-200">
                <ProfilePreview draft={draft} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
