'use client';

import { useState, type ReactNode } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine,
  Cell, Legend,
} from 'recharts';
import {
  Clock, Ticket, TrendingDown, Star,
  TrendingUp, FileText, Download, ArrowUpRight, ArrowDownRight,
  Filter, CalendarDays,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Period   = 'day' | 'week' | 'month' | 'custom';
type Sentiment = 'positive' | 'neutral' | 'negative';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — period-aware
// ─────────────────────────────────────────────────────────────────────────────

const KPI_BY_PERIOD: Record<Period, {
  tmt: string; tmtDelta: number;
  volume: number; volumeDelta: number;
  abandon: number; abandonDelta: number;
  nps: number; npsDelta: number;
}> = {
  day:    { tmt: '11m 15s', tmtDelta: -12, volume: 247,  volumeDelta: +8,  abandon: 14.2, abandonDelta: -3,  nps: 4.3, npsDelta: +0.2 },
  week:   { tmt: '12m 40s', tmtDelta: -5,  volume: 1438, volumeDelta: +14, abandon: 16.8, abandonDelta: -1,  nps: 4.1, npsDelta: +0.1 },
  month:  { tmt: '13m 05s', tmtDelta: +3,  volume: 5812, volumeDelta: +22, abandon: 17.4, abandonDelta: +2,  nps: 3.9, npsDelta: -0.3 },
  custom: { tmt: '12m 00s', tmtDelta: -8,  volume: 3200, volumeDelta: +10, abandon: 15.5, abandonDelta: -2,  nps: 4.2, npsDelta: +0.1 },
};

const AFFLUENCE_BY_PERIOD: Record<Period, { h: string; tickets: number; avg: number }[]> = {
  day: [
    { h: '07h', tickets: 12, avg: 10 }, { h: '08h', tickets: 34, avg: 29 },
    { h: '09h', tickets: 61, avg: 55 }, { h: '10h', tickets: 89, avg: 82 },
    { h: '11h', tickets: 74, avg: 70 }, { h: '12h', tickets: 48, avg: 51 },
    { h: '13h', tickets: 39, avg: 42 }, { h: '14h', tickets: 93, avg: 85 },
    { h: '15h', tickets: 81, avg: 79 }, { h: '16h', tickets: 67, avg: 63 },
    { h: '17h', tickets: 44, avg: 48 }, { h: '18h', tickets: 21, avg: 25 },
  ],
  week: [
    { h: 'Lun', tickets: 210, avg: 195 }, { h: 'Mar', tickets: 248, avg: 220 },
    { h: 'Mer', tickets: 189, avg: 205 }, { h: 'Jeu', tickets: 275, avg: 240 },
    { h: 'Ven', tickets: 312, avg: 285 }, { h: 'Sam', tickets: 204, avg: 190 },
  ],
  month: [
    { h: 'S1', tickets: 1240, avg: 1150 }, { h: 'S2', tickets: 1380, avg: 1280 },
    { h: 'S3', tickets: 1510, avg: 1420 }, { h: 'S4', tickets: 1682, avg: 1560 },
  ],
  custom: [
    { h: 'J1', tickets: 220, avg: 200 }, { h: 'J2', tickets: 310, avg: 280 },
    { h: 'J3', tickets: 275, avg: 260 }, { h: 'J4', tickets: 340, avg: 310 },
    { h: 'J5', tickets: 290, avg: 270 },
  ],
};

const TMT_BY_SERVICE = [
  { service: 'Retrait caisse',    standard: 820,  prioritaire: 540 },
  { service: 'Ouverture compte',  standard: 1240, prioritaire: 780 },
  { service: 'Virement',         standard: 680,  prioritaire: 420 },
  { service: 'Renseignements',    standard: 420,  prioritaire: 300 },
  { service: 'Prêts & Crédit',   standard: 1560, prioritaire: 960 },
  { service: 'VIP Conseil',       standard: 980,  prioritaire: 560 },
];

const NPS_REVIEWS = [
  { id: 'T-031', client: 'Amina Niyonkuru',    service: 'Retrait caisse',   rating: 5, comment: 'Service rapide et efficace. Merci !', time: 'il y a 12 min' },
  { id: 'T-028', client: 'Jean-Pierre Habimana',service: 'Ouverture compte', rating: 4, comment: 'Très bien, juste un peu d\'attente.', time: 'il y a 28 min' },
  { id: 'T-025', client: 'Claudine Uwimana',   service: 'Prêts & Crédit',   rating: 3, comment: '', time: 'il y a 41 min' },
  { id: 'T-022', client: 'Marcel Bizimana',     service: 'Virement',        rating: 2, comment: 'Trop d\'attente, agent peu disponible.', time: 'il y a 55 min' },
  { id: 'T-019', client: 'Solange Ndayishimiye',service: 'Renseignements',   rating: 5, comment: 'Parfait comme toujours.', time: 'il y a 1h 10min' },
  { id: 'T-016', client: 'Patrick Karenzo',     service: 'Retrait caisse',   rating: 1, comment: 'Guichet fermé, personne pour aider.', time: 'il y a 1h 24min' },
  { id: 'T-014', client: 'Diane Uwera',         service: 'VIP Conseil',      rating: 5, comment: '', time: 'il y a 1h 38min' },
  { id: 'T-011', client: 'Eric Nsabimana',      service: 'Ouverture compte', rating: 4, comment: 'Bonne expérience globale.', time: 'il y a 2h 05min' },
];

const AGENCIES = ['Toutes les agences', 'BUJ-001 — Siège', 'BUJ-002 — Rohero', 'GIT-001 — Gitega', 'GOM-001 — Goma Nord'];
const SERVICES = ['Tous les services', 'Retrait caisse', 'Ouverture compte', 'Virement', 'Renseignements', 'Prêts & Crédit', 'VIP Conseil'];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — formatters
// ─────────────────────────────────────────────────────────────────────────────

function fmtSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec.toString().padStart(2, '0')}s`;
}

function sentimentOf(rating: number): Sentiment {
  if (rating >= 4) return 'positive';
  if (rating === 3) return 'neutral';
  return 'negative';
}

const SENTIMENT_CFG: Record<Sentiment, { color: string; bg: string; border: string }> = {
  positive: { color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
  neutral:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
  negative: { color: '#F43F5E', bg: 'rgba(244,63,94,0.08)',   border: 'rgba(244,63,94,0.2)'   },
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function Card({ children, className = '', style = {} }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={{ backgroundColor: '#1A2235', borderRadius: '12px', border: '1px solid #334155', ...style }}>
      {children}
    </div>
  );
}

function Widget({ children, style = {} }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div style={{ backgroundColor: '#0F1623', borderRadius: '8px', ...style }}>{children}</div>;
}

function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #334155' }}>
      <h2 className="font-semibold" style={{ fontSize: '14px', color: '#e2e8f0' }}>{title}</h2>
      {action}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: '#1A2235', border: '1px solid #334155', borderRadius: '8px',
      padding: '10px 14px', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: '#64748b', marginBottom: '6px' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name} : <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {typeof p.value === 'number' && p.value > 100 ? fmtSeconds(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELTA BADGE
// ─────────────────────────────────────────────────────────────────────────────

function DeltaBadge({ delta, unit = '%', inverse = false }: {
  delta: number; unit?: string; inverse?: boolean;
}) {
  // inverse=true : une hausse est mauvaise (ex: taux d'abandon)
  const isGood = inverse ? delta < 0 : delta > 0;
  const isFlat  = delta === 0;
  const color   = isFlat ? '#64748b' : isGood ? '#10B981' : '#F43F5E';
  const bg      = isFlat ? 'rgba(100,116,139,0.1)' : isGood ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)';
  const Icon    = delta > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ color, backgroundColor: bg }}>
      {!isFlat && <Icon size={11} />}
      {delta > 0 ? '+' : ''}{delta}{unit}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — FILTER BAR
// ─────────────────────────────────────────────────────────────────────────────

function FilterBar({ period, setPeriod, agency, setAgency, service, setService, onApply }: {
  period: Period; setPeriod: (p: Period) => void;
  agency: string; setAgency: (a: string) => void;
  service: string; setService: (s: string) => void;
  onApply: () => void;
}) {
  const periods: { key: Period; label: string }[] = [
    { key: 'day',    label: 'Aujourd\'hui' },
    { key: 'week',   label: 'Cette semaine' },
    { key: 'month',  label: 'Ce mois' },
    { key: 'custom', label: 'Personnalisé' },
  ];

  const selectStyle: React.CSSProperties = {
    height: '38px', backgroundColor: '#0F1623', border: '1px solid #334155',
    borderRadius: '8px', padding: '0 32px 0 12px', fontSize: '12px', color: '#e2e8f0',
    fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer',
    appearance: 'none' as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl"
      style={{ backgroundColor: '#1A2235', border: '1px solid #334155' }}>

      {/* Icone filtre */}
      <div className="flex items-center gap-2 mr-1">
        <Filter size={14} color="#475569" />
        <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Filtres</span>
      </div>

      {/* Période — pill tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: '#0F1623', border: '1px solid #334155' }}>
        {periods.map(({ key, label }) => (
          <button key={key} onClick={() => setPeriod(key)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all"
            style={{ backgroundColor: period === key ? '#6C47FF' : 'transparent',
              color: period === key ? '#fff' : '#64748b' }}>
            {key === 'custom' && <CalendarDays size={11} />}
            {label}
          </button>
        ))}
      </div>

      {/* Agence */}
      <div style={{ position: 'relative' }}>
        <select value={agency} onChange={(e) => setAgency(e.target.value)} style={selectStyle}>
          {AGENCIES.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Service */}
      <div style={{ position: 'relative' }}>
        <select value={service} onChange={(e) => setService(e.target.value)} style={selectStyle}>
          {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Appliquer */}
      <button onClick={onApply}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ml-auto"
        style={{ backgroundColor: 'transparent', color: '#6C47FF', border: '1px solid #6C47FF',
          height: '38px' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(108,71,255,0.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
        Appliquer
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — KPI GRID
// ─────────────────────────────────────────────────────────────────────────────

function KpiGrid({ period }: { period: Period }) {
  const d = KPI_BY_PERIOD[period];

  const kpis = [
    {
      label: 'Temps Moyen de Traitement',
      value: d.tmt,
      delta: d.tmtDelta,
      deltaUnit: '%',
      deltaInverse: true,
      deltaLabel: 'vs période préc.',
      icon: Clock,
      color: '#10B981',
      bg: 'rgba(16,185,129,0.1)',
      mono: true,
    },
    {
      label: 'Volume total — tickets traités',
      value: d.volume.toLocaleString('fr-FR'),
      delta: d.volumeDelta,
      deltaUnit: '%',
      deltaInverse: false,
      deltaLabel: 'vs période préc.',
      icon: Ticket,
      color: '#6C47FF',
      bg: 'rgba(108,71,255,0.1)',
      mono: true,
    },
    {
      label: "Taux d'abandon (No-show)",
      value: `${d.abandon} %`,
      delta: d.abandonDelta,
      deltaUnit: '%',
      deltaInverse: true,
      deltaLabel: 'vs période préc.',
      icon: TrendingDown,
      color: d.abandon > 15 ? '#F43F5E' : '#F59E0B',
      bg: d.abandon > 15 ? 'rgba(244,63,94,0.1)' : 'rgba(245,158,11,0.1)',
      mono: false,
    },
    {
      label: 'NPS Global — Satisfaction',
      value: `${d.nps.toFixed(1)} / 5`,
      delta: d.npsDelta,
      deltaUnit: 'pt',
      deltaInverse: false,
      deltaLabel: 'vs période préc.',
      icon: Star,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.1)',
      mono: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map((k) => {
        const Icon = k.icon;
        return (
          <Widget key={k.label} style={{ padding: '20px' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: k.bg }}>
                <Icon size={18} color={k.color} strokeWidth={1.75} />
              </div>
              <DeltaBadge delta={k.delta} unit={k.deltaUnit} inverse={k.deltaInverse} />
            </div>
            <p className="font-bold" style={{
              fontSize: '32px', color: k.color, lineHeight: 1, marginBottom: '6px',
              fontFamily: k.mono ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
            }}>
              {k.value}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>{k.label}</p>
            <p style={{ fontSize: '10px', color: '#334155', marginTop: '4px' }}>{k.deltaLabel}</p>
          </Widget>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3A — AFFLUENCE CHART
// ─────────────────────────────────────────────────────────────────────────────

function AffluenceChart({ period }: { period: Period }) {
  const data = AFFLUENCE_BY_PERIOD[period];
  const periodLabel: Record<Period, string> = {
    day: 'aujourd\'hui vs moy. 7 jours',
    week: 'cette semaine vs semaine préc.',
    month: 'ce mois vs mois préc.',
    custom: 'période sélectionnée vs référence',
  };

  return (
    <Card>
      <SectionHeader title={`Courbe d'affluence — ${periodLabel[period]}`}
        action={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span style={{ width: '10px', height: '2px', backgroundColor: '#6C47FF', display: 'inline-block', borderRadius: '1px' }} />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Période</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ width: '10px', height: '2px', backgroundColor: '#334155', display: 'inline-block', borderRadius: '1px', borderTop: '1px dashed #475569' }} />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Référence</span>
            </div>
          </div>
        } />
      <div style={{ padding: '16px 8px 8px' }}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="h" tick={{ fontSize: 11, fill: '#475569', fontFamily: 'Inter, sans-serif' }}
              axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#475569', fontFamily: 'Inter, sans-serif' }}
              axisLine={false} tickLine={false} />
            <RechartsTooltip content={<ChartTooltip />} />
            {period === 'day' && (
              <>
                <ReferenceLine x="10h" stroke="#6C47FF" strokeDasharray="4 4" strokeOpacity={0.4}
                  label={{ value: 'Pic matin', fill: '#6C47FF', fontSize: 10, dy: -6 }} />
                <ReferenceLine x="14h" stroke="#F59E0B" strokeDasharray="4 4" strokeOpacity={0.4}
                  label={{ value: 'Pic après-midi', fill: '#F59E0B', fontSize: 10, dy: -6 }} />
              </>
            )}
            <Line type="monotone" dataKey="tickets" name="Période" stroke="#6C47FF" strokeWidth={2.5}
              dot={false} activeDot={{ r: 5, fill: '#6C47FF' }} />
            <Line type="monotone" dataKey="avg" name="Référence" stroke="#334155" strokeWidth={1.5}
              strokeDasharray="5 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3B — TMT PAR SERVICE (Bar chart)
// ─────────────────────────────────────────────────────────────────────────────

function TmtByServiceChart() {
  return (
    <Card>
      <SectionHeader title="TMT par service — Standard vs Prioritaire"
        action={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#6C47FF', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Standard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#06B6D4', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Prioritaire</span>
            </div>
          </div>
        } />
      <div style={{ padding: '16px 8px 8px' }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={TMT_BY_SERVICE} margin={{ top: 8, right: 16, bottom: 0, left: -10 }}
            barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="service" tick={{ fontSize: 10, fill: '#475569', fontFamily: 'Inter, sans-serif' }}
              axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `${Math.floor(v / 60)}m`}
              tick={{ fontSize: 11, fill: '#475569', fontFamily: 'Inter, sans-serif' }}
              axisLine={false} tickLine={false} />
            <RechartsTooltip content={<ChartTooltip />} />
            <Bar dataKey="standard" name="Standard" fill="#6C47FF" radius={[4, 4, 0, 0]}
              fillOpacity={0.85} />
            <Bar dataKey="prioritaire" name="Prioritaire" fill="#06B6D4" radius={[4, 4, 0, 0]}
              fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — NPS REVIEWS
// ─────────────────────────────────────────────────────────────────────────────

function NpsReviews() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? NPS_REVIEWS : NPS_REVIEWS.slice(0, 5);

  const avgNps = NPS_REVIEWS.reduce((s, r) => s + r.rating, 0) / NPS_REVIEWS.length;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: NPS_REVIEWS.filter((r) => r.rating === star).length,
    pct: Math.round((NPS_REVIEWS.filter((r) => r.rating === star).length / NPS_REVIEWS.length) * 100),
  }));

  return (
    <Card>
      <SectionHeader title="Évaluations clients — NPS"
        action={
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '18px', fontWeight: 700, color: '#F59E0B' }}>
              {avgNps.toFixed(1)}
            </span>
            <span style={{ fontSize: '12px', color: '#475569' }}>/ 5 · {NPS_REVIEWS.length} avis</span>
          </div>
        } />

      {/* Distribution */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #334155' }}>
        <div className="space-y-2">
          {distribution.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 shrink-0" style={{ width: '36px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{star}</span>
                <span style={{ fontSize: '10px', color: '#F59E0B' }}>★</span>
              </div>
              <div style={{ flex: 1, height: '6px', backgroundColor: '#0A0E1A', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '3px', transition: 'width 0.6s ease',
                  width: `${pct}%`,
                  backgroundColor: star >= 4 ? '#10B981' : star === 3 ? '#F59E0B' : '#F43F5E',
                }} />
              </div>
              <div style={{ width: '52px', textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                  {count} ({pct}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des avis */}
      <div className="divide-y" style={{ borderColor: '#1e293b' }}>
        {visible.map((review) => {
          const sentiment = sentimentOf(review.rating);
          const cfg = SENTIMENT_CFG[sentiment];
          return (
            <div key={review.id} className="px-5 py-4 flex items-start gap-4 transition-colors"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.015)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}>

              {/* Rating badge */}
              <div className="shrink-0 flex flex-col items-center gap-1"
                style={{ width: '48px', padding: '8px 6px', borderRadius: '8px',
                  backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: cfg.color,
                  fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                  {review.rating}
                </span>
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} style={{ fontSize: '7px', color: s <= review.rating ? '#F59E0B' : '#334155' }}>★</span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{review.client}</p>
                  <span style={{ fontSize: '10px', color: '#334155', fontFamily: 'JetBrains Mono, monospace',
                    flexShrink: 0 }}>{review.id}</span>
                </div>
                <p style={{ fontSize: '11px', color: '#475569', marginBottom: review.comment ? '6px' : 0 }}>
                  {review.service} · {review.time}
                </p>
                {review.comment && (
                  <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.5,
                    padding: '6px 10px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)',
                    borderLeft: `2px solid ${cfg.color}` }}>
                    "{review.comment}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {NPS_REVIEWS.length > 5 && (
        <div className="px-5 py-3" style={{ borderTop: '1px solid #334155' }}>
          <button onClick={() => setShowAll((v) => !v)}
            style={{ fontSize: '12px', color: '#6C47FF', background: 'none', border: 'none',
              cursor: 'pointer', fontWeight: 500 }}>
            {showAll ? '↑ Réduire' : `↓ Voir tous les ${NPS_REVIEWS.length} avis`}
          </button>
        </div>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — EXPORT PANEL
// ─────────────────────────────────────────────────────────────────────────────

function ExportPanel({ period }: { period: Period }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [done, setDone]       = useState<string | null>(null);

  const periodLabel: Record<Period, string> = {
    day: "aujourd'hui", week: 'cette semaine', month: 'ce mois', custom: 'la période',
  };

  const handleExport = async (type: string) => {
    setLoading(type);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(null);
    setDone(type);
    setTimeout(() => setDone(null), 2500);
  };

  const formats = [
    { key: 'pdf',   label: 'PDF',   icon: '📄', desc: 'Rapport consolidé imprimable' },
    { key: 'excel', label: 'Excel', icon: '📊', desc: 'Données tabulaires .xlsx'     },
    { key: 'csv',   label: 'CSV',   icon: '📋', desc: 'Export brut machine-readable' },
  ];

  return (
    <Card>
      <SectionHeader title="Centre d'exportation" />
      <div className="p-5">
        <p style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
          Générer le rapport consolidé pour{' '}
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{periodLabel[period]}</span>
        </p>
        <div className="flex flex-col gap-3">
          {formats.map(({ key, label, icon, desc }) => {
            const isLoading = loading === key;
            const isDone    = done === key;
            return (
              <button key={key} onClick={() => handleExport(key)} disabled={!!loading}
                className="flex items-center gap-4 px-4 py-3 rounded-xl w-full text-left transition-all"
                style={{
                  backgroundColor: isDone ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isDone ? 'rgba(16,185,129,0.3)' : '#334155'}`,
                  cursor: loading ? 'wait' : 'pointer',
                }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(108,71,255,0.06)'; }}
                onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = isDone ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)'; }}>

                <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>{icon}</span>
                <div className="flex-1">
                  <p style={{ fontSize: '13px', fontWeight: 600, color: isDone ? '#10B981' : '#e2e8f0' }}>
                    {isDone ? `✓ ${label} téléchargé` : label}
                  </p>
                  <p style={{ fontSize: '11px', color: '#475569' }}>{desc}</p>
                </div>
                {isLoading ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C47FF" strokeWidth="2.5" strokeLinecap="round"
                    style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                ) : (
                  <Download size={15} color={isDone ? '#10B981' : '#475569'} style={{ flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — LOGS TABLE
// ─────────────────────────────────────────────────────────────────────────────

const TICKET_LOGS = [
  { id: 'T-247', client: 'Amina Niyonkuru',     service: 'Retrait caisse',   agent: 'Rodrigue K.', tmt: 612,  status: 'done',   priority: 'standard' },
  { id: 'T-246', client: 'Jean-Pierre Habimana', service: 'Ouverture compte', agent: 'Isabelle M.', tmt: 1240, status: 'done',   priority: 'vip'      },
  { id: 'T-245', client: null,                   service: 'Renseignements',   agent: 'Chantal N.',  tmt: 0,    status: 'noshow', priority: 'standard' },
  { id: 'T-244', client: 'Marcel Bizimana',      service: 'Virement',         agent: 'Eric B.',     tmt: 780,  status: 'done',   priority: 'urgent'   },
  { id: 'T-243', client: 'Solange Ndayishimiye', service: 'Prêts & Crédit',   agent: 'Diane U.',    tmt: 1560, status: 'done',   priority: 'priority' },
  { id: 'T-242', client: 'Patrick Karenzo',      service: 'Retrait caisse',   agent: 'Patrick N.',  tmt: 480,  status: 'done',   priority: 'standard' },
  { id: 'T-241', client: null,                   service: 'Caisse générale',  agent: 'Marie K.',    tmt: 0,    status: 'noshow', priority: 'standard' },
];

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  done:   { label: 'Traité',  color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  noshow: { label: 'Absent',  color: '#F43F5E', bg: 'rgba(244,63,94,0.12)'  },
};

const PRIORITY_COLOR: Record<string, string> = {
  standard: '#F59E0B', priority: '#10B981', urgent: '#F43F5E', vip: '#06B6D4',
};

function TicketLogsTable() {
  return (
    <Card>
      <SectionHeader title="Journal des tickets — aujourd'hui"
        action={<span style={{ fontSize: '11px', color: '#475569' }}>{TICKET_LOGS.length} dernières entrées</span>} />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', backgroundColor: '#0F1623' }}>
              {['Ticket', 'Client', 'Service', 'Agent', 'TMT', 'Priorité', 'Statut'].map((h) => (
                <th key={h} className="text-left px-5 py-3"
                  style={{ fontSize: '10px', fontWeight: 600, color: '#475569',
                    textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TICKET_LOGS.map((t, i) => {
              const st = STATUS_LABEL[t.status];
              const isZebra = i % 2 === 1;
              return (
                <tr key={t.id} style={{ borderBottom: '1px solid #1e293b',
                  backgroundColor: isZebra ? 'rgba(255,255,255,0.018)' : 'transparent' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(108,71,255,0.04)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = isZebra ? 'rgba(255,255,255,0.018)' : 'transparent'; }}>
                  <td className="px-5 py-3">
                    <span style={{ color: '#6C47FF', fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '13px', fontWeight: 600 }}>{t.id}</span>
                  </td>
                  <td className="px-5 py-3" style={{ fontSize: '13px', color: t.client ? '#e2e8f0' : '#334155',
                    fontStyle: t.client ? 'normal' : 'italic' }}>
                    {t.client ?? 'Anonyme'}
                  </td>
                  <td className="px-5 py-3" style={{ fontSize: '12px', color: '#64748b' }}>{t.service}</td>
                  <td className="px-5 py-3" style={{ fontSize: '12px', color: '#94a3b8' }}>{t.agent}</td>
                  <td className="px-5 py-3">
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
                      color: t.tmt > 0 ? (t.tmt > 900 ? '#F43F5E' : '#64748b') : '#334155' }}>
                      {t.tmt > 0 ? fmtSeconds(t.tmt) : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%',
                      backgroundColor: PRIORITY_COLOR[t.priority], display: 'inline-block',
                      marginRight: '5px' }} />
                    <span style={{ fontSize: '11px', color: PRIORITY_COLOR[t.priority],
                      textTransform: 'capitalize' }}>{t.priority}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
                      style={{ color: st.color, backgroundColor: st.bg }}>
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod]   = useState<Period>('day');
  const [agency, setAgency]   = useState(AGENCIES[0]);
  const [service, setService] = useState(SERVICES[0]);
  const [applied, setApplied] = useState<Period>('day');

  const handleApply = () => setApplied(period);

  const periodTitle: Record<Period, string> = {
    day:    "Aujourd'hui",
    week:   'Cette semaine',
    month:  'Ce mois',
    custom: 'Période personnalisée',
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', minHeight: '100%' }}>

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
            Analytics & Rapports
          </h1>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
            {periodTitle[applied]} · {agency} · {service}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <TrendingUp size={13} color="#10B981" />
          <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 500 }}>
            Données actionnables — Directeur Thierry
          </span>
        </div>
      </div>

      {/* ── Zone 1 : Filtres ── */}
      <div className="mb-6">
        <FilterBar
          period={period} setPeriod={setPeriod}
          agency={agency} setAgency={setAgency}
          service={service} setService={setService}
          onApply={handleApply} />
      </div>

      {/* ── Zone 2 : KPI Grid ── */}
      <div className="mb-6">
        <KpiGrid period={applied} />
      </div>

      {/* ── Zone 3 : Graphiques ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <AffluenceChart period={applied} />
        <TmtByServiceChart />
      </div>

      {/* ── Zone 4 : NPS + Export (side by side) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <NpsReviews />
        </div>
        <div>
          <ExportPanel period={applied} />
        </div>
      </div>

      {/* ── Zone 5 : Journal des tickets ── */}
      <TicketLogsTable />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
