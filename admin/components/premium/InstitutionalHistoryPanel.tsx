'use client';
import { useState, useRef, useCallback } from 'react';

/* ─── Types ─────────────────────────────────────────────────────────── */
interface TimelineEntry { id: string; year: string; title: string; description: string; }
interface PersonProfile { id: string; name: string; role: string; era: string; bio: string; photoPreview?: string; }
interface Artifact      { id: string; title: string; description: string; preview?: string; fileType: string; }
interface ThenNow       { id: string; label: string; thenPreview?: string; nowPreview?: string; }
interface Quote         { id: string; name: string; affiliation: string; quote: string; }

type Section = 'narrative' | 'media' | 'people' | 'archives';

const uid = () => Math.random().toString(36).slice(2);

/* ─── Accordion ─────────────────────────────────────────────────────── */
function Accordion({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
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

/* ─── Then & Now Slider ─────────────────────────────────────────────── */
function ThenNowSlider({ pair, onChange }: { pair: ThenNow; onChange: (p: ThenNow) => void }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  const thenInput  = useRef<HTMLInputElement>(null);
  const nowInput   = useRef<HTMLInputElement>(null);

  const loadPreview = (file: File, key: 'thenPreview' | 'nowPreview') => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => onChange({ ...pair, [key]: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const hasImages = pair.thenPreview && pair.nowPreview;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-stone-500">{pair.label}</p>
      {hasImages ? (
        <div
          ref={containerRef}
          className="relative h-52 rounded-xl overflow-hidden cursor-col-resize select-none"
          onMouseDown={() => { dragging.current = true; }}
          onMouseMove={e => { if (dragging.current) move(e.clientX); }}
          onMouseUp={() => { dragging.current = false; }}
          onMouseLeave={() => { dragging.current = false; }}
        >
          {/* Now (right) */}
          <img src={pair.nowPreview} alt="Now" className="absolute inset-0 w-full h-full object-cover" />
          {/* Then (left, clipped) */}
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
            <img src={pair.thenPreview} alt="Then" className="absolute inset-0 h-full object-cover" style={{ width: containerRef.current?.offsetWidth ?? 400 }} />
          </div>
          {/* Divider */}
          <div className="absolute inset-y-0 w-0.5 bg-white shadow-lg" style={{ left: `${pos}%` }}>
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-stone-500">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-md">THEN</div>
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-md">NOW</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {(['then', 'now'] as const).map(side => {
            const key   = side === 'then' ? 'thenPreview' : 'nowPreview';
            const ref   = side === 'then' ? thenInput : nowInput;
            const label = side === 'then' ? 'Then' : 'Now';
            const has   = !!pair[key];
            return (
              <label key={side} className="cursor-pointer relative rounded-xl border-2 border-dashed border-stone-200 h-32 flex flex-col items-center justify-center gap-1.5 hover:border-stone-400 transition-colors overflow-hidden">
                {has
                  ? <img src={pair[key]} alt={label} className="absolute inset-0 w-full h-full object-cover" />
                  : <>
                      <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6 text-stone-300">
                        <path d="M4 5a2 2 0 012-2h1.586A2 2 0 019 3.586L10 4.586A2 2 0 0011.414 5H14a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.4"/>
                        <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.4"/>
                      </svg>
                      <span className="text-[11px] text-stone-400 font-medium">{label}</span>
                    </>
                }
                <input ref={ref} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) loadPreview(f, key); }} />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Section: Narrative ────────────────────────────────────────────── */
function NarrativeSection() {
  const [genesis,     setGenesis]     = useState('');
  const [evolution,   setEvolution]   = useState('');
  const [missionThen, setMissionThen] = useState('');
  const [missionNow,  setMissionNow]  = useState('');

  return (
    <div className="space-y-5">
      <Accordion title="The Genesis Story" hint="Who founded it, what problem did they solve?">
        <p className="text-xs text-stone-400 mb-3 leading-relaxed">
          Who were the founders? What was the original vision, and what specific community need were they trying to solve when they laid the first stone?
        </p>
        <textarea
          rows={5}
          value={genesis}
          onChange={e => setGenesis(e.target.value)}
          placeholder="e.g. In the autumn of 1892, three civic leaders gathered in a parlour on King Street with a single resolve: to build a reading room accessible to every resident of the township..."
          className="w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-150 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-stone-300 leading-relaxed"
        />
        <p className="text-[11px] text-stone-300 mt-1.5 text-right">{genesis.length} characters</p>
      </Accordion>

      <Accordion title="The Evolution Arc" hint="From humble beginnings to modern presence">
        <p className="text-xs text-stone-400 mb-3 leading-relaxed">
          A brief narrative overview of how the institution transitioned through the decades.
        </p>
        <textarea
          rows={5}
          value={evolution}
          onChange={e => setEvolution(e.target.value)}
          placeholder="e.g. What began as a single reading room in a converted storefront grew over four generations into one of the region's most trusted civic anchors..."
          className="w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-150 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-stone-300 leading-relaxed"
        />
      </Accordion>

      <Accordion title="Mission & Philosophy — Then vs. Now" hint="How have core values endured or evolved?">
        <p className="text-xs text-stone-400 mb-4 leading-relaxed">
          A side-by-side look at how the mission statement and founding values compare to the institution's current direction.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Then</p>
            <textarea
              rows={5}
              value={missionThen}
              onChange={e => setMissionThen(e.target.value)}
              placeholder="Original founding mission or philosophy..."
              className="w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-150 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-stone-300 leading-relaxed"
            />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Now</p>
            <textarea
              rows={5}
              value={missionNow}
              onChange={e => setMissionNow(e.target.value)}
              placeholder="Current mission or values as they stand today..."
              className="w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-150 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-stone-300 leading-relaxed"
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

/* ─── Section: Media & Timeline ─────────────────────────────────────── */
function MediaSection() {
  const [entries, setEntries] = useState<TimelineEntry[]>([
    { id: uid(), year: '1892', title: 'Founded', description: 'The institution opens its doors for the first time.' },
    { id: uid(), year: '1934', title: 'First Expansion', description: 'New east wing constructed to accommodate growing community.' },
  ]);
  const [thenNow, setThenNow] = useState<ThenNow[]>([
    { id: uid(), label: 'Main Entrance' },
    { id: uid(), label: 'Interior Hall' },
  ]);
  const audioRef  = useRef<HTMLInputElement>(null);
  const videoRef  = useRef<HTMLInputElement>(null);
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [videoFiles, setVideoFiles] = useState<string[]>([]);

  const addEntry = () => setEntries(p => [...p, { id: uid(), year: '', title: '', description: '' }]);
  const removeEntry = (id: string) => setEntries(p => p.filter(e => e.id !== id));
  const updateEntry = (id: string, field: keyof TimelineEntry, val: string) =>
    setEntries(p => p.map(e => e.id === id ? { ...e, [field]: val } : e));

  return (
    <div className="space-y-5">
      {/* Timeline */}
      <Accordion title="Interactive Digital Timeline" hint="Chronological milestones, expansions, leadership eras">
        <div className="relative space-y-4 before:absolute before:left-[88px] before:top-0 before:bottom-0 before:w-px before:bg-stone-100">
          {entries.map((entry, i) => (
            <div key={entry.id} className="flex gap-4 items-start group">
              <input
                value={entry.year}
                onChange={e => updateEntry(entry.id, 'year', e.target.value)}
                placeholder="Year"
                className="w-20 text-sm font-semibold text-stone-600 text-right border-0 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5 shrink-0"
              />
              <div className="w-3 h-3 rounded-full bg-stone-300 group-hover:bg-stone-600 transition-colors shrink-0 mt-1.5 z-10" />
              <div className="flex-1 space-y-1.5">
                <input
                  value={entry.title}
                  onChange={e => updateEntry(entry.id, 'title', e.target.value)}
                  placeholder="Milestone title"
                  className="w-full text-sm font-semibold text-stone-700 placeholder-stone-300 border-0 border-b border-stone-100 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5"
                />
                <textarea
                  rows={2}
                  value={entry.description}
                  onChange={e => updateEntry(entry.id, 'description', e.target.value)}
                  placeholder="Brief description of this milestone..."
                  className="w-full text-xs text-stone-500 placeholder-stone-300 border-0 focus:outline-none bg-transparent resize-none leading-relaxed"
                />
              </div>
              <button onClick={() => removeEntry(entry.id)}
                className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all p-1 shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={addEntry}
          className="mt-5 text-xs font-semibold text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-2.5 w-full hover:border-stone-400 hover:text-stone-700 transition-colors">
          + Add Milestone
        </button>
      </Accordion>

      {/* Then & Now */}
      <Accordion title='"Then & Now" Visual Sliders' hint="Upload archival + modern photos — drag to compare">
        <div className="space-y-6">
          {thenNow.map(pair => (
            <ThenNowSlider key={pair.id} pair={pair}
              onChange={updated => setThenNow(p => p.map(x => x.id === pair.id ? updated : x))} />
          ))}
          <button
            onClick={() => setThenNow(p => [...p, { id: uid(), label: `Location ${p.length + 1}` }])}
            className="text-xs font-semibold text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-2.5 w-full hover:border-stone-400 hover:text-stone-700 transition-colors">
            + Add Comparison
          </button>
        </div>
      </Accordion>

      {/* Audio & Video */}
      <Accordion title="Audio & Video Archives" hint="Oral histories, speeches, vintage film clips">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Audio</p>
            <label className="cursor-pointer flex items-center gap-2.5 border border-dashed border-stone-200 rounded-xl p-4 hover:border-stone-400 transition-colors">
              <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-stone-300 shrink-0">
                <path d="M9 4a1 1 0 012 0v6a1 1 0 01-2 0V4zM7 7a3 3 0 006 0M10 14v2M8 16h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span className="text-xs text-stone-400">Upload audio clips (.mp3, .wav)</span>
              <input ref={audioRef} type="file" multiple accept="audio/*" className="hidden"
                onChange={e => setAudioFiles(p => [...p, ...Array.from(e.target.files ?? []).map(f => f.name)])} />
            </label>
            {audioFiles.length > 0 && (
              <ul className="mt-2 space-y-1">
                {audioFiles.map((name, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-1.5">
                    <span>🎙</span>{name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Video</p>
            <label className="cursor-pointer flex items-center gap-2.5 border border-dashed border-stone-200 rounded-xl p-4 hover:border-stone-400 transition-colors">
              <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-stone-300 shrink-0">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6l4-2v10l-4-2V6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs text-stone-400">Upload video clips (.mp4, .mov)</span>
              <input ref={videoRef} type="file" multiple accept="video/*" className="hidden"
                onChange={e => setVideoFiles(p => [...p, ...Array.from(e.target.files ?? []).map(f => f.name)])} />
            </label>
            {videoFiles.length > 0 && (
              <ul className="mt-2 space-y-1">
                {videoFiles.map((name, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-1.5">
                    <span>🎬</span>{name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Accordion>
    </div>
  );
}

/* ─── Section: People ───────────────────────────────────────────────── */
function PeopleSection() {
  const [leaders, setLeaders]  = useState<PersonProfile[]>([
    { id: uid(), name: '', role: 'Founder', era: '', bio: '' },
  ]);
  const [quotes, setQuotes]    = useState<Quote[]>([
    { id: uid(), name: '', affiliation: '', quote: '' },
  ]);
  const [heroes, setHeroes]    = useState<PersonProfile[]>([
    { id: uid(), name: '', role: '', era: '', bio: '' },
  ]);

  const updateLeader = (id: string, f: keyof PersonProfile, v: string) =>
    setLeaders(p => p.map(x => x.id === id ? { ...x, [f]: v } : x));
  const updateQuote  = (id: string, f: keyof Quote, v: string) =>
    setQuotes(p => p.map(x => x.id === id ? { ...x, [f]: v } : x));
  const updateHero   = (id: string, f: keyof PersonProfile, v: string) =>
    setHeroes(p => p.map(x => x.id === id ? { ...x, [f]: v } : x));

  const PersonCard = ({
    person, onChange, onRemove, onPhoto,
  }: {
    person: PersonProfile;
    onChange: (f: keyof PersonProfile, v: string) => void;
    onRemove: () => void;
    onPhoto: (file: File) => void;
  }) => {
    const photoRef = useRef<HTMLInputElement>(null);
    return (
      <div className="flex gap-4 bg-stone-50 rounded-2xl p-4 group">
        <div className="shrink-0">
          <label className="cursor-pointer block w-14 h-14 rounded-full overflow-hidden bg-stone-200 hover:opacity-80 transition-opacity">
            {person.photoPreview
              ? <img src={person.photoPreview} alt={person.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">Photo</div>
            }
            <input type="file" accept="image/*" className="hidden" ref={photoRef}
              onChange={e => { const f = e.target.files?.[0]; if (f) onPhoto(f); }} />
          </label>
        </div>
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input value={person.name} onChange={e => onChange('name', e.target.value)}
              placeholder="Full name" className="text-sm font-semibold text-stone-700 placeholder-stone-300 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5" />
            <input value={person.role} onChange={e => onChange('role', e.target.value)}
              placeholder="Title / role" className="text-xs text-stone-500 placeholder-stone-300 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5" />
          </div>
          <input value={person.era} onChange={e => onChange('era', e.target.value)}
            placeholder="Era (e.g. 1922–1941)" className="text-xs text-stone-400 placeholder-stone-300 border-b border-stone-100 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5 w-full" />
          <textarea rows={2} value={person.bio} onChange={e => onChange('bio', e.target.value)}
            placeholder="Brief biography or contribution..."
            className="w-full text-xs text-stone-500 placeholder-stone-300 border-0 focus:outline-none bg-transparent resize-none leading-relaxed" />
        </div>
        <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all self-start p-1">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
    );
  };

  const loadPhoto = (setter: (id: string, f: keyof PersonProfile, v: string) => void, id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = e => setter(id, 'photoPreview', e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      {/* Leadership */}
      <Accordion title="Profiles in Leadership & Vision" hint="Founders, presidents, directors who shaped the institution">
        <div className="space-y-3">
          {leaders.map(p => (
            <PersonCard key={p.id} person={p}
              onChange={(f, v) => updateLeader(p.id, f, v)}
              onRemove={() => setLeaders(prev => prev.filter(x => x.id !== p.id))}
              onPhoto={file => loadPhoto(updateLeader, p.id, file)} />
          ))}
        </div>
        <button onClick={() => setLeaders(prev => [...prev, { id: uid(), name: '', role: '', era: '', bio: '' }])}
          className="mt-3 text-xs font-semibold text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-2.5 w-full hover:border-stone-400 transition-colors">
          + Add Person
        </button>
      </Accordion>

      {/* Community Voices */}
      <Accordion title="Community & Alumni Voices" hint="Quotes and stories from people who experienced the institution">
        <div className="space-y-4">
          {quotes.map(q => (
            <div key={q.id} className="bg-stone-50 rounded-2xl p-4 space-y-2 group relative">
              <textarea rows={3} value={q.quote} onChange={e => updateQuote(q.id, 'quote', e.target.value)}
                placeholder='"Share a memory, an anecdote, or a reflection that captures what this place meant to the community..."'
                className="w-full text-sm text-stone-600 placeholder-stone-300 border-0 focus:outline-none bg-transparent resize-none leading-relaxed italic" />
              <div className="grid grid-cols-2 gap-2 border-t border-stone-100 pt-2">
                <input value={q.name} onChange={e => updateQuote(q.id, 'name', e.target.value)}
                  placeholder="Name" className="text-xs font-semibold text-stone-500 placeholder-stone-300 border-b border-stone-100 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5" />
                <input value={q.affiliation} onChange={e => updateQuote(q.id, 'affiliation', e.target.value)}
                  placeholder="Class of / Role / Year" className="text-xs text-stone-400 placeholder-stone-300 border-b border-stone-100 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5" />
              </div>
              <button onClick={() => setQuotes(prev => prev.filter(x => x.id !== q.id))}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setQuotes(p => [...p, { id: uid(), name: '', affiliation: '', quote: '' }])}
          className="mt-3 text-xs font-semibold text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-2.5 w-full hover:border-stone-400 transition-colors">
          + Add Voice
        </button>
      </Accordion>

      {/* Unsung Heroes */}
      <Accordion title="The Unsung Heroes" hint="Behind-the-scenes contributors who kept the institution running">
        <p className="text-xs text-stone-400 mb-4">Builders, staff, volunteers, and local community members whose contributions often go unrecorded.</p>
        <div className="space-y-3">
          {heroes.map(p => (
            <PersonCard key={p.id} person={p}
              onChange={(f, v) => updateHero(p.id, f, v)}
              onRemove={() => setHeroes(prev => prev.filter(x => x.id !== p.id))}
              onPhoto={file => loadPhoto(updateHero, p.id, file)} />
          ))}
        </div>
        <button onClick={() => setHeroes(prev => [...prev, { id: uid(), name: '', role: '', era: '', bio: '' }])}
          className="mt-3 text-xs font-semibold text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-2.5 w-full hover:border-stone-400 transition-colors">
          + Add Person
        </button>
      </Accordion>
    </div>
  );
}

/* ─── Section: Archives ─────────────────────────────────────────────── */
function ArchivesSection() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([
    { id: uid(), title: '', description: '', fileType: 'image' },
  ]);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [gallery, setGallery] = useState<{ id: string; name: string; preview?: string }[]>([]);

  const addArtifact = () => setArtifacts(p => [...p, { id: uid(), title: '', description: '', fileType: 'image' }]);
  const removeArtifact = (id: string) => setArtifacts(p => p.filter(a => a.id !== id));
  const updateArtifact = (id: string, f: keyof Artifact, v: string) =>
    setArtifacts(p => p.map(a => a.id === id ? { ...a, [f]: v } : a));

  const loadArtifactPhoto = (id: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => setArtifacts(p => p.map(a => a.id === id ? { ...a, preview: e.target?.result as string } : a));
    reader.readAsDataURL(file);
  };

  const addGalleryFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(f => {
      const entry = { id: uid(), name: f.name, preview: undefined as string | undefined };
      if (f.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => setGallery(p => p.map(g => g.name === f.name ? { ...g, preview: e.target?.result as string } : g));
        reader.readAsDataURL(f);
      }
      setGallery(p => [...p, entry]);
    });
  };

  return (
    <div className="space-y-5">
      {/* Curated Gallery */}
      <Accordion title="Curated Digital Gallery" hint="Founding charters, blueprints, ledgers, vintage photographs">
        <div
          onClick={() => galleryRef.current?.click()}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-stone-200 p-8 text-center hover:border-stone-400 transition-colors mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-stone-300 mx-auto mb-2">
            <path d="M12 16V8m0 0l-3 3m3-3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.5 16.5A4.5 4.5 0 0017 8h-.9A7 7 0 103.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-xs text-stone-400">Upload scans of charters, blueprints, ledgers, or archival photos</p>
          <input ref={galleryRef} type="file" multiple accept="image/*,application/pdf" className="hidden"
            onChange={e => addGalleryFiles(e.target.files)} />
        </div>

        {gallery.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {gallery.map(g => (
              <div key={g.id} className="group relative aspect-square rounded-xl overflow-hidden bg-stone-100">
                {g.preview
                  ? <img src={g.preview} alt={g.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">📄</div>
                }
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100">
                  <p className="text-[10px] text-white font-medium truncate w-full">{g.name}</p>
                </div>
                <button onClick={() => setGallery(p => p.filter(x => x.id !== g.id))}
                  className="absolute top-1.5 right-1.5 w-5 h-5 bg-white/90 rounded-full items-center justify-center hidden group-hover:flex">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-stone-600">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </Accordion>

      {/* Artifact Spotlights */}
      <Accordion title="Artifact Spotlights" hint="Physical objects with historical significance">
        <p className="text-xs text-stone-400 mb-4">Photograph a physical artifact and pair it with a paragraph explaining its historical significance.</p>
        <div className="space-y-4">
          {artifacts.map(a => (
            <div key={a.id} className="flex gap-4 bg-stone-50 rounded-2xl p-4 group">
              <label className="cursor-pointer shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-stone-200 hover:opacity-80 transition-opacity flex items-center justify-center">
                {a.preview
                  ? <img src={a.preview} alt={a.title} className="w-full h-full object-cover" />
                  : <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6 text-stone-400">
                      <path d="M4 5a2 2 0 012-2h1.586A2 2 0 019 3.586L10 4.586A2 2 0 0011.414 5H14a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                }
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) loadArtifactPhoto(a.id, f); }} />
              </label>
              <div className="flex-1 space-y-2">
                <input value={a.title} onChange={e => updateArtifact(a.id, 'title', e.target.value)}
                  placeholder="Artifact name (e.g. Original School Bell, 1904)"
                  className="w-full text-sm font-semibold text-stone-700 placeholder-stone-300 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5" />
                <textarea rows={3} value={a.description} onChange={e => updateArtifact(a.id, 'description', e.target.value)}
                  placeholder="Explain the historical significance of this object..."
                  className="w-full text-xs text-stone-500 placeholder-stone-300 border-0 focus:outline-none bg-transparent resize-none leading-relaxed" />
              </div>
              <button onClick={() => removeArtifact(a.id)}
                className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all self-start p-1">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={addArtifact}
          className="mt-3 text-xs font-semibold text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-2.5 w-full hover:border-stone-400 transition-colors">
          + Add Artifact
        </button>
      </Accordion>
    </div>
  );
}

/* ─── Root Panel ────────────────────────────────────────────────────── */
const SECTIONS: { id: Section; label: string; sub: string }[] = [
  { id: 'narrative', label: 'Core Narrative',      sub: 'Genesis, evolution, mission'       },
  { id: 'media',     label: 'Media & Timeline',    sub: 'Milestones, sliders, audio/video'  },
  { id: 'people',    label: 'The Human Element',   sub: 'Leaders, voices, unsung heroes'    },
  { id: 'archives',  label: 'Primary Sources',     sub: 'Gallery, artifacts, documents'     },
];

export default function InstitutionalHistoryPanel() {
  const [active, setActive] = useState<Section>('narrative');

  return (
    <div className="space-y-6">
      {/* Sub-section nav */}
      <div className="grid grid-cols-4 gap-2">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all
              ${active === s.id
                ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                : 'bg-white border-stone-100 text-stone-700 hover:border-stone-300'}`}
          >
            <span className="text-xs font-semibold block leading-tight mb-0.5">{s.label}</span>
            <span className={`text-[10px] leading-tight ${active === s.id ? 'text-stone-400' : 'text-stone-400'}`}>{s.sub}</span>
          </button>
        ))}
      </div>

      {/* Active section */}
      {active === 'narrative' && <NarrativeSection />}
      {active === 'media'     && <MediaSection />}
      {active === 'people'    && <PeopleSection />}
      {active === 'archives'  && <ArchivesSection />}
    </div>
  );
}
