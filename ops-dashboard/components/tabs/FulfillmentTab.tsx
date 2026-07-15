'use client';
import { useState, useEffect, useCallback } from 'react';
import FulfillmentQueue, { type FulfillmentProfile } from '@/components/FulfillmentQueue';

type PlaqueStatus = 'ORDER_RECEIVED' | 'ENGRAVING' | 'SHIPPED' | 'DELIVERED';

interface FulfillmentOrder {
  shortId:        string;
  profileName:    string;
  customerName:   string;
  customerEmail:  string;
  plaqueStatus:   PlaqueStatus;
  createdAt:      string;
  address:        string | null;
  city:           string | null;
  plaqueStyle:    string | null;
  trackingNumber: string | null;
  shippedAt:      string | null;
}

const STATUS_STYLE: Record<PlaqueStatus, { bg: string; text: string; dot: string }> = {
  ORDER_RECEIVED: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  ENGRAVING:      { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
  SHIPPED:        { bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-500'  },
  DELIVERED:      { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

function OrderTable({
  orders,
  onShip,
}: {
  orders: FulfillmentOrder[];
  onShip: (shortId: string, tracking: string) => Promise<void>;
}) {
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [shipping, setShipping] = useState<Record<string, boolean>>({});

  if (orders.length === 0) {
    return <p className="text-xs text-stone-400 text-center py-10">No orders in this stage.</p>;
  }

  const handleShip = async (shortId: string) => {
    const t = tracking[shortId];
    if (!t) return;
    setShipping(s => ({ ...s, [shortId]: true }));
    await onShip(shortId, t);
    setTracking(t => { const n = { ...t }; delete n[shortId]; return n; });
    setShipping(s => { const n = { ...s }; delete n[shortId]; return n; });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-100">
            {['Profile', 'Customer', 'Address', 'Plaque', 'Ordered', 'Tracking / Action'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {orders.map(o => {
            const s = STATUS_STYLE[o.plaqueStatus];
            return (
              <tr key={o.shortId} className="hover:bg-stone-50/60 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-stone-800 whitespace-nowrap">{o.profileName}</p>
                  <code className="text-[10px] font-mono text-stone-400">{o.shortId}</code>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-stone-700 whitespace-nowrap">{o.customerName}</p>
                  <p className="text-[10px] text-stone-400 truncate max-w-[140px]">{o.customerEmail}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-stone-600 max-w-[180px] leading-snug">
                    {o.address ?? <span className="text-stone-300">—</span>}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {o.plaqueStyle
                    ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 whitespace-nowrap">{o.plaqueStyle}</span>
                    : <span className="text-[10px] text-stone-300">—</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-stone-500 whitespace-nowrap">{fmtDate(o.createdAt)}</span>
                  {o.shippedAt && <p className="text-[10px] text-stone-400">Shipped {fmtDate(o.shippedAt)}</p>}
                </td>
                <td className="px-4 py-3">
                  {o.trackingNumber ? (
                    <code className={`text-[11px] font-mono px-2 py-0.5 rounded ${s.bg} ${s.text}`}>{o.trackingNumber}</code>
                  ) : o.plaqueStatus === 'ENGRAVING' ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Enter tracking #"
                        value={tracking[o.shortId] ?? ''}
                        onChange={e => setTracking(t => ({ ...t, [o.shortId]: e.target.value }))}
                        className="text-xs border border-stone-200 rounded-lg px-2 py-1 w-32 outline-none focus:ring-2 focus:ring-stone-300"
                      />
                      <button
                        disabled={!tracking[o.shortId] || shipping[o.shortId]}
                        onClick={() => handleShip(o.shortId)}
                        className="text-[10px] font-semibold px-2 py-1 bg-stone-900 text-white rounded-lg disabled:opacity-30 transition-opacity"
                      >
                        {shipping[o.shortId] ? '…' : 'Ship'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-stone-300">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type SubTab = 'qr_gen' | 'ENGRAVING' | 'SHIPPED' | 'DELIVERED';

export default function FulfillmentTab() {
  const [orders,  setOrders]  = useState<FulfillmentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [sub,     setSub]     = useState<SubTab>('qr_gen');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/gw/admin/fulfillment');
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      setError('Could not reach the backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = (shortId: string, newStatus: FulfillmentProfile['plaqueStatus']) => {
    setOrders(prev => prev.map(o => o.shortId === shortId ? { ...o, plaqueStatus: newStatus } : o));
  };

  const handleShip = async (shortId: string, trackingNumber: string) => {
    await fetch(`/api/gw/admin/fulfillment/${shortId}/ship`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ trackingNumber }),
    });
    setOrders(prev => prev.map(o =>
      o.shortId === shortId
        ? { ...o, plaqueStatus: 'SHIPPED', trackingNumber, shippedAt: new Date().toISOString() }
        : o,
    ));
  };

  const counts = {
    qr_gen:    orders.filter(o => o.plaqueStatus === 'ORDER_RECEIVED').length,
    ENGRAVING: orders.filter(o => o.plaqueStatus === 'ENGRAVING').length,
    SHIPPED:   orders.filter(o => o.plaqueStatus === 'SHIPPED').length,
    DELIVERED: orders.filter(o => o.plaqueStatus === 'DELIVERED').length,
  };

  const SUB_TABS: { key: SubTab; label: string }[] = [
    { key: 'qr_gen',    label: 'QR Generation'  },
    { key: 'ENGRAVING', label: 'To Be Shipped'   },
    { key: 'SHIPPED',   label: 'In Transit'      },
    { key: 'DELIVERED', label: 'Delivered'       },
  ];

  const queueProfiles: FulfillmentProfile[] = orders
    .filter(o => o.plaqueStatus === 'ORDER_RECEIVED' || o.plaqueStatus === 'ENGRAVING')
    .map(o => ({
      shortId:      o.shortId,
      profileName:  o.profileName,
      customerName: o.customerName,
      plaqueStatus: o.plaqueStatus,
      createdAt:    o.createdAt,
    }));

  if (loading) return <div className="flex items-center justify-center h-40 text-stone-400 text-sm">Loading…</div>;
  if (error)   return <div className="flex items-center justify-center h-40 text-red-500 text-sm">{error}</div>;

  return (
    <div className="space-y-5">
      {/* Sub-tab bar */}
      <div className="flex gap-1 bg-white border border-stone-100 rounded-2xl p-1.5 shadow-sm w-fit">
        {SUB_TABS.map(t => {
          const count = counts[t.key];
          return (
            <button
              key={t.key}
              onClick={() => setSub(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                sub === t.key ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
              }`}
            >
              {t.label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  sub === t.key ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* QR Generation — real profiles from DB */}
      {sub === 'qr_gen' && (
        <FulfillmentQueue
          profiles={queueProfiles}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Shipping pipeline tabs */}
      {sub !== 'qr_gen' && (
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">
              {SUB_TABS.find(t => t.key === sub)?.label}
            </p>
            <p className="text-sm font-semibold text-stone-800">
              {counts[sub]} order{counts[sub] !== 1 ? 's' : ''}
            </p>
          </div>
          <OrderTable
            orders={orders.filter(o => o.plaqueStatus === sub)}
            onShip={handleShip}
          />
        </div>
      )}
    </div>
  );
}
