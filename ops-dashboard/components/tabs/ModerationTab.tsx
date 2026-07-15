'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';

const STORAGE_TOTAL_GB = 500;

// ── Types ─────────────────────────────────────────────────────────────────────

type MediaType       = 'PHOTO' | 'VIDEO' | 'AUDIO';
type ModerationStatus = 'PENDING' | 'APPROVED' | 'FLAGGED' | 'REJECTED';

interface RealAsset {
  id:               string;
  type:             MediaType;
  url:              string;
  thumbnailUrl:     string | null;
  sizeBytes:        number;
  moderationStatus: ModerationStatus;
  createdAt:        string;
  profileId:        string;
  profileShortId:   string;
  profileName:      string;
  plaqueStatus:     string;
  ownerId:          string | null;
  ownerName:        string | null;
  ownerEmail:       string | null;
}

interface BannedEntity {
  id:       string;
  type:     'USER' | 'IP';
  value:    string;
  reason:   string;
  bannedAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtBytes(b: number) {
  if (b >= 1_000_000_000) return `${(b / 1_000_000_000).toFixed(1)} GB`;
  if (b >= 1_000_000)     return `${(b / 1_000_000).toFixed(1)} MB`;
  return `${(b / 1_000).toFixed(0)} KB`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fileName(url: string) {
  try { return decodeURIComponent(new URL(url).pathname.split('/').pop() ?? url); }
  catch { return url.split('/').pop() ?? url; }
}

function hasActivatedQR(asset: RealAsset) {
  return asset.plaqueStatus !== 'ORDER_RECEIVED';
}

function isStorageHog(asset: RealAsset) {
  return asset.type === 'VIDEO' && asset.sizeBytes > 50_000_000;
}

function isFlagged(asset: RealAsset) {
  return asset.moderationStatus === 'FLAGGED' || isStorageHog(asset) || !hasActivatedQR(asset);
}

// ── Static maps ───────────────────────────────────────────────────────────────

const TYPE_STYLE: Record<MediaType, { bg: string; text: string; icon: React.ReactNode }> = {
  PHOTO: {
    bg: 'bg-indigo-50', text: 'text-indigo-700',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>,
  },
  VIDEO: {
    bg: 'bg-violet-50', text: 'text-violet-700',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>,
  },
  AUDIO: {
    bg: 'bg-emerald-50', text: 'text-emerald-700',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>,
  },
};

const STATUS_STYLE: Record<ModerationStatus, { bg: string; text: string; dot: string }> = {
  PENDING:  { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'   },
  APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  FLAGGED:  { bg: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-400'  },
  REJECTED: { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400'     },
};

// ── Thumbnail card ────────────────────────────────────────────────────────────

function Thumbnail({
  asset, selected, checked, onCheck, onClick,
}: {
  asset:    RealAsset;
  selected: boolean;
  checked:  boolean;
  onCheck:  (id: string) => void;
  onClick:  (asset: RealAsset) => void;
}) {
  const t          = TYPE_STYLE[asset.type];
  const hog        = isStorageHog(asset);
  const unlinked   = !hasActivatedQR(asset);
  const aiFlag     = asset.moderationStatus === 'FLAGGED';
  const hasFlag    = hog || unlinked || aiFlag;

  return (
    <div
      onClick={() => onClick(asset)}
      className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
        selected ? 'border-stone-900 shadow-md' : 'border-transparent hover:border-stone-200'
      }`}
    >
      <div className={`${t.bg} aspect-square flex flex-col items-center justify-center gap-1.5 relative`}>
        {asset.thumbnailUrl ? (
          <img src={asset.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            <span className={t.text}>{t.icon}</span>
            <span className={`text-[9px] font-bold uppercase tracking-wide ${t.text}`}>{asset.type}</span>
          </>
        )}

        {hasFlag && (
          <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5 items-end">
            {hog      && <span className="text-[8px] font-bold bg-red-500 text-white px-1 py-0.5 rounded-md">LARGE</span>}
            {unlinked && <span className="text-[8px] font-bold bg-orange-500 text-white px-1 py-0.5 rounded-md">UNLINKED</span>}
            {aiFlag   && <span className="text-[8px] font-bold bg-pink-500 text-white px-1 py-0.5 rounded-md">AI:FLAGGED</span>}
          </div>
        )}

        <span className={`absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full ${STATUS_STYLE[asset.moderationStatus].dot}`} />
      </div>

      <div className="bg-white px-2 py-1.5">
        <p className="text-[10px] font-medium text-stone-700 truncate">{fileName(asset.url)}</p>
        <p className="text-[9px] text-stone-400">{asset.sizeBytes > 0 ? fmtBytes(asset.sizeBytes) : '—'}</p>
      </div>

      <div
        className="absolute top-1.5 left-1.5"
        onClick={e => { e.stopPropagation(); onCheck(asset.id); }}
      >
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
          checked ? 'bg-stone-900 border-stone-900' : 'bg-white/80 border-stone-300'
        }`}>
          {checked && (
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Details panel ─────────────────────────────────────────────────────────────

function DetailsPanel({
  asset, checkedCount, onApprove, onReject,
}: {
  asset:        RealAsset | null;
  checkedCount: number;
  onApprove:    () => void;
  onReject:     () => void;
}) {
  if (!asset && checkedCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-stone-300 gap-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <p className="text-xs text-stone-400 text-center">Select a file to preview details<br />or check boxes for batch actions</p>
      </div>
    );
  }

  if (checkedCount > 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center">
          <span className="text-2xl font-bold text-stone-700">{checkedCount}</span>
        </div>
        <p className="text-sm font-semibold text-stone-700">{checkedCount} files selected</p>
        <p className="text-xs text-stone-400 text-center">Apply an action to all selected files at once.</p>
        <div className="flex flex-col gap-2 w-full">
          <button onClick={onApprove} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors">Approve Selected</button>
          <button onClick={onReject}  className="w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">Reject / Delete Selected</button>
        </div>
      </div>
    );
  }

  if (!asset) return null;

  const t        = TYPE_STYLE[asset.type];
  const hog      = isStorageHog(asset);
  const unlinked = !hasActivatedQR(asset);
  const aiFlag   = asset.moderationStatus === 'FLAGGED';

  return (
    <div className="p-5 flex flex-col gap-4 h-full overflow-y-auto">
      <div className={`${t.bg} rounded-xl aspect-video flex flex-col items-center justify-center gap-2 relative overflow-hidden`}>
        {asset.thumbnailUrl
          ? <img src={asset.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          : <><span className={`${t.text} scale-150`}>{t.icon}</span><span className={`text-[10px] font-bold uppercase tracking-widest ${t.text}`}>{asset.type}</span></>
        }
      </div>

      <div>
        <p className="text-sm font-bold text-stone-800 break-all">{fileName(asset.url)}</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {asset.sizeBytes > 0 ? fmtBytes(asset.sizeBytes) : '—'} · Uploaded {fmtDate(asset.createdAt)}
        </p>
      </div>

      {(hog || unlinked || aiFlag) && (
        <div className="flex flex-wrap gap-1.5">
          {hog      && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">⚠ Storage Hog ({fmtBytes(asset.sizeBytes)})</span>}
          {unlinked && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">⚠ No Activated QR</span>}
          {aiFlag   && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">AI: FLAGGED</span>}
        </div>
      )}

      <div className="space-y-2 text-xs">
        {[
          { label: 'Profile',   value: asset.profileName },
          { label: 'Short ID',  value: asset.profileShortId, mono: true },
          { label: 'Account',   value: asset.ownerName  ?? '—' },
          { label: 'Email',     value: asset.ownerEmail ?? '—' },
          { label: 'QR Active', value: hasActivatedQR(asset) ? 'Yes' : 'No — profile unlinked' },
        ].map(r => (
          <div key={r.label} className="flex gap-2">
            <span className="text-stone-400 w-20 shrink-0">{r.label}</span>
            <span className={`text-stone-700 font-medium ${r.mono ? 'font-mono text-indigo-600' : ''}`}>{r.value}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-stone-100" />

      {asset.moderationStatus === 'PENDING' || asset.moderationStatus === 'FLAGGED' ? (
        <div className="flex flex-col gap-2">
          <button onClick={onApprove} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors">Approve</button>
          <button onClick={onReject}  className="w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">Reject / Delete</button>
          {asset.ownerId && (
            <a href={`/accounts?shortId=${asset.profileShortId}`} className="w-full py-2 rounded-xl bg-stone-100 text-stone-700 text-sm font-semibold text-center hover:bg-stone-200 transition-colors">View Account ↗</a>
          )}
        </div>
      ) : (
        <div className={`px-3 py-2 rounded-xl text-xs font-semibold ${STATUS_STYLE[asset.moderationStatus].bg} ${STATUS_STYLE[asset.moderationStatus].text}`}>
          {asset.moderationStatus === 'APPROVED' ? '✓ Approved' : '✕ Rejected'}
        </div>
      )}
    </div>
  );
}

// ── Media Upload Queue ────────────────────────────────────────────────────────

function MediaQueueTab({
  assets, onAct,
}: {
  assets: RealAsset[];
  onAct:  (ids: string[], next: ModerationStatus) => void;
}) {
  const [selected,     setSelected]     = useState<RealAsset | null>(null);
  const [checked,      setChecked]      = useState<Set<string>>(new Set());
  const [typeFilter,   setTypeFilter]   = useState<MediaType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<ModerationStatus | 'ALL'>('PENDING');
  const [sizeFilter,   setSizeFilter]   = useState<'ALL' | 'LARGE'>('ALL');

  const filtered = useMemo(() => assets.filter(a => {
    if (typeFilter   !== 'ALL' && a.type             !== typeFilter)   return false;
    if (statusFilter !== 'ALL' && a.moderationStatus !== statusFilter) return false;
    if (sizeFilter === 'LARGE' && a.sizeBytes < 50_000_000)            return false;
    return true;
  }), [assets, typeFilter, statusFilter, sizeFilter]);

  function act(ids: string[], next: ModerationStatus) {
    onAct(ids, next);
    setChecked(new Set());
    if (selected && ids.includes(selected.id)) {
      setSelected(prev => prev ? { ...prev, moderationStatus: next } : null);
    }
  }

  function toggleCheck(id: string) {
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll() {
    setChecked(checked.size === filtered.length ? new Set() : new Set(filtered.map(a => a.id)));
  }

  const pendingCount = assets.filter(a => a.moderationStatus === 'PENDING').length;

  return (
    <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Media Upload Queue</p>
            <p className="text-sm font-semibold text-stone-800">{pendingCount} pending review</p>
          </div>
          {checked.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">{checked.size} selected</span>
              <button onClick={() => act([...checked], 'APPROVED')} className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">Approve Selected</button>
              <button onClick={() => act([...checked], 'REJECTED')} className="text-xs font-semibold px-3 py-1.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">Reject Selected</button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 bg-stone-50 rounded-xl p-1">
            {(['ALL', 'PHOTO', 'VIDEO', 'AUDIO'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${typeFilter === t ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}>
                {t === 'ALL' ? 'All Types' : t}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-stone-50 rounded-xl p-1">
            {(['ALL', 'PENDING', 'FLAGGED', 'APPROVED', 'REJECTED'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${statusFilter === s ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}>
                {s === 'ALL' ? 'All Status' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-stone-50 rounded-xl p-1">
            {([['ALL', 'All Sizes'], ['LARGE', '50 MB+']] as const).map(([v, l]) => (
              <button key={v} onClick={() => setSizeFilter(v)} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${sizeFilter === v ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}>{l}</button>
            ))}
          </div>
          <button onClick={toggleAll} className="ml-auto text-[10px] font-semibold text-stone-500 hover:text-stone-800 px-2.5 py-1 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors">
            {checked.size === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      <div className="flex" style={{ height: 520 }}>
        <div className="flex-1 overflow-y-auto p-4 border-r border-stone-100">
          {assets.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-16">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-16">No files match your filters.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map(a => (
                <Thumbnail
                  key={a.id}
                  asset={a}
                  selected={selected?.id === a.id}
                  checked={checked.has(a.id)}
                  onCheck={toggleCheck}
                  onClick={setSelected}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-72 shrink-0">
          <DetailsPanel
            asset={checked.size === 1 ? assets.find(a => a.id === [...checked][0]) ?? selected : checked.size > 1 ? null : selected}
            checkedCount={checked.size}
            onApprove={() => {
              if (checked.size > 0) act([...checked], 'APPROVED');
              else if (selected)    act([selected.id], 'APPROVED');
            }}
            onReject={() => {
              if (checked.size > 0) act([...checked], 'REJECTED');
              else if (selected)    act([selected.id], 'REJECTED');
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Flagged & High-Risk queue ─────────────────────────────────────────────────

function FlaggedQueue({ assets }: { assets: RealAsset[] }) {
  const flagged = useMemo(() => assets.filter(isFlagged), [assets]);

  return (
    <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Flagged & High-Risk</p>
          <p className="text-sm font-semibold text-stone-800">{flagged.length} auto-flagged uploads</p>
        </div>
        <div className="flex gap-2 text-[10px]">
          {[
            { label: 'Storage Hog', count: assets.filter(isStorageHog).length,                           bg: 'bg-red-100',    text: 'text-red-700'    },
            { label: 'Unlinked',    count: assets.filter(a => !hasActivatedQR(a)).length,                 bg: 'bg-orange-100', text: 'text-orange-700' },
            { label: 'AI Flagged',  count: assets.filter(a => a.moderationStatus === 'FLAGGED').length,   bg: 'bg-pink-100',   text: 'text-pink-700'   },
          ].map(b => (
            <span key={b.label} className={`font-semibold px-2 py-1 rounded-full ${b.bg} ${b.text}`}>{b.count} {b.label}</span>
          ))}
        </div>
      </div>

      <div className="px-5 py-3 space-y-2 bg-stone-50/50 border-b border-stone-100">
        {[
          { color: 'bg-red-500',    label: 'Storage Hog',  desc: 'Videos exceeding 50 MB — verify the account tier justifies the storage cost.' },
          { color: 'bg-orange-500', label: 'Unlinked',     desc: 'Media on profiles with no activated QR plaque — possible bot or free-storage abuse.' },
          { color: 'bg-pink-500',   label: 'AI Flagged',   desc: 'Flagged by automated vision scan. Requires manual review.' },
        ].map(b => (
          <div key={b.label} className="flex items-start gap-2 text-[10px] text-stone-600">
            <span className={`w-2 h-2 rounded-full ${b.color} mt-1 shrink-0`} />
            <span><strong>{b.label}:</strong> {b.desc}</span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              {['File', 'Type', 'Size', 'Profile', 'Account', 'Flags', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {flagged.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-stone-400">No flagged assets.</td></tr>
            )}
            {flagged.map(a => {
              const t    = TYPE_STYLE[a.type];
              const s    = STATUS_STYLE[a.moderationStatus];
              const hog  = isStorageHog(a);
              const unl  = !hasActivatedQR(a);
              const aiF  = a.moderationStatus === 'FLAGGED';
              return (
                <tr key={a.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-4 py-3 max-w-[160px]">
                    <p className="text-xs font-medium text-stone-700 truncate">{fileName(a.url)}</p>
                    <p className="text-[10px] text-stone-400">{fmtDate(a.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.bg} ${t.text}`}>{a.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${hog ? 'text-red-600' : 'text-stone-700'}`}>{a.sizeBytes > 0 ? fmtBytes(a.sizeBytes) : '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-stone-700 max-w-[140px] truncate">{a.profileName}</p>
                    <code className="text-[9px] font-mono text-stone-400">{a.profileShortId}</code>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-stone-700 whitespace-nowrap">{a.ownerName ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {hog  && <span className="text-[8px] font-bold bg-red-100 text-red-700 px-1 py-0.5 rounded">HOG</span>}
                      {unl  && <span className="text-[8px] font-bold bg-orange-100 text-orange-700 px-1 py-0.5 rounded">UNLINKED</span>}
                      {aiF  && <span className="text-[8px] font-bold bg-pink-100 text-pink-700 px-1 py-0.5 rounded">AI</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {a.moderationStatus.charAt(0) + a.moderationStatus.slice(1).toLowerCase()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-4 bg-gradient-to-r from-violet-50 to-indigo-50 border-t border-stone-100 flex items-center gap-4">
        <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-violet-600">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-violet-800">AI Vision Integration — Coming Soon</p>
          <p className="text-[10px] text-violet-600 mt-0.5">Connect AWS Rekognition or similar to auto-approve safe images and route NSFW/violent content directly into this queue.</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-violet-100 text-violet-600 whitespace-nowrap">Roadmap</span>
      </div>
    </div>
  );
}

// ── Storage Insights ──────────────────────────────────────────────────────────

function StorageInsights({ assets }: { assets: RealAsset[] }) {
  const usedBytes     = assets.reduce((s, a) => s + a.sizeBytes, 0);
  const usedGB        = usedBytes / 1_000_000_000;
  const usedPct       = Math.min((usedGB / STORAGE_TOTAL_GB) * 100, 100);
  const r             = 54;
  const circumference = 2 * Math.PI * r;
  const dashOffset    = circumference * (1 - usedPct / 100);
  const burnRateDaysLeft = Math.round((STORAGE_TOTAL_GB - usedGB) / 0.51);

  const totalBytes = assets.reduce((s, a) => s + a.sizeBytes, 0);

  const accountStorageMap = new Map<string, { name: string; email: string; usedBytes: number }>();
  assets.forEach(a => {
    if (!a.ownerId) return;
    const cur = accountStorageMap.get(a.ownerId);
    if (cur) { cur.usedBytes += a.sizeBytes; }
    else { accountStorageMap.set(a.ownerId, { name: a.ownerName ?? '—', email: a.ownerEmail ?? '—', usedBytes: a.sizeBytes }); }
  });
  const accountStorage = [...accountStorageMap.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.usedBytes - a.usedBytes);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Storage ring */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-6 flex flex-col items-center gap-3 col-span-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 self-start">Total Storage</p>
          <div className="relative">
            <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
              <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
              <circle
                cx="60" cy="60" r={r} fill="none"
                stroke={usedPct > 85 ? '#ef4444' : usedPct > 65 ? '#f59e0b' : '#1c1917'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-bold text-stone-900">{usedPct.toFixed(0)}%</p>
              <p className="text-[9px] text-stone-400">used</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-stone-800">{usedGB.toFixed(1)} GB <span className="text-stone-400 font-normal">/ {STORAGE_TOTAL_GB} GB</span></p>
            <p className="text-[10px] text-stone-400 mt-0.5">{(STORAGE_TOTAL_GB - usedGB).toFixed(1)} GB remaining</p>
          </div>
        </div>

        {/* Burn rate + stats */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Burn Rate',       value: '~0.51 GB/day',           sub: 'Based on last 30 days',     accent: 'text-stone-900' },
            { label: 'Days Until Full', value: `${burnRateDaysLeft}d`,    sub: 'At current upload rate',    accent: burnRateDaysLeft < 60 ? 'text-red-600' : 'text-stone-900' },
            { label: 'Total Assets',    value: assets.length,             sub: `${assets.filter(a => a.moderationStatus === 'APPROVED').length} approved`, accent: 'text-stone-900' },
            { label: 'Pending Review',  value: assets.filter(a => a.moderationStatus === 'PENDING').length, sub: 'Awaiting moderation', accent: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-stone-100 rounded-2xl shadow-sm px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
              <p className="text-[10px] text-stone-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Type breakdown */}
      <div className="bg-white border border-stone-100 rounded-2xl shadow-sm px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Storage by File Type</p>
        {(['VIDEO', 'PHOTO', 'AUDIO'] as MediaType[]).map(type => {
          const typeBytes = assets.filter(a => a.type === type).reduce((s, a) => s + a.sizeBytes, 0);
          const pct = totalBytes > 0 ? (typeBytes / totalBytes) * 100 : 0;
          const t   = TYPE_STYLE[type];
          return (
            <div key={type} className="flex items-center gap-3 mb-2">
              <span className={`text-[10px] font-bold w-10 ${t.text}`}>{type}</span>
              <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${type === 'VIDEO' ? 'bg-violet-500' : type === 'PHOTO' ? 'bg-indigo-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] text-stone-500 w-28 text-right">{fmtBytes(typeBytes)} ({pct.toFixed(0)}%)</span>
            </div>
          );
        })}
      </div>

      {/* Leaderboard */}
      <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Top Media Consumers</p>
          <p className="text-sm font-semibold text-stone-800">Storage used by account</p>
        </div>
        {accountStorage.length === 0 ? (
          <p className="px-5 py-6 text-xs text-stone-300 text-center">No data yet.</p>
        ) : (
          <div className="divide-y divide-stone-50">
            {accountStorage.slice(0, 10).map((acc, i) => {
              const pct = usedBytes > 0 ? (acc.usedBytes / usedBytes) * 100 : 0;
              return (
                <div key={acc.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="text-[11px] font-bold text-stone-300 w-5 text-center shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-stone-800">{acc.name}</p>
                    <p className="text-[10px] text-stone-400">{acc.email}</p>
                    <div className="mt-1.5 h-1.5 bg-stone-100 rounded-full overflow-hidden w-full max-w-[200px]">
                      <div className="h-full bg-stone-900 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-stone-800">{fmtBytes(acc.usedBytes)}</p>
                    <p className="text-[10px] text-stone-400">{pct.toFixed(1)}% of used</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Ban List (local-state placeholder — no DB table yet) ──────────────────────

const SEED_BANS: BannedEntity[] = [];

function BanList() {
  const [entities,  setEntities]  = useState<BannedEntity[]>(SEED_BANS);
  const [newValue,  setNewValue]  = useState('');
  const [newType,   setNewType]   = useState<'USER' | 'IP'>('USER');
  const [newReason, setNewReason] = useState('');

  function unban(id: string) { setEntities(prev => prev.filter(e => e.id !== id)); }

  function addBan() {
    if (!newValue.trim() || !newReason.trim()) return;
    setEntities(prev => [{
      id: `BAN-${String(prev.length + 1).padStart(2, '0')}`,
      type: newType, value: newValue.trim(), reason: newReason.trim(), bannedAt: new Date().toISOString(),
    }, ...prev]);
    setNewValue(''); setNewReason('');
  }

  return (
    <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Banned Entities</p>
        <p className="text-sm font-semibold text-stone-800">{entities.length} active ban{entities.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="px-5 py-4 bg-stone-50/50 border-b border-stone-100">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Add Ban</p>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 bg-white border border-stone-200 rounded-xl p-1">
            {(['USER', 'IP'] as const).map(t => (
              <button key={t} onClick={() => setNewType(t)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${newType === t ? 'bg-stone-900 text-white' : 'text-stone-400 hover:text-stone-700'}`}>{t}</button>
            ))}
          </div>
          <input type="text" placeholder={newType === 'IP' ? 'IP address' : 'Email / username'} value={newValue} onChange={e => setNewValue(e.target.value)} className="flex-1 min-w-[160px] text-xs border border-stone-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-stone-300" />
          <input type="text" placeholder="Reason for ban" value={newReason} onChange={e => setNewReason(e.target.value)} className="flex-1 min-w-[200px] text-xs border border-stone-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-stone-300" />
          <button onClick={addBan} disabled={!newValue.trim() || !newReason.trim()} className="text-xs font-semibold px-4 py-2 bg-stone-900 text-white rounded-xl disabled:opacity-30 hover:bg-stone-800 transition-colors">Ban</button>
        </div>
      </div>
      {entities.length === 0 ? (
        <p className="px-5 py-8 text-xs text-stone-300 text-center">No active bans.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                {['Type', 'Value', 'Reason', 'Banned', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {entities.map(e => (
                <tr key={e.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.type === 'IP' ? 'bg-rose-50 text-rose-700' : 'bg-orange-50 text-orange-700'}`}>{e.type}</span></td>
                  <td className="px-4 py-3"><code className="text-[11px] font-mono text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">{e.value}</code></td>
                  <td className="px-4 py-3"><p className="text-xs text-stone-600">{e.reason}</p></td>
                  <td className="px-4 py-3"><span className="text-xs text-stone-400 whitespace-nowrap">{fmtDate(e.bannedAt)}</span></td>
                  <td className="px-4 py-3"><button onClick={() => unban(e.id)} className="text-[10px] font-semibold text-stone-500 hover:text-red-600 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-red-50 transition-colors">Unban</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Root tab ──────────────────────────────────────────────────────────────────

type SubTab = 'queue' | 'flagged' | 'storage' | 'bans';

export default function ModerationTab() {
  const [sub,    setSub]    = useState<SubTab>('queue');
  const [assets, setAssets] = useState<RealAsset[]>([]);

  useEffect(() => {
    fetch('/api/gw/admin/media')
      .then(r => r.json())
      .then((d: { assets?: RealAsset[] }) => setAssets(d.assets ?? []))
      .catch(() => {});
  }, []);

  const handleAct = useCallback((ids: string[], next: ModerationStatus) => {
    // Optimistic update
    setAssets(prev => prev.map(a => ids.includes(a.id) ? { ...a, moderationStatus: next } : a));
    // Persist each in the background
    ids.forEach(id => {
      fetch(`/api/gw/admin/media/${id}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: next }),
      }).catch(() => {});
    });
  }, []);

  const pendingCount = assets.filter(a => a.moderationStatus === 'PENDING').length;
  const flaggedCount = assets.filter(isFlagged).length;

  const SUB_TABS: { key: SubTab; label: string; count?: number }[] = [
    { key: 'queue',   label: 'Media Upload Queue',  count: pendingCount },
    { key: 'flagged', label: 'Flagged & High-Risk', count: flaggedCount },
    { key: 'storage', label: 'Storage Insights' },
    { key: 'bans',    label: 'Ban List' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-white border border-stone-100 rounded-2xl p-1.5 shadow-sm w-fit">
        {SUB_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              sub === t.key ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${sub === t.key ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {sub === 'queue'   && <MediaQueueTab assets={assets} onAct={handleAct} />}
      {sub === 'flagged' && <FlaggedQueue assets={assets} />}
      {sub === 'storage' && <StorageInsights assets={assets} />}
      {sub === 'bans'    && <BanList />}
    </div>
  );
}
