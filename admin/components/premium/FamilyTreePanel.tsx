'use client';
import { useState, useRef, useEffect, useMemo } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Relation = 'SELF' | 'PARENT' | 'SIBLING' | 'CHILD' | 'GRANDPARENT' | 'GRANDCHILD' | 'SPOUSE' | 'OTHER';

interface TreeNode {
  id:                string;
  full_name:         string;
  relation:          Relation;
  birth_year?:       number;
  death_year?:       number;
  linked_profile_id?: string;
}

interface Pos { x: number; y: number; w: number; h: number }

// ── Layout constants ──────────────────────────────────────────────────────────

const NW    = 158;   // node width
const NH    = 82;    // node height
const SW    = 188;   // SELF node width
const SH    = 96;    // SELF node height
const HGAP  = 52;    // horizontal gap between siblings
const VGAP  = 100;   // vertical gap between generations
const CW    = 3200;  // canvas width
const CH    = 2000;  // canvas height
const OX    = CW / 2;
const OY    = CH / 2;

// ── Relation metadata ─────────────────────────────────────────────────────────

const LABELS: Record<Relation, string> = {
  SELF:        'Self',
  PARENT:      'Parent',
  SIBLING:     'Sibling',
  CHILD:       'Child',
  GRANDPARENT: 'Grandparent',
  GRANDCHILD:  'Grandchild',
  SPOUSE:      'Spouse / Partner',
  OTHER:       'Other relation',
};

const GEN: Record<Relation, number> = {
  GRANDPARENT: -2, PARENT: -1,
  SIBLING: 0, SELF: 0, SPOUSE: 0, OTHER: 0,
  CHILD: 1, GRANDCHILD: 2,
};

const GEN0_ORDER: Record<Relation, number> = {
  SIBLING: 0, SELF: 1, SPOUSE: 2, OTHER: 3,
  GRANDPARENT: 9, PARENT: 9, CHILD: 9, GRANDCHILD: 9,
};

const BADGE: Record<Relation, string> = {
  SELF:        'bg-stone-700 text-stone-200',
  PARENT:      'bg-blue-900/60 text-blue-300',
  SIBLING:     'bg-violet-900/60 text-violet-300',
  CHILD:       'bg-emerald-900/60 text-emerald-300',
  GRANDPARENT: 'bg-sky-900/60 text-sky-300',
  GRANDCHILD:  'bg-teal-900/60 text-teal-300',
  SPOUSE:      'bg-rose-900/60 text-rose-300',
  OTHER:       'bg-stone-700 text-stone-400',
};

const SUGGESTED_NEXT: Partial<Record<Relation, Relation>> = {
  SELF: 'CHILD', PARENT: 'GRANDPARENT', CHILD: 'GRANDCHILD',
  SPOUSE: 'CHILD', SIBLING: 'PARENT', GRANDPARENT: 'PARENT',
};

// ── Mock seed data ────────────────────────────────────────────────────────────

const SEED: TreeNode[] = [
  { id: 'n0', full_name: 'Margaret Eleanor Whitfield', relation: 'SELF',        birth_year: 1945, death_year: 2026 },
  { id: 'n1', full_name: 'Robert Whitfield',           relation: 'SPOUSE',      birth_year: 1943 },
  { id: 'n2', full_name: 'Eleanor Patterson',          relation: 'PARENT',      birth_year: 1918, death_year: 1998 },
  { id: 'n3', full_name: 'George Patterson',           relation: 'PARENT',      birth_year: 1915, death_year: 1987 },
  { id: 'n4', full_name: 'Jennifer Whitfield',         relation: 'CHILD',       birth_year: 1974 },
  { id: 'n5', full_name: 'Thomas Whitfield',           relation: 'CHILD',       birth_year: 1977 },
];

// ── Layout engine ─────────────────────────────────────────────────────────────

function buildLayout(nodes: TreeNode[]): Map<string, Pos> {
  const positions = new Map<string, Pos>();
  const byGen = new Map<number, TreeNode[]>();

  nodes.forEach(n => {
    const g = GEN[n.relation];
    if (!byGen.has(g)) byGen.set(g, []);
    byGen.get(g)!.push(n);
  });

  byGen.get(0)?.sort((a, b) => GEN0_ORDER[a.relation] - GEN0_ORDER[b.relation]);

  byGen.forEach((genNodes, gen) => {
    const y = gen * (NH + VGAP);
    const widths = genNodes.map(n => n.relation === 'SELF' ? SW : NW);
    const totalW = widths.reduce((s, w) => s + w, 0) + Math.max(0, genNodes.length - 1) * HGAP;
    let curX = -totalW / 2;

    genNodes.forEach(node => {
      const w = node.relation === 'SELF' ? SW : NW;
      const h = node.relation === 'SELF' ? SH : NH;
      positions.set(node.id, { x: curX, y, w, h });
      curX += w + HGAP;
    });
  });

  return positions;
}

// ── Edge builder ──────────────────────────────────────────────────────────────

type EdgeKind = 'ancestry' | 'marriage' | 'sibling';
interface Edge { id: string; points: [number, number][]; kind: EdgeKind; label?: string }

function buildEdges(nodes: TreeNode[], pos: Map<string, Pos>): Edge[] {
  const edges: Edge[] = [];
  const self = nodes.find(n => n.relation === 'SELF');
  const selfP = self ? pos.get(self.id) : null;

  const cx  = (p: Pos) => OX + p.x + p.w / 2;
  const top = (p: Pos) => OY + p.y;
  const bot = (p: Pos) => OY + p.y + p.h;
  const lft = (p: Pos) => OX + p.x;
  const rgt = (p: Pos) => OX + p.x + p.w;
  const mcy = (p: Pos) => OY + p.y + p.h / 2;

  nodes.forEach(node => {
    const p = pos.get(node.id);
    if (!p || !self || !selfP) return;

    if (node.relation === 'PARENT') {
      const mid = (bot(p) + top(selfP)) / 2;
      edges.push({ id: `p-${node.id}`, kind: 'ancestry', points: [
        [cx(p), bot(p)], [cx(p), mid], [cx(selfP), mid], [cx(selfP), top(selfP)],
      ]});
    }

    if (node.relation === 'GRANDPARENT') {
      const parents = nodes.filter(n => n.relation === 'PARENT');
      if (parents.length) {
        const pp = pos.get(parents[0].id)!;
        if (pp) {
          const mid = (bot(p) + top(pp)) / 2;
          edges.push({ id: `gp-${node.id}`, kind: 'ancestry', points: [
            [cx(p), bot(p)], [cx(p), mid], [cx(pp), mid], [cx(pp), top(pp)],
          ]});
        }
      }
    }

    if (node.relation === 'CHILD') {
      const mid = (bot(selfP) + top(p)) / 2;
      edges.push({ id: `c-${node.id}`, kind: 'ancestry', points: [
        [cx(selfP), bot(selfP)], [cx(selfP), mid], [cx(p), mid], [cx(p), top(p)],
      ]});
    }

    if (node.relation === 'GRANDCHILD') {
      const children = nodes.filter(n => n.relation === 'CHILD');
      if (children.length) {
        const cp = pos.get(children[0].id)!;
        if (cp) {
          const mid = (bot(cp) + top(p)) / 2;
          edges.push({ id: `gc-${node.id}`, kind: 'ancestry', points: [
            [cx(cp), bot(cp)], [cx(cp), mid], [cx(p), mid], [cx(p), top(p)],
          ]});
        }
      }
    }

    if (node.relation === 'SPOUSE') {
      const midX = (rgt(selfP) + lft(p)) / 2;
      edges.push({ id: `sp-${node.id}`, kind: 'marriage', label: '♥', points: [
        [rgt(selfP), mcy(selfP)], [midX, mcy(selfP)], [midX, mcy(p)], [lft(p), mcy(p)],
      ]});
    }

    if (node.relation === 'SIBLING') {
      const topY = Math.min(top(p), top(selfP)) - VGAP * 0.45;
      edges.push({ id: `sib-${node.id}`, kind: 'sibling', points: [
        [cx(p), top(p)], [cx(p), topY], [cx(selfP), topY], [cx(selfP), top(selfP)],
      ]});
    }
  });

  return edges;
}

// ── SVG edge layer ────────────────────────────────────────────────────────────

function polylinePath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  return pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`).join(' ');
}

function EdgeLayer({ edges }: { edges: Edge[] }) {
  return (
    <svg
      style={{ position: 'absolute', left: 0, top: 0, width: CW, height: CH, pointerEvents: 'none' }}
    >
      {edges.map(e => {
        const color   = e.kind === 'marriage' ? '#fb7185' : e.kind === 'sibling' ? '#a78bfa' : '#78716c';
        const dash    = e.kind === 'sibling'  ? '6 4' : 'none';
        const width   = e.kind === 'marriage' ? 2 : 1.5;
        const mid     = e.points[Math.floor(e.points.length / 2)];
        return (
          <g key={e.id}>
            <path d={polylinePath(e.points)} stroke={color} strokeWidth={width}
              fill="none" strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" />
            {e.label && mid && (
              <text x={mid[0]} y={mid[1] - 6} textAnchor="middle"
                fontSize="14" fill="#fb7185" style={{ userSelect: 'none' }}>
                {e.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend() {
  const items = [
    { color: '#78716c', dash: 'none',  label: 'Direct ancestry' },
    { color: '#fb7185', dash: 'none',  label: 'Marriage / partner' },
    { color: '#a78bfa', dash: '6 4',   label: 'Siblings' },
  ];
  return (
    <div className="flex items-center gap-5 px-4 py-2.5 bg-stone-900/80 rounded-xl border border-stone-800">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-2">
          <svg width="28" height="10">
            <line x1="0" y1="5" x2="28" y2="5"
              stroke={item.color} strokeWidth="1.8"
              strokeDasharray={item.dash} strokeLinecap="round" />
          </svg>
          <span className="text-[10px] text-stone-400 whitespace-nowrap">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Node card ─────────────────────────────────────────────────────────────────

function NodeCard({ node, p, onClick, onAdd }: {
  node: TreeNode; p: Pos;
  onClick: () => void;
  onAdd:   () => void;
}) {
  const [hov, setHov] = useState(false);
  const isSelf = node.relation === 'SELF';
  const lifespan = [
    node.birth_year  && `b. ${node.birth_year}`,
    node.death_year  && `d. ${node.death_year}`,
  ].filter(Boolean).join(' · ');

  return (
    <div
      style={{ position: 'absolute', left: OX + p.x, top: OY + p.y, width: p.w, zIndex: hov ? 10 : 1 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        onClick={onClick}
        className={[
          'rounded-2xl border p-3 flex flex-col gap-1 cursor-pointer select-none transition-all duration-150',
          isSelf
            ? 'bg-gradient-to-b from-stone-700 to-stone-800 border-stone-600 shadow-lg shadow-black/40'
            : hov
            ? 'bg-stone-800 border-stone-500 shadow-xl shadow-black/50'
            : 'bg-stone-850 bg-stone-900/90 border-stone-700 shadow-md shadow-black/30',
        ].join(' ')}
        style={{ height: p.h }}
      >
        <span className={`self-start text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${BADGE[node.relation]}`}>
          {LABELS[node.relation]}
        </span>
        <p className="text-xs font-semibold text-stone-100 leading-snug line-clamp-2">{node.full_name}</p>
        {lifespan && <p className="text-[10px] text-stone-500">{lifespan}</p>}
        {node.linked_profile_id && (
          <p className="text-[10px] text-blue-400">⟶ linked profile</p>
        )}
      </div>

      {hov && (
        <button
          onClick={e => { e.stopPropagation(); onAdd(); }}
          className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-stone-600 border border-stone-500 text-stone-200 text-xs font-bold flex items-center justify-center hover:bg-stone-500 transition-colors shadow-lg z-20"
          title="Add relative"
        >
          +
        </button>
      )}
    </div>
  );
}

// ── Node detail modal ─────────────────────────────────────────────────────────

function NodeModal({ node, onClose, onAddRelative, onRemove }: {
  node:          TreeNode;
  onClose:       () => void;
  onAddRelative: () => void;
  onRemove:      () => void;
}) {
  const lifespan = [node.birth_year && `b. ${node.birth_year}`, node.death_year && `d. ${node.death_year}`].filter(Boolean).join(' · ');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-stone-900 border border-stone-700 rounded-3xl p-7 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${BADGE[node.relation]}`}>
              {LABELS[node.relation]}
            </span>
            <h3 className="text-lg font-semibold text-stone-100 mt-2 leading-snug">{node.full_name}</h3>
            {lifespan && <p className="text-sm text-stone-400 mt-0.5">{lifespan}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-800 text-stone-400 hover:bg-stone-700 transition-colors text-lg">
            ×
          </button>
        </div>

        {node.linked_profile_id && (
          <div className="mb-5 bg-blue-950/50 border border-blue-800/50 rounded-xl px-4 py-3 flex items-center gap-3">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-blue-400 shrink-0">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5 8h6M9 6l2 2-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-xs text-blue-300">Has a linked LegacyLink memorial profile</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onAddRelative}
            className="flex-1 bg-stone-700 text-stone-100 text-sm font-semibold py-2.5 rounded-xl hover:bg-stone-600 transition-colors"
          >
            + Add Relative
          </button>
          {node.relation !== 'SELF' && (
            <button
              onClick={onRemove}
              className="text-sm text-red-400 border border-red-900/50 px-4 py-2.5 rounded-xl hover:bg-red-950/40 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add member form ───────────────────────────────────────────────────────────

function AddForm({ initial, onAdd, onClose }: {
  initial:  Partial<TreeNode>;
  onAdd:    (n: TreeNode) => void;
  onClose:  () => void;
}) {
  const [name,      setName]      = useState('');
  const [relation,  setRelation]  = useState<Relation>(initial.relation ?? 'PARENT');
  const [birthYear, setBirthYear] = useState('');
  const [deathYear, setDeathYear] = useState('');
  const [linkedId,  setLinkedId]  = useState('');

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      id:        Date.now().toString(),
      full_name: name.trim(),
      relation,
      ...(birthYear && { birth_year: Number(birthYear) }),
      ...(deathYear && { death_year: Number(deathYear) }),
      ...(linkedId  && { linked_profile_id: linkedId }),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-stone-900 border border-stone-700 rounded-3xl p-7 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-stone-100">Add Family Member</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-800 text-stone-400 hover:bg-stone-700 transition-colors text-lg">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Full Name</label>
            <input
              autoFocus
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="e.g. George Patterson"
              className="w-full bg-stone-800 border border-stone-600 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Relationship to Margaret</label>
            <select
              value={relation} onChange={e => setRelation(e.target.value as Relation)}
              className="w-full bg-stone-800 border border-stone-600 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              {(Object.keys(LABELS) as Relation[]).filter(r => r !== 'SELF').map(r => (
                <option key={r} value={r}>{LABELS[r]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Birth Year</label>
              <input
                type="number" placeholder="1940"
                value={birthYear} onChange={e => setBirthYear(e.target.value)}
                className="w-full bg-stone-800 border border-stone-600 rounded-xl px-3 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Death Year</label>
              <input
                type="number" placeholder="Optional"
                value={deathYear} onChange={e => setDeathYear(e.target.value)}
                className="w-full bg-stone-800 border border-stone-600 rounded-xl px-3 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">
              Link to LegacyLink Profile <span className="normal-case font-normal text-stone-600">(optional)</span>
            </label>
            <input
              placeholder="Short ID — e.g. a5trneuj"
              value={linkedId} onChange={e => setLinkedId(e.target.value)}
              className="w-full bg-stone-800 border border-stone-600 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 font-mono focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={submit}
            className="flex-1 bg-stone-100 text-stone-900 text-sm font-bold py-3 rounded-xl hover:bg-white transition-colors"
          >
            Add to Tree
          </button>
          <button
            onClick={onClose}
            className="text-sm text-stone-500 border border-stone-700 px-5 py-3 rounded-xl hover:bg-stone-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function FamilyTreePanel() {
  const [nodes,        setNodes]        = useState<TreeNode[]>(SEED);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [addInitial,   setAddInitial]   = useState<Partial<TreeNode>>({});

  // Pan / zoom
  const canvasRef = useRef<HTMLDivElement>(null);
  const [pan,      setPan]      = useState({ x: 0, y: 0 });
  const [scale,    setScale]    = useState(0.82);
  const [panning,  setPanning]  = useState(false);
  const dragging = useRef(false);

  // Wheel zoom — must be non-passive to call preventDefault
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale(s => Math.max(0.3, Math.min(2.5, s * (e.deltaY > 0 ? 0.92 : 1.09))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
    };

    const onUp = () => {
      dragging.current = false;
      setPanning(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    const onDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.('[data-node]')) return;
      e.preventDefault();
      dragging.current = true;
      setPanning(true);
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };

    el.addEventListener('mousedown', onDown);
    return () => {
      el.removeEventListener('mousedown', onDown);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  const positions = useMemo(() => buildLayout(nodes), [nodes]);
  const edges     = useMemo(() => buildEdges(nodes, positions), [nodes, positions]);

  const openAdd = (initial: Partial<TreeNode> = {}) => {
    setSelectedNode(null);
    setAddInitial(initial);
    setShowAdd(true);
  };

  const addNode = (n: TreeNode) => {
    setNodes(prev => [...prev, n]);
    setShowAdd(false);
  };

  const removeNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setSelectedNode(null);
  };

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-stone-400">
            {nodes.length} member{nodes.length !== 1 ? 's' : ''} &middot; scroll to zoom &middot; drag to pan
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setPan({ x: 0, y: 0 }); setScale(0.82); }}
            className="text-xs text-stone-400 border border-stone-700 px-3 py-1.5 rounded-lg hover:bg-stone-800 transition-colors"
          >
            Reset view
          </button>
          <button
            onClick={() => openAdd({})}
            className="text-xs font-semibold bg-stone-800 text-stone-100 border border-stone-600 px-4 py-1.5 rounded-lg hover:bg-stone-700 transition-colors"
          >
            + Add Member
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full rounded-2xl overflow-hidden bg-stone-950 border border-stone-800"
        style={{ height: 520, cursor: panning ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}
      >
        {/* Inner transform wrapper */}
        <div style={{
          position: 'absolute', left: 0, top: 0, width: CW, height: CH,
          transform: `translate(${pan.x - CW / 2 + (canvasRef.current?.offsetWidth ?? 780) / 2}px, ${pan.y - CH / 2 + 260}px) scale(${scale})`,
          transformOrigin: '50% 50%',
        }}>
          <EdgeLayer edges={edges} />

          {nodes.map(node => {
            const p = positions.get(node.id);
            if (!p) return null;
            return (
              <div key={node.id} data-node="true">
                <NodeCard
                  node={node} p={p}
                  onClick={() => setSelectedNode(node)}
                  onAdd={() => openAdd({ relation: SUGGESTED_NEXT[node.relation] ?? 'OTHER' })}
                />
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <p className="text-stone-600 text-sm">No family members yet</p>
            <button onClick={() => openAdd({})} className="text-xs font-semibold text-stone-400 border border-stone-700 px-4 py-2 rounded-xl hover:bg-stone-800 transition-colors">
              + Add First Member
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-3">
          <Legend />
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          {[['＋', 1.15], ['－', 0.87]].map(([label, factor]) => (
            <button key={String(label)}
              onClick={() => setScale(s => Math.max(0.3, Math.min(2.5, s * Number(factor))))}
              className="w-8 h-8 bg-stone-900/90 border border-stone-700 rounded-lg text-stone-300 text-sm flex items-center justify-center hover:bg-stone-800 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* GEDCOM import */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Import Family Data</h3>
        <p className="text-xs text-stone-400 mb-4">Upload a GEDCOM file from Ancestry.com or MyHeritage to auto-populate the tree.</p>
        <label className="flex items-center gap-3 border border-dashed border-stone-200 rounded-xl p-4 cursor-pointer hover:border-stone-400 transition-colors">
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-stone-300 shrink-0">
            <path d="M10 13V5m0 0L7 8m3-3l3 3M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm text-stone-400">Click to upload a <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">.ged</code> file</span>
          <input type="file" accept=".ged,.gedcom" className="hidden" />
        </label>
      </div>

      {/* Modals */}
      {selectedNode && (
        <NodeModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onAddRelative={() => openAdd({ relation: SUGGESTED_NEXT[selectedNode.relation] ?? 'OTHER' })}
          onRemove={() => removeNode(selectedNode.id)}
        />
      )}
      {showAdd && (
        <AddForm
          initial={addInitial}
          onAdd={addNode}
          onClose={() => setShowAdd(false)}
        />
      )}

    </div>
  );
}
