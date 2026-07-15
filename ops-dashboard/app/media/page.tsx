'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

type MediaType = 'PHOTO' | 'VIDEO' | 'AUDIO';
type ModerationStatus = 'PENDING' | 'APPROVED' | 'FLAGGED' | 'REJECTED';

interface MediaAsset {
  id: string;
  type: MediaType;
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  size_bytes: number | null;
  sort_order: number;
  moderation_status: ModerationStatus;
  profile: {
    id: string;
    full_name: string;
    short_id: string;
  };
}

function fmtBytes(n: number | null) {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_LABELS: Record<MediaType, string> = {
  PHOTO: 'Photo',
  VIDEO: 'Video',
  AUDIO: 'Audio',
};

const TYPE_BADGE: Record<MediaType, string> = {
  PHOTO: 'bg-sky-100 text-sky-700',
  VIDEO: 'bg-violet-100 text-violet-700',
  AUDIO: 'bg-amber-100 text-amber-700',
};

const MOD_BADGE: Record<ModerationStatus, string> = {
  PENDING:  'bg-stone-100 text-stone-400',
  APPROVED: 'bg-green-100 text-green-700',
  FLAGGED:  'bg-amber-100 text-amber-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function MediaPage() {
  const [assets, setAssets]     = useState<MediaAsset[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [filter, setFilter]     = useState<MediaType | 'ALL'>('ALL');
  const [search, setSearch]     = useState('');
  const [preview, setPreview]   = useState<MediaAsset | null>(null);

  useEffect(() => {
    fetch('/api/gw/admin/media')
      .then(r => r.json())
      .then(d => setAssets(d.assets ?? []))
      .catch(() => setError('Could not reach the backend.'))
      .finally(() => setLoading(false));
  }, []);

  const visible = assets.filter(a => {
    if (filter !== 'ALL' && a.type !== filter as MediaType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.profile.full_name.toLowerCase().includes(q) ||
        (a.caption ?? '').toLowerCase().includes(q) ||
        a.profile.short_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    ALL:   assets.length,
    PHOTO: assets.filter(a => a.type === 'PHOTO').length,
    VIDEO: assets.filter(a => a.type === 'VIDEO').length,
    AUDIO: assets.filter(a => a.type === 'AUDIO').length,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-900">Media Uploads</h1>
          <p className="text-sm text-stone-400 mt-0.5">All photos and videos attached to memorial profiles</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-1 bg-white border border-stone-200 rounded-xl p-1">
            {(['ALL', 'PHOTO', 'VIDEO', 'AUDIO'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  filter === t
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:text-stone-800',
                ].join(' ')}
              >
                {t === 'ALL' ? 'All' : TYPE_LABELS[t as MediaType]}
                <span className="ml-1.5 opacity-60">{counts[t]}</span>
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search by name or caption…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] max-w-xs text-sm border border-stone-200 rounded-xl px-3 py-2 bg-white text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center h-64 text-stone-400 text-sm">Loading…</div>
        )}
        {error && (
          <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
        )}
        {!loading && !error && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-stone-400 text-sm gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 opacity-30"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 6.75h15M12 3v.75" /></svg>
            No media found
          </div>
        )}

        {/* Grid */}
        {!loading && !error && visible.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {visible.map(asset => (
              <div
                key={asset.id}
                onClick={() => setPreview(asset)}
                className="group cursor-pointer bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative aspect-square bg-stone-100">
                  {asset.type === 'PHOTO' && (
                    <img
                      src={asset.thumbnail_url ?? asset.url}
                      alt={asset.caption ?? asset.profile.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {asset.type === 'VIDEO' && (
                    asset.thumbnail_url
                      ? <img src={asset.thumbnail_url} alt="Video thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center bg-stone-900">
                          <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10 opacity-70"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                  )}
                  {asset.type === 'AUDIO' && (
                    <div className="w-full h-full flex items-center justify-center bg-amber-50">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-amber-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>
                    </div>
                  )}

                  <span className={`absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TYPE_BADGE[asset.type]}`}>
                    {TYPE_LABELS[asset.type]}
                  </span>
                  <span className={`absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${MOD_BADGE[asset.moderation_status]}`}>
                    {asset.moderation_status}
                  </span>
                </div>

                {/* Meta */}
                <div className="p-3">
                  <p className="text-xs font-medium text-stone-800 truncate">{asset.profile.full_name}</p>
                  {asset.caption && (
                    <p className="text-[11px] text-stone-400 truncate mt-0.5">{asset.caption}</p>
                  )}
                  <p className="text-[10px] text-stone-300 mt-1">{fmtBytes(asset.size_bytes)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Media */}
            <div className="bg-stone-950 flex items-center justify-center min-h-[320px]">
              {preview.type === 'PHOTO' && (
                <img
                  src={preview.url}
                  alt={preview.caption ?? preview.profile.full_name}
                  className="max-h-[60vh] max-w-full object-contain"
                />
              )}
              {preview.type === 'VIDEO' && (
                <video src={preview.url} controls className="max-h-[60vh] max-w-full" />
              )}
              {preview.type === 'AUDIO' && (
                <div className="p-10 flex flex-col items-center gap-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-16 h-16 opacity-40"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>
                  <audio src={preview.url} controls className="w-full" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-stone-800">{preview.profile.full_name}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {preview.profile.short_id} · {TYPE_LABELS[preview.type]} · {fmtBytes(preview.size_bytes)}
                </p>
                <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${MOD_BADGE[preview.moderation_status]}`}>
                  {preview.moderation_status}
                </span>
                {preview.caption && (
                  <p className="text-sm text-stone-600 mt-2 italic">"{preview.caption}"</p>
                )}
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-3 text-xs text-stone-500 underline underline-offset-2 hover:text-stone-800"
                >
                  Open original ↗
                </a>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="shrink-0 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
