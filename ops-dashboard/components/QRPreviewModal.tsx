'use client';
import { useEffect, useRef, useState } from 'react';

interface QRProfile { id: string; name: string; url: string; svg: string }
interface Props { profiles: QRProfile[]; onClose: () => void }

function downloadSvg(svg: string, filename: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadPng(svg: string, filename: string, size = 1024): Promise<void> {
  return new Promise(resolve => {
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl  = URL.createObjectURL(svgBlob);
    const img     = new Image();
    img.onload = () => {
      const canvas  = document.createElement('canvas');
      canvas.width  = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(svgUrl);
      canvas.toBlob(pngBlob => {
        if (pngBlob) {
          const pngUrl = URL.createObjectURL(pngBlob);
          const a      = document.createElement('a');
          a.href = pngUrl; a.download = filename; a.click();
          URL.revokeObjectURL(pngUrl);
        }
        resolve();
      }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(svgUrl); resolve(); };
    img.src = svgUrl;
  });
}

function downloadAllSvg(profiles: QRProfile[]) {
  profiles.forEach((p, i) => setTimeout(() => downloadSvg(p.svg, `QR-${p.id}.svg`), i * 120));
}

async function downloadAllPng(profiles: QRProfile[], onProgress: (done: number) => void) {
  for (let i = 0; i < profiles.length; i++) {
    await downloadPng(profiles[i].svg, `QR-${profiles[i].id}.png`);
    onProgress(i + 1);
    // Small gap between downloads so the browser doesn't choke
    await new Promise(r => setTimeout(r, 80));
  }
}

export default function QRPreviewModal({ profiles, onClose }: Props) {
  const backdropRef          = useRef<HTMLDivElement>(null);
  const [pngLoading, setPngLoading]     = useState<Set<string>>(new Set());
  const [batchPngBusy, setBatchPngBusy] = useState(false);
  const [batchPngDone, setBatchPngDone] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleDownloadPng = async (p: QRProfile) => {
    setPngLoading(prev => new Set(prev).add(p.id));
    await downloadPng(p.svg, `QR-${p.id}.png`);
    setPngLoading(prev => { const n = new Set(prev); n.delete(p.id); return n; });
  };

  const handleBatchPng = async () => {
    setBatchPngBusy(true);
    setBatchPngDone(0);
    await downloadAllPng(profiles, done => setBatchPngDone(done));
    setBatchPngBusy(false);
    setBatchPngDone(0);
  };

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
              {profiles.length} code{profiles.length !== 1 ? 's' : ''} · Level H error correction · print-ready
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Batch SVG */}
            <button
              onClick={() => downloadAllSvg(profiles)}
              className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              All SVG ({profiles.length})
            </button>

            {/* Batch PNG */}
            <button
              onClick={handleBatchPng}
              disabled={batchPngBusy}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              {batchPngBusy ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {batchPngDone}/{profiles.length} PNG…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  All PNG ({profiles.length})
                </>
              )}
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
            {profiles.map(p => {
              const isPngLoading = pngLoading.has(p.id);
              return (
                <div key={p.id} className="bg-white border border-stone-100 rounded-2xl p-3 flex flex-col gap-3 shadow-sm">
                  {/* QR preview */}
                  <div className="w-full aspect-square bg-white border border-stone-100 rounded-xl overflow-hidden flex items-center justify-center">
                    <div
                      className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: p.svg }}
                    />
                  </div>

                  {/* Label */}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-700 truncate">{p.name}</p>
                    <code className="text-[10px] text-stone-400 font-mono">{p.id}</code>
                  </div>

                  {/* Download buttons — same layout as admin QRModal */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => downloadSvg(p.svg, `QR-${p.id}.svg`)}
                      className="py-2 border border-stone-200 rounded-xl text-[11px] font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                    >
                      ↓ SVG
                      <span className="block text-[9px] font-normal text-stone-400 mt-0.5 leading-none">Vector · engraving</span>
                    </button>
                    <button
                      onClick={() => handleDownloadPng(p)}
                      disabled={isPngLoading}
                      className="py-2 bg-stone-800 rounded-xl text-[11px] font-medium text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
                    >
                      {isPngLoading ? (
                        <span className="flex items-center justify-center gap-1">
                          <svg className="w-2.5 h-2.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </span>
                      ) : (
                        <>
                          ↓ PNG
                          <span className="block text-[9px] font-normal text-white/60 mt-0.5 leading-none">1024 px · sharing</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-100 shrink-0">
          <p className="text-[10px] text-stone-400">
            Error-correction level H — maximum redundancy for laser engraving on metal or stone.
            PNG exports are 1024×1024 px on white, suitable for digital sharing and standard printing.
          </p>
        </div>
      </div>
    </div>
  );
}
