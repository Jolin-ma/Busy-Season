'use client';
import { useEffect, useRef } from 'react';

interface QRProfile { id: string; name: string; url: string; svg: string }
interface Props { profiles: QRProfile[]; onClose: () => void }

function downloadSvg(svg: string, filename: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadAll(profiles: QRProfile[]) {
  profiles.forEach((p, i) => setTimeout(() => downloadSvg(p.svg, `QR-${p.id}.svg`), i * 120));
}

export default function QRPreviewModal({ profiles, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-white border border-stone-100 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Generated QR Codes</h2>
            <p className="text-sm font-semibold text-stone-800">
              {profiles.length} vector SVG{profiles.length !== 1 ? 's' : ''} · 1000×1000px · print-ready
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadAll(profiles)}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              Download All ({profiles.length})
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors text-lg"
            >
              ×
            </button>
          </div>
        </div>

        {/* QR grid */}
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {profiles.map(p => (
              <div key={p.id} className="bg-white border border-stone-100 rounded-2xl p-3 flex flex-col gap-3 shadow-sm">
                <div
                  className="w-full aspect-square bg-white border border-stone-100 rounded-xl overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: p.svg }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-700 truncate">{p.name}</p>
                  <code className="text-[10px] text-stone-400 font-mono">{p.id}</code>
                </div>
                <button
                  onClick={() => downloadSvg(p.svg, `QR-${p.id}.svg`)}
                  className="w-full text-xs text-stone-600 border border-stone-200 hover:bg-stone-50 py-1.5 rounded-lg transition-colors font-medium"
                >
                  Download SVG
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-100 shrink-0">
          <p className="text-[10px] text-stone-400">
            Error-correction level H — maximum redundancy for laser engraving on metal or stone.
          </p>
        </div>
      </div>
    </div>
  );
}
