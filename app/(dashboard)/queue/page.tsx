'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { ArrowRightLeft, ChevronDown, AlertTriangle, UserCog, X, Zap, Lock, Unlock } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Priority     = 'standard' | 'priority' | 'urgent' | 'vip';
type TicketState  = 'waiting' | 'called' | 'serving' | 'done';
type GuichetState = 'online' | 'pause' | 'closed' | 'overflow';

interface Ticket  { id: string; code: string; priority: Priority; service: string; client: string | null; createdAt: number; state: TicketState; }
interface Guichet { id: string; number: string; agent: string; status: GuichetState; currentTicket: string | null; serviceStart: number | null; service: string; }

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

const now = Date.now();

const INITIAL_TICKETS: Ticket[] = [
  { id: '1', code: 'T-047', priority: 'vip',      service: 'VIP Conseil',    client: 'Marie Nkurunziza',     createdAt: now - 720000, state: 'waiting' },
  { id: '2', code: 'T-048', priority: 'urgent',   service: 'Urgence Méd.',   client: null,                   createdAt: now - 512000, state: 'waiting' },
  { id: '3', code: 'T-049', priority: 'priority', service: 'Caisse',         client: 'Aline Mukamana',       createdAt: now - 310000, state: 'waiting' },
  { id: '4', code: 'T-050', priority: 'standard', service: 'Dépôt',          client: null,                   createdAt: now - 225000, state: 'waiting' },
  { id: '5', code: 'T-051', priority: 'standard', service: 'Virement',       client: 'Diane Uwera',          createdAt: now - 140000, state: 'waiting' },
  { id: '6', code: 'T-052', priority: 'urgent',   service: 'Retrait',        client: null,                   createdAt: now - 95000,  state: 'waiting' },
  { id: '7', code: 'T-053', priority: 'standard', service: 'Renseignements', client: 'Patrick Nsengimana',   createdAt: now - 67000,  state: 'waiting' },
  { id: '8', code: 'T-054', priority: 'priority', service: 'Crédit',         client: null,                   createdAt: now - 42000,  state: 'waiting' },
  { id: '9', code: 'T-055', priority: 'vip',      service: 'VIP Conseil',    client: 'Jean-Pierre Habimana', createdAt: now - 28000,  state: 'waiting' },
];

const INITIAL_GUICHETS: Guichet[] = [
  { id: 'g1', number: 'G-01', agent: 'Isabelle M.',    status: 'online',   currentTicket: 'T-043', serviceStart: now - 480000, service: 'Ouverture Compte' },
  { id: 'g2', number: 'G-02', agent: 'Rodrigue K.',    status: 'overflow', currentTicket: 'T-044', serviceStart: now - 960000, service: 'Retrait Caisse'   },
  { id: 'g3', number: 'G-03', agent: 'Chantal N.',     status: 'pause',    currentTicket: null,    serviceStart: null,         service: 'Caisse'           },
  { id: 'g4', number: 'G-04', agent: 'Eric B.',        status: 'closed',   currentTicket: null,    serviceStart: null,         service: 'Virements'        },
  { id: 'g5', number: 'G-05', agent: 'Diane U.',       status: 'online',   currentTicket: 'T-045', serviceStart: now - 120000, service: 'Prêts'            },
  { id: 'g6', number: 'G-06', agent: 'Patrick N.',     status: 'online',   currentTicket: 'T-046', serviceStart: now - 67000,  service: 'Retrait Caisse'   },
  { id: 'g7', number: 'G-07', agent: 'Marie K.',       status: 'pause',    currentTicket: null,    serviceStart: null,         service: 'Ouverture Compte' },
  { id: 'g8', number: 'G-08', agent: 'Jean-Claude M.', status: 'online',   currentTicket: 'T-042', serviceStart: now - 300000, service: 'VIP'              },
];

// ─────────────────────────────────────────────────────────────────────────────
// STYLE CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const priorityCfg: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  standard: { label: 'Standard',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', dot: '#F59E0B' },
  priority: { label: 'Prioritaire', color: '#10B981', bg: 'rgba(16,185,129,0.12)', dot: '#10B981' },
  urgent:   { label: 'Urgence',     color: '#F43F5E', bg: 'rgba(244,63,94,0.12)',  dot: '#F43F5E' },
  vip:      { label: 'VIP',         color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',  dot: '#06B6D4' },
};

const guichetCfg: Record<GuichetState, { label: string; color: string; border: string; bg: string }> = {
  online:   { label: 'En ligne',  color: '#10B981', border: '#10B981', bg: 'rgba(16,185,129,0.06)' },
  pause:    { label: 'En pause',  color: '#F59E0B', border: '#F59E0B', bg: 'rgba(245,158,11,0.06)' },
  closed:   { label: 'Fermé',     color: '#F43F5E', border: '#334155', bg: 'rgba(0,0,0,0)'         },
  overflow: { label: 'Débordé',   color: '#8B5CF6', border: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
};

const priorityOrder: Record<Priority, number> = { urgent: 0, vip: 1, priority: 2, standard: 3 };

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function useTimer() {
  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 1000); return () => clearInterval(id); }, []);
}

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function Widget({ children, style = {} }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div style={{ backgroundColor: '#0F1623', borderRadius: '8px', border: '1px solid #334155', ...style }}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// TICKET CARD
// ─────────────────────────────────────────────────────────────────────────────

function TicketCard({ ticket, onChangePriority, onTransfer }: {
  ticket: Ticket;
  onChangePriority: (id: string, p: Priority) => void;
  onTransfer: (id: string) => void;
}) {
  useTimer();
  const cfg = priorityCfg[ticket.priority];
  const elapsed = Date.now() - ticket.createdAt;
  const isOverdue = elapsed > 15 * 60 * 1000;

  return (
    <div style={{ backgroundColor: '#0F1623', borderRadius: '8px',
      border: `1px solid ${isOverdue ? '#F43F5E' : '#334155'}`, padding: '12px 14px',
      boxShadow: isOverdue ? '0 0 0 1px rgba(244,63,94,0.3)' : 'none' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: isOverdue ? '#F43F5E' : '#6C47FF' }}>
          {ticket.code}
        </span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: cfg.bg, color: cfg.color }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: cfg.dot, display: 'inline-block' }} aria-hidden="true" />
          {cfg.label}
        </span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{ticket.service}</span>
        {ticket.client && <span style={{ fontSize: '11px', color: '#475569' }}>{ticket.client}</span>}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700,
            color: isOverdue ? '#F43F5E' : '#64748b',
            animation: isOverdue ? 'blink-red 1.5s ease-in-out infinite' : 'none' }}>
            ⏱ {formatElapsed(elapsed)}
          </span>
          {isOverdue && (
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#F43F5E', backgroundColor: 'rgba(244,63,94,0.15)',
              padding: '1px 5px', borderRadius: '4px', letterSpacing: '0.04em' }}>DÉPASSÉ</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onTransfer(ticket.id)} title="Transférer"
            className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-100" style={{ color: '#475569' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(108,71,255,0.15)'; e.currentTarget.style.color = '#6C47FF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
            <ArrowRightLeft size={13} />
          </button>
          <div className="relative group">
            <button title="Changer priorité"
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-100" style={{ color: '#475569' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.15)'; e.currentTarget.style.color = '#F59E0B'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
              <Zap size={13} />
            </button>
            <div className="absolute right-0 bottom-full mb-1 rounded-lg overflow-hidden z-20 hidden group-hover:block"
              style={{ backgroundColor: '#1A2235', border: '1px solid #334155', minWidth: '120px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
              {(Object.keys(priorityCfg) as Priority[]).map((p) => (
                <button key={p} onClick={() => onChangePriority(ticket.id, p)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors duration-100"
                  style={{ color: priorityCfg[p].color, backgroundColor: ticket.priority === p ? priorityCfg[p].bg : 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = priorityCfg[p].bg; }}
                  onMouseLeave={(e) => { if (ticket.priority !== p) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: priorityCfg[p].dot, display: 'inline-block', flexShrink: 0 }} />
                  {priorityCfg[p].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GUICHET CARD
// ─────────────────────────────────────────────────────────────────────────────

function GuichetCard({ guichet, onAction }: {
  guichet: Guichet;
  onAction: (g: Guichet, action: 'transfer' | 'toggle' | 'call') => void;
}) {
  useTimer();
  const cfg = guichetCfg[guichet.status];
  const serviceElapsed = guichet.serviceStart ? Date.now() - guichet.serviceStart : 0;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ backgroundColor: '#1A2235', borderRadius: '12px', border: `1px solid ${cfg.border}`,
      padding: '16px', position: 'relative', background: `linear-gradient(135deg, ${cfg.bg} 0%, #1A2235 60%)` }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{guichet.number}</span>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{guichet.service}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ color: cfg.color, backgroundColor: cfg.bg }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: cfg.color, display: 'inline-block',
              animation: guichet.status === 'online' || guichet.status === 'overflow' ? 'pulse-soft 2s ease-in-out infinite' : 'none' }} aria-hidden="true" />
            {cfg.label}
          </span>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center w-6 h-6 rounded-md transition-colors duration-100" style={{ color: '#475569' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; }}
              aria-label="Actions guichet">
              <ChevronDown size={13} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-20"
                  style={{ backgroundColor: '#0F1623', border: '1px solid #334155', minWidth: '160px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                  {[
                    { icon: ArrowRightLeft, label: 'Transférer ticket', action: 'transfer' as const, color: '#6C47FF' },
                    { icon: UserCog,        label: 'Réaffecter agent',  action: 'call'     as const, color: '#06B6D4' },
                    { icon: guichet.status === 'closed' ? Unlock : Lock,
                      label: guichet.status === 'closed' ? 'Ouvrir guichet' : 'Fermer guichet',
                      action: 'toggle' as const,
                      color: guichet.status === 'closed' ? '#10B981' : '#F43F5E' },
                  ].map(({ icon: Icon, label, action, color }) => (
                    <button key={label} onClick={() => { onAction(guichet, action); setMenuOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-medium transition-colors duration-100" style={{ color }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <Icon size={13} /><span>{label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ backgroundColor: '#6C47FF', color: '#fff', fontSize: '10px' }} aria-hidden="true">
          {guichet.agent[0]}
        </div>
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{guichet.agent}</span>
      </div>

      {guichet.currentTicket ? (
        <div className="rounded-lg p-3" style={{ backgroundColor: '#0A0E1A', border: '1px solid #1e293b' }}>
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700,
              color: guichet.status === 'overflow' ? '#8B5CF6' : '#6C47FF' }}>{guichet.currentTicket}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700,
              color: guichet.status === 'overflow' ? '#8B5CF6' : '#10B981' }}>{formatElapsed(serviceElapsed)}</span>
          </div>
          <p style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>En cours de traitement</p>
          {guichet.status === 'overflow' && (
            <div className="flex items-center gap-1.5 mt-2">
              <AlertTriangle size={11} color="#8B5CF6" />
              <span style={{ fontSize: '10px', color: '#8B5CF6', fontWeight: 600 }}>Durée dépassée — intervention requise</span>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg p-3 flex items-center justify-center"
          style={{ backgroundColor: '#0A0E1A', border: '1px dashed #1e293b', minHeight: '58px' }}>
          <span style={{ fontSize: '12px', color: '#334155' }}>
            {guichet.status === 'closed' ? 'Guichet fermé' : "En attente d'un ticket"}
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSFER MODAL
// ─────────────────────────────────────────────────────────────────────────────

function TransferModal({ ticketCode, guichets, onConfirm, onClose }: {
  ticketCode: string; guichets: Guichet[];
  onConfirm: (guichetId: string) => void; onClose: () => void;
}) {
  const [selected, setSelected] = useState('');
  const available = guichets.filter((g) => g.status === 'online' && !g.currentTicket);

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl overflow-hidden"
        style={{ width: '400px', maxWidth: '90vw', backgroundColor: '#1A2235', border: '1px solid #334155', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #334155' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>Transférer le ticket</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Ticket <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6C47FF' }}>{ticketCode}</span> vers un guichet disponible
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div className="p-4 space-y-2">
          {available.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#475569', textAlign: 'center', padding: '16px' }}>Aucun guichet disponible</p>
          ) : available.map((g) => (
            <button key={g.id} onClick={() => setSelected(g.id)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-100"
              style={{ backgroundColor: selected === g.id ? 'rgba(108,71,255,0.15)' : '#0F1623',
                border: `1px solid ${selected === g.id ? '#6C47FF' : '#334155'}` }}>
              <div className="flex items-center gap-3">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>{g.number}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{g.agent}</span>
              </div>
              <span style={{ fontSize: '11px', color: '#475569' }}>{g.service}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #334155' }}>
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#0F1623', color: '#64748b', border: '1px solid #334155' }}>Annuler</button>
          <button onClick={() => selected && onConfirm(selected)} disabled={!selected}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-100"
            style={{ backgroundColor: selected ? '#6C47FF' : '#334155', color: selected ? '#fff' : '#475569',
              cursor: selected ? 'pointer' : 'not-allowed' }}>
            Confirmer le transfert
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function QueuePage() {
  const [tickets, setTickets]     = useState<Ticket[]>(INITIAL_TICKETS);
  const [guichets, setGuichets]   = useState<Guichet[]>(INITIAL_GUICHETS);
  const [degraded, setDegraded]   = useState(false);
  const [degradedSecs, setDegradedSecs] = useState(0);
  const [transferTarget, setTransferTarget] = useState<string | null>(null);

  // Simulate WebSocket — ajoute un ticket toutes les 18s
  useEffect(() => {
    let counter = 60;
    const priorities: Priority[] = ['standard', 'standard', 'standard', 'priority', 'urgent', 'vip'];
    const services = ['Caisse', 'Dépôt', 'Virement', 'Crédit', 'Retrait', 'Renseignements'];
    const id = setInterval(() => {
      counter++;
      setTickets((prev) => [...prev, {
        id: String(counter), code: `T-0${counter}`,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        service: services[Math.floor(Math.random() * services.length)],
        client: null, createdAt: Date.now(), state: 'waiting',
      }]);
    }, 18000);
    return () => clearInterval(id);
  }, []);

  // Simulate degraded mode
  useEffect(() => { const id = setInterval(() => setDegraded((d) => !d), 45000); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (!degraded) { setDegradedSecs(0); return; }
    const id = setInterval(() => setDegradedSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [degraded]);

  const sortedTickets = [...tickets].sort((a, b) => {
    const pd = priorityOrder[a.priority] - priorityOrder[b.priority];
    return pd !== 0 ? pd : a.createdAt - b.createdAt;
  });

  const handleChangePriority = useCallback((ticketId: string, priority: Priority) => {
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, priority } : t));
  }, []);

  const handleTransferConfirm = useCallback((guichetId: string) => {
    if (!transferTarget) return;
    const ticket = tickets.find((t) => t.id === transferTarget);
    if (!ticket) return;
    setGuichets((prev) => prev.map((g) =>
      g.id === guichetId ? { ...g, currentTicket: ticket.code, serviceStart: Date.now(), status: 'online' } : g
    ));
    setTickets((prev) => prev.filter((t) => t.id !== transferTarget));
    setTransferTarget(null);
  }, [transferTarget, tickets]);

  const handleGuichetAction = useCallback((guichet: Guichet, action: 'transfer' | 'toggle' | 'call') => {
    if (action === 'toggle') {
      setGuichets((prev) => prev.map((g) =>
        g.id === guichet.id ? { ...g, status: g.status === 'closed' ? 'online' : 'closed', currentTicket: null, serviceStart: null } : g
      ));
    }
  }, []);

  const transferTicket = transferTarget ? tickets.find((t) => t.id === transferTarget) : null;
  const totalWaiting   = tickets.length;
  const onlineCount    = guichets.filter((g) => g.status === 'online' || g.status === 'overflow').length;
  const overflowCount  = guichets.filter((g) => g.status === 'overflow').length;
  const urgentCount    = tickets.filter((t) => t.priority === 'urgent' || t.priority === 'vip').length;

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-bold" style={{ fontSize: '20px', color: '#f1f5f9' }}>Supervision de la File</h1>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>Gestion temps réel des guichets et tickets</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: 'En attente',      value: totalWaiting,       color: '#6C47FF' },
            { label: 'Guichets actifs', value: `${onlineCount}/8`, color: '#10B981' },
            { label: 'Urgences',        value: urgentCount,        color: '#F43F5E' },
            { label: 'Débordés',        value: overflowCount,      color: '#8B5CF6' },
          ].map((s) => (
            <div key={s.label} className="text-center px-4 py-2 rounded-lg" style={{ backgroundColor: '#1A2235', border: '1px solid #334155' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '18px', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Degraded banner */}
      {degraded && (
        <div className="flex items-center gap-3 px-5 py-2.5" role="alert"
          style={{ backgroundColor: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px' }}>
          <AlertTriangle size={15} color="#F59E0B" />
          <span style={{ fontSize: '13px', color: '#F59E0B', fontWeight: 500 }}>
            Mode dégradé — Dernière mise à jour il y a {degradedSecs} seconde{degradedSecs > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Main layout 30/70 */}
      <div className="flex gap-0 flex-1 min-h-0 rounded-xl overflow-hidden"
        style={{ border: '1px solid #334155' }}>

        {/* LEFT — Flux en attente */}
        <div className="flex flex-col shrink-0"
          style={{ width: '30%', minWidth: '260px', backgroundColor: '#0F1623',
            borderRight: '1px solid #334155' }}>

          {/* Header colonne gauche */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid #1e293b' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
              Flux en attente
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: 'rgba(108,71,255,0.15)', color: '#6C47FF',
                  fontFamily: 'JetBrains Mono, monospace' }}>
                {totalWaiting}
              </span>
            </h2>
            <div className="flex items-center gap-1.5">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: degraded ? '#F59E0B' : '#10B981', display: 'inline-block',
                animation: 'pulse-soft 2s ease-in-out infinite' }} aria-hidden="true" />
              <span style={{ fontSize: '10px', color: degraded ? '#F59E0B' : '#10B981', fontWeight: 600 }}>
                {degraded ? 'Dégradé' : 'Temps réel'}
              </span>
            </div>
          </div>

          {/* Liste tickets — s'étend jusqu'en bas */}
          <div className="flex flex-col gap-2 overflow-y-auto flex-1 p-3">
            {sortedTickets.map((t) => (
              <TicketCard key={t.id} ticket={t}
                onChangePriority={handleChangePriority}
                onTransfer={setTransferTarget} />
            ))}
          </div>
        </div>

        {/* RIGHT — Guichets */}
        <div className="flex-1 overflow-y-auto p-4"
          style={{ backgroundColor: '#0A0E1A' }}>
          <h2 className="mb-4" style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
            Guichets
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981',
                fontFamily: 'JetBrains Mono, monospace' }}>
              {onlineCount} actifs
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {guichets.map((g) => (
              <GuichetCard key={g.id} guichet={g} onAction={handleGuichetAction} />
            ))}
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {transferTicket && (
        <TransferModal ticketCode={transferTicket.code} guichets={guichets}
          onConfirm={handleTransferConfirm} onClose={() => setTransferTarget(null)} />
      )}

      <style>{`
        @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes blink-red  { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>
    </div>
  );
}
