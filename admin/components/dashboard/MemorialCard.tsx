'use client';
import Image from 'next/image';
import { Memorial, PlaqueStatus } from '@/types/profile';

const STATUS_CONFIG: Record<PlaqueStatus, { label: string; color: string }> = {
  order_received: { label: 'Order Received',     color: 'bg-stone-100 text-stone-500' },
  engraving:      { label: 'In Laser Engraving', color: 'bg-amber-100 text-amber-700' },
  shipped:        { label: 'Shipped via USPS',   color: 'bg-blue-100 text-blue-700'   },
  delivered:      { label: 'Delivered',           color: 'bg-green-100 text-green-700' },
};

interface Props {
  memorial: Memorial;
  onEdit: () => void;
}

export default function MemorialCard({ memorial, onEdit }: Props) {
  const status = STATUS_CONFIG[memorial.plaqueStatus];

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex gap-5 items-start">
      {/* Portrait */}
      <div className="w-16 h-16 rounded-full overflow-hidden bg-stone-100 shrink-0">
        <Image
          src={memorial.portraitUrl}
          alt={memorial.name}
          width={64}
          height={64}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-stone-800 truncate">{memorial.name}</h3>
        <p className="text-xs text-stone-400 mt-0.5">{memorial.dateOfBirth} — {memorial.dateOfDeath}</p>

        {/* Status badge */}
        <span className={`inline-block mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
          {status.label}
        </span>

        {memorial.trackingNumber && (
          <p className="text-xs text-stone-400 mt-1">Tracking: {memorial.trackingNumber}</p>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-stone-400">
            <span className="font-semibold text-stone-600">{memorial.scansCount}</span> scans
          </span>
          <div className="flex gap-2">
            <a
              href={`http://localhost:3000/profile/${memorial.shortId}`}
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
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
