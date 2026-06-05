'use client';
import { useEffect, useState } from 'react';

interface Props {
  shortId: string;
  name: string;
  onClose: () => void;
}

export default function QRModal({ shortId, name, onClose }: Props) {
  const [svg, setSvg]         = useState<string | null>(null);
  const [error, setError]     = useState(false);
  const [copied, setCopied]   = useState(false);
  const [pngLoading, setPngLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/qr/${shortId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.text(); })
      .then(setSvg)
      .catch(() => setError(true));
  }, [shortId]);

  const downloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `legacylink-${shortId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = (size = 1024) => {
    if (!svg || pngLoading) return;
    setPngLoading(true);
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
        setPngLoading(false);
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a      = document.createElement('a');
        a.href       = pngUrl;
        a.download   = `legacylink-${shortId}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    };
    img.onerror = () => { setPngLoading(false); URL.revokeObjectURL(svgUrl); };
    img.src = svgUrl;
  };

  const copyScanUrl = async () => {
    const host = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
    await navigator.clipboard.writeText(`http://${host}:3000/p/${shortId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 w-full max-w-xs shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-semibold text-stone-800 text-base">QR Code</h3>
            <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[180px]">{name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-400 hover:bg-stone-200 transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* QR Display */}
        <div className="border border-stone-100 rounded-2xl flex items-center justify-center aspect-square p-5 mb-4 bg-white">
          {error ? (
            <div className="text-center">
              <p className="text-stone-400 text-xs">Could not reach QR engine.</p>
              <p className="text-stone-300 text-[10px] mt-1">Make sure the Fastify server is running on port 3000.</p>
            </div>
          ) : svg ? (
            <div
              dangerouslySetInnerHTML={{ __html: svg }}
              className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
            />
          ) : (
            <div className="w-7 h-7 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
          )}
        </div>

        <p className="text-[10px] text-stone-400 text-center mb-5 leading-relaxed px-2">
          Level H error correction &mdash; readable with up to 30% surface damage
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {/* Download row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={downloadSvg}
              disabled={!svg}
              className="py-2.5 border border-stone-200 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-40"
            >
              ↓ SVG
              <span className="block text-[10px] font-normal text-stone-400 mt-0.5">Vector · engraving</span>
            </button>
            <button
              onClick={() => downloadPng()}
              disabled={!svg || pngLoading}
              className="py-2.5 bg-stone-800 rounded-xl text-xs font-medium text-white hover:bg-stone-700 transition-colors disabled:opacity-40"
            >
              {pngLoading ? (
                <span className="flex items-center justify-center gap-1.5">
                  <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                  Rendering…
                </span>
              ) : (
                <>
                  ↓ PNG
                  <span className="block text-[10px] font-normal text-white/60 mt-0.5">1024 px · sharing</span>
                </>
              )}
            </button>
          </div>

          {/* Copy URL */}
          <button
            onClick={copyScanUrl}
            className="w-full py-2.5 border border-stone-200 rounded-xl text-xs font-medium text-stone-500 hover:bg-stone-50 transition-colors"
          >
            {copied ? '✓ Link copied to clipboard' : 'Copy scan URL'}
          </button>
        </div>

        <p className="text-[10px] text-stone-300 text-center mt-4 leading-relaxed">
          The QR matrix is permanent. Only the destination URL can be updated later.
        </p>
      </div>
    </div>
  );
}
