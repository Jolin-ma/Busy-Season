'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const NAV_MAIN = [
  {
    label: 'Overview', href: '/',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-3h2v3a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
  },
  {
    label: 'Geographic', href: '/geographic',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>,
  },
  {
    label: 'Fulfillment', href: '/fulfillment',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /></svg>,
  },
  {
    label: 'Accounts', href: '/accounts',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
  },
  {
    label: 'Media', href: '/media',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 5 2-3 3 6z" clipRule="evenodd" /></svg>,
  },
  {
    label: 'Billing', href: '/billing',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [pendingOrders,  setPendingOrders]  = useState(0);
  const [dupCount,       setDupCount]       = useState(0);
  const [newCount,       setNewCount]       = useState(0);
  const [claimsCount,    setClaimsCount]    = useState(0);

  useEffect(() => {
    fetch('/api/gw/admin/fulfillment')
      .then(r => r.json())
      .then((d: { orders?: { plaqueStatus: string }[] }) => {
        setPendingOrders(
          (d.orders ?? []).filter(o => o.plaqueStatus === 'ORDER_RECEIVED' || o.plaqueStatus === 'ENGRAVING').length,
        );
      })
      .catch(() => {});

    fetch('/api/gw/ops/billing/accounts')
      .then(r => r.json())
      .then((d: { accounts?: { hasDuplicate: boolean }[] }) => {
        setDupCount((d.accounts ?? []).filter(a => a.hasDuplicate).length);
      })
      .catch(() => {});

    fetch('/api/gw/admin/support/tickets')
      .then(r => r.json())
      .then((d: { tickets?: { status: string }[] }) => {
        setNewCount((d.tickets ?? []).filter(t => t.status === 'OPEN').length);
      })
      .catch(() => {});

    fetch('/api/gw/ops/succession/claims')
      .then(r => r.json())
      .then((d: { claims?: unknown[] }) => setClaimsCount((d.claims ?? []).length))
      .catch(() => {});
  }, []);

  const isSupport      = pathname === '/support';
  const isBilling      = pathname === '/billing';
  const isAccounts     = pathname === '/accounts';
  const isGeographic   = pathname === '/geographic';
  const isFulfillment  = pathname === '/fulfillment';
  const isMedia        = pathname === '/media';
  const isSuccession   = pathname === '/succession';
  const isMain         = !isSupport && !isBilling && !isAccounts && !isGeographic && !isFulfillment && !isMedia && !isSuccession;

  return (
    <aside className="hidden md:flex flex-col bg-white border-r border-stone-100 shrink-0 h-screen sticky top-0 w-[220px]">

      {/* Logo */}
      <div className="flex items-center justify-center px-4 py-2 border-b border-stone-100 shrink-0">
        <img src="/legacy_link_logo.png" alt="LegacyLink" className="h-28 w-auto" />
      </div>

      {/* Main nav */}
      <nav className="px-2 pt-4 pb-2 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-300 px-3 mb-2">Dashboard</p>
        {NAV_MAIN.map(item => {
          const isActive =
            item.href === '/accounts'     ? isAccounts    :
            item.href === '/billing'      ? isBilling      :
            item.href === '/geographic'   ? isGeographic   :
            item.href === '/fulfillment'  ? isFulfillment  :
            item.href === '/media'        ? isMedia        :
            isMain;

          return (
            <a
              key={item.label}
              href={item.href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-stone-100 text-stone-900'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800',
              ].join(' ')}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.label === 'Fulfillment' && pendingOrders > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isFulfillment ? 'bg-stone-600 text-white' : 'bg-stone-900 text-white'}`}>
                  {pendingOrders}
                </span>
              )}
              {item.label === 'Billing' && dupCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isBilling ? 'bg-amber-400 text-stone-900' : 'bg-amber-500 text-white'}`}>
                  {dupCount}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      <div className="mx-4 my-2 border-t border-stone-100" />

      {/* Premium */}
      <nav className="px-2 pb-2 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-300 px-3 mb-2">Premium</p>
        <a
          href="/support"
          className={[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
            isSupport
              ? 'bg-stone-900 text-white'
              : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800',
          ].join(' ')}
        >
          <span className="shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="flex-1">Priority Support</span>
          {newCount > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isSupport ? 'bg-white text-stone-900' : 'bg-red-500 text-white'}`}>
              {newCount}
            </span>
          )}
        </a>

        <a
          href="/succession"
          className={[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
            isSuccession
              ? 'bg-stone-900 text-white'
              : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800',
          ].join(' ')}
        >
          <span className="shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="flex-1">Succession</span>
          {claimsCount > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isSuccession ? 'bg-white text-stone-900' : 'bg-indigo-500 text-white'}`}>
              {claimsCount}
            </span>
          )}
        </a>
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Admin footer */}
      <div className="border-t border-stone-100 px-2 py-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-xs font-bold shrink-0">
            J
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-stone-700 truncate">Admin</p>
            <p className="text-[10px] text-stone-400 truncate">Internal only</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
