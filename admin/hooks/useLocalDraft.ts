'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ProfileDraft, EMPTY_DRAFT } from '@/types/profile';

const KEY = 'll_profile_draft';

// Serialisable subset — File/Blob objects can't survive JSON round-trips.
type SerializedDraft = Omit<ProfileDraft, 'portraitFile' | 'portraitPreview' | 'gallery'>;

function serialize(d: ProfileDraft): SerializedDraft {
  const { portraitFile: _pf, portraitPreview: _pp, gallery: _g, ...rest } = d;
  return rest;
}

export type SaveStatus = 'idle' | 'saving' | 'saved';

export function useLocalDraft() {
  const [draft, setDraftState] = useState<ProfileDraft>(EMPTY_DRAFT);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // On mount: check for an existing saved draft (text fields only).
  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) setHasSavedDraft(true);
    } catch {}
  }, []);

  const setDraft = useCallback((updater: ProfileDraft | ((prev: ProfileDraft) => ProfileDraft)) => {
    setDraftState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      // Debounce autosave: persist 800ms after the last keystroke.
      clearTimeout(timer.current);
      setSaveStatus('saving');
      timer.current = setTimeout(() => {
        try {
          localStorage.setItem(KEY, JSON.stringify(serialize(next)));
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch {}
      }, 800);
      return next;
    });
  }, []);

  const restoreDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const saved: SerializedDraft = JSON.parse(raw);
      // Merge text fields back; keep any in-memory File objects that exist.
      setDraftState(prev => ({
        ...EMPTY_DRAFT,
        ...saved,
        portraitFile: prev.portraitFile,
        portraitPreview: prev.portraitPreview,
        gallery: prev.gallery,
      }));
      setHasSavedDraft(false);
    } catch {}
  }, []);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch {}
    setHasSavedDraft(false);
    setSaveStatus('idle');
    setDraftState(EMPTY_DRAFT);
  }, []);

  return { draft, setDraft, restoreDraft, clearDraft, hasSavedDraft, saveStatus };
}
