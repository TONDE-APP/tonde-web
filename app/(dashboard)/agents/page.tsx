'use client';

import { useState, useMemo, useRef, useEffect, type ReactNode } from 'react';
import {
  Search, Plus, X, ChevronUp, ChevronDown, RotateCcw,
  Star, Clock, Ticket, Shield, Phone, ArrowRightLeft,
  PauseCircle, AlertTriangle, ChevronRight,
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type AgentRole    = 'agent' | 'supervisor' | 'admin_agency';
type AgentStatus  = 'online' | 'pause' | 'offline' | 'disabled';

interface Permission {
  key: string;
  label: string;
  description: string;
}

interface Agent {
  id: string;           // EMP-243
  name: string;
  email: string;
  avatar: string;       // initiales
  avatarColor: string;
  role: AgentRole;
  services: string[];
  guichet: string | null;
  status: AgentStatus;
  isActive: boolean;
  // KPIs
  ticketsToday: number;
  tmt: number;          // secondes
  nps: number;          // 1-5
  sparkline: { v: number }[]; // 4h, 8 points (30min each)
  permissions: Record<string, boolean>;
}

type SortKey = 'name' | 'status' | 'ticketsToday' | 'tmt' | 'nps';
type SortDir = 'asc' | 'desc';

// ─────────────────────────────────────────────────────────────────────────────
// STATIC CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const ROLES: Record<AgentRole, { label: string; color: string; bg: string }> = {
  agent:         { label: 'Agent',       color: '#06B6D4', bg: 'rgba(6,182,212,0.12)'  },
  supervisor:    { label: 'Superviseur', color: '#6C47FF', bg: 'rgba(108,71,255,0.12)' },
  admin_agency:  { label: 'Admin',       color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
};

const STATUS_CFG: Record<AgentStatus, { label: string; color: string; dot: string }> = {
  online:   { label: 'En ligne',    color: '#10B981', dot: '#10B981' },
  pause:    { label: 'En pause',    color: '#F59E0B', dot: '#F59E0B' },
  offline:  { label: 'Hors ligne',  color: '#64748b', dot: '#64748b' },
  disabled: { label: 'Désactivé',   color: '#F43F5E', dot: '#F43F5E' },
};

const ALL_PERMISSIONS: Permission[] = [
  { key: 'can_call',     label: 'Appeler un ticket',    description: 'Peut appeler le prochain ticket en file' },
  { key: 'can_transfer', label: 'Transférer',           description: 'Peut transférer un ticket vers un autre guichet' },
  { key: 'can_pause',    label: 'Mettre en pause',      description: 'Peut suspendre son guichet temporairement' },
  { key: 'can_noshow',   label: 'Marquer absent',       description: 'Peut marquer un client comme absent (no-show)' },
  { key: 'can_reports',  label: 'Voir les rapports',    description: 'Accès aux statistiques et exports' },
  { key: 'can_settings', label: 'Modifier paramètres',  description: 'Peut modifier la configuration du guichet' },
];

const GUICHETS = ['G-01', 'G-02', 'G-03', 'G-04', 'G-05', 'G-06', 'G-07', 'G-08'];
const AGENCY_TMT_AVG = 780; // 13 min en secondes

const ALL_SERVICES = [
  'Ouverture compte', 'Retrait caisse', 'Dépôt espèces',
  'Virement bancaire', 'Renseignements', 'Prêts & Crédit',
  'VIP Conseil', 'Caisse générale', 'Change devises', 'Mobile Money',
];

const ROLE_DESCRIPTIONS: Record<AgentRole, string> = {
  agent:        'Accès guichet uniquement — traitement des tickets assignés.',
  supervisor:   'Gestion de l\'équipe + statistiques — ne traite pas de tickets.',
  admin_agency: 'Accès complet à la configuration de l\'agence.',
};

const AVATAR_COLORS = ['#6C47FF','#06B6D4','#10B981','#F59E0B','#8B5CF6','#F43F5E','#0EA5E9'];

function generateEmpId(existing: Agent[]): string {
  const max = existing.reduce((m, a) => {
    const n = parseInt(a.id.replace('EMP-', ''));
    return isNaN(n) ? m : Math.max(m, n);
  }, 100);
  return `EMP-${max + 1}`;
}

function getInitials(name: string): string {
  return name.trim().split(' ').filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — mêmes agents que Dashboard/Queue
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_AGENTS: Agent[] = [
  {
    id: 'EMP-101', name: 'Isabelle Muhoza', email: 'i.muhoza@tonde.app',
    avatar: 'IM', avatarColor: '#6C47FF', role: 'supervisor',
    services: ['Ouverture compte', 'Prêts'], guichet: 'G-01',
    status: 'online', isActive: true,
    ticketsToday: 14, tmt: 624, nps: 4.8,
    sparkline: [{ v: 2 }, { v: 3 }, { v: 4 }, { v: 2 }, { v: 5 }, { v: 3 }, { v: 4 }, { v: 3 }],
    permissions: { can_call: true, can_transfer: true, can_pause: true, can_noshow: true, can_reports: true, can_settings: false },
  },
  {
    id: 'EMP-102', name: 'Rodrigue Kabura', email: 'r.kabura@tonde.app',
    avatar: 'RK', avatarColor: '#06B6D4', role: 'agent',
    services: ['Retrait caisse'], guichet: 'G-02',
    status: 'online', isActive: true,
    ticketsToday: 11, tmt: 912, nps: 3.9,
    sparkline: [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 5 }, { v: 4 }, { v: 3 }, { v: 2 }, { v: 4 }],
    permissions: { can_call: true, can_transfer: true, can_pause: true, can_noshow: true, can_reports: false, can_settings: false },
  },
  {
    id: 'EMP-103', name: 'Chantal Ndayishimiye', email: 'c.ndayi@tonde.app',
    avatar: 'CN', avatarColor: '#10B981', role: 'agent',
    services: ['Renseignements', 'Caisse'], guichet: 'G-03',
    status: 'pause', isActive: true,
    ticketsToday: 9, tmt: 540, nps: 4.5,
    sparkline: [{ v: 3 }, { v: 2 }, { v: 1 }, { v: 0 }, { v: 2 }, { v: 3 }, { v: 1 }, { v: 0 }],
    permissions: { can_call: true, can_transfer: false, can_pause: true, can_noshow: true, can_reports: false, can_settings: false },
  },
  {
    id: 'EMP-104', name: 'Eric Bizimana', email: 'e.bizimana@tonde.app',
    avatar: 'EB', avatarColor: '#F43F5E', role: 'agent',
    services: ['Virements'], guichet: 'G-04',
    status: 'offline', isActive: true,
    ticketsToday: 0, tmt: 0, nps: 4.1,
    sparkline: [{ v: 4 }, { v: 3 }, { v: 2 }, { v: 1 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }],
    permissions: { can_call: true, can_transfer: true, can_pause: true, can_noshow: false, can_reports: false, can_settings: false },
  },
  {
    id: 'EMP-105', name: 'Diane Uwera', email: 'd.uwera@tonde.app',
    avatar: 'DU', avatarColor: '#8B5CF6', role: 'agent',
    services: ['Prêts', 'Crédit'], guichet: 'G-05',
    status: 'online', isActive: true,
    ticketsToday: 16, tmt: 698, nps: 4.7,
    sparkline: [{ v: 2 }, { v: 4 }, { v: 5 }, { v: 3 }, { v: 6 }, { v: 4 }, { v: 5 }, { v: 4 }],
    permissions: { can_call: true, can_transfer: true, can_pause: true, can_noshow: true, can_reports: true, can_settings: false },
  },
  {
    id: 'EMP-106', name: 'Patrick Nsengimana', email: 'p.nsengi@tonde.app',
    avatar: 'PN', avatarColor: '#F59E0B', role: 'agent',
    services: ['Retrait caisse', 'Dépôt'], guichet: 'G-06',
    status: 'online', isActive: true,
    ticketsToday: 12, tmt: 756, nps: 4.2,
    sparkline: [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 3 }, { v: 4 }, { v: 3 }, { v: 3 }],
    permissions: { can_call: true, can_transfer: true, can_pause: true, can_noshow: true, can_reports: false, can_settings: false },
  },
  {
    id: 'EMP-107', name: 'Marie Karegeya', email: 'm.kareg@tonde.app',
    avatar: 'MK', avatarColor: '#06B6D4', role: 'agent',
    services: ['Ouverture compte'], guichet: 'G-07',
    status: 'pause', isActive: true,
    ticketsToday: 7, tmt: 830, nps: 3.7,
    sparkline: [{ v: 2 }, { v: 3 }, { v: 2 }, { v: 1 }, { v: 0 }, { v: 1 }, { v: 0 }, { v: 0 }],
    permissions: { can_call: true, can_transfer: false, can_pause: true, can_noshow: false, can_reports: false, can_settings: false },
  },
  {
    id: 'EMP-108', name: 'Jean-Claude Minani', email: 'jc.minani@tonde.app',
    avatar: 'JM', avatarColor: '#6C47FF', role: 'admin_agency',
    services: ['VIP', 'Prêts', 'Ouverture compte'], guichet: 'G-08',
    status: 'online', isActive: true,
    ticketsToday: 8, tmt: 580, nps: 4.9,
    sparkline: [{ v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }, { v: 2 }, { v: 3 }, { v: 2 }, { v: 3 }],
    permissions: { can_call: true, can_transfer: true, can_pause: true, can_noshow: true, can_reports: true, can_settings: true },
  },
  {
    id: 'EMP-109', name: 'Aline Hakizimana', email: 'a.hakizi@tonde.app',
    avatar: 'AH', avatarColor: '#F43F5E', role: 'agent',
    services: ['Caisse'], guichet: null,
    status: 'disabled', isActive: false,
    ticketsToday: 0, tmt: 0, nps: 2.8,
    sparkline: [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }],
    permissions: { can_call: false, can_transfer: false, can_pause: false, can_noshow: false, can_reports: false, can_settings: false },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatTmt(s: number): string {
  if (s === 0) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec.toString().padStart(2, '0')}s`;
}

function NpsStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={11}
          fill={i <= Math.round(value) ? '#F59E0B' : 'transparent'}
          color={i <= Math.round(value) ? '#F59E0B' : '#334155'}
          strokeWidth={1.5} />
      ))}
      <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
        {value > 0 ? value.toFixed(1) : '—'}
      </span>
    </div>
  );
}

function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <ResponsiveContainer width={64} height={28}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1A2235', border: '1px solid #334155', borderRadius: '6px', fontSize: '10px', padding: '4px 8px' }}
          itemStyle={{ color: color }}
          formatter={(v: number) => [`${v} tickets`, '']}
          labelFormatter={() => ''}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Toggle avec confirmation inline
function StatusToggle({ agent, onToggle }: { agent: Agent; onToggle: (id: string, active: boolean) => void }) {
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confirming) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setConfirming(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [confirming]);

  const isActive = agent.isActive;

  return (
    <div ref={ref} className="relative flex items-center">
      {confirming ? (
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg"
          style={{ backgroundColor: '#0A0E1A', border: '1px solid #334155', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            {isActive ? 'Désactiver ?' : 'Activer ?'}
          </span>
          <button onClick={() => { onToggle(agent.id, !isActive); setConfirming(false); }}
            className="px-2 py-0.5 rounded text-xs font-semibold transition-colors"
            style={{ backgroundColor: isActive ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
              color: isActive ? '#F43F5E' : '#10B981' }}>
            Oui
          </button>
          <button onClick={() => setConfirming(false)}
            className="px-2 py-0.5 rounded text-xs font-semibold"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
            Non
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} role="switch" aria-checked={isActive}
          className="relative flex items-center transition-all duration-200"
          style={{ width: '36px', height: '20px', borderRadius: '10px', padding: '2px',
            backgroundColor: isActive ? '#10B981' : '#334155',
            boxShadow: isActive ? '0 0 8px rgba(16,185,129,0.3)' : 'none' }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff',
            transform: isActive ? 'translateX(16px)' : 'translateX(0)',
            transition: 'transform 0.2s', display: 'block', flexShrink: 0 }} />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAWER — Panneau latéral
// ─────────────────────────────────────────────────────────────────────────────

function AgentDrawer({ agent, onClose, onUpdate }: {
  agent: Agent;
  onClose: () => void;
  onUpdate: (updated: Agent) => void;
}) {
  const [draft, setDraft] = useState<Agent>({ ...agent });
  const [pinReset, setPinReset] = useState(false);
  const [saved, setSaved] = useState(false);

  const tmtDiff = draft.tmt - AGENCY_TMT_AVG;
  const tmtPct  = AGENCY_TMT_AVG > 0 ? Math.round((draft.tmt / AGENCY_TMT_AVG) * 100) : 0;

  const handleSave = () => {
    onUpdate(draft);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const handlePermission = (key: string, val: boolean) => {
    setDraft((d) => ({ ...d, permissions: { ...d.permissions, [key]: val } }));
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40" style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
        onClick={onClose} />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{ width: '420px', maxWidth: '95vw', backgroundColor: '#0F1623',
          borderLeft: '1px solid #334155', boxShadow: '-24px 0 64px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid #334155' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: draft.avatarColor, color: '#fff' }}>{draft.avatar}</div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>{draft.name}</p>
              <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>{draft.id}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer"
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#475569' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── Identité ── */}
          <section>
            <h3 style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '12px' }}>Identité</h3>
            <div className="space-y-3">
              {[
                { label: 'Nom complet', value: draft.name, key: 'name' as const },
                { label: 'Adresse e-mail', value: draft.email, key: 'email' as const },
              ].map(({ label, value, key }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>{label}</label>
                  <input value={value} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                    style={{ width: '100%', height: '38px', backgroundColor: '#1A2235', border: '1px solid #334155',
                      borderRadius: '8px', padding: '0 12px', fontSize: '13px', color: '#e2e8f0',
                      fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' as const }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#6C47FF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,71,255,0.15)'; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = 'none'; }} />
                </div>
              ))}

              {/* Rôle */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>Rôle</label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(ROLES) as AgentRole[]).map((r) => (
                    <button key={r} onClick={() => setDraft((d) => ({ ...d, role: r }))}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: draft.role === r ? ROLES[r].bg : 'rgba(255,255,255,0.04)',
                        color: draft.role === r ? ROLES[r].color : '#475569',
                        border: `1px solid ${draft.role === r ? ROLES[r].color : '#334155'}`,
                      }}>
                      {ROLES[r].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Guichet assigné ── */}
          <section>
            <h3 style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '12px' }}>Guichet assigné</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setDraft((d) => ({ ...d, guichet: null }))}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: draft.guichet === null ? 'rgba(244,63,94,0.12)' : 'rgba(255,255,255,0.04)',
                  color: draft.guichet === null ? '#F43F5E' : '#475569',
                  border: `1px solid ${draft.guichet === null ? '#F43F5E' : '#334155'}`,
                }}>
                Non assigné
              </button>
              {GUICHETS.map((g) => (
                <button key={g} onClick={() => setDraft((d) => ({ ...d, guichet: g }))}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: draft.guichet === g ? 'rgba(108,71,255,0.15)' : 'rgba(255,255,255,0.04)',
                    color: draft.guichet === g ? '#6C47FF' : '#475569',
                    border: `1px solid ${draft.guichet === g ? '#6C47FF' : '#334155'}`,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                  {g}
                </button>
              ))}
            </div>
          </section>

          {/* ── Permissions RBAC ── */}
          <section>
            <h3 style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '12px' }}>Permissions</h3>
            <div className="space-y-2">
              {ALL_PERMISSIONS.map((p) => {
                const enabled = draft.permissions[p.key] ?? false;
                return (
                  <div key={p.key} onClick={() => handlePermission(p.key, !enabled)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                    style={{ backgroundColor: enabled ? 'rgba(108,71,255,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${enabled ? 'rgba(108,71,255,0.25)' : '#1e293b'}` }}>
                    <div>
                      <p style={{ fontSize: '13px', color: enabled ? '#e2e8f0' : '#64748b', fontWeight: 500 }}>{p.label}</p>
                      <p style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>{p.description}</p>
                    </div>
                    {/* Custom checkbox */}
                    <div style={{ width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                      backgroundColor: enabled ? '#6C47FF' : 'transparent',
                      border: `2px solid ${enabled ? '#6C47FF' : '#334155'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      {enabled && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Sécurité ── */}
          <section>
            <h3 style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '12px' }}>Sécurité</h3>
            {pinReset ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <Shield size={14} color="#10B981" />
                <span style={{ fontSize: '12px', color: '#10B981' }}>
                  Réinitialisation envoyée par e-mail — le PIN actuel est invalidé.
                </span>
              </div>
            ) : (
              <button onClick={() => setPinReset(true)}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all"
                style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.14)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.08)'; }}>
                <RotateCcw size={14} />
                Réinitialiser le code PIN
              </button>
            )}
          </section>

          {/* ── KPIs Performance ── */}
          <section>
            <h3 style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '12px' }}>Performance du jour</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: Ticket, label: 'Tickets traités', value: draft.ticketsToday || '—', color: '#6C47FF', bg: 'rgba(108,71,255,0.1)' },
                { icon: Clock,  label: 'TMT individuel',  value: formatTmt(draft.tmt),       color: tmtDiff > 0 ? '#F43F5E' : '#10B981', bg: tmtDiff > 0 ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)' },
                { icon: Star,   label: 'Satisfaction',    value: draft.nps > 0 ? `${draft.nps.toFixed(1)}/5` : '—', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="rounded-xl p-3 flex flex-col gap-2"
                  style={{ backgroundColor: bg, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <Icon size={14} color={color} />
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '18px', fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.3 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* TMT vs moyenne agence */}
            {draft.tmt > 0 && (
              <div className="rounded-xl p-4" style={{ backgroundColor: '#1A2235', border: '1px solid #334155' }}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: '12px', color: '#64748b' }}>TMT vs moyenne agence</span>
                  <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
                    color: tmtDiff > 0 ? '#F43F5E' : '#10B981', fontWeight: 600 }}>
                    {tmtDiff > 0 ? '+' : ''}{formatTmt(Math.abs(tmtDiff))}
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#0A0E1A', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '3px', transition: 'width 0.6s ease',
                    width: `${Math.min(tmtPct, 100)}%`,
                    backgroundColor: tmtPct > 100 ? '#F43F5E' : '#10B981',
                  }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span style={{ fontSize: '10px', color: '#334155' }}>0</span>
                  <span style={{ fontSize: '10px', color: '#475569' }}>Moy. {formatTmt(AGENCY_TMT_AVG)}</span>
                </div>
              </div>
            )}

            {/* Sparkline sur 4h */}
            <div className="mt-3 rounded-xl p-4" style={{ backgroundColor: '#1A2235', border: '1px solid #334155' }}>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Activité — 4 dernières heures</p>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={draft.sparkline} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <Line type="monotone" dataKey="v" stroke={draft.avatarColor} strokeWidth={2} dot={false}
                    activeDot={{ r: 4, fill: draft.avatarColor }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F1623', border: '1px solid #334155', borderRadius: '6px',
                      fontSize: '11px', padding: '4px 8px' }}
                    itemStyle={{ color: draft.avatarColor }}
                    formatter={(v: number) => [`${v} tickets`, '']}
                    labelFormatter={() => ''} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Footer sticky */}
        <div className="flex gap-3 px-6 py-4 shrink-0" style={{ borderTop: '1px solid #334155' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid #334155' }}>
            Annuler
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: saved ? '#10B981' : '#6C47FF', color: '#fff',
              boxShadow: saved ? '0 0 12px rgba(16,185,129,0.3)' : '0 0 12px rgba(108,71,255,0.2)' }}>
            {saved ? '✓ Enregistré' : 'Enregistrer'}
          </button>
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE ROW
// ─────────────────────────────────────────────────────────────────────────────

function AgentRow({ agent, index, onSelect, onToggle }: {
  agent: Agent; index: number;
  onSelect: (a: Agent) => void;
  onToggle: (id: string, active: boolean) => void;
}) {
  const statusCfg = STATUS_CFG[agent.isActive ? agent.status : 'disabled'];
  const roleCfg   = ROLES[agent.role];
  const isZebra   = index % 2 === 1;

  return (
    <tr
      onClick={(e) => { if ((e.target as HTMLElement).closest('[data-no-select]')) return; onSelect(agent); }}
      className="group cursor-pointer transition-colors duration-100"
      style={{ backgroundColor: isZebra ? 'rgba(255,255,255,0.018)' : 'transparent' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(108,71,255,0.06)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = isZebra ? 'rgba(255,255,255,0.018)' : 'transparent'; }}>

      {/* Agent — Avatar + Nom */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: agent.isActive ? agent.avatarColor : '#1e293b',
                color: agent.isActive ? '#fff' : '#475569', opacity: agent.isActive ? 1 : 0.6 }}>
              {agent.avatar}
            </div>
            {/* Status dot */}
            <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '9px', height: '9px',
              borderRadius: '50%', backgroundColor: statusCfg.dot, border: '2px solid #0F1623',
              animation: agent.status === 'online' && agent.isActive ? 'pulse-soft 2s ease-in-out infinite' : 'none' }} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: agent.isActive ? '#e2e8f0' : '#475569', lineHeight: 1.25 }}>
              {agent.name}
            </p>
            <p style={{ fontSize: '11px', color: '#334155', fontFamily: 'JetBrains Mono, monospace', marginTop: '1px' }}>
              {agent.id}
            </p>
          </div>
        </div>
      </td>

      {/* Rôle */}
      <td className="px-5 py-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
          style={{ color: roleCfg.color, backgroundColor: roleCfg.bg }}>
          {roleCfg.label}
        </span>
      </td>

      {/* Services */}
      <td className="px-5 py-3">
        <div className="flex flex-wrap gap-1">
          {agent.services.slice(0, 2).map((s) => (
            <span key={s} className="px-1.5 py-0.5 rounded text-xs"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid #1e293b' }}>
              {s}
            </span>
          ))}
          {agent.services.length > 2 && (
            <span className="px-1.5 py-0.5 rounded text-xs" style={{ color: '#334155' }}>
              +{agent.services.length - 2}
            </span>
          )}
        </div>
      </td>

      {/* Guichet */}
      <td className="px-5 py-3">
        <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace',
          color: agent.guichet ? '#6C47FF' : '#334155', fontWeight: agent.guichet ? 600 : 400 }}>
          {agent.guichet ?? '—'}
        </span>
      </td>

      {/* Statut */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-1.5">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusCfg.dot,
            display: 'inline-block', flexShrink: 0,
            animation: agent.status === 'online' && agent.isActive ? 'pulse-soft 2s ease-in-out infinite' : 'none' }} />
          <span style={{ fontSize: '12px', color: statusCfg.color }}>{statusCfg.label}</span>
        </div>
      </td>

      {/* Tickets */}
      <td className="px-5 py-3">
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 600,
          color: agent.ticketsToday > 0 ? '#e2e8f0' : '#334155' }}>
          {agent.ticketsToday || '—'}
        </span>
      </td>

      {/* TMT */}
      <td className="px-5 py-3">
        <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace',
          color: agent.tmt > AGENCY_TMT_AVG ? '#F43F5E' : agent.tmt > 0 ? '#10B981' : '#334155' }}>
          {formatTmt(agent.tmt)}
        </span>
      </td>

      {/* NPS */}
      <td className="px-5 py-3">
        <NpsStars value={agent.nps} />
      </td>

      {/* Sparkline */}
      <td className="px-5 py-3">
        <Sparkline data={agent.sparkline} color={agent.isActive ? agent.avatarColor : '#334155'} />
      </td>

      {/* Toggle actif */}
      <td className="px-5 py-3" data-no-select="true" onClick={(e) => e.stopPropagation()}>
        <StatusToggle agent={agent} onToggle={onToggle} />
      </td>

      {/* Chevron */}
      <td className="px-3 py-3">
        <ChevronRight size={14} color="#334155"
          style={{ transition: 'color 0.15s', color: 'inherit' }}
          className="group-hover:text-violet-500" />
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAWER — Création d'un nouvel agent
// ─────────────────────────────────────────────────────────────────────────────

interface CreateForm {
  name: string;
  email: string;
  role: AgentRole;
  pin: string;
  services: string[];
  guichet: string | null;
}

interface FormErrors {
  name?: string;
  email?: string;
  pin?: string;
}

function CreateAgentDrawer({ onClose, onCreate, existingAgents }: {
  onClose: () => void;
  onCreate: (agent: Agent) => void;
  existingAgents: Agent[];
}) {
  const [form, setForm] = useState<CreateForm>({
    name: '', email: '', role: 'agent', pin: '', services: [], guichet: null,
  });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // ── Validation ──
  const validate = (f: CreateForm): FormErrors => {
    const e: FormErrors = {};
    if (!f.name.trim() || f.name.trim().length < 3)
      e.name = 'Le nom doit contenir au moins 3 caractères.';
    if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      e.email = 'Adresse e-mail invalide.';
    if (!f.pin || !/^\d{4,6}$/.test(f.pin))
      e.pin = 'Le PIN doit contenir entre 4 et 6 chiffres.';
    return e;
  };

  const setField = <K extends keyof CreateForm>(key: K, val: CreateForm[K]) => {
    const updated = { ...form, [key]: val };
    setForm(updated);
    if (touched[key]) {
      setErrors(validate(updated));
    }
  };

  const handleBlur = (key: keyof CreateForm) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(form));
  };

  const generatePin = () => {
    const pin = String(Math.floor(100000 + Math.random() * 900000)).slice(0, 6);
    setField('pin', pin);
    setShowPin(true);
  };

  const toggleService = (s: string) => {
    setField('services', form.services.includes(s)
      ? form.services.filter((x) => x !== s)
      : [...form.services, s]
    );
  };

  const handleSubmit = async () => {
    const allTouched = Object.fromEntries(
      ['name', 'email', 'pin'].map((k) => [k, true])
    );
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    // Simule l'appel API FastAPI
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setSuccess(true);

    const colorIndex = existingAgents.length % AVATAR_COLORS.length;
    const newAgent: Agent = {
      id:           generateEmpId(existingAgents),
      name:         form.name.trim(),
      email:        form.email.trim(),
      avatar:       getInitials(form.name),
      avatarColor:  AVATAR_COLORS[colorIndex],
      role:         form.role,
      services:     form.services.length > 0 ? form.services : ['Renseignements'],
      guichet:      form.guichet,
      status:       'offline',
      isActive:     true,
      ticketsToday: 0,
      tmt:          0,
      nps:          0,
      sparkline:    Array(8).fill({ v: 0 }),
      permissions: {
        can_call:     true,
        can_transfer: form.role !== 'agent' ? true : false,
        can_pause:    true,
        can_noshow:   true,
        can_reports:  form.role !== 'agent',
        can_settings: form.role === 'admin_agency',
      },
    };

    setTimeout(() => { onCreate(newAgent); onClose(); }, 600);
  };

  // ── Input helper ──
  const inputCls = (key: keyof FormErrors): React.CSSProperties => ({
    width: '100%', height: '42px', backgroundColor: '#0F1623',
    border: `1px solid ${touched[key] && errors[key] ? '#F43F5E' : '#334155'}`,
    borderRadius: '8px', padding: '0 14px', fontSize: '14px', color: '#f1f5f9',
    fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  });

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#6C47FF';
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(108,71,255,0.18)';
  };
  const handleBlurInput = (e: React.FocusEvent<HTMLInputElement>, key: keyof CreateForm) => {
    const hasError = touched[key] && errors[key as keyof FormErrors];
    e.currentTarget.style.borderColor = hasError ? '#F43F5E' : '#334155';
    e.currentTarget.style.boxShadow   = 'none';
    handleBlur(key as keyof FormErrors);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
        onClick={onClose} />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
        style={{ width: '480px', maxWidth: '95vw', backgroundColor: '#1A2235',
          borderLeft: '1px solid #334155', boxShadow: '-24px 0 64px rgba(0,0,0,0.5)' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: '1px solid #334155' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
              Nouvel Agent
            </h2>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '3px' }}>
              Les informations d'accès seront envoyées par e-mail.
            </p>
          </div>
          <button onClick={onClose} aria-label="Fermer"
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
            <X size={18} />
          </button>
        </div>

        {/* ── Body scrollable ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">

          {/* ─ SECTION : Identité ─ */}
          <section>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '16px' }}>
              Identité
            </p>
            <div className="space-y-4">

              {/* Nom */}
              <div>
                <label htmlFor="new-name" style={{ display: 'block', fontSize: '13px', fontWeight: 600,
                  color: '#94a3b8', marginBottom: '6px' }}>
                  Nom complet <span style={{ color: '#F43F5E' }}>*</span>
                </label>
                <input id="new-name" type="text" value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlurInput(e, 'name')}
                  placeholder="ex: Jean-Pierre Nkurunziza"
                  style={inputCls('name')} />
                {touched.name && errors.name && (
                  <p style={{ fontSize: '11px', color: '#F43F5E', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={10} /> {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="new-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600,
                  color: '#94a3b8', marginBottom: '6px' }}>
                  Email professionnel <span style={{ color: '#F43F5E' }}>*</span>
                </label>
                <input id="new-email" type="email" value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlurInput(e, 'email')}
                  placeholder="ex: j.nkurunziza@banque.bi"
                  style={inputCls('email')} />
                {touched.email && errors.email && (
                  <p style={{ fontSize: '11px', color: '#F43F5E', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={10} /> {errors.email}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ─ SECTION : Sécurité & Accès ─ */}
          <section>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '16px' }}>
              Sécurité & Accès
            </p>
            <div className="space-y-4">

              {/* Rôle */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600,
                  color: '#94a3b8', marginBottom: '8px' }}>
                  Rôle <span style={{ color: '#F43F5E' }}>*</span>
                </label>
                <div className="space-y-2">
                  {(Object.keys(ROLES) as AgentRole[]).map((r) => {
                    const isSelected = form.role === r;
                    return (
                      <div key={r} onClick={() => setField('role', r)}
                        className="flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                        style={{
                          backgroundColor: isSelected ? ROLES[r].bg : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isSelected ? ROLES[r].color : '#334155'}`,
                        }}>
                        {/* Radio visuel */}
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', marginTop: '2px', flexShrink: 0,
                          border: `2px solid ${isSelected ? ROLES[r].color : '#334155'}`,
                          backgroundColor: isSelected ? ROLES[r].color : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                          {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff' }} />}
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 600,
                            color: isSelected ? ROLES[r].color : '#64748b' }}>{ROLES[r].label}</p>
                          <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px', lineHeight: 1.5 }}>
                            {ROLE_DESCRIPTIONS[r]}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PIN */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="new-pin" style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
                    Code PIN initial <span style={{ color: '#F43F5E' }}>*</span>
                  </label>
                  <button type="button" onClick={generatePin}
                    style={{ fontSize: '11px', color: '#6C47FF', background: 'none', border: 'none',
                      cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RotateCcw size={10} /> Générer aléatoirement
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input id="new-pin" type={showPin ? 'text' : 'password'} value={form.pin}
                    onChange={(e) => setField('pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onFocus={handleFocus}
                    onBlur={(e) => handleBlurInput(e, 'pin')}
                    placeholder="4 à 6 chiffres"
                    inputMode="numeric"
                    style={{ ...inputCls('pin'), paddingRight: '44px',
                      fontFamily: form.pin && !showPin ? 'monospace' : 'Inter, sans-serif',
                      letterSpacing: form.pin && !showPin ? '0.3em' : 'normal' }} />
                  <button type="button" onClick={() => setShowPin((v) => !v)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                    {showPin ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {touched.pin && errors.pin && (
                  <p style={{ fontSize: '11px', color: '#F43F5E', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={10} /> {errors.pin}
                  </p>
                )}
                <p style={{ fontSize: '11px', color: '#334155', marginTop: '5px' }}>
                  Le PIN sera hashé (bcrypt) avant d'être stocké en base de données.
                </p>
              </div>
            </div>
          </section>

          {/* ─ SECTION : Assignation Métier ─ */}
          <section>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '16px' }}>
              Assignation Métier
            </p>
            <div className="space-y-4">

              {/* Services */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600,
                  color: '#94a3b8', marginBottom: '8px' }}>
                  Services autorisés
                  <span style={{ fontSize: '11px', color: '#334155', fontWeight: 400, marginLeft: '6px' }}>
                    ({form.services.length} sélectionné{form.services.length > 1 ? 's' : ''})
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SERVICES.map((s) => {
                    const active = form.services.includes(s);
                    return (
                      <button key={s} type="button" onClick={() => toggleService(s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          backgroundColor: active ? 'rgba(108,71,255,0.15)' : 'rgba(255,255,255,0.03)',
                          color:           active ? '#6C47FF' : '#64748b',
                          border:          `1px solid ${active ? 'rgba(108,71,255,0.4)' : '#334155'}`,
                        }}>
                        {active && <span style={{ marginRight: '4px' }}>✓</span>}
                        {s}
                      </button>
                    );
                  })}
                </div>
                {form.services.length === 0 && (
                  <p style={{ fontSize: '11px', color: '#475569', marginTop: '8px' }}>
                    Sans sélection, l'agent recevra le service "Renseignements" par défaut.
                  </p>
                )}
              </div>

              {/* Guichet */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600,
                  color: '#94a3b8', marginBottom: '8px' }}>
                  Guichet par défaut
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setField('guichet', null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: form.guichet === null ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                      color:           form.guichet === null ? '#94a3b8' : '#475569',
                      border:          `1px solid ${form.guichet === null ? '#475569' : '#334155'}`,
                    }}>
                    Non assigné
                  </button>
                  {GUICHETS.map((g) => {
                    const isOccupied = existingAgents.some((a) => a.guichet === g && a.isActive);
                    return (
                      <button key={g} type="button" onClick={() => setField('guichet', g)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          backgroundColor: form.guichet === g ? 'rgba(108,71,255,0.15)' : 'rgba(255,255,255,0.02)',
                          color:           form.guichet === g ? '#6C47FF' : isOccupied ? '#F59E0B' : '#64748b',
                          border:          `1px solid ${form.guichet === g ? '#6C47FF' : isOccupied ? 'rgba(245,158,11,0.3)' : '#334155'}`,
                          fontFamily:      'JetBrains Mono, monospace',
                        }}>
                        {g}
                        {isOccupied && !form.guichet && (
                          <span style={{ fontSize: '9px', color: '#F59E0B' }}>●</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: '11px', color: '#334155', marginTop: '6px' }}>
                  <span style={{ color: '#F59E0B' }}>●</span>{' '}
                  Guichets déjà occupés par un agent actif.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* ── Footer sticky ── */}
        <div className="shrink-0 px-6 py-4 flex gap-3"
          style={{ borderTop: '1px solid #334155', backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(26,34,53,0.92)' }}>
          <button onClick={onClose} type="button"
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ backgroundColor: 'transparent', color: '#64748b', border: '1px solid #334155' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#475569'; e.currentTarget.style.color = '#94a3b8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#64748b'; }}>
            Annuler
          </button>
          <button onClick={handleSubmit} type="button" disabled={loading || success}
            className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              height: '40px', borderRadius: '8px',
              backgroundColor: success ? '#10B981' : '#6C47FF',
              color: '#fff',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: success ? '0 0 16px rgba(16,185,129,0.3)' : '0 0 16px rgba(108,71,255,0.25)',
              opacity: loading ? 0.9 : 1,
            }}>
            {success ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Agent créé !
              </>
            ) : loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
                Création en cours…
              </>
            ) : (
              <>
                <Plus size={15} />
                Créer l'agent
              </>
            )}
          </button>
        </div>
      </aside>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [agents, setAgents]       = useState<Agent[]>(MOCK_AGENTS);
  const [search, setSearch]       = useState('');
  const [sortKey, setSortKey]     = useState<SortKey>('name');
  const [sortDir, setSortDir]     = useState<SortDir>('asc');
  const [selected, setSelected]   = useState<Agent | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterRole, setFilterRole] = useState<AgentRole | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AgentStatus | 'all'>('all');

  // Tri
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronDown size={11} color="#334155" />;
    return sortDir === 'asc' ? <ChevronUp size={11} color="#6C47FF" /> : <ChevronDown size={11} color="#6C47FF" />;
  };

  // Filtrage + tri
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return agents
      .filter((a) => {
        const matchSearch = a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
        const matchRole   = filterRole === 'all' || a.role === filterRole;
        const matchStatus = filterStatus === 'all' || (filterStatus === 'disabled' ? !a.isActive : a.status === filterStatus && a.isActive);
        return matchSearch && matchRole && matchStatus;
      })
      .sort((a, b) => {
        let val = 0;
        if (sortKey === 'name')         val = a.name.localeCompare(b.name);
        if (sortKey === 'status')       val = (a.isActive ? 0 : 1) - (b.isActive ? 0 : 1);
        if (sortKey === 'ticketsToday') val = a.ticketsToday - b.ticketsToday;
        if (sortKey === 'tmt')          val = a.tmt - b.tmt;
        if (sortKey === 'nps')          val = a.nps - b.nps;
        return sortDir === 'asc' ? val : -val;
      });
  }, [agents, search, sortKey, sortDir, filterRole, filterStatus]);

  const handleToggle = (id: string, active: boolean) => {
    setAgents((prev) => prev.map((a) =>
      a.id === id ? { ...a, isActive: active, status: active ? 'offline' : 'disabled' } : a
    ));
  };

  const handleUpdate = (updated: Agent) => {
    setAgents((prev) => prev.map((a) => a.id === updated.id ? updated : a));
    setSelected(updated);
  };

  const handleCreate = (newAgent: Agent) => {
    setAgents((prev) => [newAgent, ...prev]);
  };

  // Stats rapides header
  const onlineCount   = agents.filter((a) => a.isActive && a.status === 'online').length;
  const pauseCount    = agents.filter((a) => a.isActive && a.status === 'pause').length;
  const disabledCount = agents.filter((a) => !a.isActive).length;
  const totalTickets  = agents.reduce((s, a) => s + a.ticketsToday, 0);

  const thStyle: React.CSSProperties = {
    fontSize: '10px', fontWeight: 600, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    padding: '10px 20px', textAlign: 'left', cursor: 'pointer', userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', minHeight: '100%' }}>

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
            Gestion des Agents
          </h1>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
            {agents.length} agents · {onlineCount} en ligne · {pauseCount} en pause · {disabledCount} désactivés
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ backgroundColor: '#6C47FF', color: '#fff', boxShadow: '0 0 16px rgba(108,71,255,0.3)' }}
          onClick={() => setShowCreate(true)}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#7c5cff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#6C47FF'; }}>
          <Plus size={16} />
          Ajouter un Agent
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'En ligne',       value: onlineCount,   color: '#10B981', bg: 'rgba(16,185,129,0.08)'  },
          { label: 'En pause',       value: pauseCount,    color: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
          { label: 'Désactivés',     value: disabledCount, color: '#F43F5E', bg: 'rgba(244,63,94,0.08)'   },
          { label: 'Tickets / jour', value: totalTickets,  color: '#6C47FF', bg: 'rgba(108,71,255,0.08)'  },
        ].map((s) => (
          <div key={s.label} className="rounded-xl px-5 py-4 flex items-center justify-between"
            style={{ backgroundColor: s.bg, border: `1px solid ${s.color}20` }}>
            <p style={{ fontSize: '12px', color: '#64748b' }}>{s.label}</p>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '22px', fontWeight: 700, color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Barre de filtres ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Recherche */}
        <div className="relative flex-1" style={{ minWidth: '220px', maxWidth: '360px' }}>
          <Search size={14} color="#475569" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou ID (EMP-243)…"
            style={{ width: '100%', height: '38px', backgroundColor: '#1A2235', border: '1px solid #334155',
              borderRadius: '10px', padding: '0 12px 0 36px', fontSize: '13px', color: '#e2e8f0',
              fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' as const }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#6C47FF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,71,255,0.12)'; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = 'none'; }} />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filtre rôle */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: '#1A2235', border: '1px solid #334155' }}>
          {(['all', 'agent', 'supervisor', 'admin_agency'] as const).map((r) => (
            <button key={r} onClick={() => setFilterRole(r)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all"
              style={{ backgroundColor: filterRole === r ? '#6C47FF' : 'transparent',
                color: filterRole === r ? '#fff' : '#64748b' }}>
              {r === 'all' ? 'Tous' : ROLES[r].label}
            </button>
          ))}
        </div>

        {/* Filtre statut */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: '#1A2235', border: '1px solid #334155' }}>
          {(['all', 'online', 'pause', 'disabled'] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all"
              style={{ backgroundColor: filterStatus === s ? (s === 'all' ? '#6C47FF' : STATUS_CFG[s === 'disabled' ? 'disabled' : s].dot + '22') : 'transparent',
                color: filterStatus === s ? (s === 'all' ? '#fff' : STATUS_CFG[s === 'disabled' ? 'disabled' : s].color) : '#64748b' }}>
              {s !== 'all' && <span style={{ width: '5px', height: '5px', borderRadius: '50%',
                backgroundColor: STATUS_CFG[s === 'disabled' ? 'disabled' : s].dot, display: 'inline-block' }} />}
              {s === 'all' ? 'Tous' : STATUS_CFG[s === 'disabled' ? 'disabled' : s].label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tableau ── */}
      <div style={{ backgroundColor: '#1A2235', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', backgroundColor: '#0F1623' }}>
                <th style={thStyle} onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">Agent <SortIcon col="name" /></div>
                </th>
                <th style={thStyle}>Rôle</th>
                <th style={thStyle}>Services</th>
                <th style={thStyle}>Guichet</th>
                <th style={thStyle} onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1.5">Statut <SortIcon col="status" /></div>
                </th>
                <th style={thStyle} onClick={() => handleSort('ticketsToday')}>
                  <div className="flex items-center gap-1.5">Tickets <SortIcon col="ticketsToday" /></div>
                </th>
                <th style={thStyle} onClick={() => handleSort('tmt')}>
                  <div className="flex items-center gap-1.5">TMT <SortIcon col="tmt" /></div>
                </th>
                <th style={thStyle} onClick={() => handleSort('nps')}>
                  <div className="flex items-center gap-1.5">Satisfaction <SortIcon col="nps" /></div>
                </th>
                <th style={thStyle}>Activité 4h</th>
                <th style={thStyle}>Actif</th>
                <th style={{ ...thStyle, cursor: 'default' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '48px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>
                    Aucun agent trouvé pour ces critères.
                  </td>
                </tr>
              ) : (
                filtered.map((agent, i) => (
                  <AgentRow key={agent.id} agent={agent} index={i}
                    onSelect={setSelected} onToggle={handleToggle} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer tableau */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #334155' }}>
          <p style={{ fontSize: '12px', color: '#475569' }}>
            {filtered.length} agent{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
            {filtered.length !== agents.length && ` sur ${agents.length}`}
          </p>
          <div className="flex items-center gap-2">
            <Phone size={12} color="#334155" />
            <PauseCircle size={12} color="#334155" />
            <AlertTriangle size={12} color="#334155" />
            <ArrowRightLeft size={12} color="#334155" />
            <span style={{ fontSize: '11px', color: '#334155', marginLeft: '4px' }}>Cliquer sur une ligne pour modifier</span>
          </div>
        </div>
      </div>

      {/* ── Drawer édition ── */}
      {selected && (
        <AgentDrawer
          agent={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate} />
      )}

      {/* ── Drawer création ── */}
      {showCreate && (
        <CreateAgentDrawer
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          existingAgents={agents} />
      )}

      <style>{`
        @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
