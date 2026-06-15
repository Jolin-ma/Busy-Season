'use client';
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ── Types ─────────────────────────────────────────────────────────────────────

type TicketStatus   = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'PRIORITY' | 'STANDARD';
type PlaqueStatus   = 'ORDER_RECEIVED' | 'ENGRAVING' | 'SHIPPED' | 'DELIVERED';

interface Ticket {
  id:             string;
  subject:        string;
  message:        string;
  status:         TicketStatus;
  priority:       TicketPriority;
  createdAt:      string;
  responseDueAt:  string | null;
  resolvedAt:     string | null;
  profileShortId: string;
  profileName:    string;
  plaqueStatus:   PlaqueStatus;
  plan:           'PREMIUM' | 'BASIC';
  userId:         string | null;
  customerName:   string | null;
  customerEmail:  string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<TicketPriority, number> = { PRIORITY: 0, STANDARD: 1 };

function isStale(ticket: Ticket): boolean {
  if (ticket.status !== 'OPEN') return false;
  return Date.now() - new Date(ticket.createdAt).getTime() > 24 * 3_600_000;
}

function staleHours(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
}

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1)  return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function smartSort(tickets: Ticket[]): Ticket[] {
  return [...tickets].sort((a, b) => {
    const pDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (pDiff !== 0) return pDiff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

// ── Style maps ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<TicketStatus, string> = {
  OPEN:        'bg-red-50 text-red-600 border-red-100',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
  RESOLVED:    'bg-emerald-50 text-emerald-700 border-emerald-100',
  CLOSED:      'bg-stone-100 text-stone-500 border-stone-200',
};
const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN:        'New',
  IN_PROGRESS: 'In Progress',
  RESOLVED:    'Archived',
  CLOSED:      'Closed',
};

const PRIORITY_STYLE: Record<TicketPriority, string> = {
  PRIORITY: 'bg-orange-50 text-orange-700 border-orange-200',
  STANDARD: 'bg-stone-100 text-stone-500 border-stone-200',
};

const PLAQUE_LABEL: Record<PlaqueStatus, string> = {
  ORDER_RECEIVED: 'Order Received',
  ENGRAVING:      'In Production',
  SHIPPED:        'Shipped',
  DELIVERED:      'Active',
};
const PLAQUE_STYLE: Record<PlaqueStatus, string> = {
  ORDER_RECEIVED: 'bg-amber-50 text-amber-700 border-amber-200',
  ENGRAVING:      'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED:        'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED:      'bg-emerald-50 text-emerald-700 border-emerald-200',
};

// ── Context Linker Drawer ─────────────────────────────────────────────────────

function ContextDrawer({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[340px] bg-white shadow-2xl z-50 flex flex-col">

        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">Context Linker</p>
            <h3 className="text-sm font-bold text-stone-800 mt-0.5">{ticket.customerName ?? ticket.profileName}</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors text-stone-400">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          <section>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Account</p>
            <div className="space-y-2">
              {[
                { label: 'Customer',   value: ticket.customerName ?? '—' },
                { label: 'Email',      value: ticket.customerEmail ?? '—' },
                { label: 'User ID',    value: ticket.userId ? ticket.userId.slice(0, 8) + '…' : '—' },
                { label: 'Ticket ID',  value: ticket.id.slice(0, 8) + '…' },
                { label: 'Submitted',  value: new Date(ticket.createdAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' }) },
              ].map(f => (
                <div key={f.label} className="flex items-start justify-between gap-3">
                  <span className="text-xs text-stone-400 shrink-0">{f.label}</span>
                  <span className="text-xs font-semibold text-stone-700 text-right break-all">{f.value}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-stone-100" />

          <section>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Linked Memorial Profile</p>
            <div className="bg-stone-50 rounded-xl border border-stone-100 p-4 space-y-3">
              <div>
                <p className="text-sm font-bold text-stone-800">{ticket.profileName}</p>
                <p className="text-[10px] font-mono text-stone-400 mt-0.5">{ticket.profileShortId}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${PLAQUE_STYLE[ticket.plaqueStatus]}`}>
                  {PLAQUE_LABEL[ticket.plaqueStatus]}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  ticket.plan === 'PREMIUM' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'
                }`}>
                  {ticket.plan}
                </span>
              </div>

              {ticket.plaqueStatus === 'ORDER_RECEIVED' && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    Plaque not yet printed — customer may not have received their physical QR yet.
                  </p>
                </div>
              )}

              <a
                href={`http://localhost:3000/p/${ticket.profileShortId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                Open Profile ↗
              </a>
            </div>
          </section>

          <div className="border-t border-stone-100" />

          <section>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Quick Actions</p>
            {ticket.customerEmail && (
              <a
                href={`mailto:${ticket.customerEmail}?subject=Re: [${ticket.id.slice(0, 8)}] ${ticket.subject}`}
                className="flex items-center gap-2 w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-stone-400">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Reply via Email ↗
              </a>
            )}
            {ticket.userId && (
              <a
                href={`/accounts?shortId=${ticket.profileShortId}`}
                className="flex items-center gap-2 w-full mt-2 text-xs font-semibold px-3 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
              >
                View Account ↗
              </a>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

// ── Ticket card ───────────────────────────────────────────────────────────────

function TicketCard({
  ticket,
  onUpdateStatus,
  onOpenContext,
}: {
  ticket:         Ticket;
  onUpdateStatus: (id: string, status: TicketStatus) => void;
  onOpenContext:  (ticket: Ticket) => void;
}) {
  const [expanded, setExpanded] = useState(ticket.status === 'OPEN');
  const stale = isStale(ticket);
  const name  = ticket.customerName ?? ticket.profileName;

  return (
    <div className={[
      'bg-white rounded-2xl shadow-sm overflow-hidden transition-all',
      stale
        ? 'border border-stone-200 border-l-4 border-l-amber-400'
        : ticket.status === 'OPEN'
          ? 'border border-stone-200'
          : 'border border-stone-100',
    ].join(' ')}>

      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-stone-50/50 transition-colors"
      >
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 ${stale ? 'bg-amber-100 text-amber-700' : 'bg-stone-200 text-stone-600'}`}>
          {name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-semibold text-stone-800">{name}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLE[ticket.status]}`}>
              {STATUS_LABEL[ticket.status]}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${PRIORITY_STYLE[ticket.priority]}`}>
              {ticket.priority}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              ticket.plan === 'PREMIUM' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'
            }`}>
              {ticket.plan}
            </span>
            {stale && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Stale · {staleHours(ticket.createdAt)}h
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 truncate">{ticket.customerEmail ?? '—'}</p>
          <p className="text-sm font-medium text-stone-700 mt-1 truncate">{ticket.subject}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-stone-400 whitespace-nowrap">{timeAgo(ticket.createdAt)}</span>
          <button
            onClick={e => { e.stopPropagation(); onOpenContext(ticket); }}
            title="View Context"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-700"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
          <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 text-stone-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-stone-100">
          <div className="px-5 py-3 bg-stone-50 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Ticket ID',  value: ticket.id.slice(0, 8) + '…' },
              { label: 'Profile',    value: ticket.profileShortId },
              { label: 'Plan',       value: ticket.plan },
              { label: 'Submitted',  value: new Date(ticket.createdAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' }) },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">{f.label}</p>
                <p className="text-xs font-semibold text-stone-700 mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>

          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Message</p>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
          </div>

          <div className="px-5 py-3 border-t border-stone-100 flex items-center gap-2 flex-wrap">
            {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
              <>
                {ticket.status === 'OPEN' && (
                  <button
                    onClick={() => onUpdateStatus(ticket.id, 'IN_PROGRESS')}
                    className="text-xs font-semibold px-4 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-700 transition-colors"
                  >
                    Mark In Progress
                  </button>
                )}
                <button
                  onClick={() => onUpdateStatus(ticket.id, 'RESOLVED')}
                  className="text-xs font-semibold px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Archive (Resolve)
                </button>
                {ticket.customerEmail && (
                  <a
                    href={`mailto:${ticket.customerEmail}?subject=Re: [${ticket.id.slice(0, 8)}] ${ticket.subject}`}
                    className="text-xs font-semibold px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Reply via Email ↗
                  </a>
                )}
              </>
            )}
            <button
              onClick={() => onOpenContext(ticket)}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              View Context
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type FilterTab = TicketStatus | 'ALL';

const FILTERS: { label: string; value: FilterTab }[] = [
  { label: 'All',      value: 'ALL'         },
  { label: 'Inbox',    value: 'OPEN'        },
  { label: 'Active',   value: 'IN_PROGRESS' },
  { label: 'Archived', value: 'RESOLVED'    },
];

export default function SupportPage() {
  const [tickets,       setTickets]       = useState<Ticket[]>([]);
  const [activeTab,     setActiveTab]     = useState<FilterTab>('ALL');
  const [contextTicket, setContextTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    fetch(`${API}/admin/support/tickets`)
      .then(r => r.json())
      .then((d: { tickets?: Ticket[] }) => setTickets(d.tickets ?? []))
      .catch(() => {});
  }, []);

  const updateStatus = useCallback((id: string, status: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    fetch(`${API}/admin/support/tickets/${id}/status`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    }).catch(() => {});
  }, []);

  const filtered   = smartSort(activeTab === 'ALL' ? tickets : tickets.filter(t => t.status === activeTab));
  const newCount   = tickets.filter(t => t.status === 'OPEN').length;
  const staleCount = tickets.filter(isStale).length;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f7f6f3' }}>
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-7 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
                Priority Support
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Premium member tickets · {newCount} unread
              </p>
            </div>
            {newCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-semibold text-red-600">
                  {newCount} new ticket{newCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {staleCount > 0 && (activeTab === 'ALL' || activeTab === 'OPEN') && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-500 shrink-0">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs font-semibold text-amber-800">
                {staleCount} ticket{staleCount !== 1 ? 's have' : ' has'} been waiting over 24 hours without a response.
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1 bg-white border border-stone-100 rounded-xl p-1 shadow-sm w-fit">
              {FILTERS.map(f => {
                const count = f.value === 'ALL'
                  ? tickets.length
                  : tickets.filter(t => t.status === f.value).length;
                return (
                  <button
                    key={f.value}
                    onClick={() => setActiveTab(f.value)}
                    className={[
                      'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      activeTab === f.value
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50',
                    ].join(' ')}
                  >
                    {f.label}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === f.value ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-stone-400">Sorted by priority · oldest first</p>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
              <p className="text-stone-400 text-sm">
                {tickets.length === 0 ? 'Loading…' : 'No tickets in this category'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onUpdateStatus={updateStatus}
                  onOpenContext={setContextTicket}
                />
              ))}
            </div>
          )}

          <p className="text-center text-[10px] text-stone-300 pb-2">
            LegacyLink Internal · Priority Support · All times UTC · Tickets are permanently archived, never deleted
          </p>
        </div>
      </main>

      {contextTicket && (
        <ContextDrawer ticket={contextTicket} onClose={() => setContextTicket(null)} />
      )}
    </div>
  );
}
