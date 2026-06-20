# TONDE — Structure du Projet · Web Dashboard & Site Vitrine

## Framework : Next.js 16 (App Router)

Le routing est basé sur le système de fichiers Next.js App Router.
Les groupes de routes `(auth)` et `(dashboard)` permettent d'isoler les layouts sans impacter l'URL.

---

## Arborescence cible

```
tonde-web/
├── app/                                   # App Router Next.js
│   ├── layout.tsx                         # Layout racine + Providers globaux
│   ├── page.tsx                           # Landing page (route /)
│   ├── globals.css                        # Design system TONDE + CSS variables
│   │
│   ├── (auth)/                            # Groupe routes publiques auth
│   │   └── login/
│   │       └── page.tsx                   # Page de connexion admin
│   │
│   ├── (dashboard)/                       # Groupe routes protégées dashboard
│   │   ├── layout.tsx                     # Layout dashboard (Sidebar + Header)
│   │   ├── dashboard/
│   │   │   └── page.tsx                   # Vue principale + stats du jour
│   │   ├── queue/
│   │   │   └── page.tsx                   # File d'attente temps réel
│   │   ├── agents/
│   │   │   └── page.tsx                   # Gestion agents et guichets
│   │   ├── analytics/
│   │   │   └── page.tsx                   # Statistiques et rapports
│   │   └── settings/
│   │       └── page.tsx                   # Configuration institution
│   │
│   └── pricing/
│       └── page.tsx                       # Page tarification publique
│
├── components/
│   ├── landing/                           # Composants landing page publique
│   │   ├── navigation.tsx
│   │   ├── hero-section.tsx
│   │   ├── problem-section.tsx
│   │   ├── ecosystem-section.tsx
│   │   ├── technical-section.tsx
│   │   ├── testimonials-section.tsx
│   │   ├── pricing-section.tsx
│   │   ├── faq-section.tsx
│   │   ├── cta-section.tsx
│   │   └── footer-section.tsx
│   │
│   ├── ui/                                # shadcn/ui components (ne pas modifier)
│   │
│   └── layout/                            # Composants layout dashboard
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── DashboardLayout.tsx
│
├── lib/
│   ├── utils.ts                           # cn() + utilitaires shadcn
│   ├── axios.ts                           # Instance Axios + intercepteurs JWT
│   ├── websocket.ts                       # Service WebSocket + reconnexion
│   └── query-client.ts                    # TanStack Query client configuré
│
├── store/
│   ├── app.store.ts                       # Zustand : state UI global
│   └── auth.store.ts                      # Zustand : user connecté + rôle
│
├── services/                              # Couche API — un fichier par domaine
│   ├── auth.service.ts                    # login, logout, refresh
│   ├── queue.service.ts                   # file d'attente, appel suivant
│   ├── tickets.service.ts                 # tickets, historique
│   ├── agencies.service.ts                # agences, services
│   ├── agents.service.ts                  # agents, guichets
│   └── analytics.service.ts              # stats, rapports
│
├── hooks/                                 # Hooks TanStack Query réutilisables
│   ├── useQueue.ts
│   ├── useAgents.ts
│   ├── useTickets.ts
│   └── useAnalytics.ts
│
├── types/                                 # Types TypeScript partagés
│   ├── ticket.types.ts
│   ├── user.types.ts
│   ├── agency.types.ts
│   └── api.types.ts
│
├── utils/
│   ├── permissions.ts                     # hasPermission(role, action)
│   ├── formatters.ts                      # dates, durées, BIF
│   └── error-handler.ts                   # message d'erreur lisible
│
├── i18n/                                  # Internationalisation
│   ├── fr/                                # Traductions françaises (principale)
│   ├── en/                                # Traductions anglaises
│   └── rn/                                # Traductions Kirundi
│
├── public/
│   └── assets/                            # Logo TONDE, images, favicon
│
├── styles/
│   └── globals.css                        # (legacy — utiliser app/globals.css)
│
├── index.html                             # (ignoré par Next.js)
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── components.json                        # Configuration shadcn/ui
├── package.json
├── .env.development
├── .env.production
└── .env.example
```

---

## Pattern en couches (obligatoire)

```
Page (app/) → Hook (TanStack Query) → Service → Axios → API Backend
                                          ↓
                                     Zustand Store (UI state)
                                          ↓
                                  WebSocket Service (temps réel)
```

---

## Rôles et accès aux routes

| Route | Rôles autorisés |
|-------|----------------|
| `/` (landing) | Public |
| `/pricing` | Public |
| `/login` | Public |
| `/dashboard` | agent, supervisor, admin_agency, admin_org |
| `/queue` | agent, supervisor |
| `/agents` | supervisor, admin_agency, admin_org |
| `/analytics` | supervisor, admin_agency, admin_org |
| `/settings` | admin_agency, admin_org |

La protection des routes dashboard est gérée via un **middleware Next.js** (`middleware.ts` à créer à la racine).

---

## Modules à créer (MVP restant)

Suivre le pattern `service → hook → composant → page` :

- `reports/` — génération PDF/Excel
- `notifications/` — centre de notifications admin
- `counters/` — gestion guichets
- `billing/` — facturation Mobile Money
