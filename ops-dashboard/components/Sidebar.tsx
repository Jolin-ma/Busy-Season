'use client';
import { usePathname } from 'next/navigation';
import { SUPPORT_TICKETS } from '@/lib/mock-data';

const NAV_MAIN = [
  {
    label: 'Overview', href: '/#overview',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-3h2v3a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
  },
  {
    label: 'Analytics', href: '/#analytics',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>,
  },
  {
    label: 'Geographic', href: '/#geographic',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>,
  },
  {
    label: 'Fulfillment', href: '/#fulfillment',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /></svg>,
  },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const newCount  = SUPPORT_TICKETS.filter(t => t.status === 'NEW').length;

  const isSupport = pathname === '/support';

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
          const active = !isSupport && pathname === '/';
          const isActive = !isSupport && item.label === 'Overview' ? true
            : !isSupport && item.href.includes(pathname) ? true : false;
          // Simple active: on main page highlight all anchors, use isSupport for support page
          const highlighted = !isSupport && !item.href.includes('/support');
          void highlighted; void isActive; void active;
          return (
            <a
              key={item.label}
              href={item.href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                !isSupport
                  ? 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                  : 'text-stone-400 hover:bg-stone-50 hover:text-stone-700',
              ].join(' ')}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="mx-4 my-2 border-t border-stone-100" />

      {/* Priority Support */}
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
