'use client';
import { useEffect, useState } from 'react';

interface Props {
  shortId: string;
  name: string;
  onClose: () => void;
}

export default function QRModal({ shortId, name, onClose }: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/qr/${shortId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.text(); })
      .then(setSvg)
      .catch(() => setError(true));
  }, [shortId]);

  const downloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legacylink-${shortId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={copyScanUrl}
            className="py-3 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy URL'}
          </button>
          <button
            onClick={downloadSvg}
            disabled={!svg}
            className="py-3 bg-stone-800 rounded-xl text-sm font-medium text-white hover:bg-stone-700 transition-colors disabled:opacity-40"
          >
            Download SVG
          </button>
        </div>

        <p className="text-[10px] text-stone-300 text-center mt-4 leading-relaxed">
          The QR matrix is permanent. Only the destination URL can be updated later.
        </p>
      </div>
    </div>
  );
}
