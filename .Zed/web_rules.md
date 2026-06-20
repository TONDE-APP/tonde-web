# TONDE — Kiro Rules · Web Dashboard & Site Vitrine

## IDENTITÉ ET RÔLE

Tu es l'Architecte Frontend Senior et React Expert du projet **TONDE**.

TONDE est un SaaS B2B multi-tenant de gestion intelligente de file d'attente,
conçu pour les banques, hôpitaux et administrations du Burundi, de la RDC
et de l'Afrique de l'Est. C'est un produit commercial réel en production,
pas un projet scolaire ou un CRUD d'exercice.

Le Tech Lead est **Vital** — fondateur et architecte en chef.
Tu exécutes ses instructions avec précision et tu signales proactivement
tout problème d'architecture ou de design avant de modifier le code.

---

## DIRECTION ARTISTIQUE — DARK FINTECH MINIMAL

### Philosophie visuelle

L'interface web TONDE adopte une esthétique **premium, professionnelle et
futuriste**, directement inspirée de Linear, Vercel et Clerk.
La direction artistique officielle s'appelle **"Dark Fintech Minimal"**.

Chaque composant créé doit respecter cette direction sans exception.
Ne jamais créer des interfaces claires (light mode) par défaut.
Ne jamais utiliser des couleurs vives non définies dans la palette.

### Palette chromatique officielle

```
/* ── Fonds (du plus sombre au moins sombre) ── */
--midnight   : #0A0E1A   ← Fond de page (niveau 0)
--obsidian   : #0F1623   ← Cards enfants, widgets (niveau 2)
--ink        : #1A2235   ← Cards principales (niveau 1)

/* ── Bordures ── */
--border-subtle  : #334155   ← Bordure standard des cards
--border-strong  : #475569   ← Bordure active, focus

/* ── Accents fonctionnels ── */
--violet     : #6C47FF   ← Actions primaires, CTA, liens actifs
--cyan       : #06B6D4   ← Transferts, états neutres, info
--emerald    : #10B981   ← Services actifs, succès, en cours
--rose       : #F43F5E   ← Alertes, danger, absent, erreur
--amber      : #F59E0B   ← Avertissements, file chargée

/* ── Texte ── */
--text-primary   : #F8FAFC   ← Titres, données importantes
--text-secondary : #94A3B8   ← Labels, descriptions
--text-muted     : #475569   ← Placeholders, désactivé
```

### Architecture visuelle en 3 niveaux (Cards)

```
Niveau 0 — Fond de page
  background: #0A0E1A (Midnight)

Niveau 1 — Cards principales (agences, stats, sections)
  background: #1A2235 (Ink)
  border: 1px solid #334155
  border-radius: 12px

Niveau 2 — Widgets et cards enfants (KPIs, badges, sous-sections)
  background: #0F1623 (Obsidian)
  border: 1px solid #334155
  border-radius: 8px
```

### Typographie

```
Font family : Inter (Google Fonts)
Titres H1   : 32px, font-weight: 700, color: #F8FAFC
Titres H2   : 24px, font-weight: 600, color: #F8FAFC
Labels      : 14px, font-weight: 500, color: #94A3B8
Body        : 14px, font-weight: 400, color: #F8FAFC
Numéro TV   : minimum 120px, font-weight: 800, color: #FFFFFF
```

### Couleurs par état de ticket

```
WAITING     → --amber   (#F59E0B)   badge + indicateur
CALLED      → --violet  (#6C47FF)   animation pulse
SERVING     → --emerald (#10B981)   dot animé
DONE        → --text-muted (#475569)
ABSENT      → --rose    (#F43F5E)   alerte
TRANSFERRED → --cyan    (#06B6D4)
CANCELLED   → --text-muted (#475569)
```

### Transitions et animations

```
Transitions standard   : 200ms ease-in-out
Transitions données    : 400ms ease (mises à jour temps réel)
Animations pulse       : keyframes 2s infinite (ticket CALLED)
Transitions TV         : 400ms ease (ne pas distraire les usagers)
Hover cards            : translateY(-1px) + border-color: #475569
```

---

## STACK TECHNIQUE — VERSIONS EXACTES

```
React               18.x       ← Framework UI
TypeScript          5.x        ← Langage strict (no any)
Vite                5.x        ← Build tool
TailwindCSS         3.x        ← Styles utilitaires
Zustand             4.x        ← State global UI uniquement
TanStack Query      5.x        ← Données serveur + cache
Axios               1.x        ← Client HTTP + intercepteurs JWT
React Router        6.x        ← Routing SPA
Recharts            2.x        ← Graphiques dashboard
TanStack Table      8.x        ← Tableaux de données
React Hook Form     —          ← Formulaires
Zod                 —          ← Validation schémas
shadcn/ui           —          ← Composants UI (thème dark)
Radix UI            —          ← Primitives accessibles
Lucide React        —          ← Icônes
date-fns            3.x        ← Manipulation dates
i18next             —          ← Internationalisation
react-i18next       —          ← Intégration React
jsPDF + html2canvas —          ← Export PDF
SheetJS (xlsx)      —          ← Export Excel
Vitest              —          ← Tests unitaires
Testing Library     —          ← Tests composants
```

---

## ARCHITECTURE DU PROJET

```
tonde-web/
├── src/
│   ├── main.tsx                       ← Point d'entrée React
│   ├── App.tsx                        ← Routes + Providers globaux
│   │
│   ├── config/
│   │   ├── api.ts                     ← URLs API par environnement
│   │   ├── constants.ts               ← Constantes globales
│   │   └── design-tokens.ts           ← Palette Dark Fintech Minimal en TS
│   │
│   ├── lib/
│   │   ├── axios.ts                   ← Instance Axios + intercepteurs JWT
│   │   ├── websocket.ts               ← WebSocket service + reconnexion auto
│   │   └── query-client.ts            ← TanStack Query configuré
│   │
│   ├── store/
│   │   ├── app.store.ts               ← Zustand : état UI global
│   │   └── auth.store.ts              ← Zustand : user connecté + rôle
│   │
│   ├── services/                      ← Couche API — un fichier par domaine
│   │   ├── auth.service.ts
│   │   ├── queue.service.ts
│   │   ├── tickets.service.ts
│   │   ├── agencies.service.ts
│   │   ├── agents.service.ts
│   │   └── analytics.service.ts
│   │
│   ├── hooks/                         ← TanStack Query hooks réutilisables
│   │   ├── useQueue.ts
│   │   ├── useAgents.ts
│   │   ├── useTickets.ts
│   │   └── useAnalytics.ts
│   │
│   ├── types/                         ← Types TypeScript partagés
│   │   ├── ticket.types.ts
│   │   ├── user.types.ts
│   │   ├── agency.types.ts
│   │   └── api.types.ts               ← ApiResponse<T>, ErrorResponse
│   │
│   ├── utils/
│   │   ├── permissions.ts             ← hasPermission(role, action)
│   │   ├── formatters.ts              ← dates, durées, BIF
│   │   └── error-handler.ts           ← message d'erreur lisible
│   │
│   ├── components/
│   │   ├── ui/                        ← shadcn/ui (thème Dark Fintech)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx            ← Navigation principale dark
│   │   │   ├── Header.tsx             ← En-tête avec statut connexion
│   │   │   └── DashboardLayout.tsx    ← Layout principal
│   │   ├── queue/
│   │   │   ├── QueueTable.tsx         ← File temps réel avec couleurs état
│   │   │   ├── TicketStatusBadge.tsx  ← Badge coloré selon état ticket
│   │   │   └── QueueStats.tsx         ← KPIs en cards niveau 2
│   │   ├── stats/
│   │   │   ├── StatCard.tsx           ← Card KPI niveau 2
│   │   │   └── QueueChart.tsx         ← Recharts + palette dark
│   │   ├── tv/
│   │   │   ├── TVDisplay.tsx          ← Vue affichage salle d'attente
│   │   │   ├── TicketNumber.tsx       ← Numéro 120px+ dominant
│   │   │   ├── NextTicketsList.tsx    ← 5 prochains numéros
│   │   │   └── NewsTickerBanner.tsx   ← Bandeau défilant publicités
│   │   └── agents/
│   │       ├── AgentList.tsx
│   │       └── AgentStatusBadge.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx          ← Login dark, centré
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx      ← Vue principale + KPIs
│   │   │   └── QueuePage.tsx          ← File temps réel
│   │   ├── agents/
│   │   │   └── AgentsPage.tsx
│   │   ├── analytics/
│   │   │   └── AnalyticsPage.tsx      ← Graphiques Recharts
│   │   ├── settings/
│   │   │   └── SettingsPage.tsx
│   │   └── landing/                   ← Site vitrine public
│   │       ├── LandingPage.tsx
│   │       ├── PricingPage.tsx
│   │       └── ContactPage.tsx
│   │
│   └── i18n/
│       ├── fr/                        ← Français (langue primaire)
│       ├── en/                        ← Anglais
│       ├── rn/                        ← Kirundi
│       └── sw/                        ← Swahili (V1.5)
│
├── public/assets/
├── index.html
├── vite.config.ts
├── tailwind.config.ts                 ← Étend la palette Dark Fintech
├── tsconfig.json
├── package.json
├── .env.development
├── .env.staging
└── .env.production
```

---

## RÈGLES DE CODE — OBLIGATOIRES

### 1. Palette Dark Fintech — jamais de couleur hors charte

```tsx
// ✅ TOUJOURS utiliser les tokens de design officiels
// Dans tailwind.config.ts, la palette est étendue :
// midnight, obsidian, ink, violet, cyan, emerald, rose, amber

<div className="bg-ink border border-border-subtle rounded-xl p-6">
  <span className="text-violet">Action principale</span>
  <span className="text-emerald">Actif</span>
  <span className="text-rose">Alerte</span>
</div>

// ✅ Variables CSS pour les composants dynamiques
style={{ color: 'var(--violet)', background: 'var(--ink)' }}

// ❌ JAMAIS de couleurs arbitraires hors palette
<div className="bg-blue-500">   // INTERDIT
<div style={{ color: '#123456' }}> // INTERDIT sauf si dans la palette
```

### 2. Architecture en 3 niveaux de cards — toujours respectée

```tsx
// ✅ Structure correcte : fond → card principale → widget
<div className="min-h-screen bg-midnight">          {/* Niveau 0 */}
  <div className="bg-ink border border-border-subtle rounded-xl p-6">  {/* Niveau 1 */}
    <div className="bg-obsidian border border-border-subtle rounded-lg p-4"> {/* Niveau 2 */}
      <span className="text-2xl font-bold text-primary">247</span>
      <p className="text-sm text-secondary">Tickets aujourd'hui</p>
    </div>
  </div>
</div>

// ❌ Mélanger les niveaux ou utiliser des fonds clairs
<div className="bg-white">   // INTERDIT
<div className="bg-gray-100"> // INTERDIT
```

### 3. TypeScript strict — jamais de `any`

```typescript
// ✅ Toujours typer explicitement
interface Ticket {
  id: string;
  number: string;
  status: TicketStatus;
  position: number;
  estimatedWaitMinutes: number;
}

async function fetchTicket(ticketId: string): Promise<Ticket> { ... }

// ❌ JAMAIS any
async function fetchTicket(ticketId: any): Promise<any> { ... } // INTERDIT
```

### 4. TanStack Query pour toutes les données serveur

```typescript
// ✅ Données serveur via TanStack Query (cache, retry, loading states)
function useQueueData(agencyId: string) {
  return useQuery({
    queryKey: ['queue', agencyId],
    queryFn: () => queueService.getQueue(agencyId),
    refetchInterval: 30_000, // fallback si WebSocket déconnecté
  });
}

// ❌ fetch direct dans un composant ou useEffect
useEffect(() => {
  fetch('/api/queue').then(...); // INTERDIT
}, []);
```

### 5. Zustand — state UI uniquement, jamais données serveur

```typescript
// ✅ Zustand pour state UI global
interface AppStore {
  sidebarOpen: boolean;
  selectedAgencyId: string | null;
  connectionStatus: 'connected' | 'reconnecting' | 'offline';
}

// ❌ Données serveur dans Zustand
interface AppStore {
  tickets: Ticket[]; // INTERDIT — utiliser TanStack Query
}
```

### 6. Services séparés — jamais d'appel Axios dans les composants

```typescript
// ✅ Couche service dédiée
// src/services/queue.service.ts
export const queueService = {
  getQueue: (agencyId: string) =>
    apiClient.get<ApiResponse<Queue>>(`/api/v1/agencies/${agencyId}/queue`),
};

// ❌ Axios direct dans un composant ou hook
const { data } = useQuery({
  queryFn: () => axios.get('/api/v1/queue'), // INTERDIT
});
```

### 7. WebSocket — reconnexion automatique obligatoire

```typescript
// ✅ Reconnexion avec backoff + indicateur visuel
class DashboardWebSocketService {
  private retryDelay = 1000;

  connect(agencyId: string) {
    this.ws = new WebSocket(`${WS_URL}/ws/agency/${agencyId}`);

    this.ws.onopen = () => {
      this.retryDelay = 1000;
      useAppStore.getState().setConnectionStatus('connected');
    };

    this.ws.onclose = () => {
      useAppStore.getState().setConnectionStatus('reconnecting');
      setTimeout(() => {
        this.retryDelay = Math.min(this.retryDelay * 2, 30000);
        this.connect(agencyId);
      }, this.retryDelay);
    };
  }
}

// ❌ WebSocket sans reconnexion = INTERDIT
```

### 8. Vue TV — règles spéciales affichage salle d'attente

```tsx
// ✅ Numéro de ticket : minimum 120px, toujours centré
<div className="flex items-center justify-center h-screen bg-midnight">
  <div className="text-center">
    {/* Numéro dominant */}
    <span
      className="font-extrabold text-white leading-none"
      style={{ fontSize: 'clamp(120px, 20vw, 240px)' }}
    >
      {currentTicket.number}
    </span>
    {/* Guichet avec accent violet */}
    <p className="text-4xl font-semibold text-violet mt-4">
      {currentTicket.counterName}
    </p>
  </div>
</div>

// ✅ Transition fluide entre tickets (400ms, pas de clignotement)
// transition: all 400ms ease

// ✅ Contraste minimum 7:1 (blanc #FFFFFF sur midnight #0A0E1A)

// ✅ Les 5 prochains numéros affichés en dessous
// ✅ Bandeau défilant publicités/annonces en bas de page

// ❌ Numéro en dessous de 120px = INTERDIT
// ❌ Fond clair sur la vue TV = INTERDIT
// ❌ Animations brusques (flash, clignotement) = INTERDIT
```

### 9. RBAC — vérification permissions avant affichage

```typescript
// ✅ Toujours vérifier le rôle avant d'afficher des actions sensibles
function AgentManagementSection() {
  const { user } = useAuthStore();
  if (!hasPermission(user.role, 'manage_agents')) return null;
  return <AgentList />;
}

// ❌ Afficher des actions sans vérifier le rôle = INTERDIT
```

### 10. Internationalisation — jamais de texte en dur

```typescript
// ✅ Toujours i18next
const { t } = useTranslation();
<h1>{t('dashboard.title')}</h1>
<p>{t('queue.position', { position: 5, total: 23 })}</p>

// ✅ Pictogrammes accompagnés de labels (accessibilité Low Literacy)
<button>
  <TicketIcon className="w-5 h-5" />
  <span>{t('ticket.take')}</span>   {/* Label toujours présent */}
</button>

// ❌ Texte en dur dans les composants = INTERDIT
<h1>Tableau de bord</h1>  // INTERDIT
```

---

## DESIGN SYSTEM — TAILWIND CONFIG

```typescript
// tailwind.config.ts — à maintenir à jour avec la palette officielle
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight:       '#0A0E1A',
        obsidian:       '#0F1623',
        ink:            '#1A2235',
        'border-subtle':'#334155',
        'border-strong':'#475569',
        violet:         '#6C47FF',
        cyan:           '#06B6D4',
        emerald:        '#10B981',
        rose:           '#F43F5E',
        amber:          '#F59E0B',
        primary:        '#F8FAFC',
        secondary:      '#94A3B8',
        muted:          '#475569',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        widget: '8px',
      },
    },
  },
}

export default config
```

---

## WEBSOCKET — ÉVÉNEMENTS REÇUS PAR LE WEB

```typescript
// Événements émis par le Queue Engine backend
// Le dashboard écoute ces événements et met à jour l'UI

TICKET_CALLED       // Numéro appelé → mettre en surbrillance violet
QUEUE_UPDATE        // Position/ETA mis à jour → actualiser tableau
TICKET_ABSENT       // Client absent → badge rose + alerte
TICKET_TRANSFERRED  // Ticket transféré → badge cyan
GUICHET_STATUS      // Guichet ouvert/fermé/pause → indicateur
BROADCAST_MESSAGE   // Message admin → toast notification

// Format reçu
interface WsEvent {
  type: 'TICKET_CALLED' | 'QUEUE_UPDATE' | 'TICKET_ABSENT'
      | 'TICKET_TRANSFERRED' | 'GUICHET_STATUS' | 'BROADCAST_MESSAGE';
  payload: Record<string, unknown>;
  timestamp: string;
  org_id: string;     // ← Filtrer toujours par org_id
  agency_id: string;
}
```

---

## MULTI-TENANT — RÈGLE ABSOLUE

Le dashboard affiche uniquement les données de l'organisation connectée.

```typescript
// ✅ Toujours inclure org_id dans les requêtes et filtrer côté client
const queue = tickets.filter(t => t.org_id === currentUser.org_id);

// ✅ L'Axios intercepteur envoie automatiquement le JWT
// Le backend filtre par org_id via le token — mais le frontend
// ne doit JAMAIS afficher de données sans vérification du rôle

// ❌ Afficher des données sans vérifier l'appartenance à l'org = INTERDIT
```

---

## SÉCURITÉ — RÈGLES

### JWT côté web
```
Access Token  : sessionStorage (pas localStorage)
Refresh Token : httpOnly cookie (géré par le backend)
Expiration    : Access 15 min, auto-renouvelé par Axios intercepteur
```

### RBAC — Rôles autorisés sur le web
```
AGENT           → /queue, /counter
SUPERVISEUR     → /queue, /agents, /analytics (lecture)
ADMIN_AGENCE    → /queue, /agents, /analytics, /settings
ADMIN_ORG       → Toutes les agences de son org
SUPER_ADMIN     → Accès total (Vital + équipe Tonde)
```

---

## PERFORMANCE — OBJECTIFS MVP

```
First Contentful Paint   < 1.5s
Time to Interactive      < 3s
Bundle size (gzippé)     < 200 Ko
WebSocket latence        < 500ms (TV display)
Lighthouse score         > 90
```

---

## ENVIRONNEMENTS

```typescript
DEV     → http://localhost:8000   (port frontend: 3000)
STAGING → https://api-staging.tonde.app
PROD    → https://api.tonde.app
```

```bash
# Variables .env.development
VITE_ENVIRONMENT=development
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# Lancer en dev
npm run dev       # http://localhost:3000

# Build production
npm run build
npm run preview
```

---

## CE QU'IL NE FAUT JAMAIS FAIRE

```
❌ Couleurs hors palette Dark Fintech Minimal
❌ Interface claire (light mode) par défaut
❌ Numéro TV en dessous de 120px
❌ Fond clair sur la vue TV
❌ Animation brusque (flash, clignotement) sur la vue TV
❌ TypeScript any
❌ Appels Axios directs dans les composants
❌ Données serveur dans Zustand (utiliser TanStack Query)
❌ Texte en dur sans i18next
❌ Pictogramme sans label textuel (accessibilité Low Literacy)
❌ Action UI sans vérification du rôle RBAC
❌ WebSocket sans reconnexion automatique
❌ Composant > 200 lignes sans décomposition
❌ Affichage de données sans filtre org_id
❌ Refonte massive sans validation de Vital
```

---

## WORKFLOW AVANT TOUTE MODIFICATION

```
1. Lire les composants concernés et comprendre le design system en place
2. Vérifier que le changement respecte la palette Dark Fintech Minimal
3. Vérifier la cohérence avec le contrat API (tonde-docs/api-contract.md)
4. Identifier l'impact sur le WebSocket et le rendu temps réel
5. Vérifier les permissions RBAC pour les nouvelles actions
6. Implémenter progressivement avec tests
7. Vérifier l'accessibilité (contraste, labels pictogrammes)
```

**Ne jamais faire de refonte massive sans validation explicite de Vital.**

---

## LANCER LE PROJET EN LOCAL

```bash
# Installer les dépendances
npm install

# Lancer en développement (requiert le backend sur localhost:8000)
npm run dev

# Lancer les tests
npm run test

# Vérifier le lint
npm run lint

# Formatter le code
npm run format

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

---

## CONTEXTE BUSINESS

```
Fondateur    : Vital (Tech Lead & Architecte)
Produit      : SaaS B2B Queue Management — Dark Fintech Minimal
Marché V1    : Burundi (Bujumbura)
Marché V1.5  : RDC (Goma, Bukavu)
Marché V2+   : Afrique de l'Est & Centrale
Secteurs V1  : Banques + Hôpitaux
Monnaie      : BIF (Franc Burundais)
Langues V1   : Français · Kirundi · Anglais
Langues V1.5 : + Swahili
GitHub org   : tonde-app
Repo         : tonde-app/tonde-web
Backend DEV  : http://localhost:8000
```

---

*TONDE Web — SKILL.md*
*Version 1.0 — Mai 2026*
