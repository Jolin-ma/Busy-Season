'use client';
import { useState } from 'react';

type PinState = 'idle' | 'acquiring' | 'confirming' | 'saving' | 'pinned' | 'error';

interface PinnedCoords {
  latitude:        number;
  longitude:       number;
  accuracy_radius: number | null;
  venue_name:      string | null;
  visitor_note:    string | null;
  pinned_at:       string;
}

interface Props { profileId?: string; }

const BASE = 'http://localhost:3000';

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

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 text-xs font-semibold text-stone-600 border border-stone-200 px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
    >
      {copied ? (
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-green-500">
          <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
          <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M3 11V3.5A1.5 1.5 0 014.5 2H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      )}
      {copied ? 'Copied!' : label}
    </button>
  );
}

export default function GeotagPanel({ profileId = 'demo' }: Props) {
  const [pinState,   setPinState]   = useState<PinState>('idle');
  const [errorMsg,   setErrorMsg]   = useState('');
  const [pinned,     setPinned]     = useState<PinnedCoords | null>(null);
  const [draft,      setDraft]      = useState<{ lat: number; lng: number; accuracy: number | null } | null>(null);
  const [venueName,  setVenueName]  = useState('');
  const [visitorNote,setVisitorNote]= useState('');
  const [saved,      setSaved]      = useState(false);

  const acquireLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Your browser or device does not support geolocation.');
      setPinState('error');
      return;
    }
    setPinState('acquiring');
    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setDraft({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy ?? null });
        setPinState('confirming');
      },
      err => {
        const msg: Record<number, string> = {
          1: 'Location permission denied. Allow location access in your browser settings.',
          2: 'Position unavailable. Try moving closer to a window or outside.',
          3: 'GPS signal timed out. Try again in an open area.',
        };
        setErrorMsg(msg[err.code] ?? 'Unable to retrieve location.');
        setPinState('error');
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
    );
  };

  const confirmPin = async () => {
    if (!draft) return;
    setPinState('saving');
    try {
      const res = await fetch(`${BASE}/api/v1/premium/location/${profileId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: draft.lat, longitude: draft.lng, accuracyRadius: draft.accuracy }),
      });
      if (!res.ok) throw new Error();
      const { coordinates } = await res.json();
      setPinned(coordinates);
      setVenueName(coordinates.venue_name ?? '');
      setVisitorNote(coordinates.visitor_note ?? '');
    } catch {
      setPinned({
        latitude: draft.lat, longitude: draft.lng,
        accuracy_radius: draft.accuracy,
        venue_name: null, visitor_note: null,
        pinned_at: new Date().toISOString(),
      });
    }
    setDraft(null);
    setPinState('pinned');
  };

  const saveDetails = async () => {
    if (!pinned) return;
    try {
      await fetch(`${BASE}/api/v1/premium/location/${profileId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue_name: venueName, visitor_note: visitorNote }),
      });
    } catch { /* optimistic */ }
    setPinned(prev => prev ? { ...prev, venue_name: venueName, visitor_note: visitorNote } : prev);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const googleMapsUrl = pinned ? `https://www.google.com/maps?q=${pinned.latitude},${pinned.longitude}` : null;
  const appleMapsUrl  = pinned ? `https://maps.apple.com/?q=${pinned.latitude},${pinned.longitude}` : null;
  const coordsString  = pinned ? `${pinned.latitude.toFixed(7)}, ${pinned.longitude.toFixed(7)}` : '';
  const shareLink     = pinned ? `https://www.google.com/maps?q=${pinned.latitude},${pinned.longitude}` : '';

  return (
    <div className="space-y-6">

      {/* ── NOT YET PINNED ────────────────────────────────────────────────── */}
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
              Stand at the memorial site and tap <strong>Pin This Location</strong>. Your device captures the exact GPS coordinates — so family members who haven't been here can find it.
            </p>

            {pinState === 'error' && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 mb-5 text-left">
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
            <p className="text-xs text-stone-400 mt-3">Requires location permission · best accuracy outdoors</p>
          </div>

          {/* What this is for */}
          <div className="bg-stone-50 border border-stone-100 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-stone-600">Who is this for?</p>
            <div className="space-y-2">
              {[
                { icon: '📍', text: 'Family members in another city who want to visit and need the exact spot.' },
                { icon: '🏛', text: 'Large cemeteries and parks where GPS is the only reliable way to find a specific plot or bench.' },
                { icon: '🔗', text: 'Anyone reading this memorial online who wants to make a trip — one tap opens Maps.' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex gap-2.5 items-start">
                  <span className="text-sm shrink-0 mt-0.5">{icon}</span>
                  <p className="text-xs text-stone-500 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── ACQUIRING ─────────────────────────────────────────────────────── */}
      {pinState === 'acquiring' && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full border-4 border-stone-200 border-t-stone-800 animate-spin mx-auto mb-5" />
          <h3 className="text-base font-semibold text-stone-800 mb-2">Acquiring GPS signal…</h3>
          <p className="text-sm text-stone-400">Stay still for best accuracy. Usually takes 5–15 seconds.</p>
        </div>
      )}

      {/* ── CONFIRM ───────────────────────────────────────────────────────── */}
      {pinState === 'confirming' && draft && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-stone-800 mb-1">Confirm location</h3>
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
              Signal quality is low (±{Math.round(draft.accuracy)}m). Move to open sky and retry for a more precise pin.
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={confirmPin}
              className="bg-stone-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-stone-700 transition-colors">
              Confirm &amp; Save
            </button>
            <button onClick={acquireLocation}
              className="text-sm text-stone-500 border border-stone-200 px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors">
              Retry GPS
            </button>
            <button onClick={() => { setPinState('idle'); setDraft(null); }}
              className="text-sm text-stone-400 px-4 py-2.5 rounded-xl hover:bg-stone-100 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── SAVING ────────────────────────────────────────────────────────── */}
      {pinState === 'saving' && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full border-4 border-stone-200 border-t-stone-800 animate-spin mx-auto mb-5" />
          <p className="text-sm text-stone-500">Saving location…</p>
        </div>
      )}

      {/* ── PINNED ────────────────────────────────────────────────────────── */}
      {pinState === 'pinned' && pinned && (
        <>
          {/* Confirmed coordinates */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-stone-800">Location pinned</p>
                  <p className="text-xs text-stone-400">
                    {new Date(pinned.pinned_at).toLocaleDateString('en-CA', { dateStyle: 'medium' })}
                  </p>
                </div>
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

            <button onClick={() => { setPinState('idle'); setPinned(null); }}
              className="text-xs text-stone-400 hover:text-red-500 transition-colors">
              Reset pin location
            </button>
          </div>

          {/* Venue name + visitor note */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">Location Details</h3>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1.5">
                Venue / Site Name
              </label>
              <input
                value={venueName}
                onChange={e => setVenueName(e.target.value)}
                placeholder="e.g. Victoria Park, Hamilton · Oshawa Union Cemetery"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1.5">
                Visitor Note <span className="normal-case font-normal text-stone-300">(optional — shown on the public memorial)</span>
              </label>
              <textarea
                rows={3}
                value={visitorNote}
                onChange={e => setVisitorNote(e.target.value)}
                placeholder="e.g. The bench is near the north entrance, past the fountain on the left. Look for the oak tree. — A sentence like this is often more useful than GPS alone."
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-300 resize-none focus:outline-none focus:ring-2 focus:ring-stone-200 leading-relaxed"
              />
            </div>

            <button
              onClick={saveDetails}
              className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-stone-700 transition-colors"
            >
              {saved ? '✓ Saved' : 'Save Details'}
            </button>
          </div>

          {/* Share this location */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">
              Share This Location
            </h3>
            <p className="text-xs text-stone-400 mb-5 leading-relaxed">
              Send these to family members who want to visit. One tap opens the exact spot in their preferred maps app — no searching, no guessing.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <a href={googleMapsUrl!} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold text-stone-600 border border-stone-200 px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors">
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                  <circle cx="8" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M8 2C5.24 2 3 4.24 3 7c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                Open in Google Maps
              </a>
              <a href={appleMapsUrl!} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold text-stone-600 border border-stone-200 px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors">
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                  <circle cx="8" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M8 2C5.24 2 3 4.24 3 7c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                Open in Apple Maps
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              <CopyButton value={coordsString} label="Copy coordinates" />
              <CopyButton value={shareLink}    label="Copy share link" />
            </div>

            <p className="text-[11px] text-stone-300 mt-4 leading-relaxed">
              Tip: paste the share link into a text message, email, or the family guestbook — anyone who taps it goes straight to the pinned spot.
            </p>
          </div>
        </>
      )}

    </div>
  );
}
