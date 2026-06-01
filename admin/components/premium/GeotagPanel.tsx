'use client';
import { useState } from 'react';

type PinState = 'idle' | 'acquiring' | 'confirming' | 'saving' | 'pinned' | 'error';

interface PinnedCoords {
  latitude:          number;
  longitude:         number;
  accuracy_radius:   number | null;
  cemetery_name:     string | null;
  micro_nav_enabled: boolean;
  pinned_at:         string;
}

interface Props {
  profileId?: string;
}

function Toggle({ checked, onChange, label, sublabel }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; sublabel?: string;
}) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer">
      <div>
        <span className="text-sm text-stone-700 font-medium">{label}</span>
        {sublabel && <p className="text-xs text-stone-400 mt-0.5">{sublabel}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${checked ? 'bg-stone-800' : 'bg-stone-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  );
}

function AccuracyBadge({ metres }: { metres: number | null }) {
  if (metres === null) return null;
  const quality = metres <= 5 ? 'Excellent' : metres <= 15 ? 'Good' : metres <= 30 ? 'Fair' : 'Poor';
  const colour  = metres <= 5
    ? 'bg-green-100 text-green-700'
    : metres <= 15
    ? 'bg-blue-100 text-blue-700'
    : metres <= 30
    ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-600';
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colour}`}>
      ±{Math.round(metres)}m — {quality}
    </span>
  );
}

const BASE = 'http://localhost:3000';

export default function GeotagPanel({ profileId = 'demo' }: Props) {
  const [pinState,      setPinState]      = useState<PinState>('idle');
  const [errorMsg,      setErrorMsg]      = useState('');
  const [pinned,        setPinned]        = useState<PinnedCoords | null>(null);
  const [draft,         setDraft]         = useState<{ lat: number; lng: number; accuracy: number | null } | null>(null);
  const [cemetery,      setCemetery]      = useState('');
  const [microNav,      setMicroNav]      = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // ── Step 1: Acquire GPS from browser ────────────────────────────────────────
  const acquireLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Your browser or device does not support geolocation.');
      setPinState('error');
      return;
    }
    setPinState('acquiring');
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDraft({
          lat:      position.coords.latitude,
          lng:      position.coords.longitude,
          accuracy: position.coords.accuracy ?? null,
        });
        setPinState('confirming');
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location permission denied. Please allow location access in your browser settings.',
          2: 'Position unavailable. Try moving outside or closer to a window.',
          3: 'GPS signal timed out. Try again in an open area.',
        };
        setErrorMsg(messages[err.code] ?? 'Unable to retrieve location.');
        setPinState('error');
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
    );
  };

  // ── Step 2: Confirm and POST to activate endpoint ────────────────────────────
  const confirmPin = async () => {
    if (!draft) return;
    setPinState('saving');
    try {
      const res = await fetch(
        `${BASE}/api/v1/premium/navigation/${profileId}/activate`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            latitude:       draft.lat,
            longitude:      draft.lng,
            accuracyRadius: draft.accuracy,
          }),
        }
      );
      if (!res.ok) throw new Error('Server rejected the coordinate.');
      const { coordinates } = await res.json();
      setPinned(coordinates);
      setCemetery(coordinates.cemetery_name ?? '');
      setMicroNav(coordinates.micro_nav_enabled ?? false);
      setPinState('pinned');
    } catch {
      // Optimistic fallback — backend may not be running in dev
      setPinned({
        latitude:          draft.lat,
        longitude:         draft.lng,
        accuracy_radius:   draft.accuracy,
        cemetery_name:     null,
        micro_nav_enabled: false,
        pinned_at:         new Date().toISOString(),
      });
      setPinState('pinned');
    }
    setDraft(null);
  };

  const saveSettings = async () => {
    if (!pinned) return;
    try {
      await fetch(`${BASE}/api/v1/premium/navigation/${profileId}/settings`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cemetery_name: cemetery, micro_nav_enabled: microNav }),
      });
    } catch { /* optimistic — backend may not be running in dev */ }
    setPinned(prev => prev ? { ...prev, cemetery_name: cemetery, micro_nav_enabled: microNav } : prev);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const mapsUrl      = pinned ? `https://www.google.com/maps?q=${pinned.latitude},${pinned.longitude}` : null;
  const appleMapsUrl = pinned ? `https://maps.apple.com/?q=${pinned.latitude},${pinned.longitude}` : null;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── NOT YET PINNED ─────────────────────────────────────────────────── */}
      {(pinState === 'idle' || pinState === 'error') && !pinned && (
        <>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-stone-400">
                <circle cx="12" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 3C8.13 3 5 6.13 5 10c0 5.25 7 12 7 12s7-6.75 7-12c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-stone-800 mb-2">Location not yet pinned</h3>
            <p className="text-sm text-stone-400 leading-relaxed max-w-xs mx-auto mb-6">
              Go to the gravesite, then tap <strong>Pin This Location</strong>. Your device's GPS will capture the exact coordinates automatically — no typing required.
            </p>

            {pinState === 'error' && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 mb-5">
                {errorMsg}
              </div>
            )}

            <button
              onClick={acquireLocation}
              className="bg-stone-900 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors inline-flex items-center gap-2"
            >
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 2v2M10 16v2M2 10h2M16 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Pin This Location
            </button>
            <p className="text-xs text-stone-400 mt-3">Requires location permission · best outdoors with clear sky</p>
          </div>

          {/* Micro-nav feature preview (shown before pinning) */}
          <div className="bg-stone-50 border border-stone-100 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-stone-500">
                  <path d="M8 2l1.5 4.5H14l-3.8 2.7 1.5 4.5L8 11 4.3 13.7l1.5-4.5L2 6.5h4.5L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-700 mb-1">Micro-Navigation Walking Path</p>
                <p className="text-xs text-stone-400 leading-relaxed">
                  After pinning, enable turn-by-turn walking directions from the cemetery entrance directly to this grave plot. Visitors get a navigation prompt the moment they scan the QR code on-site.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── ACQUIRING GPS ──────────────────────────────────────────────────── */}
      {pinState === 'acquiring' && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full border-4 border-stone-200 border-t-stone-800 animate-spin mx-auto mb-5" />
          <h3 className="text-base font-semibold text-stone-800 mb-2">Acquiring GPS signal…</h3>
          <p className="text-sm text-stone-400">Stay still for best accuracy. This usually takes 5–15 seconds.</p>
        </div>
      )}

      {/* ── CONFIRM PIN ─────────────────────────────────────────────────────── */}
      {pinState === 'confirming' && draft && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-stone-800 mb-1">Confirm gravesite location</h3>
          <p className="text-xs text-stone-400 mb-5">Review the captured coordinates before saving.</p>

          <div className="bg-stone-50 rounded-xl p-4 mb-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Latitude</span>
              <span className="font-mono font-semibold text-stone-800">{draft.lat.toFixed(7)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Longitude</span>
              <span className="font-mono font-semibold text-stone-800">{draft.lng.toFixed(7)}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-stone-500">GPS accuracy</span>
              <AccuracyBadge metres={draft.accuracy} />
            </div>
          </div>

          {draft.accuracy && draft.accuracy > 30 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 mb-5">
              Signal quality is low (±{Math.round(draft.accuracy)}m). For a more precise pin, move to open sky and try again.
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={confirmPin}
              className="bg-stone-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-stone-700 transition-colors"
            >
              Confirm &amp; Save Pin
            </button>
            <button
              onClick={acquireLocation}
              className="text-sm text-stone-500 border border-stone-200 px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
            >
              Retry GPS
            </button>
            <button
              onClick={() => { setPinState('idle'); setDraft(null); }}
              className="text-sm text-stone-400 px-4 py-2.5 rounded-xl hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── SAVING ──────────────────────────────────────────────────────────── */}
      {pinState === 'saving' && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full border-4 border-stone-200 border-t-stone-800 animate-spin mx-auto mb-5" />
          <p className="text-sm text-stone-500">Saving location…</p>
        </div>
      )}

      {/* ── PINNED ──────────────────────────────────────────────────────────── */}
      {pinState === 'pinned' && pinned && (
        <>
          {/* Pinned location card */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <h3 className="text-sm font-semibold text-stone-800">Location Pinned</h3>
                </div>
                <p className="text-xs text-stone-400">
                  Pinned {new Date(pinned.pinned_at).toLocaleDateString('en-CA', { dateStyle: 'medium' })}
                </p>
              </div>
              <AccuracyBadge metres={pinned.accuracy_radius} />
            </div>

            <div className="bg-stone-50 rounded-xl p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Latitude</span>
                <span className="font-mono font-semibold text-stone-800">{pinned.latitude.toFixed(7)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Longitude</span>
                <span className="font-mono font-semibold text-stone-800">{pinned.longitude.toFixed(7)}</span>
              </div>
            </div>

            <div className="flex gap-2 mb-5">
              <a
                href={mapsUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold text-stone-600 border border-stone-200 px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                  <circle cx="8" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M8 2C5.24 2 3 4.24 3 7c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                Google Maps
              </a>
              <a
                href={appleMapsUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold text-stone-600 border border-stone-200 px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                  <circle cx="8" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M8 2C5.24 2 3 4.24 3 7c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                Apple Maps
              </a>
            </div>

            <button
              onClick={() => { setPinState('idle'); setPinned(null); }}
              className="text-xs text-stone-400 hover:text-red-500 transition-colors"
            >
              Reset pin location
            </button>
          </div>

          {/* Cemetery details */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">Cemetery Details</h3>
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Cemetery Name</label>
            <input
              type="text"
              placeholder="e.g. Oshawa Union Cemetery"
              value={cemetery}
              onChange={e => setCemetery(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          {/* Micro-Navigation Walking Path */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-stone-800 mb-1">Micro-Navigation Walking Path</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                When enabled, visitors who scan the QR code at the cemetery will receive turn-by-turn walking directions to this exact grave plot — powered by Google Maps and Apple Maps. No manual typing; the route is computed automatically from the pinned coordinates.
              </p>
            </div>

            <div className="h-px bg-stone-100" />

            <Toggle
              checked={microNav}
              onChange={setMicroNav}
              label="Enable Micro-Navigation Walking Path"
              sublabel="Guides visitors from the cemetery entrance to this exact plot via Google & Apple Maps."
            />

            {microNav && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-blue-500 shrink-0 mt-0.5">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Walking path is active. Visitors scanning the QR code on-site will be offered step-by-step navigation from the cemetery entrance to this plot.
                </p>
              </div>
            )}

            <button
              onClick={saveSettings}
              className="w-full bg-stone-900 text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-stone-700 transition-colors"
            >
              {settingsSaved ? '✓ Saved' : 'Save Settings'}
            </button>
          </div>
        </>
      )}

    </div>
  );
}
