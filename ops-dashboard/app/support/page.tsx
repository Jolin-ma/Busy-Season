'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  PROFILES,
  SUPPORT_TICKETS,
  type ProfileStatus,
  type SupportTicket,
  type TicketPriority,
  type TicketStatus,
} from '@/lib/mock-data';

// ── Helpers ───────────────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<TicketPriority, number> = { CRITICAL: 0, HIGH: 1, NORMAL: 2 };

function isStale(ticket: SupportTicket): boolean {
  if (ticket.status !== 'NEW') return false;
  return Date.now() - new Date(ticket.submittedAt).getTime() > 24 * 3_600_000;
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

function smartSort(tickets: SupportTicket[]): SupportTicket[] {
  return [...tickets].sort((a, b) => {
    const pDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (pDiff !== 0) return pDiff;
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });
}

// ── Style maps ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<TicketStatus, string> = {
  NEW:         'bg-red-50 text-red-600 border-red-100',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
  RESOLVED:    'bg-emerald-50 text-emerald-700 border-emerald-100',
};
const STATUS_LABEL: Record<TicketStatus, string> = {
  NEW:         'New',
  IN_PROGRESS: 'In Progress',
  RESOLVED:    'Archived',
};

const PRIORITY_STYLE: Record<TicketPriority, string> = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  HIGH:     'bg-orange-50 text-orange-700 border-orange-200',
  NORMAL:   'bg-stone-100 text-stone-500 border-stone-200',
};

const MFG_LABEL: Record<ProfileStatus, string> = {
  PENDING_PRINT: 'Pending Print',
  IN_PRODUCTION: 'In Production',
  ACTIVE:        'Active',
};
const MFG_STYLE: Record<ProfileStatus, string> = {
  PENDING_PRINT: 'bg-amber-50 text-amber-700 border-amber-200',
  IN_PRODUCTION: 'bg-blue-50 text-blue-700 border-blue-200',
  ACTIVE:        'bg-emerald-50 text-emerald-700 border-emerald-200',
};

// ── Context Linker Drawer ─────────────────────────────────────────────────────

function ContextDrawer({
  ticket,
  onClose,
}: {
  ticket: SupportTicket;
  onClose: () => void;
}) {
  const profile = ticket.linkedShortId
    ? PROFILES.find(p => p.id === ticket.linkedShortId)
    : undefined;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-[340px] bg-white shadow-2xl z-50 flex flex-col">

        {/* Drawer header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">Context Linker</p>
            <h3 className="text-sm font-bold text-stone-800 mt-0.5">{ticket.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors text-stone-400"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Account section */}
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Account</p>
            <div className="space-y-2">
              {[
                { label: 'Account #',  value: ticket.accountNumber },
                { label: 'Email',      value: ticket.email },
                { label: 'Ticket ID',  value: ticket.id },
                { label: 'Submitted',  value: new Date(ticket.submittedAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' }) },
              ].map(f => (
                <div key={f.label} className="flex items-start justify-between gap-3">
                  <span className="text-xs text-stone-400 shrink-0">{f.label}</span>
                  <span className="text-xs font-semibold text-stone-700 text-right break-all">{f.value}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-stone-100" />

          {/* Linked memorial profile */}
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Linked Memorial Profile</p>
            {profile ? (
              <div className="bg-stone-50 rounded-xl border border-stone-100 p-4 space-y-3">
                <div>
                  <p className="text-sm font-bold text-stone-800">{profile.name}</p>
                  <p className="text-[10px] font-mono text-stone-400 mt-0.5">{profile.id}</p>
                </div>

                {/* Manufacturing status */}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${MFG_STYLE[profile.status]}`}>
                    {MFG_LABEL[profile.status]}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">Created</span>
                    <span className="text-[10px] font-semibold text-stone-600">
                      {new Date(profile.createdAt).toLocaleDateString('en-CA', { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>

                {/* Warning: plaque not yet printed */}
                {profile.status === 'PENDING_PRINT' && (
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
                  href={profile.qrCodeUrl}
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
            ) : (
              <div className="bg-stone-50 rounded-xl border border-stone-100 p-4 text-center">
                <p className="text-xs text-stone-400">No linked profile</p>
                <p className="text-[10px] text-stone-300 mt-1">Check the ticket message for a short ID</p>
              </div>
            )}
          </section>

          <div className="border-t border-stone-100" />

          {/* Quick actions */}
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Quick Actions</p>
            <a
              href={`mailto:${ticket.email}?subject=Re: [${ticket.id}] ${ticket.subject}`}
              className="flex items-center gap-2 w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-stone-400">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Reply via Email ↗
            </a>
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
  ticket: SupportTicket;
  onUpdateStatus: (id: string, status: TicketStatus) => void;
  onOpenContext: (ticket: SupportTicket) => void;
}) {
  const [expanded, setExpanded] = useState(ticket.status === 'NEW');
  const stale = isStale(ticket);

  return (
    <div className={[
      'bg-white rounded-2xl shadow-sm overflow-hidden transition-all',
      stale
        ? 'border border-stone-200 border-l-4 border-l-amber-400'
        : ticket.status === 'NEW'
          ? 'border border-stone-200'
          : 'border border-stone-100',
    ].join(' ')}>

      {/* Header row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-stone-50/50 transition-colors"
      >
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 ${stale ? 'bg-amber-100 text-amber-700' : 'bg-stone-200 text-stone-600'}`}>
          {ticket.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-semibold text-stone-800">{ticket.name}</span>
            <span className="text-[10px] font-mono text-stone-400">{ticket.accountNumber}</span>
            <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-full font-semibold">
              {ticket.plan}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLE[ticket.status]}`}>
              {STATUS_LABEL[ticket.status]}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${PRIORITY_STYLE[ticket.priority]}`}>
              {ticket.priority}
            </span>
            {stale && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Stale · {staleHours(ticket.submittedAt)}h
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 truncate">{ticket.email}</p>
          <p className="text-sm font-medium text-stone-700 mt-1 truncate">{ticket.subject}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-stone-400 whitespace-nowrap">{timeAgo(ticket.submittedAt)}</span>
          {/* Context linker button — stops propagation so it doesn't toggle expand */}
          <button
            onClick={e => { e.stopPropagation(); onOpenContext(ticket); }}
            title="View Context"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-700"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
          <svg
            viewBox="0 0 20 20" fill="currentColor"
            className={`w-4 h-4 text-stone-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-stone-100">
          {/* Account details strip */}
          <div className="px-5 py-3 bg-stone-50 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Ticket ID',  value: ticket.id },
              { label: 'Account #',  value: ticket.accountNumber },
              { label: 'Plan',       value: ticket.plan },
              { label: 'Submitted',  value: new Date(ticket.submittedAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' }) },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">{f.label}</p>
                <p className="text-xs font-semibold text-stone-700 mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>

          {/* Message */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Message</p>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
          </div>

          {/* Actions */}
          <div className="px-5 py-3 border-t border-stone-100 flex items-center gap-2 flex-wrap">
            {ticket.status !== 'RESOLVED' && (
              <>
                {ticket.status === 'NEW' && (
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
                <a
                  href={`mailto:${ticket.email}?subject=Re: [${ticket.id}] ${ticket.subject}`}
                  className="text-xs font-semibold px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Reply via Email ↗
                </a>
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

const FILTERS: { label: string; value: TicketStatus | 'ALL' }[] = [
  { label: 'All',      value: 'ALL' },
  { label: 'Inbox',    value: 'NEW' },
  { label: 'Active',   value: 'IN_PROGRESS' },
  { label: 'Archived', value: 'RESOLVED' },
];

export default function SupportPage() {
  const [tickets,       setTickets]       = useState<SupportTicket[]>(SUPPORT_TICKETS);
  const [activeTab,     setActiveTab]     = useState<TicketStatus | 'ALL'>('ALL');
  const [contextTicket, setContextTicket] = useState<SupportTicket | null>(null);

  const updateStatus = (id: string, status: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const filtered   = smartSort(activeTab === 'ALL' ? tickets : tickets.filter(t => t.status === activeTab));
  const newCount   = tickets.filter(t => t.status === 'NEW').length;
  const staleCount = tickets.filter(isStale).length;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f7f6f3' }}>
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-7 space-y-5">

          {/* Header */}
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

          {/* Stale alert banner */}
          {staleCount > 0 && (activeTab === 'ALL' || activeTab === 'NEW') && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-500 shrink-0">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs font-semibold text-amber-800">
                {staleCount} ticket{staleCount !== 1 ? 's have' : ' has'} been waiting over 24 hours without a response.
              </p>
            </div>
          )}

          {/* Filter tabs + sort label */}
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

          {/* Ticket list */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
              <p className="text-stone-400 text-sm">No tickets in this category</p>
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

      {/* Context Linker drawer */}
      {contextTicket && (
        <ContextDrawer ticket={contextTicket} onClose={() => setContextTicket(null)} />
      )}
    </div>
  );
}
