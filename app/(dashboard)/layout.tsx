'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ListOrdered, Users, BarChart3,
  Settings, LogOut, ChevronDown, ChevronRight, Menu, X,
  Bell, Search, BookOpen, UserCog, Wifi, WifiOff,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Language = 'FR' | 'EN' | 'RN' | 'SW';
type WsState  = 'live' | 'reconnecting' | 'offline';
type UserRole = 'ADMIN_ORG' | 'SUPERVISOR' | 'AGENT';

interface Agency { id: string; label: string; agencyId: string }

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, labels: { FR: 'Aperçu',         EN: 'Overview',  RN: 'Incamake',      SW: 'Muhtasari'  } },
  { to: '/queue',     icon: ListOrdered,     labels: { FR: "Files d'attente", EN: 'Queues',    RN: 'Imirongo',      SW: 'Foleni'     } },
  { to: '/agents',    icon: Users,           labels: { FR: 'Agents',          EN: 'Agents',    RN: 'Abakozi',       SW: 'Mawakala'   } },
  { to: '/analytics', icon: BarChart3,       labels: { FR: 'Statistiques',    EN: 'Analytics', RN: 'Imibare',       SW: 'Takwimu'    } },
  { to: '/settings',  icon: Settings,        labels: { FR: 'Paramètres',      EN: 'Settings',  RN: 'Igenamiterere', SW: 'Mipangilio' } },
];

const LANGS: Language[] = ['FR', 'EN', 'RN', 'SW'];
const langFlags: Record<Language, string> = { FR: '🇫🇷', EN: '🇬🇧', RN: '🇧🇮', SW: '🇹🇿' };

const agencies: Agency[] = [
  { id: '1', label: 'Banque de la République — Siège',  agencyId: 'BUJ-001' },
  { id: '2', label: 'Banque de la République — Rohero', agencyId: 'BUJ-002' },
  { id: '3', label: 'Agence Gitega — Centre',           agencyId: 'GIT-001' },
  { id: '4', label: 'Agence Goma Nord',                  agencyId: 'GOM-001' },
  { id: '5', label: 'Agence Kigali Centre',              agencyId: 'KGL-001' },
];

const roleConfig: Record<UserRole, { label: string; color: string; bg: string }> = {
  ADMIN_ORG:  { label: 'ADMIN_ORG',  color: '#6C47FF', bg: 'rgba(108,71,255,0.15)' },
  SUPERVISOR: { label: 'SUPERVISOR', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)'  },
  AGENT:      { label: 'AGENT',      color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
};

const logoutLabel:   Record<Language, string> = { FR: 'Déconnexion',      EN: 'Sign out',      RN: 'Gusohoka',      SW: 'Toka'       };
const settingsLabel: Record<Language, string> = { FR: 'Paramètres',       EN: 'Settings',      RN: 'Igenamiterere', SW: 'Mipangilio' };
const docsLabel:     Record<Language, string> = { FR: 'Documentation API', EN: 'API Docs',     RN: 'Inyandiko API', SW: 'Docs API'   };
const accountLabel:  Record<Language, string> = { FR: 'Mon compte',        EN: 'My account',   RN: 'Konti yanjye',  SW: 'Akaunti'    };
const searchLabel:   Record<Language, string> = {
  FR: 'Rechercher un ticket ou un agent…', EN: 'Search ticket or agent…',
  RN: 'Shakisha…', SW: 'Tafuta…',
};

const notifColor: Record<string, string> = { critical: '#F43F5E', warning: '#F59E0B', info: '#06B6D4' };

const mockNotifications = [
  { id: 1, level: 'critical', msg: "Guichet G-04 inactif depuis 8 min",         time: 'il y a 3 min'  },
  { id: 2, level: 'critical', msg: "File 'Retrait' saturée — attente > 45 min", time: 'il y a 7 min'  },
  { id: 3, level: 'warning',  msg: "TMT dépasse le seuil configuré (15 min)",   time: 'il y a 11 min' },
  { id: 4, level: 'info',     msg: "3 tickets VIP sans agent assigné",           time: 'il y a 18 min' },
];

// ─────────────────────────────────────────────────────────────────────────────
// WS BADGE
// ─────────────────────────────────────────────────────────────────────────────

function WsBadge() {
  const [state, setState] = useState<WsState>('live');

  useEffect(() => {
    if (state !== 'live') {
      const t = setTimeout(() => setState(state === 'reconnecting' ? 'live' : 'reconnecting'), 3000);
      return () => clearTimeout(t);
    }
  }, [state]);

  const cfg = {
    live:         { dot: '#10B981', border: 'rgba(16,185,129,0.3)',  bg: 'rgba(16,185,129,0.1)',  text: '#10B981', label: 'LIVE',         icon: <Wifi size={12} /> },
    reconnecting: { dot: '#F59E0B', border: 'rgba(245,158,11,0.3)',  bg: 'rgba(245,158,11,0.1)',  text: '#F59E0B', label: 'RECONNECTING', icon: <Wifi size={12} /> },
    offline:      { dot: '#F43F5E', border: 'rgba(244,63,94,0.3)',   bg: 'rgba(244,63,94,0.1)',   text: '#F43F5E', label: 'OFFLINE',      icon: <WifiOff size={12} /> },
  }[state];

  return (
    <button onClick={() => setState(state === 'live' ? 'offline' : 'live')} title="Statut WebSocket"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-200"
      style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, cursor: 'pointer' }}>
      <span style={{ color: cfg.text, display: 'flex', alignItems: 'center' }}>{cfg.icon}</span>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: cfg.dot, display: 'inline-block', flexShrink: 0,
        animation: state === 'live' ? 'pulse-soft 2s ease-in-out infinite' : 'none' }} aria-hidden="true" />
      <span style={{ fontSize: '10px', fontWeight: 700, color: cfg.text, letterSpacing: '0.06em' }}>{cfg.label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS BELL
// ─────────────────────────────────────────────────────────────────────────────

function NotificationsBell({ count: _count }: { count: number }) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const unread = mockNotifications.filter((n) => !read.includes(n.id));

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-label={`${unread.length} alertes non lues`} aria-expanded={open}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150" style={{ color: '#64748b' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e2e8f0'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}>
        <Bell size={17} />
        {unread.length > 0 && (
          <span className="absolute flex items-center justify-center"
            style={{ top: '-3px', right: '-3px', minWidth: '16px', height: '16px', borderRadius: '8px', backgroundColor: '#F43F5E',
              fontSize: '9px', fontWeight: 700, color: '#fff', border: '2px solid #0A0E1A', padding: '0 3px' }} aria-hidden="true">
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-50"
          style={{ width: '320px', backgroundColor: '#1A2235', border: '1px solid #334155', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #334155' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>Notifications</span>
            {unread.length > 0 && (
              <button onClick={() => setRead(mockNotifications.map((n) => n.id))}
                style={{ fontSize: '11px', color: '#6C47FF', background: 'none', border: 'none', cursor: 'pointer' }}>
                Tout marquer lu
              </button>
            )}
          </div>
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {mockNotifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 px-4 py-3 transition-colors duration-100"
                style={{ backgroundColor: read.includes(n.id) ? 'transparent' : 'rgba(108,71,255,0.04)',
                  borderBottom: '1px solid #1e293b', opacity: read.includes(n.id) ? 0.5 : 1 }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: notifColor[n.level],
                  display: 'inline-block', marginTop: '4px', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>{n.msg}</p>
                  <p style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>{n.time}</p>
                </div>
                {!read.includes(n.id) && (
                  <button onClick={() => setRead((r) => [...r, n.id])}
                    style={{ fontSize: '14px', color: '#475569', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                    aria-label="Marquer lu">×</button>
                )}
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5" style={{ borderTop: '1px solid #334155' }}>
            <button style={{ fontSize: '12px', color: '#6C47FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              Voir toutes les alertes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENCY SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

function AgencySelector() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Agency>(agencies[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative hidden md:block">
      <button onClick={() => setOpen(!open)} aria-expanded={open}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150"
        style={{ backgroundColor: '#0F1623', border: '1px solid #334155', maxWidth: '280px' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6C47FF'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; }}>
        <div className="flex flex-col items-start min-w-0">
          <span className="truncate" style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.2, maxWidth: '200px' }}>
            {current.label}
          </span>
          <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.3 }}>
            {current.agencyId}
          </span>
        </div>
        <ChevronDown size={13} color="#475569" style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-50"
          style={{ minWidth: '280px', backgroundColor: '#1A2235', border: '1px solid #334155', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#475569', padding: '10px 14px 6px',
            textTransform: 'uppercase', letterSpacing: '0.06em' }}>Changer d'agence</p>
          {agencies.map((ag) => (
            <button key={ag.id} onClick={() => { setCurrent(ag); setOpen(false); }}
              className="flex items-center justify-between w-full px-4 py-2.5 transition-colors duration-100"
              style={{ backgroundColor: ag.id === current.id ? 'rgba(108,71,255,0.1)' : 'transparent' }}
              onMouseEnter={(e) => { if (ag.id !== current.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={(e) => { if (ag.id !== current.id) e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <span style={{ fontSize: '13px', color: ag.id === current.id ? '#6C47FF' : '#cbd5e1', fontWeight: ag.id === current.id ? 600 : 400 }}>
                {ag.label}
              </span>
              <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>{ag.agencyId}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

function LangSelector({ lang, setLang }: { lang: Language; setLang: (l: Language) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
        style={{ backgroundColor: '#0F1623', border: '1px solid #334155', color: '#94a3b8' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#475569'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; }}>
        <span aria-hidden="true">{langFlags[lang]}</span>
        <span>{lang}</span>
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50"
          style={{ backgroundColor: '#1A2235', border: '1px solid #334155', minWidth: '100px', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
          {LANGS.map((l) => (
            <button key={l} onClick={() => { setLang(l); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium transition-colors duration-100"
              style={{ color: l === lang ? '#6C47FF' : '#94a3b8', backgroundColor: l === lang ? 'rgba(108,71,255,0.1)' : 'transparent' }}
              onMouseEnter={(e) => { if (l !== lang) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={(e) => { if (l !== lang) e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <span>{langFlags[l]}</span><span>{l}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL SEARCH
// ─────────────────────────────────────────────────────────────────────────────

function GlobalSearch({ lang }: { lang: Language }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen(true); }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150"
        style={{ backgroundColor: '#0F1623', border: '1px solid #334155', color: '#475569', minWidth: '200px' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#475569'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; }}
        aria-label="Recherche globale">
        <Search size={13} />
        <span style={{ fontSize: '12px', flex: 1, textAlign: 'left' }}>{searchLabel[lang]}</span>
        <kbd style={{ fontSize: '9px', color: '#334155', border: '1px solid #334155', borderRadius: '4px',
          padding: '1px 4px', fontFamily: 'JetBrains Mono, monospace' }}>⌘K</kbd>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setOpen(false)} />
          <div className="fixed z-50 top-20 left-1/2 -translate-x-1/2 rounded-xl overflow-hidden"
            style={{ width: '520px', maxWidth: '90vw', backgroundColor: '#1A2235', border: '1px solid #334155', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #334155' }}>
              <Search size={16} color="#475569" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchLabel[lang]}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }} />
              <kbd onClick={() => setOpen(false)} style={{ fontSize: '10px', color: '#475569', border: '1px solid #334155',
                borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace' }}>ESC</kbd>
            </div>
            <div style={{ padding: '12px 16px' }}>
              {q ? (
                <p style={{ fontSize: '13px', color: '#475569', textAlign: 'center', padding: '16px 0' }}>Aucun résultat pour « {q} »</p>
              ) : (
                <div>
                  <p style={{ fontSize: '10px', color: '#334155', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Recherches récentes</p>
                  {['T-047', 'Rodrigue K.', 'Agence Rohero'].map((item) => (
                    <div key={item} className="flex items-center gap-3 px-2 py-2 rounded-lg" style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}>
                      <Search size={13} color="#334155" />
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE MENU
// ─────────────────────────────────────────────────────────────────────────────

function ProfileMenu({ lang, onLogout }: { lang: Language; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const role: UserRole = 'ADMIN_ORG';
  const roleCfg = roleConfig[role];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150"
        style={{ border: '1px solid transparent' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.backgroundColor = 'transparent'; } }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ backgroundColor: '#6C47FF', color: '#fff' }} aria-hidden="true">A</div>
        <div className="hidden sm:flex flex-col items-start">
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.25 }}>Administrateur</span>
          <span className="px-1.5 rounded" style={{ fontSize: '9px', fontWeight: 700, color: roleCfg.color,
            backgroundColor: roleCfg.bg, lineHeight: 1.6, letterSpacing: '0.04em' }}>{roleCfg.label}</span>
        </div>
        <ChevronDown size={12} color="#475569" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-50"
          style={{ minWidth: '220px', backgroundColor: '#1A2235', border: '1px solid #334155', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #334155' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold"
                style={{ backgroundColor: '#6C47FF', color: '#fff' }}>A</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>Administrateur</p>
                <p style={{ fontSize: '11px', color: '#64748b' }}>admin@tonde.app</p>
              </div>
            </div>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-md"
              style={{ fontSize: '10px', fontWeight: 700, color: roleCfg.color, backgroundColor: roleCfg.bg, letterSpacing: '0.04em' }}>
              {roleCfg.label}
            </span>
          </div>
          <div className="py-1">
            {[
              { icon: UserCog, label: accountLabel[lang],  to: '/settings' },
              { icon: Settings, label: settingsLabel[lang], to: '/settings' },
              { icon: BookOpen, label: docsLabel[lang],     to: 'https://fastapi.tonde.app/docs', external: true },
            ].map(({ icon: Icon, label, to, external }) => (
              external ? (
                <a key={label} href={to} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-100"
                  style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}>
                  <Icon size={14} /><span>{label}</span>
                  <ChevronRight size={11} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                </a>
              ) : (
                <Link key={label} href={to} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-100"
                  style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}>
                  <Icon size={14} /><span>{label}</span>
                </Link>
              )
            ))}
          </div>
          <div style={{ borderTop: '1px solid #334155' }}>
            <button onClick={() => { setOpen(false); onLogout(); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 transition-colors duration-100"
              style={{ color: '#F43F5E', fontSize: '13px' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <LogOut size={14} /><span style={{ fontWeight: 500 }}>{logoutLabel[lang]}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR TOOLTIP (position fixed pour éviter le clipping)
// ─────────────────────────────────────────────────────────────────────────────

function SidebarTooltip({ label, color = '#e2e8f0' }: { label: string; color?: string }) {
  const [pos, setPos] = useState<{ top: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const li = ref.current?.parentElement;
    if (!li) return;
    const show = () => {
      const rect = li.getBoundingClientRect();
      setPos({ top: rect.top + rect.height / 2 });
    };
    const hide = () => setPos(null);
    li.addEventListener('mouseenter', show);
    li.addEventListener('mouseleave', hide);
    return () => {
      li.removeEventListener('mouseenter', show);
      li.removeEventListener('mouseleave', hide);
    };
  }, []);

  return (
    <>
      {/* Anchor invisible — juste pour récupérer la ref du parent */}
      <span ref={ref} style={{ display: 'none' }} aria-hidden="true" />

      {/* Tooltip rendu hors du flux — position fixed, jamais coupé */}
      {pos && (
        <div style={{
          position: 'fixed',
          top: pos.top,
          left: '72px',
          transform: 'translateY(-50%)',
          zIndex: 9999,
          backgroundColor: '#1A2235',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: 600,
          color,
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.01em',
        }}>
          {label}
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN SHELL (Layout principal)
// ─────────────────────────────────────────────────────────────────────────────

function AdminShell({ children, criticalAlerts = 2 }: { children: ReactNode; criticalAlerts?: number }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [lang, setLang]               = useState<Language>('FR');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed]     = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = () => router.push('/login');
  const sidebarW = collapsed ? '64px' : '240px';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0A0E1A', fontFamily: 'Inter, sans-serif' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ══ SIDEBAR ══ */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col shrink-0
          transition-all duration-200 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: sidebarW,
          backgroundColor: '#0A0E1A',
          borderRight: '1px solid #334155',
          minHeight: '100vh',
          overflow: 'visible',
        }}>

        {/* ── Logo ── */}
        <div className="flex items-center shrink-0 px-3 gap-3"
          style={{ height: '64px', borderBottom: '1px solid #334155' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#6C47FF' }}>
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M11 2L20 7V15L11 20L2 15V7L11 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <path d="M11 2V20M2 7L20 15M20 7L2 15" stroke="white" strokeWidth="1.5" strokeOpacity="0.35" />
            </svg>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-widest flex-1 whitespace-nowrap overflow-hidden"
              style={{ color: '#ffffff' }}>TONDE</span>
          )}
          <button className="lg:hidden ml-auto" onClick={() => setSidebarOpen(false)} aria-label="Fermer">
            <X size={17} color="#64748b" />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto"
          style={{ padding: collapsed ? '16px 8px' : '16px 12px', overflowX: 'visible' }}>
          <ul className="flex flex-col gap-0.5">
            {navItems.map(({ to, icon: Icon, labels }) => {
              const isActive = pathname === to || (to !== '/dashboard' && pathname.startsWith(to));
              return (
                <li key={to} className="relative">
                  <Link href={to}
                    className="flex items-center rounded-lg text-sm font-medium transition-all duration-150"
                    style={{
                      gap: collapsed ? '0' : '12px',
                      padding: collapsed ? '10px 0' : '10px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      ...(isActive
                        ? { backgroundColor: '#6C47FF', color: '#ffffff' }
                        : { color: '#94a3b8' }),
                    }}
                    onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; } }}
                    onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; } }}>
                    <Icon size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                    {!collapsed && <span className="whitespace-nowrap overflow-hidden">{labels[lang]}</span>}
                  </Link>
                  {collapsed && <SidebarTooltip label={labels[lang]} />}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Logout ── */}
        <div className="relative" style={{ borderTop: '1px solid #1e293b', padding: collapsed ? '12px 8px' : '12px' }}>
          <button onClick={handleLogout}
            className="flex items-center rounded-lg text-sm font-medium transition-all duration-150 w-full"
            style={{
              gap: collapsed ? '0' : '12px',
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: '#64748b',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#F43F5E'; e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
            <LogOut size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            {!collapsed && <span className="whitespace-nowrap">{logoutLabel[lang]}</span>}
          </button>
          {collapsed && <SidebarTooltip label={logoutLabel[lang]} color="#F43F5E" />}
        </div>

        {/* ── Bouton collapse — desktop, toujours visible en bas ── */}
        <div className="hidden lg:flex items-center justify-center shrink-0 py-3"
          style={{ borderTop: '1px solid #334155' }}>
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
            style={{ color: '#475569' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── HEADER ── */}
        <header className="flex items-center justify-between px-4 shrink-0 gap-3"
          style={{ height: '64px', backgroundColor: '#0A0E1A', borderBottom: '1px solid #334155' }}>
          <button className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg" onClick={() => setSidebarOpen(true)}
            style={{ color: '#64748b' }} aria-label="Ouvrir le menu">
            <Menu size={20} />
          </button>

          <AgencySelector />
          <GlobalSearch lang={lang} />

          <div className="flex items-center gap-2 ml-auto">
            <WsBadge />
            <NotificationsBell count={criticalAlerts} />
            <LangSelector lang={lang} setLang={setLang} />
            <div style={{ width: '1px', height: '20px', backgroundColor: '#334155' }} />
            <ProfileMenu lang={lang} onLogout={handleLogout} />
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#0A0E1A', minHeight: 0 }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes blink-red {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
