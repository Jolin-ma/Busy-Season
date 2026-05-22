'use client';
import { useState } from 'react';
import { TimelineMilestone } from '@/types/profile';

interface Props {
  milestones: TimelineMilestone[];
  onChange: (milestones: TimelineMilestone[]) => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Step2Timeline({ milestones, onChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const add = () => {
    const newItem: TimelineMilestone = { id: uid(), year: '', title: '', description: '' };
    onChange([...milestones, newItem]);
    setExpandedId(newItem.id);
  };

  const update = (id: string, patch: Partial<TimelineMilestone>) => {
    onChange(milestones.map(m => m.id === id ? { ...m, ...patch } : m));
  };

  const remove = (id: string) => {
    onChange(milestones.filter(m => m.id !== id));
  };

  const move = (index: number, dir: 'up' | 'down') => {
    const next = [...milestones];
    const swap = dir === 'up' ? index - 1 : index + 1;
    [next[index], next[swap]] = [next[swap], next[index]];
    onChange(next);
  };

  return (
    <div>
      <p className="text-sm text-stone-500 mb-6">
        Add key milestones in chronological order. You can reorder or delete them at any time.
      </p>

      <div className="space-y-3">
        {milestones.map((m, i) => (
          <div key={m.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            {/* Card header */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
              onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
            >
              <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 text-xs flex items-center justify-center shrink-0 font-semibold">
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-medium text-stone-700 truncate">
                {m.year && m.title ? `${m.year} — ${m.title}` : <span className="text-stone-400 italic">Untitled milestone</span>}
              </span>
              {/* Move buttons */}
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => move(i, 'up')}
                  disabled={i === 0}
                  className="p-1 text-stone-400 hover:text-stone-600 disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Move up"
                >▲</button>
                <button
                  onClick={() => move(i, 'down')}
                  disabled={i === milestones.length - 1}
                  className="p-1 text-stone-400 hover:text-stone-600 disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Move down"
                >▼</button>
                <button
                  onClick={() => remove(m.id)}
                  className="p-1 text-red-400 hover:text-red-600"
                  title="Delete"
                >✕</button>
              </div>
            </div>

            {/* Expanded fields */}
            {expandedId === m.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-stone-100">
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">Year</label>
                    <input
                      type="number"
                      value={m.year}
                      onChange={e => update(m.id, { year: e.target.value })}
                      placeholder="1974"
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={m.title}
                      onChange={e => update(m.id, { title: e.target.value })}
                      placeholder="e.g. Founded the Community Clinic"
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={m.description}
                    onChange={e => update(m.id, { description: e.target.value })}
                    placeholder="A brief description of this life event…"
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="mt-5 w-full py-3.5 border-2 border-dashed border-stone-300 rounded-2xl text-stone-500 text-sm font-medium hover:border-stone-400 hover:bg-stone-50 transition-colors"
      >
        + Add Milestone
      </button>
    </div>
  );
}
