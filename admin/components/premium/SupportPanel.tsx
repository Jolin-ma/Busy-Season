'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  response_due_at?: string;
  created_at: string;
}

interface Props {
  profileId: string;
}

const STATUS_STYLES: Record<TicketStatus, string> = {
  OPEN:        'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED:    'bg-green-100 text-green-700',
  CLOSED:      'bg-stone-100 text-stone-500',
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN:        'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED:    'Resolved',
  CLOSED:      'Closed',
};

function SLABadge({ due }: { due: string }) {
  const ms   = new Date(due).getTime() - Date.now();
  const hrs  = Math.floor(ms / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  const past = ms < 0;

  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${past ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
      {past ? 'SLA overdue' : `SLA: ${hrs}h ${mins}m`}
    </span>
  );
}

export default function SupportPanel({ profileId }: Props) {
  const [tickets, setTickets]   = useState<Ticket[]>([]);
  const [subject, setSubject]   = useState('');
  const [message, setMessage]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending]   = useState(false);

  useEffect(() => {
    if (!profileId) return;
    fetch(`${API}/api/v1/premium/support/${profileId}/tickets`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data.tickets)) setTickets(data.tickets); })
      .catch(() => {});
  }, [profileId]);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      const token = localStorage.getItem('ll_token');
      const auth  = localStorage.getItem('ll_auth');
      const user  = auth ? JSON.parse(auth) : null;

      const res = await fetch(`${API}/api/v1/premium/support/${profileId}/tickets`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ user_id: user?.id ?? '', subject: subject.trim(), message: message.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setTickets(prev => [data.ticket, ...prev]);
        setSubject(''); setMessage('');
        setShowForm(false);
      }
    } catch { /* ignore */ }
    setSending(false);
  };

  return (
    <div className="space-y-6">

      {/* SLA promise banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-amber-400">
            <path d="M10 2l1.8 5.4H17l-4.5 3.3 1.7 5.3L10 13l-4.2 3 1.7-5.3L3 7.4h5.2L10 2z" fill="currentColor"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold mb-1">Priority Support — 2-hour SLA</p>
          <p className="text-xs text-stone-400 leading-relaxed">
            As a Premium member every support ticket is guaranteed a response within 2 hours. Our team also offers hands-on digital onboarding to help you upload biographies, photos, and timelines.
          </p>
        </div>
      </div>

      {/* Concierge onboarding */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Concierge Onboarding</h3>
        <p className="text-xs text-stone-400 mb-5">
          Our team will guide you through uploading the biography, photos, and timeline — step by step.
        </p>
        <button
          onClick={() => { setSubject('Concierge Onboarding Request'); setShowForm(true); }}
          className="bg-stone-900 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-stone-700 transition-colors"
        >
          Request Concierge Onboarding
        </button>
      </div>

      {/* New ticket form */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Open a Support Ticket</h3>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm font-semibold text-stone-600 border border-stone-200 px-4 py-2 rounded-xl hover:bg-stone-50 transition-colors"
            >
              + New Ticket
            </button>
          )}
        </div>

        {showForm && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Subject</label>
              <input
                type="text"
                placeholder="Briefly describe your issue"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Message</label>
              <textarea
                rows={4}
                placeholder="Describe what you need help with..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={sending || !subject.trim() || !message.trim()}
                className="bg-stone-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {sending && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                {sending ? 'Submitting…' : 'Submit Ticket'}
              </button>
              <button
                onClick={() => { setShowForm(false); setSubject(''); setMessage(''); }}
                className="text-sm text-stone-400 px-4 py-2.5 rounded-xl hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active tickets */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Active Tickets</h3>

        {tickets.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-4">No active support tickets.</p>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => (
              <div key={ticket.id} className="border border-stone-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-sm font-semibold text-stone-800">{ticket.subject}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    {ticket.response_due_at && ticket.status === 'OPEN' && (
                      <SLABadge due={ticket.response_due_at} />
                    )}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[ticket.status]}`}>
                      {STATUS_LABELS[ticket.status]}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-stone-400 mb-2 line-clamp-2">{ticket.message}</p>
                <p className="text-xs text-stone-300">
                  Opened {new Date(ticket.created_at).toLocaleDateString('en-CA')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
