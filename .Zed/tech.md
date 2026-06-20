# TONDE — Stack Technique · Web Dashboard & Site Vitrine

## Décision architecturale

Le projet `tonde-web` utilise **Next.js** (App Router) comme framework principal.

Ce choix a été validé pour les raisons suivantes :
- SSR natif bénéfique pour le SEO de la landing page publique
- Routing file-based cohérent pour cohabiter landing + dashboard dans le même repo
- Meilleur support des Server Components pour les pages statiques
- Écosystème Next.js mature avec shadcn/ui

> Les specs initiales mentionnaient React + Vite. Cette décision (Option A) remplace définitivement Vite par Next.js sur ce repository.

---

## Stack principale

| Composant | Choix | Version |
|-----------|-------|---------|
| Framework | Next.js (App Router) | 16.x |
| React | React | 19.x |
| Langage | TypeScript | 5.x |
| Styles | TailwindCSS | 4.x |
| State global | Zustand | 4.x |
| Data fetching | TanStack Query (React Query) | 5.x |
| Client HTTP | Axios | 1.x |
| WebSocket | native WebSocket API | — |
| Routing | Next.js App Router | — |
| Graphiques | Recharts | 2.x |
| Tableaux | TanStack Table | 8.x |
| Formulaires | React Hook Form + Zod | — |
| UI Components | shadcn/ui + Radix UI | — |
| Icons | Lucide React | — |
| Dates | date-fns | 4.x |
| PDF export | jsPDF + html2canvas | — |
| Excel export | SheetJS (xlsx) | — |
| Internationalisation | i18next + react-i18next | — |
| Tests | Vitest + Testing Library | — |

---

## Authentification web

- JWT Access Token stocké dans `httpOnly cookie` (sécurisé) ou `sessionStorage`
- Refresh automatique via Axios intercepteur
- Rôles supportés côté web : `agent`, `supervisor`, `admin_agency`, `admin_org`, `super_admin`
- Redirection automatique si token expiré (middleware Next.js)

---

## Environnements

```typescript
// src/config/api.ts
const ENV_URLS = {
  development: 'http://localhost:8000',
  staging:     'https://api-staging.tonde.app',
  production:  'https://api.tonde.app',
};

export const API_BASE_URL = ENV_URLS[process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'];
```

```bash
# .env.development
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_APP_NAME=Tonde Dashboard

# Lancer en dev
npm run dev   # http://localhost:3000

# Build production
npm run build
npm run start
```

---

## WebSocket — temps réel dashboard

```typescript
// Le dashboard écoute les événements WebSocket pour :
// - Mise à jour de la file en temps réel
// - Statut des guichets (ouvert/fermé/pause)
// - Nouveau ticket créé
// - Ticket appelé / absent / done

const ws = new WebSocket(`${WS_BASE_URL}/ws/agency/${agencyId}?token=${token}`);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Mettre à jour Zustand store
};
```

---

## Commandes courantes

```bash
npm install          # Installer les dépendances
npm run dev          # Lancer en développement (port 3000)
npm run build        # Build de production
npm run start        # Lancer le build de production
npm run lint         # ESLint
```
