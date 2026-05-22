'use client';
import { useRef, useState } from 'react';
import { ProfileDraft } from '@/types/profile';

type Fields = Pick<ProfileDraft, 'name' | 'epitaph' | 'dateOfBirth' | 'dateOfDeath' | 'portraitFile' | 'portraitPreview'>;
export type Step1Errors = Partial<Record<keyof Fields, string>>;

interface Props {
  data: Fields;
  errors: Step1Errors;
  onChange: (data: Fields) => void;
}

export default function Step1CoreIdentity({ data, errors, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const preview = URL.createObjectURL(file);
    onChange({ ...data, portraitFile: file, portraitPreview: preview });
  };

  const field = (key: keyof Fields) => (
    errors[key] ? (
      <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
    ) : null
  );

  return (
    <div className="space-y-6">
      {/* Portrait Upload */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Portrait Photo</label>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-colors
            ${dragging ? 'border-stone-500 bg-stone-100' : 'border-stone-200 hover:border-stone-400 bg-stone-50'}`}
        >
          {data.portraitPreview ? (
            <div className="flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.portraitPreview} alt="Portrait preview" className="w-24 h-24 rounded-full object-cover shadow" />
              <p className="text-xs text-stone-500">Click or drop to replace</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-400 text-xl">＋</div>
              <p className="text-sm text-stone-500">Drop a photo here, or <span className="font-semibold text-stone-700">browse</span></p>
              <p className="text-xs text-stone-400">JPG, PNG — recommended 400×400px</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Full Name *</label>
        <input
          type="text"
          value={data.name}
          onChange={e => onChange({ ...data, name: e.target.value })}
          placeholder="e.g. Margaret Eleanor Whitfield"
          className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white
            ${errors.name ? 'border-red-300' : 'border-stone-200'}`}
        />
        {field('name')}
      </div>

      {/* Epitaph */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Epitaph / Favourite Quote *</label>
        <textarea
          rows={3}
          value={data.epitaph}
          onChange={e => onChange({ ...data, epitaph: e.target.value })}
          placeholder="A short, meaningful phrase displayed beneath their name…"
          className={`w-full border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white
            ${errors.epitaph ? 'border-red-300' : 'border-stone-200'}`}
        />
        {field('epitaph')}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Date of Birth *</label>
          <input
            type="date"
            value={data.dateOfBirth}
            onChange={e => onChange({ ...data, dateOfBirth: e.target.value })}
            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white
              ${errors.dateOfBirth ? 'border-red-300' : 'border-stone-200'}`}
          />
          {field('dateOfBirth')}
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Date of Death *</label>
          <input
            type="date"
            value={data.dateOfDeath}
            onChange={e => onChange({ ...data, dateOfDeath: e.target.value })}
            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white
              ${errors.dateOfDeath ? 'border-red-300' : 'border-stone-200'}`}
          />
          {field('dateOfDeath')}
        </div>
      </div>
    </div>
  );
}
