# TONDE Web

Landing page officielle de **TONDE**, l’infrastructure intelligente de gestion de files d’attente conçue pour les institutions africaines modernes.

## Objectif

Cette application web sert actuellement de **landing page produit** pour présenter :

- la proposition de valeur TONDE
- les problèmes terrain adressés
- l’écosystème produit TONDE
- les garanties techniques (temps réel, offline-first, sécurité)
- les plans de tarification

## Statut du projet

- **Landing page active** : oui
- **Applications métier réelles** : en développement
- **Visuels produits** : mockups conceptuels remplaçables
- **Mode visuel** : dark only

## Direction artistique

Le projet suit la direction **Dark Fintech Minimal** avec :

- `Midnight #0A0E1A`
- `Ink #1A2235`
- `Violet #6C47FF`
- `Cyan #00D4FF`
- `Inter` + `JetBrains Mono`

## Stack technique

- **Next.js 16**
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **shadcn/ui**
- **Radix UI**

## Lancer le projet en local

### Installation

```bash
npm install
```

### Développement

Sur cet environnement Windows, `Turbopack` pose problème. Utiliser **Webpack** :

```bash
npx next dev --webpack
```

Puis ouvrir :

```text
http://localhost:3000
```

### Build production

```bash
npm run build
```

### Démarrer la build

```bash
npm run start
```

## Scripts disponibles

```bash
npm run build
npm run build:turbo
npm run dev
npm run start
```

### Important

Le script `dev` par défaut utilise `next dev`. Si l’environnement local échoue avec Turbopack, lancer manuellement :

```bash
npx next dev --webpack
```

## Structure principale

```text
app/
  globals.css
  layout.tsx
  page.tsx

components/
  landing/
    animated-mobile-queue.tsx
    animated-sphere.tsx
    animated-tetrahedron.tsx
    animated-wave.tsx
    cta-section.tsx
    ecosystem-section.tsx
    faq-section.tsx
    footer-section.tsx
    hero-section.tsx
    navigation.tsx
    pricing-section.tsx
    problem-section.tsx
    technical-section.tsx
    testimonials-section.tsx
  ui/

lib/
  landing-demo.ts

public/
  assets/mockups/
```

## Sections actuelles de la landing

- Header / Navigation
- Hero TONDE
- Le problème
- L’écosystème TONDE
- Preuve de fiabilité
- Signaux terrain
- Tarification
- FAQ
- CTA final
- Footer

## Mockups conceptuels

Les mockups utilisés dans la landing sont centralisés dans :

- `lib/landing-demo.ts`
- `public/assets/mockups/`

Ils peuvent être remplacés plus tard par de vrais screenshots sans modifier la structure générale du site.

## Validation réalisée

Les validations déjà confirmées dans ce dépôt :

- `npm run build` ✅
- diagnostics TypeScript sans erreur bloquante ✅

## Notes

- Le projet est optimisé pour respecter la vision produit TONDE.
- La landing actuelle n’est pas un template brut v0.app : elle a été restructurée pour correspondre aux spécifications TONDE.
- Le mode clair n’est pas prévu à ce stade.

## Dépôt GitHub

```text
https://github.com/TONDE-APP/tonde-web.git
```
