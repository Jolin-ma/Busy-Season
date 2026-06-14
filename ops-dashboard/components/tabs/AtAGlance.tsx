'use client';
import { useState, useEffect } from 'react';
import { SUMMARY, SUPPORT_TICKETS, FLAGGED_ITEMS } from '@/lib/mock-data';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ── System health (mock) ──────────────────────────────────────────────────────
const HEALTH = {
  api:      { label: 'Fastify API',        ms: 42,   uptime: 99.94, ok: true  },
  db:       { label: 'PostgreSQL / Prisma', ms: 12,   conns: 4,      ok: true  },
  storage:  { label: 'Object Storage',      usedGb: 22.8, totalGb: 34, ok: true  },
  cdn:      { label: 'CDN Edge',            ms: 18,   uptime: 99.8,  ok: true  },
};

// ── Derived alerts (static mock) ─────────────────────────────────────────────
const criticalTickets = SUPPORT_TICKETS.filter(t => t.priority === 'CRITICAL' && t.status !== 'RESOLVED');
const pendingFlags    = FLAGGED_ITEMS.filter(f => f.status === 'PENDING').length;

// ── Recent activity feed ──────────────────────────────────────────────────────
const ACTIVITY = [
  { id: 1, text: 'Critical ticket from Jennifer Whitfield — QR not scanning at cemetery',     time: '2h ago',  dot: 'bg-red-500'     },
  { id: 2, text: 'Order ORD-2043 placed by Susan Adams — Steel Premium plaque',                time: '1d ago',  dot: 'bg-stone-400'   },
  { id: 3, text: "Duplicate charge flagged on Jane Doe's account (June billing cycle)",        time: '2d ago',  dot: 'bg-amber-500'   },
  { id: 4, text: "Guestbook entry reported on Margaret Whitfield's profile (4 reports)",       time: '2d ago',  dot: 'bg-red-400'     },
  { id: 5, text: 'Order ORD-2036 shipped to Robert Davis — CP987654321CA',                     time: '3d ago',  dot: 'bg-emerald-500' },
  { id: 6, text: 'New account: Susan Adams registered (Steel Premium plaque)',                  time: '4d ago',  dot: 'bg-stone-400'   },
  { id: 7, text: 'Florence Anna Park profile went live — QR marker activated',                 time: '5d ago',  dot: 'bg-emerald-500' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function Dot({ ok }: { ok: boolean }) {
  return (
    <span className={`w-2 h-2 rounded-full shrink-0 ${ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
  );
}

export default function AtAGlance() {
  const [pendingShipments, setPendingShipments] = useState(0);
  const [pendingQR,        setPendingQR]        = useState(0);
  const [dupCharges,       setDupCharges]       = useState(0);
  const [mrr,              setMrr]              = useState(0);

  useEffect(() => {
    fetch(`${API}/admin/fulfillment`)
      .then(r => r.json())
      .then((d: { orders?: { plaqueStatus: string }[] }) => {
        const orders = d.orders ?? [];
        setPendingShipments(orders.filter(o => o.plaqueStatus === 'ENGRAVING').length);
        setPendingQR(orders.filter(o => o.plaqueStatus === 'ORDER_RECEIVED').length);
      })
      .catch(() => {});

    fetch(`${API}/ops/billing/accounts`)
      .then(r => r.json())
      .then((d: { accounts?: { plan: string; hasDuplicate: boolean }[] }) => {
        const accounts = d.accounts ?? [];
        setDupCharges(accounts.filter(a => a.hasDuplicate).length);
        setMrr(accounts.reduce((s, a) => s + (a.plan === 'PREMIUM' ? 15 : 7), 0));
      })
      .catch(() => {});
  }, []);

  const alerts = [
    criticalTickets.length > 0 && { level: 'critical', text: `${criticalTickets.length} critical support ticket${criticalTickets.length > 1 ? 's' : ''} open` },
    dupCharges     > 0         && { level: 'warning',  text: `${dupCharges} account${dupCharges > 1 ? 's' : ''} with duplicate charges` },
    pendingShipments > 0       && { level: 'warning',  text: `${pendingShipments} order${pendingShipments > 1 ? 's' : ''} awaiting shipment` },
    pendingQR > 0              && { level: 'info',     text: `${pendingQR} QR code${pendingQR > 1 ? 's' : ''} pending generation` },
  ].filter(Boolean) as { level: string; text: string }[];

  return (
    <div className="space-y-5">

      {/* ── Action items alert ── */}
      {alerts.length > 0 && (
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-50 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="text-xs font-semibold text-stone-700">Action Items — {alerts.length} item{alerts.length > 1 ? 's' : ''} need attention</p>
          </div>
          <div className="divide-y divide-stone-50">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.level === 'critical' ? 'bg-red-500' : a.level === 'warning' ? 'bg-amber-500' : 'bg-blue-400'}`} />
                <p className="text-xs text-stone-600">{a.text}</p>
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  a.level === 'critical' ? 'bg-red-50 text-red-600' :
                  a.level === 'warning'  ? 'bg-amber-50 text-amber-700' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {a.level.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'Live Memorials',
            value: SUMMARY.totalProfiles.toLocaleString(),
            sub: `+${SUMMARY.profilesTrend}% this week`,
            subOk: SUMMARY.profilesTrend >= 0,
            accent: 'bg-stone-100 text-stone-600',
            icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>,
          },
          {
            label: 'QR Scans (24 h)',
            value: Math.round(SUMMARY.totalScans * 0.04).toLocaleString(),
            sub: `${SUMMARY.totalScans.toLocaleString()} all-time`,
            subOk: true,
            accent: 'bg-indigo-50 text-indigo-600',
            icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd"/></svg>,
          },
          {
            label: 'MRR',
            value: `$${mrr.toFixed(0)}`,
            sub: 'Live from DB',
            subOk: true,
            accent: 'bg-emerald-50 text-emerald-600',
            icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>,
          },
          {
            label: 'Pending Flags',
            value: pendingFlags.toString(),
            sub: `${FLAGGED_ITEMS.filter(f => f.autoFlag).length} auto-detected`,
            subOk: pendingFlags === 0,
            accent: pendingFlags > 0 ? 'bg-red-50 text-red-500' : 'bg-stone-100 text-stone-400',
            icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 7l2.55 2.4A1 1 0 0116 11H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/></svg>,
          },
        ].map(card => (
          <div key={card.label} className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">{card.label}</p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-stone-900 tabular-nums">{card.value}</p>
            <p className={`text-xs font-medium ${card.subOk ? 'text-emerald-600' : 'text-red-500'}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── System health + activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* System health */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-4">System Health</p>
          <div className="space-y-3">
            {/* API */}
            <div className="flex items-center justify-between py-2 border-b border-stone-50">
              <div className="flex items-center gap-2.5">
                <Dot ok={HEALTH.api.ok} />
                <span className="text-xs font-medium text-stone-700">{HEALTH.api.label}</span>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className="text-[11px] text-stone-400">{HEALTH.api.ms}ms avg</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{HEALTH.api.uptime}% uptime</span>
              </div>
            </div>
            {/* DB */}
            <div className="flex items-center justify-between py-2 border-b border-stone-50">
              <div className="flex items-center gap-2.5">
                <Dot ok={HEALTH.db.ok} />
                <span className="text-xs font-medium text-stone-700">{HEALTH.db.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-stone-400">{HEALTH.db.ms}ms query</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{HEALTH.db.conns} conns</span>
              </div>
            </div>
            {/* Storage */}
            <div className="flex items-center justify-between py-2 border-b border-stone-50">
              <div className="flex items-center gap-2.5">
                <Dot ok={HEALTH.storage.ok} />
                <span className="text-xs font-medium text-stone-700">{HEALTH.storage.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] text-stone-400">{HEALTH.storage.usedGb} / {HEALTH.storage.totalGb} GB</span>
                  <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${(HEALTH.storage.usedGb / HEALTH.storage.totalGb) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* CDN */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <Dot ok={HEALTH.cdn.ok} />
                <span className="text-xs font-medium text-stone-700">{HEALTH.cdn.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-stone-400">{HEALTH.cdn.ms}ms latency</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{HEALTH.cdn.uptime}% uptime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-4">Recent Activity</p>
          <div className="space-y-0">
            {ACTIVITY.map((a, i) => (
              <div key={a.id} className={`flex gap-3 py-2.5 ${i < ACTIVITY.length - 1 ? 'border-b border-stone-50' : ''}`}>
                <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                  <span className={`w-2 h-2 rounded-full ${a.dot}`} />
                  {i < ACTIVITY.length - 1 && <div className="w-px flex-1 bg-stone-100" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-700 leading-snug">{a.text}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
