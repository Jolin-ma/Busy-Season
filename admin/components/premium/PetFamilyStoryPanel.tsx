'use client';
import { useState, useRef } from 'react';

/* ─── Types ─────────────────────────────────────────────────────────── */
interface RoutineEntry  { id: string; time: string; description: string; }
interface Quirk         { id: string; text: string; }
interface FavoriteThing { id: string; label: string; preview?: string; }
interface BondCard      { id: string; memberName: string; relationship: string; story: string; photoPreview?: string; }
interface Adventure     { id: string; title: string; description: string; preview?: string; }

type Section = 'narrative' | 'rituals' | 'bond';

const uid = () => Math.random().toString(36).slice(2);

/* ─── Accordion ─────────────────────────────────────────────────────── */
function Accordion({ title, hint, children, defaultOpen = true }: {
  title: string; hint?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-stone-50 transition-colors"
      >
        <div>
          <p className="text-sm font-semibold text-stone-800">{title}</p>
          {hint && <p className="text-xs text-stone-400 mt-0.5">{hint}</p>}
        </div>
        <svg viewBox="0 0 20 20" fill="currentColor"
          className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

/* ─── Section 1: Core Narrative ─────────────────────────────────────── */
function NarrativeSection() {
  const [origin,      setOrigin]      = useState('');
  const [formalName,  setFormalName]  = useState('');
  const [nameStory,   setNameStory]   = useState('');
  const [nicknames,   setNicknames]   = useState('');
  const [personality, setPersonality] = useState('');
  const [traits,      setTraits]      = useState<string[]>([]);
  const traitOptions = ['Gentle soul', 'Chaotic troublemaker', 'Old wise spirit', 'Velcro companion', 'Playful goofball', 'Stoic guardian', 'Social butterfly', 'Independent explorer'];

  const toggleTrait = (t: string) =>
    setTraits(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  return (
    <div className="space-y-5">
      <Accordion title="The Origin Story" hint="How did they join the family?">
        <p className="text-xs text-stone-400 mb-3 leading-relaxed">
          Whether it was a detailed search, a surprise rescue, or a case of "they chose us" — this sets the emotional stage.
        </p>
        <textarea
          rows={5}
          value={origin}
          onChange={e => setOrigin(e.target.value)}
          placeholder="e.g. It was a rainy Tuesday in October when we walked into the shelter with absolutely no intention of coming home with anyone. Then we heard a small, insistent bark from the third kennel on the left..."
          className="w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-150 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-stone-200 leading-relaxed"
        />
        <p className="text-[11px] text-stone-300 mt-1.5 text-right">{origin.length} characters</p>
      </Accordion>

      <Accordion title="The Name Legend" hint="The story behind the name and every silly nickname">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-1.5">Formal Name</label>
              <input
                value={formalName}
                onChange={e => setFormalName(e.target.value)}
                placeholder="e.g. Sir Biscuit of Westwood"
                className="w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-150 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-1.5">Nicknames</label>
              <input
                value={nicknames}
                onChange={e => setNicknames(e.target.value)}
                placeholder="Biscuit, Bisc, The Biscman, Little Potato..."
                className="w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-150 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-1.5">The Inspiration</label>
            <textarea
              rows={3}
              value={nameStory}
              onChange={e => setNameStory(e.target.value)}
              placeholder="Why that name? Was it their colour, a beloved character, a family tradition, or just the first thing someone said when they walked in the door?"
              className="w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-150 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-stone-200 leading-relaxed"
            />
          </div>
        </div>
      </Accordion>

      <Accordion title='The "Personality Profile"' hint="Their distinct traits and spirit in a few words">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Quick Tags</label>
            <div className="flex flex-wrap gap-2">
              {traitOptions.map(t => (
                <button
                  key={t}
                  onClick={() => toggleTrait(t)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                    ${traits.includes(t)
                      ? 'bg-stone-900 border-stone-900 text-white'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-1.5">In Their Own Words (yours)</label>
            <textarea
              rows={4}
              value={personality}
              onChange={e => setPersonality(e.target.value)}
              placeholder="Describe their personality in a short vignette. What made them unmistakably, irreplaceably themselves? A single perfect paragraph is more powerful than a list."
              className="w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-150 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-stone-200 leading-relaxed"
            />
          </div>
        </div>
      </Accordion>

      <div className="flex justify-end">
        <button className="bg-stone-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-stone-700 transition-colors">
          Save Narrative
        </button>
      </div>
    </div>
  );
}

/* ─── Section 2: Daily Rituals & Quirks ─────────────────────────────── */
function RitualsSection() {
  const [routine,    setRoutine]    = useState<RoutineEntry[]>([
    { id: uid(), time: '7:00 AM', description: 'The morning face-lick wake-up call.' },
    { id: uid(), time: '3:00 PM', description: 'Guarding the sunbeam on the living room rug.' },
  ]);
  const [quirks,     setQuirks]     = useState<Quirk[]>([{ id: uid(), text: '' }]);
  const [favorites,  setFavorites]  = useState<FavoriteThing[]>([{ id: uid(), label: '' }]);
  const [mediaFiles, setMediaFiles] = useState<{ id: string; name: string; type: string }[]>([]);
  const mediaRef = useRef<HTMLInputElement>(null);

  const updateRoutine = (id: string, f: keyof RoutineEntry, v: string) =>
    setRoutine(p => p.map(r => r.id === id ? { ...r, [f]: v } : r));
  const updateQuirk = (id: string, v: string) =>
    setQuirks(p => p.map(q => q.id === id ? { ...q, text: v } : q));
  const updateFav = (id: string, v: string) =>
    setFavorites(p => p.map(f => f.id === id ? { ...f, label: v } : f));

  const loadFavPhoto = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = e => setFavorites(p => p.map(f => f.id === id ? { ...f, preview: e.target?.result as string } : f));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <Accordion title="The Daily Routine" hint="A charming timeline of their perfect day">
        <p className="text-xs text-stone-400 mb-4 leading-relaxed">
          Years down the road, it's the tiny specific habits we miss the most.
        </p>
        <div className="relative space-y-3 before:absolute before:left-[74px] before:top-0 before:bottom-0 before:w-px before:bg-stone-100">
          {routine.map(r => (
            <div key={r.id} className="flex gap-4 items-start group">
              <input
                value={r.time}
                onChange={e => updateRoutine(r.id, 'time', e.target.value)}
                placeholder="Time"
                className="w-16 text-xs font-semibold text-stone-500 text-right border-0 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5 shrink-0"
              />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-200 group-hover:bg-amber-400 transition-colors shrink-0 mt-1 z-10" />
              <input
                value={r.description}
                onChange={e => updateRoutine(r.id, 'description', e.target.value)}
                placeholder="What were they doing at this moment?"
                className="flex-1 text-sm text-stone-600 placeholder-stone-300 border-b border-stone-100 focus:outline-none focus:border-stone-300 bg-transparent pb-0.5"
              />
              <button onClick={() => setRoutine(p => p.filter(x => x.id !== r.id))}
                className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all p-1 shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setRoutine(p => [...p, { id: uid(), time: '', description: '' }])}
          className="mt-4 text-xs font-semibold text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-2.5 w-full hover:border-stone-400 transition-colors">
          + Add Moment
        </button>
      </Accordion>

      <Accordion title="Signature Quirks" hint="Their unique eccentricities — the things only your family noticed">
        <div className="space-y-2">
          {quirks.map(q => (
            <div key={q.id} className="flex gap-2 items-center group">
              <span className="text-stone-300 text-sm shrink-0">✦</span>
              <input
                value={q.text}
                onChange={e => updateQuirk(q.id, e.target.value)}
                placeholder="e.g. Barked at the Amazon driver but loved the mailman; did a full spin before lying down..."
                className="flex-1 text-sm text-stone-600 placeholder-stone-300 border-b border-stone-100 focus:outline-none focus:border-stone-300 bg-transparent py-1"
              />
              <button onClick={() => setQuirks(p => p.filter(x => x.id !== q.id))}
                className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setQuirks(p => [...p, { id: uid(), text: '' }])}
          className="mt-4 text-xs font-semibold text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-2.5 w-full hover:border-stone-400 transition-colors">
          + Add Quirk
        </button>
      </Accordion>

      <Accordion title="Favorite Things" hint="Parks, toys, treats, smells — the specific things they loved">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {favorites.map(f => (
            <div key={f.id} className="group flex gap-3 bg-stone-50 rounded-xl p-3 items-center">
              <label className="cursor-pointer w-12 h-12 rounded-lg overflow-hidden bg-stone-200 shrink-0 hover:opacity-80 transition-opacity flex items-center justify-center">
                {f.preview
                  ? <img src={f.preview} alt={f.label} className="w-full h-full object-cover" />
                  : <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-stone-400">
                      <path d="M4 5a2 2 0 012-2h1.586A2 2 0 019 3.586L10 4.586A2 2 0 0011.414 5H14a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                }
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const file = e.target.files?.[0]; if (file) loadFavPhoto(f.id, file); }} />
              </label>
              <input value={f.label} onChange={e => updateFav(f.id, e.target.value)}
                placeholder="e.g. The battered tennis ball"
                className="flex-1 text-xs font-medium text-stone-600 placeholder-stone-300 border-0 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5 min-w-0" />
              <button onClick={() => setFavorites(p => p.filter(x => x.id !== f.id))}
                className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setFavorites(p => [...p, { id: uid(), label: '' }])}
          className="text-xs font-semibold text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-2.5 w-full hover:border-stone-400 transition-colors">
          + Add Favourite
        </button>
      </Accordion>

      <Accordion title="Sound & Motion" hint="A bark, a purr, a tail wag — clips that bring them back">
        <p className="text-xs text-stone-400 mb-4 leading-relaxed">
          Hearing a specific happy purr or a distinctive bark adds an immense layer of comfort and memory preservation.
        </p>
        <div
          onClick={() => mediaRef.current?.click()}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-stone-200 p-8 text-center hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-2xl">🎙</span>
            <span className="text-2xl">🎬</span>
          </div>
          <p className="text-xs text-stone-400">Upload audio or video clips (.mp3, .wav, .mp4, .mov)</p>
          <input ref={mediaRef} type="file" multiple accept="audio/*,video/*" className="hidden"
            onChange={e => {
              if (!e.target.files) return;
              setMediaFiles(p => [...p, ...Array.from(e.target.files!).map(f => ({ id: uid(), name: f.name, type: f.type }))]);
            }} />
        </div>
        {mediaFiles.length > 0 && (
          <ul className="mt-3 space-y-2">
            {mediaFiles.map(f => (
              <li key={f.id} className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3">
                <span className="text-lg shrink-0">{f.type.startsWith('audio/') ? '🎙' : '🎬'}</span>
                <p className="flex-1 text-xs font-medium text-stone-600 truncate">{f.name}</p>
                <button onClick={() => setMediaFiles(p => p.filter(x => x.id !== f.id))}
                  className="text-stone-300 hover:text-red-400 transition-colors">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Accordion>
    </div>
  );
}

/* ─── Section 3: Family Bond & Adventures ───────────────────────────── */
function BondSection() {
  const [bonds,      setBonds]      = useState<BondCard[]>([{ id: uid(), memberName: '', relationship: '', story: '' }]);
  const [adventures, setAdventures] = useState<Adventure[]>([{ id: uid(), title: '', description: '' }]);
  const [comfort,    setComfort]    = useState('');

  const updateBond      = (id: string, f: keyof BondCard, v: string) =>
    setBonds(p => p.map(b => b.id === id ? { ...b, [f]: v } : b));
  const updateAdventure = (id: string, f: keyof Adventure, v: string) =>
    setAdventures(p => p.map(a => a.id === id ? { ...a, [f]: v } : a));

  const loadPhoto = (setter: typeof setBonds | typeof setAdventures, id: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => (setter as any)((p: any[]) => p.map((x: any) => x.id === id ? { ...x, photoPreview: e.target?.result, preview: e.target?.result } : x));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <Accordion title="The Partner in Crime" hint="How they connected with each member of the family">
        <p className="text-xs text-stone-400 mb-4 leading-relaxed">
          Pets often fill a different role for everyone — a protector for one, a couch-cuddle buddy for another.
        </p>
        <div className="space-y-4">
          {bonds.map(b => (
            <div key={b.id} className="flex gap-4 bg-stone-50 rounded-2xl p-4 group">
              <label className="cursor-pointer shrink-0 w-14 h-14 rounded-full overflow-hidden bg-stone-200 hover:opacity-80 transition-opacity flex items-center justify-center text-stone-400">
                {b.photoPreview
                  ? <img src={b.photoPreview} alt={b.memberName} className="w-full h-full object-cover" />
                  : <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                      <path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                }
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) loadPhoto(setBonds, b.id, f); }} />
              </label>
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={b.memberName} onChange={e => updateBond(b.id, 'memberName', e.target.value)}
                    placeholder="Family member's name"
                    className="text-sm font-semibold text-stone-700 placeholder-stone-300 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5" />
                  <input value={b.relationship} onChange={e => updateBond(b.id, 'relationship', e.target.value)}
                    placeholder="e.g. Their shadow, protector, cuddle buddy"
                    className="text-xs text-stone-400 placeholder-stone-300 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5" />
                </div>
                <textarea rows={2} value={b.story} onChange={e => updateBond(b.id, 'story', e.target.value)}
                  placeholder="Describe their unique dynamic — the rituals, the looks they'd share, the spot on the couch that was always theirs..."
                  className="w-full text-xs text-stone-500 placeholder-stone-300 border-0 focus:outline-none bg-transparent resize-none leading-relaxed" />
              </div>
              <button onClick={() => setBonds(p => p.filter(x => x.id !== b.id))}
                className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all self-start p-1">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setBonds(p => [...p, { id: uid(), memberName: '', relationship: '', story: '' }])}
          className="mt-3 text-xs font-semibold text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-2.5 w-full hover:border-stone-400 transition-colors">
          + Add Bond
        </button>
      </Accordion>

      <Accordion title="Greatest Adventures" hint="Road trips, firsts, long Sunday walks — the milestones you shared">
        <div className="space-y-4">
          {adventures.map(a => (
            <div key={a.id} className="group flex gap-4 bg-stone-50 rounded-2xl p-4">
              <label className="cursor-pointer shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-stone-200 hover:opacity-80 transition-opacity flex items-center justify-center">
                {a.preview
                  ? <img src={a.preview} alt={a.title} className="w-full h-full object-cover" />
                  : <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6 text-stone-400">
                      <path d="M4 5a2 2 0 012-2h1.586A2 2 0 019 3.586L10 4.586A2 2 0 0011.414 5H14a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                }
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) loadPhoto(setAdventures, a.id, f); }} />
              </label>
              <div className="flex-1 space-y-2">
                <input value={a.title} onChange={e => updateAdventure(a.id, 'title', e.target.value)}
                  placeholder="Adventure title (e.g. First time at the lake, Summer 2019)"
                  className="w-full text-sm font-semibold text-stone-700 placeholder-stone-300 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5" />
                <textarea rows={2} value={a.description} onChange={e => updateAdventure(a.id, 'description', e.target.value)}
                  placeholder="A short, vivid account. Two great sentences are worth more than a paragraph of generalities."
                  className="w-full text-xs text-stone-500 placeholder-stone-300 border-0 focus:outline-none bg-transparent resize-none leading-relaxed" />
              </div>
              <button onClick={() => setAdventures(p => p.filter(x => x.id !== a.id))}
                className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all self-start p-1">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setAdventures(p => [...p, { id: uid(), title: '', description: '' }])}
          className="mt-3 text-xs font-semibold text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-2.5 w-full hover:border-stone-400 transition-colors">
          + Add Adventure
        </button>
      </Accordion>

      <Accordion title="The Comfort Provider" hint="How they held space for the family during hard times">
        <p className="text-xs text-stone-400 mb-3 leading-relaxed">
          Pets have an uncanny ability to hold space when we need it most. Acknowledging this is one of the most powerful things you can write.
        </p>
        <textarea
          rows={5}
          value={comfort}
          onChange={e => setComfort(e.target.value)}
          placeholder="Write about a time — or a feeling — when they knew exactly what you needed without a word being said. The weight of a head on a lap. The way they'd find you in the dark."
          className="w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-150 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-stone-200 leading-relaxed"
        />
      </Accordion>

      <div className="flex justify-end">
        <button className="bg-stone-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-stone-700 transition-colors">
          Save Family Story
        </button>
      </div>
    </div>
  );
}

/* ─── Root ───────────────────────────────────────────────────────────── */
const SECTIONS: { id: Section; label: string; sub: string }[] = [
  { id: 'narrative', label: 'Core Narrative', sub: 'Origin, name, personality'     },
  { id: 'rituals',   label: 'Daily Rituals',  sub: 'Routine, quirks, favourites'   },
  { id: 'bond',      label: 'Family Bond',    sub: 'Partners, adventures, comfort' },
];

export default function PetFamilyStoryPanel() {
  const [active, setActive] = useState<Section>('narrative');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all
              ${active === s.id
                ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                : 'bg-white border-stone-100 text-stone-700 hover:border-stone-300'}`}
          >
            <span className="text-xs font-semibold block leading-tight mb-0.5">{s.label}</span>
            <span className={`text-[10px] leading-tight ${active === s.id ? 'text-stone-400' : 'text-stone-400'}`}>{s.sub}</span>
          </button>
        ))}
      </div>

      {active === 'narrative' && <NarrativeSection />}
      {active === 'rituals'   && <RitualsSection />}
      {active === 'bond'      && <BondSection />}
    </div>
  );
}
