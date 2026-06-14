'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { buildManufacturerPayload } from '@/lib/qr';
import QRPreviewModal from './QRPreviewModal';

export interface FulfillmentProfile {
  shortId:      string;
  profileName:  string;
  customerName: string;
  plaqueStatus: 'ORDER_RECEIVED' | 'ENGRAVING' | 'SHIPPED' | 'DELIVERED';
  createdAt:    string;
}

interface QRProfile { id: string; name: string; url: string; svg: string }

const STATUS_STYLES: Record<FulfillmentProfile['plaqueStatus'], string> = {
  ORDER_RECEIVED: 'bg-amber-50 text-amber-700 border-amber-100',
  ENGRAVING:      'bg-blue-50 text-blue-700 border-blue-100',
  SHIPPED:        'bg-indigo-50 text-indigo-700 border-indigo-100',
  DELIVERED:      'bg-emerald-50 text-emerald-700 border-emerald-100',
};
const STATUS_LABELS: Record<FulfillmentProfile['plaqueStatus'], string> = {
  ORDER_RECEIVED: 'Pending',
  ENGRAVING:      'In Production',
  SHIPPED:        'Shipped',
  DELIVERED:      'Delivered',
};

function StatusBadge({ status }: { status: FulfillmentProfile['plaqueStatus'] }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_STYLES[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />;
}

interface Props {
  profiles:      FulfillmentProfile[];
  onStatusChange: (shortId: string, newStatus: FulfillmentProfile['plaqueStatus']) => void;
}

export default function FulfillmentQueue({ profiles, onStatusChange }: Props) {
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [sending,     setSending]     = useState(false);
  const [generating,  setGenerating]  = useState(false);
  const [qrLoading,   setQrLoading]   = useState<string | null>(null);
  const [qrModalData, setQrModalData] = useState<QRProfile[] | null>(null);

  const pending         = profiles.filter(p => p.plaqueStatus === 'ORDER_RECEIVED');
  const allPendingSelected = pending.length > 0 && pending.every(p => selected.has(p.shortId));

  const toggleSelectAll = () => {
    if (allPendingSelected) {
      setSelected(s => { const n = new Set(s); pending.forEach(p => n.delete(p.shortId)); return n; });
    } else {
      setSelected(s => { const n = new Set(s); pending.forEach(p => n.add(p.shortId)); return n; });
    }
  };

  const toggleRow = (id: string) =>
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const generateQRCodes = async (ids: string[]) => {
    setGenerating(true);
    try {
      const res  = await fetch('/api/qr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shortIds: ids }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      setQrModalData(data.profiles);
    } catch (err) {
      toast.error('QR generation failed', { description: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setGenerating(false);
    }
  };

  const previewSingleQR = async (profile: FulfillmentProfile) => {
    setQrLoading(profile.shortId);
    try {
      const res = await fetch(`/api/qr?id=${profile.shortId}`);
      if (!res.ok) throw new Error('Failed');
      const svg = await res.text();
      const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://legacylinkstudio.com'}/p/${profile.shortId}`;
      setQrModalData([{ id: profile.shortId, name: profile.profileName, url, svg }]);
    } catch {
      toast.error('QR preview failed');
    } finally {
      setQrLoading(null);
    }
  };

  const sendToManufacturer = async () => {
    if (!selected.size) return;
    setSending(true);
    const ids = [...selected];
    try {
      const res  = await fetch('/api/manufacturing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shortIds: ids }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Request failed');
      ids.forEach(id => onStatusChange(id, 'ENGRAVING'));
      setSelected(new Set());
      toast.success(`Sent ${data.sent} order${data.sent !== 1 ? 's' : ''} to manufacturer`, { description: `Order ID: ${data.orderId}` });
    } catch (err) {
      toast.error('Failed to send orders', { description: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section id="fulfillment" className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-stone-100">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">QR Fulfillment Queue</h2>
            <p className="text-sm font-semibold text-stone-800">
              {pending.length} pending · {selected.size} selected
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generateQRCodes([...selected])}
              disabled={selected.size === 0 || generating || sending}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors',
                selected.size > 0 && !generating && !sending
                  ? 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  : 'border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed',
              ].join(' ')}
            >
              {generating
                ? <><Spinner /> Generating…</>
                : <>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM11 13a1 1 0 011-1h1v1h-1v1h1v1h-1v1h-1v-1h-1v-1h1v-1zm3 0h1v1h-1v-1zm1 2h1v1h-1v-1zm-3 1h1v1h-1v-1z" clipRule="evenodd" /></svg>
                    Generate QR Codes{selected.size > 0 ? ` (${selected.size})` : ''}
                  </>
              }
            </button>

            <button
              onClick={sendToManufacturer}
              disabled={selected.size === 0 || sending || generating}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                selected.size > 0 && !sending && !generating
                  ? 'bg-stone-900 text-white hover:bg-stone-700'
                  : 'bg-stone-100 text-stone-300 cursor-not-allowed',
              ].join(' ')}
            >
              {sending
                ? <><Spinner /> Sending…</>
                : <>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /></svg>
                    Send to Manufacturer{selected.size > 0 ? ` (${selected.size})` : ''}
                  </>
              }
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] uppercase tracking-widest text-stone-400">
                <th className="py-3 px-5 text-left w-10">
                  <input
                    type="checkbox"
                    checked={allPendingSelected}
                    onChange={toggleSelectAll}
                    title="Select all pending"
                    className="accent-stone-900 w-3.5 h-3.5 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 text-left">Profile ID</th>
                <th className="py-3 px-4 text-left">Deceased Name</th>
                <th className="py-3 px-4 text-left">Date Created</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {profiles.map(profile => {
                const isPending   = profile.plaqueStatus === 'ORDER_RECEIVED';
                const isSelected  = selected.has(profile.shortId);
                const isLoadingQR = qrLoading === profile.shortId;

                return (
                  <tr
                    key={profile.shortId}
                    className={['transition-colors', isSelected ? 'bg-stone-50' : 'hover:bg-stone-50/50'].join(' ')}
                  >
                    <td className="py-3.5 px-5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(profile.shortId)}
                        disabled={!isPending}
                        className="accent-stone-900 w-3.5 h-3.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <code className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-lg">
                        {profile.shortId}
                      </code>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-stone-800 font-medium">{profile.profileName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 tabular-nums text-xs">
                      {new Date(profile.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={profile.plaqueStatus} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => previewSingleQR(profile)}
                          disabled={isLoadingQR}
                          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 transition-colors disabled:opacity-50"
                          title="Preview QR code"
                        >
                          {isLoadingQR
                            ? <Spinner />
                            : <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" /></svg>
                          }
                          QR
                        </button>
                        <a
                          href={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://legacylinkstudio.com'}/p/${profile.shortId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
                        >
                          View ↗
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-stone-400">No profiles in the queue.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {qrModalData && (
        <QRPreviewModal profiles={qrModalData} onClose={() => setQrModalData(null)} />
      )}
    </>
  );
}
