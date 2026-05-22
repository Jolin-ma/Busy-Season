'use client';
import { useState } from 'react';
import { ProfileDraft, EMPTY_DRAFT } from '@/types/profile';
import WizardProgress from './WizardProgress';
import Step1CoreIdentity, { Step1Errors } from './Step1CoreIdentity';
import Step2Timeline from './Step2Timeline';
import Step3MediaSettings from './Step3MediaSettings';

interface Props {
  memorialId: string | null;
  onComplete: () => void;
  onCancel: () => void;
}

const STEPS = ['Core Identity', 'Life Timeline', 'Media & Settings'];

function validateStep1(data: ProfileDraft): Step1Errors {
  const errors: Step1Errors = {};
  if (!data.name.trim()) errors.name = 'Full name is required.';
  if (!data.epitaph.trim()) errors.epitaph = 'Epitaph is required.';
  if (!data.dateOfBirth) errors.dateOfBirth = 'Date of birth is required.';
  if (!data.dateOfDeath) errors.dateOfDeath = 'Date of death is required.';
  if (data.dateOfBirth && data.dateOfDeath && data.dateOfDeath < data.dateOfBirth) {
    errors.dateOfDeath = 'Date of death cannot be before date of birth.';
  }
  return errors;
}

export default function ProfileWizard({ onComplete, onCancel }: Props) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<ProfileDraft>(EMPTY_DRAFT);
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
  const [saved, setSaved] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      const errors = validateStep1(draft);
      if (Object.keys(errors).length > 0) {
        setStep1Errors(errors);
        return;
      }
      setStep1Errors({});
    }
    setStep(s => s + 1);
  };

  const handleSave = () => {
    // In production: POST draft to /api/profiles
    console.log('[wizard] Saving profile draft:', draft);
    setSaved(true);
    setTimeout(onComplete, 1800);
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
          <h2 className="text-xl font-semibold text-stone-800">Profile Saved</h2>
          <p className="text-stone-500 text-sm mt-1">Returning to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-stone-900 px-6 py-4 flex items-center justify-between">
        <span className="text-white text-lg tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
          LegacyLink
        </span>
        <button onClick={onCancel} className="text-stone-400 text-sm hover:text-white transition-colors">
          ✕ Cancel
        </button>
      </div>

      {/* Wizard card */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-1">
            {step === 1 && 'Core Identity'}
            {step === 2 && 'Life Timeline'}
            {step === 3 && 'Media & Settings'}
          </h2>
          <p className="text-xs text-stone-400 mb-8">Step {step} of {STEPS.length}</p>

          <WizardProgress currentStep={step} steps={STEPS} />

          {/* Step content */}
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
        </div>
      </div>
    </div>
  );
}
