'use client';
import { useState } from 'react';
import { SHIPPING_ORDERS, type ShipStatus, type ShippingOrder } from '@/lib/mock-data';
import FulfillmentQueue from '@/components/FulfillmentQueue';

const STATUS_STYLE: Record<ShipStatus, { bg: string; text: string; dot: string; label: string }> = {
  PENDING_QR:   { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500',   label: 'Pending QR'   },
  PENDING_SHIP: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500',    label: 'Pending Ship' },
  SHIPPED:      { bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-500',  label: 'Shipped'      },
  DELIVERED:    { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Delivered'    },
};

const PLAQUE_COLOR: Record<string, string> = {
  'Bronze Classic': 'bg-amber-100 text-amber-800',
  'Slate Matte':    'bg-slate-100 text-slate-700',
  'Steel Premium':  'bg-stone-200 text-stone-700',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

function OrderTable({ orders }: { orders: ShippingOrder[] }) {
  const [tracking, setTracking] = useState<Record<string, string>>({});

  if (orders.length === 0) {
    return <p className="text-xs text-stone-400 text-center py-10">No orders in this stage.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-100">
            {['Order', 'Profile', 'Customer', 'Address', 'Plaque', 'Ordered', 'Tracking / Action'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {orders.map(o => {
            const s = STATUS_STYLE[o.status];
            return (
              <tr key={o.id} className="hover:bg-stone-50/60 transition-colors">
                <td className="px-4 py-3">
                  <code className="text-[11px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">{o.id}</code>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-stone-800 whitespace-nowrap">{o.profileName}</p>
                  <code className="text-[10px] font-mono text-stone-400">{o.profileId}</code>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-stone-700 whitespace-nowrap">{o.customerName}</p>
                  <p className="text-[10px] text-stone-400 truncate max-w-[140px]">{o.customerEmail}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-stone-600 max-w-[180px] leading-snug">{o.address}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${PLAQUE_COLOR[o.plaqueStyle] ?? 'bg-stone-100 text-stone-600'}`}>
                    {o.plaqueStyle}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-stone-500 whitespace-nowrap">{fmtDate(o.orderedAt)}</span>
                  {o.shippedAt && <p className="text-[10px] text-stone-400">Shipped {fmtDate(o.shippedAt)}</p>}
                </td>
                <td className="px-4 py-3">
                  {o.trackingNumber ? (
                    <code className={`text-[11px] font-mono px-2 py-0.5 rounded ${s.bg} ${s.text}`}>{o.trackingNumber}</code>
                  ) : o.status === 'PENDING_SHIP' ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Enter tracking #"
                        value={tracking[o.id] ?? ''}
                        onChange={e => setTracking(t => ({ ...t, [o.id]: e.target.value }))}
                        className="text-xs border border-stone-200 rounded-lg px-2 py-1 w-32 outline-none focus:ring-2 focus:ring-stone-300"
                      />
                      <button
                        disabled={!tracking[o.id]}
                        className="text-[10px] font-semibold px-2 py-1 bg-stone-900 text-white rounded-lg disabled:opacity-30 transition-opacity"
                      >
                        Ship
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

type SubTab = ShipStatus | 'qr_gen';

export default function FulfillmentTab() {
  const [sub, setSub] = useState<SubTab>('qr_gen');

  const counts: Record<SubTab, number> = {
    qr_gen:       SHIPPING_ORDERS.filter(o => o.status === 'PENDING_QR').length,
    PENDING_QR:   SHIPPING_ORDERS.filter(o => o.status === 'PENDING_QR').length,
    PENDING_SHIP: SHIPPING_ORDERS.filter(o => o.status === 'PENDING_SHIP').length,
    SHIPPED:      SHIPPING_ORDERS.filter(o => o.status === 'SHIPPED').length,
    DELIVERED:    SHIPPING_ORDERS.filter(o => o.status === 'DELIVERED').length,
  };

  const SUB_TABS: { key: SubTab; label: string }[] = [
    { key: 'qr_gen',       label: 'QR Generation' },
    { key: 'PENDING_SHIP', label: 'To Be Shipped'  },
    { key: 'SHIPPED',      label: 'In Transit'     },
    { key: 'DELIVERED',    label: 'Delivered'      },
  ];

  return (
    <div className="space-y-5">
      {/* Sub-tab bar */}
      <div className="flex gap-1 bg-white border border-stone-100 rounded-2xl p-1.5 shadow-sm w-fit">
        {SUB_TABS.map(t => {
          const count = t.key === 'qr_gen' ? counts.PENDING_QR : counts[t.key];
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

      {/* QR Generation — reuse existing component */}
      {sub === 'qr_gen' && <FulfillmentQueue />}

      {/* Shipping pipeline tabs */}
      {sub !== 'qr_gen' && (
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">
              {SUB_TABS.find(t => t.key === sub)?.label}
            </p>
            <p className="text-sm font-semibold text-stone-800">
              {counts[sub as ShipStatus]} order{counts[sub as ShipStatus] !== 1 ? 's' : ''}
            </p>
          </div>
          <OrderTable orders={SHIPPING_ORDERS.filter(o => o.status === sub as ShipStatus)} />
        </div>
      )}
    </div>
  );
}
