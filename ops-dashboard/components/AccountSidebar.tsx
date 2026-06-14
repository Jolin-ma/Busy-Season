'use client';
import { useState } from 'react';

type ProfileStatus = 'Public' | 'Private' | 'Incomplete';
type ProfileTab    = 'Family' | 'Pets' | 'Drafts';

interface Memorial {
  id:            string;
  shortId?:      string;
  name:          string;
  initials:      string;
  avatarBg:      string;
  avatarText:    string;
  birth:         number;
  death?:        number;
  status:        ProfileStatus;
  tab:           ProfileTab;
  collaborators: number;
  hasQR:         boolean;
}

const PROFILES: Memorial[] = [
  { id: 'p1', shortId: 'a5trneuj', name: 'Margaret Chen',  initials: 'MC', avatarBg: '#3d2f1e', avatarText: '#d4b896', birth: 1954, death: 2024, status: 'Public',     tab: 'Family', collaborators: 3, hasQR: true  },
  { id: 'p2', shortId: 'b2kmpqvx', name: 'Robert J. Chen', initials: 'RC', avatarBg: '#1e2a3d', avatarText: '#96b4d4', birth: 1941, death: 2019, status: 'Public',     tab: 'Family', collaborators: 2, hasQR: true  },
  { id: 'p3', shortId: 'c7nrswyz', name: 'Emily Watson',   initials: 'EW', avatarBg: '#1e3d2a', avatarText: '#96d4b4', birth: 1968, death: 2023, status: 'Private',    tab: 'Family', collaborators: 1, hasQR: true  },
  { id: 'p4',                       name: 'Luna',           initials: 'Lu', avatarBg: '#3d2a1e', avatarText: '#d4a896', birth: 2010, death: 2022, status: 'Public',     tab: 'Pets',   collaborators: 0, hasQR: true  },
  { id: 'p5',                       name: 'Mochi',          initials: 'Mo', avatarBg: '#2a1e3d', avatarText: '#c4a6e8', birth: 2015, death: 2024, status: 'Incomplete', tab: 'Pets',   collaborators: 0, hasQR: false },
  { id: 'p6',                       name: 'Thomas Chen',    initials: 'TC', avatarBg: '#2e2e2e', avatarText: '#b4b4b4', birth: 1975,              status: 'Incomplete', tab: 'Drafts', collaborators: 0, hasQR: false },
  { id: 'p7',                       name: 'Unnamed Profile', initials: '?', avatarBg: '#222',    avatarText: '#555',    birth: 2023,              status: 'Incomplete', tab: 'Drafts', collaborators: 0, hasQR: false },
];

const PLAN            = { name: 'Legacy Premium', used: 3, total: 5 };
const PENDING_INVITES = 1;

const STATUS: Record<ProfileStatus, { bg: string; text: string; dot: string }> = {
  Public:     { bg: 'rgba(16,185,129,0.12)',  text: '#6ee7b7', dot: '#10b981' },
  Private:    { bg: 'rgba(251,191,36,0.12)',  text: '#fcd34d', dot: '#f59e0b' },
  Incomplete: { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', dot: '#64748b' },
};

// ── Icons ─────────────────────────────────────────────────────────────────────
function IcoQR() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}>
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
      <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
    </svg>
  );
}
function IcoLock({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}>
      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}>
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  );
}
function IcoUsers() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 10, height: 10 }}>
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  );
}
function IcoChevron({ right }: { right: boolean }) {
  return right ? (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}
function IcoPlus() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}>
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  );
}

// ── Shared inline-style button ─────────────────────────────────────────────────
function IconBtn({
  onClick, title, color, children,
}: {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  color?: string;
  children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 26, height: 26, borderRadius: 7,
        background: hov ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color ?? '#a8a29e',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 150ms',
      }}
    >
      {children}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AccountSidebar() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [activeId,   setActiveId]   = useState('p1');
  const [tab,        setTab]        = useState<ProfileTab>('Family');
  const [hoveredId,  setHoveredId]  = useState<string | null>(null);
  const [isPublicMap, setIsPublicMap] = useState<Record<string, boolean>>(
    Object.fromEntries(PROFILES.map(p => [p.id, p.status === 'Public']))
  );

  const active   = PROFILES.find(p => p.id === activeId) ?? PROFILES[0];
  const filtered = PROFILES.filter(p => p.tab === tab);

  const togglePrivacy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPublicMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const TABS: ProfileTab[] = ['Family', 'Pets', 'Drafts'];
  const pct = (PLAN.used / PLAN.total) * 100;

  return (
    <aside
      style={{
        width: collapsed ? 56 : 272,
        minWidth: collapsed ? 56 : 272,
        transition: 'width 300ms cubic-bezier(0.23,1,0.32,1), min-width 300ms cubic-bezier(0.23,1,0.32,1)',
        background: '#1c1917',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setCollapsed(v => !v)}
        title={collapsed ? 'Expand' : 'Collapse'}
        style={{
          position: 'absolute',
          top: 14,
          left: collapsed ? 11 : 'auto',
          right: collapsed ? 'auto' : 10,
          zIndex: 20,
          width: 26, height: 26,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.09)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#57534e',
          cursor: 'pointer',
          transition: 'background 150ms, color 150ms',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.11)';
          (e.currentTarget as HTMLButtonElement).style.color = '#a8a29e';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
          (e.currentTarget as HTMLButtonElement).style.color = '#57534e';
        }}
      >
        <IcoChevron right={collapsed} />
      </button>

      {/* ══════════ COLLAPSED ══════════ */}
      {collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 52, paddingBottom: 12, gap: 8, overflowY: 'auto', flex: 1 }}>
          {PROFILES.map(p => (
            <button
              key={p.id}
              onClick={() => { setActiveId(p.id); setCollapsed(false); }}
              title={`${p.name} (${p.birth}–${p.death ?? 'present'})`}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: p.avatarBg,
                border: `2px solid ${p.id === activeId ? '#d4b896' : 'transparent'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: p.avatarText,
                cursor: 'pointer', flexShrink: 0,
                transition: 'border-color 200ms, transform 150ms',
                boxShadow: p.id === activeId ? '0 0 0 3px rgba(212,184,150,0.2)' : 'none',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            >
              {p.initials}
            </button>
          ))}
          <button
            title="Add new memorial"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              border: '1.5px dashed rgba(255,255,255,0.18)',
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.22)', cursor: 'pointer', flexShrink: 0,
              transition: 'border-color 180ms, color 180ms',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.35)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.18)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.22)';
            }}
          >
            <IcoPlus />
          </button>
        </div>
      )}

      {/* ══════════ EXPANDED ══════════ */}
      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

          {/* ── 1. Active profile card ── */}
          <div style={{ padding: '44px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: active.avatarBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: active.avatarText,
                flexShrink: 0,
                boxShadow: '0 3px 10px rgba(0,0,0,0.45)',
              }}>
                {active.initials}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#f5f0eb', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {active.name}
                </p>
                <p style={{ fontSize: 10, color: '#78716c', margin: 0 }}>
                  {active.birth} – {active.death ?? 'present'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 9px', borderRadius: 9999,
                background: STATUS[active.status].bg,
                fontSize: 10, fontWeight: 700, color: STATUS[active.status].text,
                flexShrink: 0,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: STATUS[active.status].dot }} />
                {active.status}
              </span>

              {active.shortId && (
                <a
                  href={`http://localhost:3000/p/${active.shortId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 10, fontWeight: 700, color: '#818cf8',
                    textDecoration: 'none',
                    padding: '3px 9px', borderRadius: 7,
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    marginLeft: 'auto', flexShrink: 0,
                    transition: 'background 150ms',
                  }}
                >
                  View Live
                  <svg viewBox="0 0 12 12" fill="currentColor" style={{ width: 9, height: 9 }}>
                    <path d="M3.5 3a.5.5 0 000 1h4.293L2.146 9.646a.5.5 0 00.708.708L8.5 4.707V9a.5.5 0 001 0V3.5a.5.5 0 00-.5-.5H3.5z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* ── 2. Profile switcher ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, padding: '10px 12px 4px', flexShrink: 0 }}>
              {TABS.map(t => {
                const count = PROFILES.filter(p => p.tab === t).length;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      flex: 1, padding: '5px 0',
                      fontSize: 10, fontWeight: 700,
                      borderRadius: 7, border: 'none', cursor: 'pointer',
                      background: tab === t ? 'rgba(255,255,255,0.09)' : 'transparent',
                      color: tab === t ? '#e7e5e4' : '#57534e',
                      transition: 'all 180ms',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}
                  >
                    {t}
                    <span style={{
                      fontSize: 9, fontWeight: 800,
                      padding: '1px 4px', borderRadius: 4,
                      background: tab === t ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                      color: tab === t ? '#a8a29e' : '#3d3a37',
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Profile list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 4px' }}>
              {filtered.length === 0 && (
                <p style={{ fontSize: 11, color: '#44403c', textAlign: 'center', padding: '24px 0' }}>
                  No {tab.toLowerCase()} profiles yet
                </p>
              )}
              {filtered.map(p => {
                const isActive  = p.id === activeId;
                const isHovered = hoveredId === p.id;
                const isPublic  = isPublicMap[p.id];

                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveId(p.id)}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '7px 8px',
                      borderRadius: 10, cursor: 'pointer',
                      background: isActive
                        ? 'rgba(255,255,255,0.08)'
                        : isHovered
                          ? 'rgba(255,255,255,0.04)'
                          : 'transparent',
                      marginBottom: 2,
                      transition: 'background 150ms',
                      position: 'relative',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: p.avatarBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: p.avatarText,
                      flexShrink: 0,
                    }}>
                      {p.initials}
                    </div>

                    {/* Name + years */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 12, fontWeight: 600,
                        color: isActive ? '#f5f0eb' : '#a8a29e',
                        margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        transition: 'color 150ms',
                      }}>
                        {p.name}
                      </p>
                      <p style={{ fontSize: 9, color: '#44403c', margin: 0 }}>
                        {p.birth}{p.death ? ` – ${p.death}` : ''}
                      </p>
                    </div>

                    {/* Status dot (hidden when hover actions visible) */}
                    {!isHovered && (
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: STATUS[p.status].dot, flexShrink: 0,
                      }} />
                    )}

                    {/* Hover quick-actions */}
                    {isHovered && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        {p.hasQR && (
                          <IconBtn onClick={e => e.stopPropagation()} title="Download QR code">
                            <IcoQR />
                          </IconBtn>
                        )}
                        <IconBtn
                          onClick={e => togglePrivacy(p.id, e)}
                          title={isPublic ? 'Make private' : 'Make public'}
                          color={isPublic ? '#10b981' : '#f59e0b'}
                        >
                          <IcoLock open={!isPublic} />
                        </IconBtn>
                        {p.collaborators > 0 && (
                          <span
                            title={`${p.collaborators} collaborator${p.collaborators !== 1 ? 's' : ''}`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              fontSize: 9, fontWeight: 700, color: '#78716c',
                              padding: '3px 5px', borderRadius: 6,
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            <IcoUsers />
                            {p.collaborators}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add New Memorial */}
            <div style={{ padding: '6px 10px 10px', flexShrink: 0 }}>
              <button
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.28)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.13)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.22)';
                }}
                style={{
                  width: '100%', padding: '9px 0',
                  borderRadius: 10,
                  border: '1.5px dashed rgba(255,255,255,0.13)',
                  background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.22)',
                  cursor: 'pointer', transition: 'border-color 180ms, color 180ms',
                }}
              >
                <IcoPlus />
                Add New Memorial
              </button>
            </div>
          </div>

          {/* ── 3. Bottom: plan + invites + settings ── */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 14px 14px', flexShrink: 0 }}>

            {/* Plan progress */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#a8a29e' }}>{PLAN.name}</span>
                <span style={{ fontSize: 10, color: '#44403c' }}>{PLAN.used}/{PLAN.total} profiles</span>
              </div>
              <div style={{ height: 3, borderRadius: 9999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 9999,
                  width: `${pct}%`,
                  background: pct >= 80 ? '#f59e0b' : '#d4b896',
                  transition: 'width 600ms ease',
                }} />
              </div>
              {pct >= 80 && (
                <p style={{ fontSize: 9, color: '#d4b896', margin: '5px 0 0' }}>
                  Upgrade to add more profiles →
                </p>
              )}
            </div>

            {/* Pending invite */}
            {PENDING_INVITES > 0 && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 9px', borderRadius: 9,
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.18)',
                  marginBottom: 10, cursor: 'pointer',
                }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#6366f1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                  {PENDING_INVITES}
                </span>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#a5b4fc', margin: 0 }}>Pending invite</p>
                  <p style={{ fontSize: 9, color: '#6366f1', margin: '1px 0 0' }}>A family member shared access</p>
                </div>
              </div>
            )}

            {/* Settings links */}
            {[
              { label: 'Billing & Plan',    icon: <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/></svg> },
              { label: 'Account Settings', icon: <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg> },
              { label: 'Help Center',       icon: <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg> },
            ].map(({ label, icon }) => (
              <button
                key={label}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#a8a29e'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#44403c'; }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '6px 4px', borderRadius: 7,
                  border: 'none', background: 'transparent',
                  color: '#44403c', fontSize: 11, fontWeight: 500,
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  transition: 'color 150ms',
                }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
