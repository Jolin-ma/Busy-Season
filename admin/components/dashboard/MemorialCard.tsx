'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Memorial, PlaqueStatus } from '@/types/profile';
import QRModal from './QRModal';

const STATUS_CONFIG: Record<PlaqueStatus, { label: string; color: string }> = {
  order_received: { label: 'Order Received',     color: 'bg-stone-100 text-stone-500' },
  engraving:      { label: 'In Laser Engraving', color: 'bg-amber-100 text-amber-700' },
  shipped:        { label: 'Shipped via USPS',   color: 'bg-blue-100 text-blue-700'   },
  delivered:      { label: 'Delivered',           color: 'bg-green-100 text-green-700' },
};

interface Props {
  memorial: Memorial;
  onEdit: () => void;
  onPrivacyChange: (isPrivate: boolean, privacyPin: string) => void;
}

export default function MemorialCard({ memorial, onEdit, onPrivacyChange }: Props) {
  const [showQR, setShowQR] = useState(false);
  const status              = STATUS_CONFIG[memorial.plaqueStatus];

  const handleToggle = async () => {
    const isPrivate  = !memorial.isPrivate;
    const privacyPin = isPrivate
      ? String(Math.floor(1000 + Math.random() * 9000))
      : '';

    try {
      await fetch(`http://localhost:3000/admin/link/${memorial.shortId}/privacy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrivate, privacyPin }),
      });
    } catch {
      // Server unreachable — local state still updates so UI stays consistent
    }
    onPrivacyChange(isPrivate, privacyPin);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        {/* Top row: portrait + info */}
        <div className="flex gap-5 items-start">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-stone-100 shrink-0">
            <Image
              src={memorial.portraitUrl}
              alt={memorial.name}
              width={64} height={64}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-stone-800 truncate">{memorial.name}</h3>
              {memorial.type === 'pet' && (
                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  🐾 Pet
                </span>
              )}
              {memorial.type === 'monument' && (
                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  🏛 Monument
                </span>
              )}
            </div>
            {memorial.type === 'monument' ? (
              <p className="text-xs text-stone-400 mt-0.5">{memorial.location ?? 'No location set'}</p>
            ) : (
              <p className="text-xs text-stone-400 mt-0.5">{memorial.dateOfBirth} — {memorial.dateOfDeath}</p>
            )}

            <span className={`inline-block mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
              {status.label}
            </span>

            {memorial.trackingNumber && (
              <p className="text-xs text-stone-400 mt-1">Tracking: {memorial.trackingNumber}</p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-50 mt-4 pt-4 space-y-3">

          {/* Privacy toggle row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {memorial.isPrivate ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-stone-500">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-stone-300">
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                </svg>
              )}
              <div>
                <span className="text-xs font-medium text-stone-600">
                  {memorial.isPrivate ? 'Private — PIN required' : 'Public — anyone with the QR code'}
                </span>
                {memorial.isPrivate && memorial.privacyPin && (
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    PIN: <span className="font-mono font-semibold text-stone-600 tracking-widest">{memorial.privacyPin}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Toggle switch */}
            <button
              onClick={handleToggle}
              className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-1
                ${memorial.isPrivate ? 'bg-stone-800' : 'bg-stone-200'}`}
              aria-label="Toggle profile privacy"
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                ${memorial.isPrivate ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-stone-400">
                <span className="font-semibold text-stone-600">{memorial.scansCount}</span> scans
              </span>
              <span className="text-stone-300">·</span>
              {memorial.shortId ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                  Pending
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowQR(true)}
                className="text-xs text-stone-500 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 transition-colors"
              >
                QR Code
              </button>
              <a
                href={`http://localhost:3000/${memorial.type === 'pet' ? 'pet' : memorial.type === 'monument' ? 'monument' : 'profile'}/${memorial.shortId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-stone-500 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 transition-colors"
              >
                View Profile
              </a>
              <button
                onClick={onEdit}
                className="text-xs font-semibold text-white bg-stone-800 rounded-lg px-3 py-1.5 hover:bg-stone-700 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <QRModal shortId={memorial.shortId} name={memorial.name} onClose={() => setShowQR(false)} />
      )}

    </>
  );
}
