'use client';
import { useRef, useState } from 'react';
import { GalleryFile } from '@/types/profile';

interface Props {
  gallery: GalleryFile[];
  isPrivate: boolean;
  privacyPin: string;
  onChange: (patch: { gallery?: GalleryFile[]; isPrivate?: boolean; privacyPin?: string }) => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Step3MediaSettings({ gallery, isPrivate, privacyPin, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: GalleryFile[] = Array.from(files)
      .filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .map(f => ({ id: uid(), file: f, preview: URL.createObjectURL(f) }));
    onChange({ gallery: [...gallery, ...newItems] });
  };

  const removeGalleryItem = (id: string) => {
    onChange({ gallery: gallery.filter(g => g.id !== id) });
  };

  return (
    <div className="space-y-8">
      {/* Gallery Upload */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Photo & Video Gallery</label>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-colors
            ${dragging ? 'border-stone-500 bg-stone-100' : 'border-stone-200 hover:border-stone-400 bg-stone-50'}`}
        >
          <p className="text-sm text-stone-500">Drop photos or videos here, or <span className="font-semibold text-stone-700">browse</span></p>
          <p className="text-xs text-stone-400 mt-1">JPG, PNG, MP4 — multiple files supported</p>
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden"
            onChange={e => addFiles(e.target.files)} />
        </div>

        {gallery.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 mt-4">
            {gallery.map(item => (
              <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeGalleryItem(item.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Toggle */}
      <div className="bg-white border border-stone-100 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-stone-800">Profile Privacy</p>
            <p className="text-xs text-stone-400 mt-0.5">
              {isPrivate ? 'Visitors need a PIN to view this profile' : 'Anyone with the QR code can view this profile'}
            </p>
          </div>
          {/* Toggle */}
          <button
            onClick={() => onChange({ isPrivate: !isPrivate, privacyPin: '' })}
            className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none
              ${isPrivate ? 'bg-stone-800' : 'bg-stone-300'}`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform
                ${isPrivate ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
        </div>

        {isPrivate && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Access PIN</label>
            <input
              type="text"
              maxLength={6}
              value={privacyPin}
              onChange={e => onChange({ privacyPin: e.target.value.replace(/\D/g, '') })}
              placeholder="4–6 digit PIN"
              className="w-36 border border-stone-200 rounded-xl px-4 py-3 text-sm text-center tracking-widest focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}
