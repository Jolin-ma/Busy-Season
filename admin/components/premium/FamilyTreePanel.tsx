'use client';
import { useState, useRef } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

type Relation =
  | 'SELF' | 'SPOUSE' | 'SIBLING'
  | 'PARENT' | 'GRANDPARENT' | 'GREAT_GRANDPARENT'
  | 'CHILD' | 'GRANDCHILD' | 'OTHER';

interface Person {
  id: string;
  full_name: string;
  maiden_name?: string;
  relation: Relation;
  birth_year?: string;
  death_year?: string;
  birth_place?: string;
  life_sentence?: string;
  biography?: string;
  photoPreview?: string;
  linked_profile_id?: string;
  heirlooms?: string[];
}

const uid = () => Math.random().toString(36).slice(2);

/* ─── Metadata ───────────────────────────────────────────────────────── */

const LABELS: Record<Relation, string> = {
  SELF:              'Memorial Subject',
  SPOUSE:            'Spouse / Partner',
  SIBLING:           'Sibling',
  PARENT:            'Parent',
  GRANDPARENT:       'Grandparent',
  GREAT_GRANDPARENT: 'Great-Grandparent',
  CHILD:             'Child',
  GRANDCHILD:        'Grandchild',
  OTHER:             'Extended Family',
};

const GEN: Record<Relation, number> = {
  GREAT_GRANDPARENT: -3, GRANDPARENT: -2, PARENT: -1,
  SIBLING: 0, SELF: 0, SPOUSE: 0, OTHER: 0,
  CHILD: 1, GRANDCHILD: 2,
};

const GEN_LABEL: Record<number, string> = {
  [-3]: 'Great-Grandparents',
  [-2]: 'Grandparents',
  [-1]: 'Parents',
  [0]:  'Your Generation',
  [1]:  'Children',
  [2]:  'Grandchildren',
};

const GEN0_ORDER: Record<Relation, number> = {
  SIBLING: 0, SELF: 1, SPOUSE: 2, OTHER: 3,
  PARENT: 9, GRANDPARENT: 9, GREAT_GRANDPARENT: 9, CHILD: 9, GRANDCHILD: 9,
};

/* ─── Relation color tokens ─────────────────────────────────────────── */

const REL_BADGE: Record<Relation, string> = {
  SELF:              'bg-stone-700 text-stone-200',
  SPOUSE:            'bg-rose-50 text-rose-600 border border-rose-100',
  SIBLING:           'bg-violet-50 text-violet-600 border border-violet-100',
  PARENT:            'bg-sky-50 text-sky-600 border border-sky-100',
  GRANDPARENT:       'bg-indigo-50 text-indigo-600 border border-indigo-100',
  GREAT_GRANDPARENT: 'bg-blue-50 text-blue-600 border border-blue-100',
  CHILD:             'bg-emerald-50 text-emerald-600 border border-emerald-100',
  GRANDCHILD:        'bg-teal-50 text-teal-600 border border-teal-100',
  OTHER:             'bg-stone-50 text-stone-500 border border-stone-100',
};

/* ─── Seed data ──────────────────────────────────────────────────────── */

const SEED: Person[] = [
  {
    id: 's0', full_name: 'Margaret Eleanor Thornton', maiden_name: 'Patterson',
    relation: 'SELF', birth_year: '1928', death_year: '2024',
    birth_place: 'Burlington, ON',
    life_sentence: 'A pioneering nurse who served in three countries and came home to grow the most beautiful roses in Hamilton.',
    heirlooms: ['Silver brooch, c. 1950', 'Nursing journal, 1952–1960'],
  },
  {
    id: 's1', full_name: 'William Arthur Thornton',
    relation: 'SPOUSE', birth_year: '1925', death_year: '2001',
    birth_place: 'Hamilton, ON',
    life_sentence: 'A quiet man whose woodwork filled three generations of homes.',
  },
  {
    id: 's2', full_name: 'George Elias Patterson',
    relation: 'PARENT', birth_year: '1900', death_year: '1978',
    birth_place: 'County Cork, Ireland',
    life_sentence: 'Crossed the Atlantic at nineteen and never looked back.',
  },
  {
    id: 's3', full_name: 'Ruth Marie Patterson', maiden_name: 'Walsh',
    relation: 'PARENT', birth_year: '1903', death_year: '1992',
    birth_place: 'Halifax, NS',
    life_sentence: 'Raised six children and never missed a Sunday supper.',
  },
  {
    id: 's4', full_name: 'Jennifer Anne Thornton',
    relation: 'CHILD', birth_year: '1958',
    birth_place: 'Hamilton, ON',
    life_sentence: "Carries her mother's love of gardens and her father's stubborn streak.",
  },
  {
    id: 's5', full_name: 'Thomas Robert Thornton',
    relation: 'CHILD', birth_year: '1961',
    birth_place: 'Hamilton, ON',
    life_sentence: 'Built the bench in Victoria Park with his own hands.',
    linked_profile_id: 'thmswfl',
  },
];

/* ─── PhotoFrame ─────────────────────────────────────────────────────── */

function PhotoFrame({
  person, size, className = '',
}: { person: Person; size: number; className?: string }) {
  const [hov, setHov] = useState(false);
  const isSelf = person.relation === 'SELF';
  return (
    <div
      className={`rounded-xl overflow-hidden flex items-center justify-center shrink-0 ${isSelf ? 'bg-stone-700' : 'bg-stone-100'} ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {person.photoPreview ? (
        <img
          src={person.photoPreview}
          alt={person.full_name}
          className="w-full h-full object-cover"
          style={{
            filter: hov ? 'none' : 'grayscale(75%) sepia(12%)',
            transition: 'filter 0.45s ease',
          }}
        />
      ) : (
        <svg viewBox="0 0 24 24" fill="none"
          className={isSelf ? 'text-stone-500' : 'text-stone-300'}
          style={{ width: size * 0.4, height: size * 0.4 }}>
          <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M4 20c0-3.5 3.5-6.5 8-6.5s8 3 8 6.5"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}
    </div>
  );
}

/* ─── MicroCard (used in Lineage & Spokes views) ─────────────────────── */

function MicroCard({ person, onView, compact = false }: {
  person: Person; onView: () => void; compact?: boolean;
}) {
  const isSelf = person.relation === 'SELF';
  const lifespan = [person.birth_year, person.death_year].filter(Boolean).join('–');

  return (
    <button
      onClick={onView}
      className={`group text-left rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
        ${isSelf
          ? 'bg-stone-900 border-stone-800 text-white shadow-lg hover:shadow-xl'
          : 'bg-white border-stone-100 shadow-sm hover:border-stone-200'}
        ${compact ? 'p-3' : 'p-4'}`}
      style={{ minWidth: compact ? 110 : 140, maxWidth: compact ? 150 : 175 }}
    >
      {/* Photo */}
      <div
        className={`w-full rounded-xl overflow-hidden mb-3 ${isSelf ? 'bg-stone-700' : 'bg-stone-100'}`}
        style={{ height: compact ? 60 : 96 }}
      >
        <PhotoFrame person={person} size={compact ? 60 : 96}
          className="w-full !rounded-none"
        />
      </div>

      {/* Name */}
      <p className={`text-[11px] font-semibold leading-snug mb-0.5 line-clamp-2
        ${isSelf ? 'text-white' : 'text-stone-800'}`}>
        {person.full_name}
      </p>
      {person.maiden_name && (
        <p className={`text-[10px] italic mb-1 ${isSelf ? 'text-stone-400' : 'text-stone-400'}`}>
          née {person.maiden_name}
        </p>
      )}
      {lifespan && (
        <p className={`text-[10px] mb-1 ${isSelf ? 'text-stone-500' : 'text-stone-400'}`}>
          {lifespan}
        </p>
      )}

      {/* Origin */}
      {!compact && person.birth_place && (
        <div className="flex items-center gap-1 mb-1.5">
          <svg viewBox="0 0 20 20" fill="none"
            className={`w-2.5 h-2.5 shrink-0 ${isSelf ? 'text-stone-500' : 'text-stone-300'}`}>
            <path d="M10 3C7.24 3 5 5.24 5 8c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z"
              stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <p className={`text-[10px] truncate ${isSelf ? 'text-stone-500' : 'text-stone-400'}`}>
            {person.birth_place}
          </p>
        </div>
      )}

      {/* Life sentence */}
      {!compact && person.life_sentence && (
        <p className={`text-[10px] italic leading-relaxed line-clamp-2 mt-1 ${isSelf ? 'text-stone-500' : 'text-stone-400'}`}>
          "{person.life_sentence}"
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1 mt-2">
        {person.heirlooms && person.heirlooms.length > 0 && (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full
            ${isSelf ? 'bg-amber-800/50 text-amber-300' : 'bg-amber-50 text-amber-600'}`}>
            ◆ {person.heirlooms.length}
          </span>
        )}
        {person.linked_profile_id && (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full
            ${isSelf ? 'bg-blue-800/50 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
            ⟶ profile
          </span>
        )}
      </div>
    </button>
  );
}

/* ─── Biography modal ────────────────────────────────────────────────── */

function BiographyModal({ person, onClose, onEdit }: {
  person: Person; onClose: () => void; onEdit: () => void;
}) {
  const lifespan = [person.birth_year, person.death_year].filter(Boolean).join(' — ');
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-stone-100 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 flex gap-4 border-b border-stone-50 shrink-0">
          <PhotoFrame person={person} size={80} className="rounded-2xl" />
          <div className="flex-1 min-w-0">
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${REL_BADGE[person.relation]}`}>
              {LABELS[person.relation]}
            </span>
            <h3 className="text-base font-semibold text-stone-800 leading-tight mt-1.5">{person.full_name}</h3>
            {person.maiden_name && (
              <p className="text-xs text-stone-400 italic">née {person.maiden_name}</p>
            )}
            {lifespan && <p className="text-xs text-stone-400 mt-0.5">{lifespan}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-400 hover:bg-stone-200 transition-colors text-xl self-start shrink-0"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-5 overflow-y-auto space-y-4">
          {/* Origin */}
          {person.birth_place && (
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5 text-stone-300 shrink-0">
                <path d="M10 3C7.24 3 5 5.24 5 8c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z"
                  stroke="currentColor" strokeWidth="1.4"/>
                <circle cx="10" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
              <p className="text-xs text-stone-500">{person.birth_place}</p>
            </div>
          )}

          {/* Life in a sentence */}
          {person.life_sentence && (
            <div className="bg-stone-50 rounded-xl px-4 py-3.5 border-l-2 border-stone-200">
              <p className="text-sm text-stone-600 italic leading-relaxed">
                "{person.life_sentence}"
              </p>
            </div>
          )}

          {/* Extended biography */}
          {person.biography && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Biography</p>
              <p className="text-sm text-stone-600 leading-relaxed">{person.biography}</p>
            </div>
          )}

          {/* Heirlooms */}
          {person.heirlooms && person.heirlooms.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                Connected Heirlooms
              </p>
              <div className="flex flex-wrap gap-2">
                {person.heirlooms.map((h, i) => (
                  <span key={i}
                    className="text-[11px] bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full">
                    ◆ {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Linked profile */}
          {person.linked_profile_id && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2.5">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-blue-400 shrink-0">
                <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M7 10h6M11 8l2 2-2 2"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <p className="text-xs font-semibold text-blue-700">Has a linked LegacyLink memorial</p>
                <p className="text-[11px] text-blue-400 font-mono">{person.linked_profile_id}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 pb-7 pt-4 border-t border-stone-50 flex gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="flex-1 bg-stone-900 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-stone-700 transition-colors"
          >
            Edit Profile
          </button>
          <button
            onClick={onClose}
            className="text-sm text-stone-400 border border-stone-200 px-5 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── PersonForm (Add / Edit) ────────────────────────────────────────── */

function PersonForm({ initial, onSave, onClose, onRemove }: {
  initial: Partial<Person>;
  onSave: (p: Person) => void;
  onClose: () => void;
  onRemove?: () => void;
}) {
  const [full_name,         setFullName]      = useState(initial.full_name         ?? '');
  const [maiden_name,       setMaidenName]    = useState(initial.maiden_name       ?? '');
  const [relation,          setRelation]      = useState<Relation>(initial.relation ?? 'PARENT');
  const [birth_year,        setBirthYear]     = useState(initial.birth_year        ?? '');
  const [death_year,        setDeathYear]     = useState(initial.death_year        ?? '');
  const [birth_place,       setBirthPlace]    = useState(initial.birth_place       ?? '');
  const [life_sentence,     setLifeSentence]  = useState(initial.life_sentence     ?? '');
  const [biography,         setBiography]     = useState(initial.biography         ?? '');
  const [linked_profile_id, setLinkedId]      = useState(initial.linked_profile_id ?? '');
  const [heirloomsText,     setHeirloomsText] = useState((initial.heirlooms ?? []).join(', '));
  const [photoPreview,      setPhotoPreview]  = useState(initial.photoPreview      ?? '');
  const isEdit = !!initial.id;

  const loadPhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => setPhotoPreview(e.target?.result as string ?? '');
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!full_name.trim()) return;
    onSave({
      id:                 initial.id ?? uid(),
      full_name:          full_name.trim(),
      maiden_name:        maiden_name.trim()      || undefined,
      relation,
      birth_year:         birth_year              || undefined,
      death_year:         death_year              || undefined,
      birth_place:        birth_place.trim()      || undefined,
      life_sentence:      life_sentence.trim()    || undefined,
      biography:          biography.trim()        || undefined,
      linked_profile_id:  linked_profile_id.trim() || undefined,
      heirlooms: heirloomsText.split(',').map(h => h.trim()).filter(Boolean),
      photoPreview:       photoPreview            || undefined,
    });
  };

  const field = 'w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-200';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-stone-100 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-stone-100 flex items-center justify-between shrink-0">
          <h3 className="text-base font-semibold text-stone-800">
            {isEdit ? 'Edit' : 'Add'} Family Member
          </h3>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-400 hover:bg-stone-200 transition-colors text-xl">
            ×
          </button>
        </div>

        <div className="px-7 py-5 overflow-y-auto space-y-4">
          {/* Photo */}
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 shrink-0 flex items-center justify-center hover:opacity-80 transition-opacity">
              {photoPreview
                ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                : <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-stone-300">
                    <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 20c0-3.5 3.5-6.5 8-6.5s8 3 8 6.5"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
              }
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-700">Portrait Photo</p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Displays in sepia until hovered. JPEG or PNG.
              </p>
            </div>
            <input type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) loadPhoto(f); }} />
          </label>

          {/* Names */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1.5">Full Name *</label>
            <input value={full_name} onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Margaret Eleanor Thornton"
              className={field} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1.5">Maiden / Previous Name</label>
            <input value={maiden_name} onChange={e => setMaidenName(e.target.value)}
              placeholder="e.g. Walsh, Patterson…"
              className={field} />
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1.5">Relationship</label>
            <select value={relation} onChange={e => setRelation(e.target.value as Relation)}
              className={`${field} bg-white`}>
              {(Object.keys(LABELS) as Relation[]).filter(r => r !== 'SELF').map(r => (
                <option key={r} value={r}>{LABELS[r]}</option>
              ))}
            </select>
          </div>

          {/* Dates + Origin */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Born',   val: birth_year,  set: setBirthYear,  ph: '1918' },
              { label: 'Died',   val: death_year,  set: setDeathYear,  ph: 'Optional' },
              { label: 'Origin', val: birth_place, set: setBirthPlace, ph: 'City, Country' },
            ].map(({ label, val, set, ph }) => (
              <div key={label}>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1.5">
                  {label}
                </label>
                <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
                  className="w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-200" />
              </div>
            ))}
          </div>

          {/* Life sentence */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1.5">
              Life in a Sentence
            </label>
            <textarea value={life_sentence} onChange={e => setLifeSentence(e.target.value)} rows={2}
              placeholder="A single defining description of their legacy and spirit…"
              className="w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-stone-200 leading-relaxed" />
          </div>

          {/* Extended biography */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1.5">
              Extended Biography <span className="normal-case font-normal text-stone-300">(shown in biography popup)</span>
            </label>
            <textarea value={biography} onChange={e => setBiography(e.target.value)} rows={3}
              placeholder="A fuller narrative for the deep-dive popup…"
              className="w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-stone-200 leading-relaxed" />
          </div>

          {/* Heirlooms */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1.5">
              Connected Heirlooms <span className="normal-case font-normal text-stone-300">(comma-separated)</span>
            </label>
            <input value={heirloomsText} onChange={e => setHeirloomsText(e.target.value)}
              placeholder="Silver pocket watch 1912, Leather-bound diary…"
              className={field} />
          </div>

          {/* Linked profile */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1.5">
              Link to LegacyLink Profile <span className="normal-case font-normal text-stone-300">(short ID)</span>
            </label>
            <input value={linked_profile_id} onChange={e => setLinkedId(e.target.value)}
              placeholder="e.g. a5trneuj"
              className={`${field} font-mono`} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 pb-7 pt-4 border-t border-stone-100 flex gap-2 shrink-0">
          <button onClick={submit}
            className="flex-1 bg-stone-900 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-stone-700 transition-colors">
            {isEdit ? 'Save Changes' : 'Add to Tree'}
          </button>
          {isEdit && onRemove && (
            <button onClick={onRemove}
              className="text-sm text-red-400 border border-red-100 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors">
              Remove
            </button>
          )}
          <button onClick={onClose}
            className="text-sm text-stone-400 border border-stone-200 px-5 py-2.5 rounded-xl hover:bg-stone-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── View 1: Direct Lineage ─────────────────────────────────────────── */

function LineageView({ people, onView }: { people: Person[]; onView: (p: Person) => void }) {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set([-3]));

  const toggle = (gen: number) =>
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(gen) ? next.delete(gen) : next.add(gen);
      return next;
    });

  const byGen = new Map<number, Person[]>();
  people.forEach(p => {
    const g = GEN[p.relation];
    if (!byGen.has(g)) byGen.set(g, []);
    byGen.get(g)!.push(p);
  });
  byGen.get(0)?.sort((a, b) => GEN0_ORDER[a.relation] - GEN0_ORDER[b.relation]);

  const gens = Array.from(byGen.keys()).sort((a, b) => a - b);

  return (
    <div className="flex flex-col items-center gap-0 py-2">
      {gens.map((gen, idx) => {
        const persons = byGen.get(gen)!;
        const isCollapsed = collapsed.has(gen);
        const label = GEN_LABEL[gen] ?? `Generation ${gen > 0 ? `+${gen}` : gen}`;

        return (
          <div key={gen} className="flex flex-col items-center w-full">
            {/* Connector line from previous generation */}
            {idx > 0 && (
              <div className="flex flex-col items-center py-1">
                <div className="w-px h-4 bg-stone-200" />
                <div className="w-10 h-px bg-stone-200" />
                <div className="w-px h-4 bg-stone-200" />
              </div>
            )}

            {/* Generation header */}
            <button
              onClick={() => toggle(gen)}
              className="flex items-center gap-2 mb-3 group"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                {label}
              </span>
              <span className="text-[10px] text-stone-300">
                {persons.length} member{persons.length !== 1 ? 's' : ''}
              </span>
              <svg viewBox="0 0 20 20" fill="currentColor"
                className={`w-3 h-3 text-stone-300 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}>
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            {/* Members */}
            {isCollapsed ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {persons.map(p => (
                  <button key={p.id} onClick={() => onView(p)}
                    className="text-xs text-stone-500 bg-white border border-stone-100 rounded-xl px-4 py-2 hover:border-stone-300 transition-colors shadow-sm">
                    {p.full_name}
                    {p.birth_year && <span className="text-stone-300 ml-1.5">b. {p.birth_year}</span>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 justify-center">
                {persons.map(p => (
                  <MicroCard
                    key={p.id}
                    person={p}
                    onView={() => onView(p)}
                    compact={persons.length > 4}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

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

/* ─── New types for Story / Heirlooms / Archive ──────────────────────── */

interface Milestone  { id: string; year: string; event: string; }
interface Tradition  { id: string; text: string; }
interface Heirloom   { id: string; name: string; circa: string; belonging_to: string; custodian: string; significance: string; photoPreview?: string; }
interface ArchiveDoc { id: string; title: string; decade: string; category: string; description: string; preview?: string; fileType?: string; }

/* ─── Section 2: The Story ───────────────────────────────────────────── */

function FamilyStorySection() {
  const [origin,      setOrigin]      = useState('');
  const [traditions,  setTraditions]  = useState<Tradition[]>([{ id: uid(), text: '' }]);
  const [milestones,  setMilestones]  = useState<Milestone[]>([
    { id: uid(), year: '', event: '' },
  ]);

  const updateTrad = (id: string, v: string) =>
    setTraditions(p => p.map(t => t.id === id ? { ...t, text: v } : t));
  const updateMile = (id: string, f: keyof Milestone, v: string) =>
    setMilestones(p => p.map(m => m.id === id ? { ...m, [f]: v } : m));

  return (
    <div className="space-y-5">
      <Accordion title="The Family Origin" hint="Where did this family begin? Migration, founding, heritage.">
        <p className="text-xs text-stone-400 mb-3 leading-relaxed">
          The place a family comes from — a village in Ireland, a port in Halifax, a town square in Guangzhou — carries its entire emotional weight in a single sentence. Write it here.
        </p>
        <textarea
          rows={5}
          value={origin}
          onChange={e => setOrigin(e.target.value)}
          placeholder="e.g. The Pattersons left County Cork in 1899 aboard a steamer, carrying little more than a leather trunk and a sense that the world owed them nothing — a conviction that would define the family for the next century…"
          className="w-full text-sm text-stone-700 placeholder-stone-300 border border-stone-150 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-stone-200 leading-relaxed"
        />
        <p className="text-[11px] text-stone-300 mt-1.5 text-right">{origin.length} characters</p>
      </Accordion>

      <Accordion title="Family Traditions" hint="Rituals, recipes, and customs passed down through generations">
        <p className="text-xs text-stone-400 mb-4 leading-relaxed">
          The small, repeating things are often what family members miss most — and remember longest.
        </p>
        <div className="space-y-2 mb-3">
          {traditions.map(t => (
            <div key={t.id} className="flex gap-2 items-center group">
              <span className="text-stone-300 text-sm shrink-0">✦</span>
              <input
                value={t.text}
                onChange={e => updateTrad(t.id, e.target.value)}
                placeholder="e.g. Every Christmas Eve, the whole family made pierogis from scratch starting at noon…"
                className="flex-1 text-sm text-stone-600 placeholder-stone-300 border-b border-stone-100 focus:outline-none focus:border-stone-300 bg-transparent py-1"
              />
              <button onClick={() => setTraditions(p => p.filter(x => x.id !== t.id))}
                className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setTraditions(p => [...p, { id: uid(), text: '' }])}
          className="text-xs font-semibold text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-2.5 w-full hover:border-stone-400 transition-colors">
          + Add Tradition
        </button>
      </Accordion>

      <Accordion title="Defining Moments" hint="Key milestones in the family's collective story" defaultOpen={false}>
        <p className="text-xs text-stone-400 mb-4 leading-relaxed">
          The arrival, the departure, the fire, the harvest, the reunion. Mark them on a personal family timeline.
        </p>
        <div className="relative space-y-3 before:absolute before:left-[54px] before:top-0 before:bottom-0 before:w-px before:bg-stone-100">
          {milestones.map(m => (
            <div key={m.id} className="flex gap-4 items-start group">
              <input
                value={m.year}
                onChange={e => updateMile(m.id, 'year', e.target.value)}
                placeholder="Year"
                className="w-12 text-xs font-semibold text-stone-500 text-right border-0 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5 shrink-0"
              />
              <div className="w-2.5 h-2.5 rounded-full bg-stone-200 group-hover:bg-stone-400 transition-colors shrink-0 mt-1 z-10" />
              <input
                value={m.event}
                onChange={e => updateMile(m.id, 'event', e.target.value)}
                placeholder="What happened? Keep it vivid."
                className="flex-1 text-sm text-stone-600 placeholder-stone-300 border-b border-stone-100 focus:outline-none focus:border-stone-300 bg-transparent pb-0.5"
              />
              <button onClick={() => setMilestones(p => p.filter(x => x.id !== m.id))}
                className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all p-1 shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setMilestones(p => [...p, { id: uid(), year: '', event: '' }])}
          className="mt-4 text-xs font-semibold text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-2.5 w-full hover:border-stone-400 transition-colors">
          + Add Milestone
        </button>
      </Accordion>

      <div className="flex justify-end">
        <button className="bg-stone-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-stone-700 transition-colors">
          Save Story
        </button>
      </div>
    </div>
  );
}

/* ─── Section 3: Heirlooms ───────────────────────────────────────────── */

function HeirloomsSection() {
  const [heirlooms, setHeirlooms] = useState<Heirloom[]>([
    { id: uid(), name: 'Silver Pocket Watch', circa: 'c. 1912', belonging_to: 'Great-Grandfather Arthur', custodian: '', significance: '' },
  ]);

  const update = (id: string, f: keyof Heirloom, v: string) =>
    setHeirlooms(p => p.map(h => h.id === id ? { ...h, [f]: v } : h));

  const loadPhoto = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = e => setHeirlooms(p => p.map(h => h.id === id ? { ...h, photoPreview: e.target?.result as string } : h));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <Accordion title="Heirloom Gallery" hint="Objects that carry the weight of generations">
        <p className="text-xs text-stone-400 mb-5 leading-relaxed">
          An heirloom isn't just an object — it's a physical story. The goal here is to document each piece well enough that its origin is never lost. Upload a photo; it will display in sepia until hovered, like a rediscovered print.
        </p>

        <div className="space-y-5">
          {heirlooms.map(h => {
            const [hov, setHov] = useState(false);
            return (
              <div key={h.id} className="group bg-stone-50 rounded-2xl p-4 space-y-3">
                <div className="flex gap-4">
                  {/* Photo */}
                  <label className="cursor-pointer shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-stone-200 flex items-center justify-center hover:opacity-80 transition-opacity"
                    onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
                    {h.photoPreview ? (
                      <img src={h.photoPreview} alt={h.name} className="w-full h-full object-cover"
                        style={{ filter: hov ? 'none' : 'grayscale(75%) sepia(15%)', transition: 'filter 0.45s ease' }} />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-stone-400">
                        <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 6V5a2 2 0 012-2h4a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    )}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) loadPhoto(h.id, f); }} />
                  </label>

                  {/* Name + era */}
                  <div className="flex-1 space-y-2">
                    <input value={h.name} onChange={e => update(h.id, 'name', e.target.value)}
                      placeholder="Item name (e.g. Silver Pocket Watch)"
                      className="w-full text-sm font-semibold text-stone-700 placeholder-stone-300 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5" />
                    <div className="grid grid-cols-2 gap-3">
                      <input value={h.circa} onChange={e => update(h.id, 'circa', e.target.value)}
                        placeholder="Era / year (e.g. c. 1912)"
                        className="text-xs text-stone-500 placeholder-stone-300 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5" />
                      <input value={h.belonging_to} onChange={e => update(h.id, 'belonging_to', e.target.value)}
                        placeholder="Originally belonging to…"
                        className="text-xs text-stone-500 placeholder-stone-300 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5" />
                    </div>
                  </div>

                  <button onClick={() => setHeirlooms(p => p.filter(x => x.id !== h.id))}
                    className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all self-start p-1 shrink-0">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                {/* Significance */}
                <textarea rows={2} value={h.significance} onChange={e => update(h.id, 'significance', e.target.value)}
                  placeholder="What makes this object significant? How did it pass between generations? Where is it now?"
                  className="w-full text-xs text-stone-500 placeholder-stone-300 border border-stone-150 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-stone-200 leading-relaxed bg-white" />

                {/* Current custodian */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 shrink-0">Held by</span>
                  <input value={h.custodian} onChange={e => update(h.id, 'custodian', e.target.value)}
                    placeholder="Current custodian (person or institution)"
                    className="flex-1 text-xs text-stone-600 placeholder-stone-300 border-b border-stone-100 focus:outline-none focus:border-stone-300 bg-transparent pb-0.5" />
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => setHeirlooms(p => [...p, { id: uid(), name: '', circa: '', belonging_to: '', custodian: '', significance: '' }])}
          className="mt-4 text-xs font-semibold text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-2.5 w-full hover:border-stone-400 transition-colors">
          + Add Heirloom
        </button>
      </Accordion>
    </div>
  );
}

/* ─── Section 4: Archive ─────────────────────────────────────────────── */

const DECADES = ['1880s','1890s','1900s','1910s','1920s','1930s','1940s','1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s'];
const CATEGORIES = ['Letter','Certificate','Photograph','Newspaper clipping','Legal document','Military record','Other'];

function ArchiveSection() {
  const [docs,    setDocs]    = useState<ArchiveDoc[]>([]);
  const uploadRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList) => {
    const newDocs: ArchiveDoc[] = Array.from(files).map(f => {
      const isImage = f.type.startsWith('image/');
      const doc: ArchiveDoc = {
        id: uid(), title: f.name.replace(/\.[^.]+$/, ''),
        decade: '', category: 'Photograph', description: '', fileType: f.type,
      };
      if (isImage) {
        const reader = new FileReader();
        reader.onload = e => setDocs(p => p.map(d => d.id === doc.id ? { ...d, preview: e.target?.result as string } : d));
        reader.readAsDataURL(f);
      }
      return doc;
    });
    setDocs(p => [...p, ...newDocs]);
  };

  const update = (id: string, f: keyof ArchiveDoc, v: string) =>
    setDocs(p => p.map(d => d.id === id ? { ...d, [f]: v } : d));

  const byDecade = DECADES.filter(d => docs.some(doc => doc.decade === d));
  const undated  = docs.filter(d => !d.decade);

  const DocCard = ({ doc }: { doc: ArchiveDoc }) => {
    const [hov, setHov] = useState(false);
    const isImage = doc.fileType?.startsWith('image/');
    return (
      <div className="group bg-stone-50 rounded-2xl p-4 space-y-3">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0 flex items-center justify-center"
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            {doc.preview ? (
              <img src={doc.preview} alt={doc.title} className="w-full h-full object-cover"
                style={{ filter: hov ? 'none' : 'grayscale(70%) sepia(15%)', transition: 'filter 0.45s ease' }} />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-stone-400">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>

          {/* Title + category + decade */}
          <div className="flex-1 space-y-2 min-w-0">
            <input value={doc.title} onChange={e => update(doc.id, 'title', e.target.value)}
              placeholder="Document title"
              className="w-full text-sm font-semibold text-stone-700 placeholder-stone-300 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5" />
            <div className="grid grid-cols-2 gap-2">
              <select value={doc.category} onChange={e => update(doc.id, 'category', e.target.value)}
                className="text-xs text-stone-500 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={doc.decade} onChange={e => update(doc.id, 'decade', e.target.value)}
                className="text-xs text-stone-500 border-b border-stone-200 focus:outline-none focus:border-stone-400 bg-transparent pb-0.5">
                <option value="">Decade…</option>
                {DECADES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <button onClick={() => setDocs(p => p.filter(x => x.id !== doc.id))}
            className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all self-start p-1 shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        <input value={doc.description} onChange={e => update(doc.id, 'description', e.target.value)}
          placeholder="Brief description — what is this, who wrote it, why does it matter?"
          className="w-full text-xs text-stone-500 placeholder-stone-300 border-b border-stone-100 focus:outline-none focus:border-stone-300 bg-transparent pb-0.5" />
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        className="cursor-pointer rounded-2xl border-2 border-dashed border-stone-200 p-8 text-center hover:border-stone-300 transition-colors"
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
        onClick={() => uploadRef.current?.click()}
      >
        <div className="flex items-center justify-center gap-3 mb-2 text-stone-300">
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M14 2v6h6M12 11v6M9 14l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-stone-500">Drop letters, certificates, photographs, clippings</p>
        <p className="text-xs text-stone-400 mt-1">PDF, JPEG, PNG, TIFF accepted — then tag each item with a decade and category</p>
        <input ref={uploadRef} type="file" multiple accept="image/*,.pdf,.tif,.tiff" className="hidden"
          onChange={e => { if (e.target.files?.length) addFiles(e.target.files); }} />
      </div>

      {/* Organized by decade */}
      {docs.length > 0 && (
        <div className="space-y-6">
          {byDecade.map(decade => (
            <Accordion key={decade} title={decade} hint={`${docs.filter(d => d.decade === decade).length} item${docs.filter(d => d.decade === decade).length > 1 ? 's' : ''}`} defaultOpen={true}>
              <div className="space-y-3">
                {docs.filter(d => d.decade === decade).map(doc => <DocCard key={doc.id} doc={doc} />)}
              </div>
            </Accordion>
          ))}
          {undated.length > 0 && (
            <Accordion title="Undated" hint={`${undated.length} item${undated.length > 1 ? 's' : ''} — assign a decade above`} defaultOpen={true}>
              <div className="space-y-3">
                {undated.map(doc => <DocCard key={doc.id} doc={doc} />)}
              </div>
            </Accordion>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Section type + nav ─────────────────────────────────────────────── */

type Section = 'tree' | 'story' | 'heirlooms' | 'archive';

const SECTIONS: { id: Section; label: string; sub: string }[] = [
  { id: 'tree',     label: 'Family Tree',      sub: 'Generational lineage'       },
  { id: 'story',    label: 'The Family Story',  sub: 'Origin, traditions, moments' },
  { id: 'heirlooms',label: 'Heirlooms',         sub: 'Artifacts & their journeys'  },
  { id: 'archive',  label: 'Archive',           sub: 'Letters, docs & photos'      },
];

/* ─── Root ───────────────────────────────────────────────────────────── */

export default function FamilyTreePanel() {
  const [active,   setActive]   = useState<Section>('tree');
  const [people,   setPeople]   = useState<Person[]>(SEED);
  const [selected, setSelected] = useState<Person | null>(null);
  const [editing,  setEditing]  = useState<Person | null>(null);
  const [showAdd,  setShowAdd]  = useState(false);

  const handleSave = (p: Person) => {
    setPeople(prev =>
      prev.some(x => x.id === p.id)
        ? prev.map(x => x.id === p.id ? p : x)
        : [...prev, p]
    );
    setShowAdd(false);
    setEditing(null);
  };

  const handleRemove = (id: string) => {
    setPeople(prev => prev.filter(x => x.id !== id));
    setSelected(null);
    setEditing(null);
  };

  const openEdit = (p: Person) => { setSelected(null); setEditing(p); };

  return (
    <div className="space-y-6">

      {/* Section nav */}
      <div className="grid grid-cols-4 gap-2">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all
              ${active === s.id
                ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                : 'bg-white border-stone-100 text-stone-700 hover:border-stone-300'}`}
          >
            <span className="text-xs font-semibold block leading-tight mb-0.5">{s.label}</span>
            <span className="text-[10px] text-stone-400 leading-tight">{s.sub}</span>
          </button>
        ))}
      </div>

      {/* Tree section toolbar */}
      {active === 'tree' && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-400">
            {people.length} member{people.length !== 1 ? 's' : ''} · click any card to read biography
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="text-xs font-semibold bg-stone-900 text-white px-4 py-2 rounded-xl hover:bg-stone-700 transition-colors"
          >
            + Add Member
          </button>
        </div>
      )}

      {/* Active section */}
      {active === 'tree' && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <LineageView people={people} onView={setSelected} />
        </div>
      )}
      {active === 'story'     && <FamilyStorySection />}
      {active === 'heirlooms' && <HeirloomsSection />}
      {active === 'archive'   && <ArchiveSection />}

      {/* Modals */}
      {selected && (
        <BiographyModal
          person={selected}
          onClose={() => setSelected(null)}
          onEdit={() => openEdit(selected)}
        />
      )}
      {(showAdd || editing) && (
        <PersonForm
          initial={editing ?? {}}
          onSave={handleSave}
          onClose={() => { setShowAdd(false); setEditing(null); }}
          onRemove={editing ? () => handleRemove(editing.id) : undefined}
        />
      )}

    </div>
  );
}
