'use client';
import { ProfileDraft } from '@/types/profile';

interface Props {
  draft: ProfileDraft;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ProfilePreview({ draft }: Props) {
  const hasHero = draft.name || draft.epitaph || draft.dateOfBirth || draft.portraitPreview;
  const hasTimeline = draft.timeline.length > 0;

  if (!hasHero) {
    return (
      <div className="flex items-center justify-center h-64 text-center px-6">
        <p className="text-stone-400 text-xs leading-relaxed">
          Fill in Step 1 to see your profile preview here.
        </p>
      </div>
    );
  }

  return (
    <div className="font-sans text-stone-800 antialiased text-[14px]">
      {/* Hero */}
      <div className="bg-stone-900 text-white px-5 pt-10 pb-8 text-center">
        <div className="mx-auto w-20 h-20 rounded-full overflow-hidden ring-1 ring-stone-600 ring-offset-2 ring-offset-stone-900 mb-4 shadow-lg bg-stone-700">
          {draft.portraitPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.portraitPreview} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-500 text-xl">
              {draft.name ? draft.name[0].toUpperCase() : '?'}
            </div>
          )}
        </div>

        <h1 className="text-xl font-semibold tracking-wide leading-tight mb-1.5"
            style={{ fontFamily: 'var(--font-playfair)' }}>
          {draft.name || <span className="text-stone-600 italic">Full Name</span>}
        </h1>

        <p className="text-stone-400 text-[10px] tracking-[0.15em] uppercase mb-4">
          {draft.dateOfBirth || draft.dateOfDeath
            ? `${formatDate(draft.dateOfBirth)} — ${formatDate(draft.dateOfDeath)}`
            : <span className="text-stone-600 italic">Dates</span>}
        </p>

        {draft.epitaph ? (
          <blockquote className="text-stone-300 text-xs italic leading-relaxed border-l border-stone-600 pl-3 text-left max-w-[230px] mx-auto"
                      style={{ fontFamily: 'var(--font-playfair)' }}>
            &ldquo;{draft.epitaph}&rdquo;
          </blockquote>
        ) : (
          <p className="text-stone-600 text-xs italic">Epitaph will appear here…</p>
        )}
      </div>

      {/* Timeline */}
      {hasTimeline && (
        <div className="px-5 py-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-stone-400 mb-5">Life Journey</p>
          <div className="relative border-l border-stone-200 ml-[3px]">
            {draft.timeline.map(m => (
              <div key={m.id} className="relative pl-5 pb-6 last:pb-0">
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-stone-300 border-2 border-stone-50 shadow-sm" />
                <p className="text-[9px] font-semibold tracking-widest text-stone-400 uppercase">{m.year || '—'}</p>
                <h3 className="text-xs font-semibold text-stone-800 mt-0.5">{m.title || <span className="italic text-stone-400">Untitled</span>}</h3>
                {m.description && <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">{m.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery preview */}
      {draft.gallery.length > 0 && (
        <div className="px-5 pb-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-stone-400 mb-3">Photos</p>
          <div className="grid grid-cols-3 gap-1.5">
            {draft.gallery.slice(0, 6).map(item => (
              <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy badge */}
      {draft.isPrivate && (
        <div className="px-5 pb-6">
          <div className="flex items-center gap-2 bg-stone-100 rounded-xl px-3 py-2.5">
            <span className="text-stone-500 text-xs">🔒</span>
            <p className="text-xs text-stone-600 font-medium">Pin-protected profile</p>
          </div>
        </div>
      )}
    </div>
  );
}
