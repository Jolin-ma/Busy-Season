'use client';
import { useState, useMemo } from 'react';
import { BILLING_ACCOUNTS, PROFILES, type MockBillingAccount, type Profile, type ProfileStatus } from '@/lib/mock-data';

const STATUS_STYLE: Record<ProfileStatus, { bg: string; text: string; dot: string; label: string }> = {
  PENDING_PRINT:  { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400',  label: 'Pending Print'  },
  IN_PRODUCTION:  { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400',   label: 'In Production'  },
  ACTIVE:         { bg: 'bg-emerald-50', text: 'text-emerald-700',dot: 'bg-emerald-400',label: 'Active'         },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

interface EnrichedProfile {
  profile: Profile;
  account: MockBillingAccount | undefined;
}

export default function DirectoryTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProfileStatus | 'ALL'>('ALL');
  const [planFilter, setPlanFilter] = useState<'ALL' | 'BASIC' | 'PREMIUM'>('ALL');
  const [impersonating, setImpersonating] = useState<string | null>(null);

  const accountByShortId = useMemo(() => {
    const map: Record<string, MockBillingAccount> = {};
    BILLING_ACCOUNTS.forEach(a => a.shortIds.forEach(sid => { map[sid] = a; }));
    return map;
  }, []);

  const enriched: EnrichedProfile[] = useMemo(() => {
    return PROFILES.map(p => ({ profile: p, account: accountByShortId[p.id] }));
  }, [accountByShortId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enriched.filter(({ profile: p, account: a }) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        a?.name.toLowerCase().includes(q) ||
        a?.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchPlan   = planFilter   === 'ALL' || a?.plan === planFilter;
      return matchSearch && matchStatus && matchPlan;
    });
  }, [enriched, search, statusFilter, planFilter]);

  const counts = {
    total:   enriched.length,
    active:  enriched.filter(e => e.profile.status === 'ACTIVE').length,
    pending: enriched.filter(e => e.profile.status === 'PENDING_PRINT').length,
    prod:    enriched.filter(e => e.profile.status === 'IN_PRODUCTION').length,
  };

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Profiles', value: counts.total,   accent: 'bg-stone-900 text-white' },
          { label: 'Active',         value: counts.active,  accent: 'bg-emerald-50 text-emerald-700' },
          { label: 'In Production',  value: counts.prod,    accent: 'bg-blue-50 text-blue-700' },
          { label: 'Pending Print',  value: counts.pending, accent: 'bg-amber-50 text-amber-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl px-5 py-4 ${s.accent} border border-stone-100`}>
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60 mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-100 rounded-2xl shadow-sm px-5 py-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Search name, ID, account…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-stone-300"
          />
        </div>

        <div className="flex gap-1 bg-stone-50 rounded-xl p-1">
          {(['ALL', 'ACTIVE', 'IN_PRODUCTION', 'PENDING_PRINT'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as ProfileStatus | 'ALL')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                statusFilter === s ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              {s === 'ALL' ? 'All Status' : s === 'IN_PRODUCTION' ? 'In Prod' : s === 'PENDING_PRINT' ? 'Pending' : 'Active'}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-stone-50 rounded-xl p-1">
          {(['ALL', 'BASIC', 'PREMIUM'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                planFilter === p ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              {p === 'ALL' ? 'All Plans' : p}
            </button>
          ))}
        </div>

        <p className="text-[10px] text-stone-400 ml-auto">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                {['Profile', 'Short ID', 'Status', 'Account Holder', 'Plan', 'Created', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map(({ profile: p, account: a }) => {
                const s = STATUS_STYLE[p.status];
                const isImpersonating = impersonating === p.id;
                return (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-stone-800 whitespace-nowrap">{p.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`http://localhost:3000/p/${p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded transition-colors"
                      >
                        {p.id}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a ? (
                        <>
                          <p className="text-xs font-medium text-stone-800 whitespace-nowrap">{a.name}</p>
                          <p className="text-[10px] text-stone-400">{a.email}</p>
                        </>
                      ) : (
                        <span className="text-[10px] text-stone-300">Unlinked</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {a && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          a.plan === 'PREMIUM' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {a.plan}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-stone-500 whitespace-nowrap">{fmtDate(p.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/accounts?shortId=${p.id}`}
                          className="text-[10px] font-semibold text-stone-600 hover:text-stone-900 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors whitespace-nowrap"
                        >
                          Account ↗
                        </a>
                        <button
                          onClick={() => setImpersonating(isImpersonating ? null : p.id)}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                            isImpersonating
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                          }`}
                        >
                          {isImpersonating ? 'Stop' : 'Impersonate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-stone-400">No profiles match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Impersonation banner */}
        {impersonating && (
          <div className="bg-amber-50 border-t border-amber-200 px-5 py-3 flex items-center gap-3">
            <svg className="w-4 h-4 text-amber-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs font-semibold text-amber-800 flex-1">
              Impersonating profile <code className="font-mono bg-amber-100 px-1 rounded">{impersonating}</code> — all actions will be performed as this user.
            </p>
            <button
              onClick={() => setImpersonating(null)}
              className="text-[10px] font-bold text-amber-700 hover:text-amber-900 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 transition-colors"
            >
              End Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
