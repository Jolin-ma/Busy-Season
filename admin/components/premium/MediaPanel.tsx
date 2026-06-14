'use client';
import { useState, useRef } from 'react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

export default function MediaPanel() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next: UploadedFile[] = Array.from(incoming).map(f => ({
      id: `${Date.now()}-${f.name}`,
      name: f.name,
      size: f.size,
      type: f.type,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }));
    setFiles(prev => [...prev, ...next]);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const iconForType = (type: string) => {
    if (type.startsWith('image/')) return '🖼';
    if (type === 'application/pdf') return '📄';
    if (type.startsWith('video/')) return '🎬';
    return '📎';
  };

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors
          ${dragging ? 'border-stone-400 bg-stone-100' : 'border-stone-200 bg-white hover:border-stone-300'}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,video/*,.doc,.docx"
          className="hidden"
          onChange={e => addFiles(e.target.files)}
        />
        <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-stone-300 mx-auto mb-3">
          <path d="M12 16V8m0 0l-3 3m3-3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20.5 16.5A4.5 4.5 0 0017 8h-.9A7 7 0 103.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="text-sm font-medium text-stone-600 mb-1">Drop files here or click to upload</p>
        <p className="text-xs text-stone-400">Photos, PDFs, videos, documents — any file up to 500 MB</p>
      </div>

      {/* Quick-pick buttons */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Photos',    accept: 'image/*',            icon: '🖼' },
          { label: 'Documents', accept: '.pdf,.doc,.docx',    icon: '📄' },
          { label: 'Videos',    accept: 'video/*',            icon: '🎬' },
        ].map(({ label, accept, icon }) => (
          <label key={label} className="cursor-pointer flex items-center gap-2.5 bg-white border border-stone-100 rounded-xl px-4 py-3 hover:border-stone-300 transition-colors">
            <span className="text-lg">{icon}</span>
            <span className="text-xs font-semibold text-stone-600">Upload {label}</span>
            <input type="file" multiple accept={accept} className="hidden" onChange={e => addFiles(e.target.files)} />
          </label>
        ))}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-50">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
              {files.length} file{files.length !== 1 ? 's' : ''} uploaded
            </p>
          </div>
          <ul className="divide-y divide-stone-50">
            {files.map(f => (
              <li key={f.id} className="flex items-center gap-3 px-5 py-3">
                {f.preview
                  ? <img src={f.preview} alt={f.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  : <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-lg shrink-0">{iconForType(f.type)}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">{f.name}</p>
                  <p className="text-xs text-stone-400">{formatSize(f.size)}</p>
                </div>
                <button
                  onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))}
                  className="text-stone-300 hover:text-red-400 transition-colors p-1"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
