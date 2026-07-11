'use client';

import { useState, useRef, type ReactNode } from 'react';
import {
  Building2, ListOrdered, Tv2, CreditCard,
  Upload, MapPin, Clock, Plus, Trash2, AlertTriangle,
  Volume2, Globe, CheckCircle, Lock, ChevronRight,
  Palette, Save,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Tab     = 'branding' | 'services' | 'tv' | 'billing';
type Role    = 'admin_org' | 'admin_agency' | 'supervisor';
type SaveState = 'idle' | 'saving' | 'done';

interface Service {
  id: string;
  name: string;
  code: string;
  alertThreshold: number; // minutes
  priorityAuto: boolean;
  color: string;
  active: boolean;
}

interface DaySchedule { open: boolean; from: string; to: string }

// ─────────────────────────────────────────────────────────────────────────────
// STATIC CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const CURRENT_ROLE: Role = 'admin_org'; // Simule le rôle connecté

const TAB_ACCESS: Record<Tab, Role[]> = {
  branding:  ['admin_org', 'admin_agency', 'supervisor'],
  services:  ['admin_org', 'admin_agency', 'supervisor'],
  tv:        ['admin_org', 'admin_agency', 'supervisor'],
  billing:   ['admin_org'],
};

const CAN_EDIT: Record<Tab, Role[]> = {
  branding:  ['admin_org'],
  services:  ['admin_org', 'admin_agency'],
  tv:        ['admin_org', 'admin_agency'],
  billing:   ['admin_org'],
};

const TABS: { key: Tab; label: string; icon: typeof Building2; desc: string }[] = [
  { key: 'branding',  label: 'Profil & Branding',     icon: Building2,   desc: 'Identité visuelle et coordonnées' },
  { key: 'services',  label: 'Gestion des Services',  icon: ListOrdered, desc: 'Files d\'attente et règles métier' },
  { key: 'tv',        label: 'Affichage TV',           icon: Tv2,         desc: 'Message ticker et synthèse vocale' },
  { key: 'billing',   label: 'Facturation & Plan',    icon: CreditCard,  desc: 'Abonnement et Mobile Money' },
];

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const TV_COLORS = ['#6C47FF', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#0EA5E9'];

const PLAN_FEATURES: Record<string, string[]> = {
  Starter:    ['1 agence', 'Jusqu\'à 5 guichets', 'Dashboard basique', 'Support e-mail'],
  Business:   ['3 agences', 'Guichets illimités', 'Analytics avancés', 'Mobile Money', 'Support prioritaire'],
  Enterprise: ['Agences illimitées', 'API dédiée', 'SLA 99.9%', 'Support 24/7', 'Onboarding dédié'],
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function Card({ children, style = {} }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: '#1A2235', borderRadius: '12px', border: '1px solid #334155', ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #334155' }}>
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{title}</h3>
        {subtitle && <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
      {children} {required && <span style={{ color: '#F43F5E' }}>*</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder, disabled, type = 'text' }: {
  value: string; onChange?: (v: string) => void;
  placeholder?: string; disabled?: boolean; type?: string;
}) {
  return (
    <input type={type} value={value} placeholder={placeholder} disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      style={{ width: '100%', height: '40px', backgroundColor: disabled ? '#0A0E1A' : '#0F1623',
        border: '1px solid #334155', borderRadius: '8px', padding: '0 12px',
        fontSize: '13px', color: disabled ? '#475569' : '#e2e8f0',
        fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' as const,
        cursor: disabled ? 'not-allowed' : 'text', transition: 'border-color 0.15s, box-shadow 0.15s' }}
      onFocus={(e) => { if (!disabled) { e.currentTarget.style.borderColor = '#6C47FF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,71,255,0.15)'; } }}
      onBlur={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = 'none'; }} />
  );
}

function Toggle({ checked, onChange, disabled }: {
  checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <button role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      style={{ width: '40px', height: '22px', borderRadius: '11px', padding: '3px',
        backgroundColor: checked ? '#6C47FF' : '#334155',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', transition: 'background-color 0.2s',
        boxShadow: checked ? '0 0 8px rgba(108,71,255,0.3)' : 'none',
        opacity: disabled ? 0.5 : 1, flexShrink: 0 }}>
      <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff',
        transform: checked ? 'translateX(18px)' : 'translateX(0)',
        transition: 'transform 0.2s', display: 'block' }} />
    </button>
  );
}

// Toast Emerald
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: '32px', right: '32px', zIndex: 100,
      display: 'flex', alignItems: 'center', gap: '10px',
      backgroundColor: '#1A2235', border: '1px solid rgba(16,185,129,0.4)',
      borderRadius: '12px', padding: '14px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.2)',
      transform: visible ? 'translateY(0)' : 'translateY(120%)',
      opacity: visible ? 1 : 0, transition: 'transform 0.3s ease, opacity 0.3s ease',
    }}>
      <CheckCircle size={18} color="#10B981" />
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{message}</span>
    </div>
  );
}

// Bouton Sauvegarde
function SaveButton({ state, onClick, disabled }: {
  state: SaveState; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled || state === 'saving'}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
      style={{
        backgroundColor: state === 'done' ? '#10B981' : disabled ? '#1e293b' : '#6C47FF',
        color: disabled ? '#334155' : '#fff',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: state === 'done' ? '0 0 16px rgba(16,185,129,0.3)' : disabled ? 'none' : '0 0 16px rgba(108,71,255,0.2)',
      }}>
      {state === 'saving' ? (
        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ animation: 'spin 0.8s linear infinite' }}><path d="M12 2a10 10 0 0 1 10 10"/></svg>Sauvegarde…</>
      ) : state === 'done' ? (
        <><CheckCircle size={14} />Sauvegardé</>
      ) : (
        <><Save size={14} />Sauvegarder</>
      )}
    </button>
  );
}

// Readonly badge
function ReadonlyBadge() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
      style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
      <Lock size={12} color="#F59E0B" />
      <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 500 }}>Lecture seule</span>
    </div>
  );
}

// Hook sauvegarde avec toast
function useSave(onToast: (msg: string) => void) {
  const [state, setState] = useState<SaveState>('idle');
  const trigger = async (msg: string) => {
    setState('saving');
    await new Promise((r) => setTimeout(r, 1000));
    setState('done');
    onToast(msg);
    setTimeout(() => setState('idle'), 2000);
  };
  return { state, trigger };
}

// ─────────────────────────────────────────────────────────────────────────────
// ONGLET A — PROFIL & BRANDING
// ─────────────────────────────────────────────────────────────────────────────

function TabBranding({ canEdit, onToast }: { canEdit: boolean; onToast: (m: string) => void }) {
  const [name, setName]       = useState('Banque de la République du Burundi');
  const [address, setAddress] = useState('Avenue de la Cathédrale 6, Bujumbura');
  const [phone, setPhone]     = useState('+257 22 20 36 00');
  const [email, setEmail]     = useState('contact@brb.bi');
  const [primaryColor, setPrimaryColor] = useState('#6C47FF');
  const [accentColor, setAccentColor]   = useState('#00D4FF');
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({
    Lundi:   { open: true,  from: '07:30', to: '16:00' },
    Mardi:   { open: true,  from: '07:30', to: '16:00' },
    Mercredi:{ open: true,  from: '07:30', to: '16:00' },
    Jeudi:   { open: true,  from: '07:30', to: '16:00' },
    Vendredi:{ open: true,  from: '07:30', to: '15:30' },
    Samedi:  { open: true,  from: '08:00', to: '12:00' },
    Dimanche:{ open: false, from: '—',     to: '—'     },
  });

  const fileRef = useRef<HTMLInputElement>(null);
  const [logoName, setLogoName] = useState<string | null>(null);
  const { state, trigger } = useSave(onToast);

  return (
    <div className="space-y-6">

      {/* ── Identité visuelle ── */}
      <Card>
        <CardHeader title="Identité visuelle" subtitle="Logo et palette de couleurs de l'institution" />
        <div className="p-6 space-y-6">

          {/* Logo upload */}
          <div>
            <Label>Logo de l'institution</Label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#0F1623', border: '2px dashed #334155' }}>
                {logoName ? (
                  <span style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', padding: '4px' }}>{logoName}</span>
                ) : (
                  <Building2 size={28} color="#334155" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => setLogoName(e.target.files?.[0]?.name ?? null)} />
                <button onClick={() => canEdit && fileRef.current?.click()} disabled={!canEdit}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ backgroundColor: canEdit ? 'rgba(108,71,255,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${canEdit ? 'rgba(108,71,255,0.3)' : '#334155'}`,
                    color: canEdit ? '#6C47FF' : '#334155', cursor: canEdit ? 'pointer' : 'not-allowed' }}>
                  <Upload size={14} /> Télécharger le logo
                </button>
                <p style={{ fontSize: '11px', color: '#334155' }}>PNG ou SVG · Fond transparent · Max 2 Mo</p>
              </div>
            </div>
          </div>

          {/* Palette TV */}
          <div>
            <Label>Palette TV — personnalisation de l'affichage</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Couleur primaire', value: primaryColor, set: setPrimaryColor },
                { label: 'Couleur accent',   value: accentColor,  set: setAccentColor  },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{label}</p>
                  <div className="flex items-center gap-3">
                    {/* Swatch selector */}
                    <div className="flex gap-2 flex-wrap">
                      {TV_COLORS.map((c) => (
                        <button key={c} onClick={() => canEdit && set(c)} disabled={!canEdit}
                          style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: c,
                            border: value === c ? '2px solid #fff' : '2px solid transparent',
                            cursor: canEdit ? 'pointer' : 'not-allowed',
                            boxShadow: value === c ? `0 0 8px ${c}88` : 'none',
                            transition: 'all 0.15s' }} />
                      ))}
                    </div>
                    {/* Custom hex */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: '#0F1623', border: '1px solid #334155' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: value, flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Coordonnées ── */}
      <Card>
        <CardHeader title="Coordonnées de l'institution" />
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: "Nom de l'agence", val: name, set: setName, required: true },
            { label: 'Adresse GPS', val: address, set: setAddress, icon: MapPin },
            { label: 'Téléphone', val: phone, set: setPhone, type: 'tel' },
            { label: 'Email institutionnel', val: email, set: setEmail, type: 'email' },
          ].map(({ label, val, set, required, type }) => (
            <div key={label}>
              <Label required={required}>{label}</Label>
              <Input value={val} onChange={canEdit ? set : undefined} disabled={!canEdit} type={type} />
            </div>
          ))}
        </div>
      </Card>

      {/* ── Horaires d'ouverture ── */}
      <Card>
        <CardHeader title="Horaires d'ouverture"
          subtitle="Définit les plages de prise de ticket sur l'application mobile" />
        <div className="p-6">
          <div className="space-y-3">
            {DAYS.map((day) => {
              const s = schedule[day];
              return (
                <div key={day} className="flex items-center gap-4 py-2 rounded-lg px-3"
                  style={{ backgroundColor: s.open ? 'rgba(108,71,255,0.04)' : 'transparent',
                    border: `1px solid ${s.open ? 'rgba(108,71,255,0.12)' : '#1e293b'}` }}>
                  <Toggle checked={s.open} disabled={!canEdit}
                    onChange={(v) => canEdit && setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], open: v } }))} />
                  <span style={{ width: '80px', fontSize: '13px', fontWeight: 500,
                    color: s.open ? '#e2e8f0' : '#475569', flexShrink: 0 }}>{day}</span>
                  {s.open ? (
                    <div className="flex items-center gap-2">
                      <input type="time" value={s.from} disabled={!canEdit}
                        onChange={(e) => canEdit && setSchedule((p) => ({ ...p, [day]: { ...p[day], from: e.target.value } }))}
                        style={{ backgroundColor: '#0F1623', border: '1px solid #334155', borderRadius: '6px',
                          padding: '4px 8px', fontSize: '12px', color: '#e2e8f0', outline: 'none',
                          cursor: canEdit ? 'text' : 'not-allowed', fontFamily: 'JetBrains Mono, monospace' }} />
                      <span style={{ color: '#334155', fontSize: '12px' }}>→</span>
                      <input type="time" value={s.to} disabled={!canEdit}
                        onChange={(e) => canEdit && setSchedule((p) => ({ ...p, [day]: { ...p[day], to: e.target.value } }))}
                        style={{ backgroundColor: '#0F1623', border: '1px solid #334155', borderRadius: '6px',
                          padding: '4px 8px', fontSize: '12px', color: '#e2e8f0', outline: 'none',
                          cursor: canEdit ? 'text' : 'not-allowed', fontFamily: 'JetBrains Mono, monospace' }} />
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#334155', fontStyle: 'italic' }}>Fermé</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Footer actions */}
      <div className="flex items-center justify-between">
        {!canEdit && <ReadonlyBadge />}
        <div className="ml-auto">
          <SaveButton state={state} onClick={() => trigger('Profil & branding sauvegardé')} disabled={!canEdit} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ONGLET B — GESTION DES SERVICES
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_SERVICES: Service[] = [
  { id: 's1', name: 'Retrait caisse',    code: 'RET', alertThreshold: 20, priorityAuto: false, color: '#06B6D4', active: true  },
  { id: 's2', name: 'Ouverture compte',  code: 'OUV', alertThreshold: 30, priorityAuto: false, color: '#6C47FF', active: true  },
  { id: 's3', name: 'Virement bancaire', code: 'VIR', alertThreshold: 25, priorityAuto: false, color: '#10B981', active: true  },
  { id: 's4', name: 'Renseignements',    code: 'REN', alertThreshold: 15, priorityAuto: false, color: '#F59E0B', active: true  },
  { id: 's5', name: 'Prêts & Crédit',   code: 'PRE', alertThreshold: 40, priorityAuto: true,  color: '#8B5CF6', active: true  },
  { id: 's6', name: 'VIP Conseil',       code: 'VIP', alertThreshold: 10, priorityAuto: true,  color: '#F43F5E', active: true  },
  { id: 's7', name: 'Caisse générale',   code: 'CAI', alertThreshold: 20, priorityAuto: false, color: '#0EA5E9', active: false },
];

const PRIORITY_TRIGGERS = [
  { key: 'pregnant',   label: 'Femme enceinte',      icon: '🤱' },
  { key: 'elderly',    label: 'Personne âgée (+65)', icon: '👴' },
  { key: 'disabled',   label: 'Personne handicapée', icon: '♿' },
  { key: 'vip_card',   label: 'Carte VIP présentée', icon: '💳' },
];

function TabServices({ canEdit, onToast }: { canEdit: boolean; onToast: (m: string) => void }) {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [triggers, setTriggers] = useState<Record<string, boolean>>({
    pregnant: true, elderly: true, disabled: true, vip_card: false,
  });
  const [newName, setNewName]   = useState('');
  const [newCode, setNewCode]   = useState('');
  const { state, trigger }      = useSave(onToast);

  const toggleService = (id: string, field: keyof Service, val: boolean) => {
    if (!canEdit) return;
    setServices((p) => p.map((s) => s.id === id ? { ...s, [field]: val } : s));
  };

  const updateThreshold = (id: string, val: number) => {
    if (!canEdit) return;
    setServices((p) => p.map((s) => s.id === id ? { ...s, alertThreshold: val } : s));
  };

  const addService = () => {
    if (!newName.trim() || !newCode.trim()) return;
    const colors = ['#6C47FF','#06B6D4','#10B981','#F59E0B','#8B5CF6','#F43F5E'];
    setServices((p) => [...p, {
      id: `s${Date.now()}`, name: newName.trim(), code: newCode.trim().toUpperCase().slice(0, 3),
      alertThreshold: 20, priorityAuto: false, color: colors[p.length % colors.length], active: true,
    }]);
    setNewName(''); setNewCode('');
  };

  const removeService = (id: string) => {
    if (!canEdit) return;
    setServices((p) => p.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">

      {/* ── Liste des files ── */}
      <Card>
        <CardHeader title="Files d'attente actives"
          subtitle={`${services.filter((s) => s.active).length} services actifs · ${services.length} au total`} />
        <div className="p-6">
          <div className="space-y-2">
            {services.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all"
                style={{ backgroundColor: s.active ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0)',
                  border: `1px solid ${s.active ? '#334155' : '#1e293b'}`,
                  opacity: s.active ? 1 : 0.5 }}>

                {/* Couleur dot */}
                <div style={{ width: '10px', height: '10px', borderRadius: '50%',
                  backgroundColor: s.color, flexShrink: 0 }} />

                {/* Nom + code */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{s.name}</p>
                  <p style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>{s.code}</p>
                </div>

                {/* Seuil alerte */}
                <div className="flex items-center gap-2 shrink-0">
                  <AlertTriangle size={12} color="#F59E0B" />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Alerte après</span>
                  <input type="number" value={s.alertThreshold} min={5} max={120} disabled={!canEdit}
                    onChange={(e) => updateThreshold(s.id, Number(e.target.value))}
                    style={{ width: '52px', height: '28px', backgroundColor: '#0F1623', border: '1px solid #334155',
                      borderRadius: '6px', padding: '0 8px', fontSize: '12px', color: '#e2e8f0',
                      fontFamily: 'JetBrains Mono, monospace', outline: 'none', textAlign: 'center',
                      cursor: canEdit ? 'text' : 'not-allowed' }} />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>min</span>
                </div>

                {/* Priorité auto */}
                <div className="flex items-center gap-2 shrink-0">
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Priorité auto</span>
                  <Toggle checked={s.priorityAuto} disabled={!canEdit}
                    onChange={(v) => toggleService(s.id, 'priorityAuto', v)} />
                </div>

                {/* Actif */}
                <Toggle checked={s.active} disabled={!canEdit}
                  onChange={(v) => toggleService(s.id, 'active', v)} />

                {/* Supprimer */}
                {canEdit && (
                  <button onClick={() => removeService(s.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                    style={{ color: '#334155', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#F43F5E'; e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Ajouter un service */}
          {canEdit && (
            <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid #1e293b' }}>
              <input value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="Nouveau service…"
                style={{ flex: 1, height: '38px', backgroundColor: '#0F1623', border: '1px solid #334155',
                  borderRadius: '8px', padding: '0 12px', fontSize: '13px', color: '#e2e8f0',
                  fontFamily: 'Inter, sans-serif', outline: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#6C47FF'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#334155'; }} />
              <input value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="COD"
                style={{ width: '64px', height: '38px', backgroundColor: '#0F1623', border: '1px solid #334155',
                  borderRadius: '8px', padding: '0 10px', fontSize: '13px', color: '#e2e8f0',
                  fontFamily: 'JetBrains Mono, monospace', outline: 'none', textAlign: 'center' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#6C47FF'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#334155'; }} />
              <button onClick={addService} disabled={!newName.trim() || !newCode.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ backgroundColor: newName && newCode ? 'rgba(108,71,255,0.15)' : 'rgba(255,255,255,0.03)',
                  color: newName && newCode ? '#6C47FF' : '#334155', border: '1px solid currentcolor',
                  cursor: newName && newCode ? 'pointer' : 'not-allowed' }}>
                <Plus size={14} /> Ajouter
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* ── Déclencheurs de priorité automatique ── */}
      <Card>
        <CardHeader title="Déclencheurs de priorité automatique"
          subtitle="Le ticket est basculé en file Prioritaire si l'usager coche cette option sur l'app mobile" />
        <div className="p-6 space-y-3">
          {PRIORITY_TRIGGERS.map(({ key, label, icon }) => (
            <div key={key} className="flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer"
              style={{ backgroundColor: triggers[key] ? 'rgba(108,71,255,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${triggers[key] ? 'rgba(108,71,255,0.2)' : '#1e293b'}` }}
              onClick={() => canEdit && setTriggers((p) => ({ ...p, [key]: !p[key] }))}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '20px' }}>{icon}</span>
                <p style={{ fontSize: '13px', fontWeight: 500, color: triggers[key] ? '#e2e8f0' : '#64748b' }}>{label}</p>
              </div>
              <Toggle checked={triggers[key]} disabled={!canEdit}
                onChange={(v) => setTriggers((p) => ({ ...p, [key]: v }))} />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        {!canEdit && <ReadonlyBadge />}
        <div className="ml-auto">
          <SaveButton state={state} onClick={() => trigger('Configuration des services sauvegardée')} disabled={!canEdit} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ONGLET C — AFFICHAGE TV
// ─────────────────────────────────────────────────────────────────────────────

function TabTv({ canEdit, onToast }: { canEdit: boolean; onToast: (m: string) => void }) {
  const [ticker, setTicker]     = useState('Bienvenue à la Banque de la République du Burundi — Merci de votre patience.');
  const [ttsEnabled, setTts]    = useState(true);
  const [ttsLangs, setTtsLangs] = useState({ fr: true, rn: true, en: false, sw: false });
  const [tickerSpeed, setTickerSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [showTicketNb, setShowTicketNb] = useState(true);
  const [showWaitTime, setShowWaitTime] = useState(true);
  const [showAgentName, setShowAgentName] = useState(false);
  const { state, trigger } = useSave(onToast);

  const langs = [
    { key: 'fr' as const, label: 'Français',  flag: '🇫🇷' },
    { key: 'rn' as const, label: 'Kirundi',   flag: '🇧🇮' },
    { key: 'en' as const, label: 'Anglais',   flag: '🇬🇧' },
    { key: 'sw' as const, label: 'Swahili',   flag: '🇹🇿' },
  ];

  return (
    <div className="space-y-6">

      {/* ── Message ticker ── */}
      <Card>
        <CardHeader title="Message défilant (Ticker)"
          subtitle="Texte affiché en bas de l'écran TV en boucle" />
        <div className="p-6 space-y-5">
          <div>
            <Label>Contenu du message</Label>
            <textarea value={ticker} onChange={(e) => canEdit && setTicker(e.target.value)}
              disabled={!canEdit} rows={3}
              style={{ width: '100%', backgroundColor: '#0F1623', border: '1px solid #334155',
                borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#e2e8f0',
                fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical',
                boxSizing: 'border-box' as const, cursor: canEdit ? 'text' : 'not-allowed' }}
              onFocus={(e) => { if (canEdit) { e.currentTarget.style.borderColor = '#6C47FF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,71,255,0.15)'; } }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>

          {/* Vitesse défilement */}
          <div>
            <Label>Vitesse de défilement</Label>
            <div className="flex items-center gap-2">
              {(['slow', 'normal', 'fast'] as const).map((s) => (
                <button key={s} disabled={!canEdit} onClick={() => canEdit && setTickerSpeed(s)}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                  style={{ backgroundColor: tickerSpeed === s ? 'rgba(108,71,255,0.15)' : 'rgba(255,255,255,0.03)',
                    color: tickerSpeed === s ? '#6C47FF' : '#64748b',
                    border: `1px solid ${tickerSpeed === s ? 'rgba(108,71,255,0.3)' : '#334155'}`,
                    cursor: canEdit ? 'pointer' : 'not-allowed' }}>
                  {s === 'slow' ? 'Lent' : s === 'normal' ? 'Normal' : 'Rapide'}
                </button>
              ))}
            </div>
          </div>

          {/* Prévisualisation ticker */}
          <div>
            <p style={{ fontSize: '11px', color: '#475569', marginBottom: '8px' }}>Prévisualisation</p>
            <div style={{ backgroundColor: '#0A0E1A', borderRadius: '8px', border: '1px solid #1e293b',
              padding: '10px 16px', overflow: 'hidden' }}>
              <div style={{ whiteSpace: 'nowrap', color: '#e2e8f0', fontSize: '13px',
                animation: `ticker-${tickerSpeed} ${tickerSpeed === 'slow' ? '20s' : tickerSpeed === 'fast' ? '8s' : '14s'} linear infinite` }}>
                📢 &nbsp;{ticker}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;📢 &nbsp;{ticker}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Synthèse vocale TTS ── */}
      <Card>
        <CardHeader title="Synthèse Vocale (TTS)"
          subtitle="Annonce sonore du numéro de ticket au guichet assigné" />
        <div className="p-6 space-y-5">

          {/* Activer TTS */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ backgroundColor: ttsEnabled ? 'rgba(108,71,255,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${ttsEnabled ? 'rgba(108,71,255,0.2)' : '#1e293b'}` }}>
            <div className="flex items-center gap-3">
              <Volume2 size={16} color={ttsEnabled ? '#6C47FF' : '#475569'} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: ttsEnabled ? '#e2e8f0' : '#64748b' }}>
                  Annonces sonores activées
                </p>
                <p style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>
                  Lecture automatique à chaque appel de ticket
                </p>
              </div>
            </div>
            <Toggle checked={ttsEnabled} disabled={!canEdit} onChange={(v) => canEdit && setTts(v)} />
          </div>

          {/* Langues TTS */}
          {ttsEnabled && (
            <div>
              <Label>Langues d'annonce</Label>
              <div className="grid grid-cols-2 gap-3">
                {langs.map(({ key, label, flag }) => (
                  <div key={key} onClick={() => canEdit && setTtsLangs((p) => ({ ...p, [key]: !p[key] }))}
                    className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all"
                    style={{ backgroundColor: ttsLangs[key] ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${ttsLangs[key] ? 'rgba(16,185,129,0.2)' : '#1e293b'}` }}>
                    <div className="flex items-center gap-2">
                      <span>{flag}</span>
                      <span style={{ fontSize: '13px', color: ttsLangs[key] ? '#e2e8f0' : '#64748b' }}>{label}</span>
                    </div>
                    <Toggle checked={ttsLangs[key]} disabled={!canEdit}
                      onChange={(v) => canEdit && setTtsLangs((p) => ({ ...p, [key]: v }))} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Informations affichées sur le TV ── */}
      <Card>
        <CardHeader title="Données affichées sur l'écran TV" />
        <div className="p-6 space-y-3">
          {[
            { label: 'Numéro de ticket',    sub: 'ex: T-047',          checked: showTicketNb,   set: setShowTicketNb  },
            { label: "Temps d'attente estimé", sub: 'ex: ~8 min',      checked: showWaitTime,   set: setShowWaitTime  },
            { label: "Nom de l'agent",      sub: 'ex: Isabelle M.',    checked: showAgentName,  set: setShowAgentName },
          ].map(({ label, sub, checked, set }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid #1e293b' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>{sub}</p>
              </div>
              <Toggle checked={checked} disabled={!canEdit} onChange={(v) => canEdit && set(v)} />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        {!canEdit && <ReadonlyBadge />}
        <div className="ml-auto">
          <SaveButton state={state} onClick={() => trigger('Configuration TV sauvegardée')} disabled={!canEdit} />
        </div>
      </div>

      <style>{`
        @keyframes ticker-slow   { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
        @keyframes ticker-normal { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
        @keyframes ticker-fast   { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ONGLET D — FACTURATION & PLAN
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_TRANSACTIONS = [
  { id: 'TXN-8841', client: 'Amina Niyonkuru',     amount: 2000,  method: 'Lumicash',  date: '11 Jul 2026 · 09:14', status: 'success' },
  { id: 'TXN-8840', client: 'Jean-Pierre Habimana', amount: 5000,  method: 'M-Pesa',    date: '11 Jul 2026 · 08:52', status: 'success' },
  { id: 'TXN-8839', client: 'Claudine Uwimana',     amount: 2000,  method: 'Lumicash',  date: '10 Jul 2026 · 16:31', status: 'failed'  },
  { id: 'TXN-8838', client: 'Marcel Bizimana',      amount: 2000,  method: 'Lumicash',  date: '10 Jul 2026 · 14:18', status: 'success' },
  { id: 'TXN-8837', client: 'Solange Ndayishimiye', amount: 5000,  method: 'M-Pesa',    date: '10 Jul 2026 · 11:05', status: 'success' },
];

const TX_STATUS = {
  success: { label: 'Succès',  color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  failed:  { label: 'Échoué', color: '#F43F5E', bg: 'rgba(244,63,94,0.12)'  },
};

function TabBilling({ canEdit, onToast }: { canEdit: boolean; onToast: (m: string) => void }) {
  const currentPlan = 'Business';
  const renewal     = '1 Août 2026';
  const { state, trigger } = useSave(onToast);

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Lock size={28} color="#F59E0B" />
        </div>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0' }}>Accès restreint</p>
        <p style={{ fontSize: '13px', color: '#475569', textAlign: 'center', maxWidth: '320px' }}>
          Cette section est réservée au rôle <span style={{ color: '#F59E0B', fontWeight: 600 }}>Admin Organisation</span>.
          Contactez votre administrateur.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Plan actuel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {['Starter', 'Business', 'Enterprise'].map((plan) => {
          const isCurrent = plan === currentPlan;
          return (
            <Card key={plan} style={{ border: isCurrent ? '1px solid rgba(108,71,255,0.5)' : '1px solid #334155',
              boxShadow: isCurrent ? '0 0 24px rgba(108,71,255,0.15)' : 'none' }}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <p style={{ fontSize: '15px', fontWeight: 700, color: isCurrent ? '#6C47FF' : '#94a3b8' }}>{plan}</p>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: 'rgba(108,71,255,0.15)', color: '#6C47FF' }}>
                      Actuel
                    </span>
                  )}
                </div>
                <ul className="space-y-2 mb-5">
                  {PLAN_FEATURES[plan].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle size={13} color={isCurrent ? '#10B981' : '#334155'} />
                      <span style={{ fontSize: '12px', color: isCurrent ? '#94a3b8' : '#475569' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <button className="w-full py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{ backgroundColor: 'rgba(108,71,255,0.08)', color: '#6C47FF',
                      border: '1px solid rgba(108,71,255,0.2)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(108,71,255,0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(108,71,255,0.08)'; }}>
                    Passer à {plan}
                  </button>
                )}
                {isCurrent && (
                  <p style={{ fontSize: '11px', color: '#475569', textAlign: 'center' }}>
                    Renouvellement le <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{renewal}</span>
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Mobile Money transactions ── */}
      <Card>
        <CardHeader title="Réconciliation Mobile Money"
          subtitle="Transactions des tickets premium et consultations payantes"
          action={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                  {MOCK_TRANSACTIONS.filter((t) => t.status === 'success').length} succès
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
                <span style={{ fontSize: '11px', color: '#F43F5E', fontWeight: 600 }}>
                  {MOCK_TRANSACTIONS.filter((t) => t.status === 'failed').length} échoué
                </span>
              </div>
            </div>
          } />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', backgroundColor: '#0F1623' }}>
                {['ID', 'Client', 'Montant', 'Méthode', 'Date', 'Statut'].map((h) => (
                  <th key={h} className="text-left px-5 py-3"
                    style={{ fontSize: '10px', fontWeight: 600, color: '#475569',
                      textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((tx, i) => {
                const st = TX_STATUS[tx.status as keyof typeof TX_STATUS];
                return (
                  <tr key={tx.id} style={{ borderBottom: i < MOCK_TRANSACTIONS.length - 1 ? '1px solid #1e293b' : 'none',
                    backgroundColor: i % 2 === 1 ? 'rgba(255,255,255,0.018)' : 'transparent' }}>
                    <td className="px-5 py-3">
                      <span style={{ color: '#6C47FF', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600 }}>{tx.id}</span>
                    </td>
                    <td className="px-5 py-3" style={{ fontSize: '13px', color: '#e2e8f0' }}>{tx.client}</td>
                    <td className="px-5 py-3">
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 600, color: '#10B981' }}>
                        {tx.amount.toLocaleString('fr-FR')} BIF
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ backgroundColor: tx.method === 'Lumicash' ? 'rgba(245,158,11,0.12)' : 'rgba(6,182,212,0.12)',
                          color: tx.method === 'Lumicash' ? '#F59E0B' : '#06B6D4' }}>
                        {tx.method}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>{tx.date}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
                        style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-end">
        <SaveButton state={state} onClick={() => trigger('Paramètres de facturation sauvegardés')} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('branding');
  const [toast, setToast]         = useState({ visible: false, message: '' });

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const canEdit = CAN_EDIT[activeTab].includes(CURRENT_ROLE);
  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', minHeight: '100%' }}>

      {/* ── En-tête ── */}
      <div className="mb-6">
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
          Configuration & Paramètres
        </h1>
        <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
          {activeTabConfig.desc}
        </p>
      </div>

      {/* ── Tabs navigation ── */}
      <div className="flex items-center gap-1 p-1 rounded-xl mb-8 flex-wrap"
        style={{ backgroundColor: '#1A2235', border: '1px solid #334155', width: 'fit-content' }}>
        {TABS.filter((t) => TAB_ACCESS[t.key].includes(CURRENT_ROLE)).map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          const editable = CAN_EDIT[key].includes(CURRENT_ROLE);
          return (
            <button key={key} onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ backgroundColor: isActive ? '#0A0E1A' : 'transparent',
                color: isActive ? '#e2e8f0' : '#64748b',
                border: isActive ? '1px solid #334155' : '1px solid transparent' }}>
              <Icon size={15} strokeWidth={1.75} />
              {label}
              {!editable && (
                <Lock size={11} color="#475569" style={{ marginLeft: '2px' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Contenu de l'onglet actif ── */}
      {activeTab === 'branding'  && <TabBranding  canEdit={canEdit} onToast={showToast} />}
      {activeTab === 'services'  && <TabServices  canEdit={canEdit} onToast={showToast} />}
      {activeTab === 'tv'        && <TabTv        canEdit={canEdit} onToast={showToast} />}
      {activeTab === 'billing'   && <TabBilling   canEdit={canEdit} onToast={showToast} />}

      {/* ── Toast Emerald ── */}
      <Toast message={`✓ ${toast.message}`} visible={toast.visible} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
