# TONDE — Vision Produit · Web Dashboard & Site Vitrine

## Identité

**TONDE** signifie "file d'attente" en Kirundi.

Le projet web TONDE couvre deux interfaces distinctes dans le même repository :
1. **Dashboard Admin** — interface de gestion pour les directeurs et managers des institutions
2. **Site vitrine** — page de présentation commerciale pour convaincre les banques et hôpitaux

## Rôle de l'IA dans ce projet

Tu es l'Architecte Frontend Senior et React Expert du projet TONDE.

Tu travailles sur des interfaces web professionnelles destinées à des directeurs d'institutions africaines (banques, hôpitaux) et à des investisseurs potentiels. Tu raisonnes comme un ingénieur frontend senior qui prépare des interfaces rapides, accessibles, multilingues, capables d'afficher des données en temps réel.

## Mission

### Dashboard Admin
Permettre aux managers et administrateurs d'institutions de :
- Superviser la file d'attente en temps réel
- Gérer les agents et guichets
- Consulter les statistiques et rapports
- Configurer les services et paramètres

### Site vitrine
Convaincre les institutions de choisir TONDE en présentant :
- La proposition de valeur clairement
- Les fonctionnalités en démonstration
- Les plans tarifaires
- Les cas d'usage banque/hôpital

## Marchés cibles

- **Phase 1** : Burundi — décideurs institutionnels francophones
- **Phase 2** : RDC — expansion commerciale
- **Phase 3** : Afrique de l'Est et Centrale

## Modules Dashboard Admin

| Module | Priorité |
|--------|----------|
| Auth admin (login sécurisé) | P0 |
| Vue file d'attente temps réel | P0 |
| Gestion agents et guichets | P0 |
| Statistiques du jour | P0 |
| Rapports et exports PDF/Excel | P1 |
| Configuration institution | P1 |
| Gestion services | P1 |
| Analytics avancés | P2 |

## Roadmap

| Version | Fonctionnalités |
|---------|----------------|
| V1.0 | Auth, Queue live, Stats jour, Gestion agents |
| V1.5 | Rapports automatiques, Mobile Money réconciliation |
| V2.0 | Analytics prédictifs, multi-agences dashboard |

## Méthode de travail obligatoire

Avant toute modification :
1. Analyser les composants existants
2. Vérifier la cohérence avec le contrat API
3. Identifier l'impact sur le WebSocket (données live)
4. Produire un plan si changement majeur
5. Implémenter progressivement avec tests

Ne jamais créer un nouvel appel API sans vérifier qu'il existe dans `tonde-docs/api-contract.md`.

## Addendum — Direction artistique et structure officielle de la landing page

### Direction artistique globale : Dark Fintech Minimal

- Esthétique premium inspirée de Linear / Vercel
- Objectif : projeter une image de haute technicité, de fiabilité et de dignité
- Palette officielle :
  - `Midnight (#0A0E1A)` — fond principal
  - `Ink (#1A2235)` — cartes et sections
  - `Violet (#6C47FF)` — CTA et identité de marque
  - `Cyan (#00D4FF)` — flux temps réel et transferts
- Typographie officielle :
  - `Inter` pour le texte général
  - `JetBrains Mono` pour les données chiffrées et tickets
- Espacement : grille stricte de 8 points

### Structure détaillée de la landing page `/`

1. **Header**
   - Logo Main Light à gauche sur fond sombre
   - Navigation : Produit, Tarifs, Témoignages, FAQ
   - CTA principal : `Demander une Démo`

2. **Hero**
   - H1 : `Transformez le chaos de l'attente en une expérience de dignité.`
   - Sous-titre : `TONDE est l'infrastructure intelligente de gestion de files d'attente conçue pour les institutions africaines modernes.`
   - Visuel : synchronisation entre application mobile Flutter et affichage TV temps réel

3. **Section Problème**
   - Mettre en avant l'abandon de file, les pertes de revenus et le stress cognitif
   - Référence cible : `22 % des usagers abandonnent la file avant d'être servis en Afrique subsaharienne`

4. **Section Écosystème TONDE**
   - App Mobile
   - Guichet Desktop
   - Affichage TV
   - Dashboard Admin

5. **Section Technique / preuve de fiabilité**
   - WebSocket temps réel `< 100ms`
   - Approche `Offline-First`
   - Isolation des données par institution via PostgreSQL / RLS

6. **Tarification**
   - `Starter` — agences individuelles
   - `Business` — Mobile Money + rapports avancés
   - `Enterprise` — multi-agences + analytics prédictifs

### Règles UI complémentaires

- Boutons : hauteur `40px`, radius `8px`, hover +10 % luminosité
- Badges : fond coloré à 10 % d'opacité + pastille 6px
- Cartes : bordure `#334155` + ombre légère `0 4px 24px`
- Accessibilité : contraste cible `7.2:1` et zones tactiles min. `44px` sur mobile

### Stack technique validée pour ce repository

- **Option A validée** : la landing et le dashboard utilisent **Next.js** sur ce repository
- Référence de stack actuelle : voir `tech.md`
- Les directives de design ci-dessus s'ajoutent aux règles Next.js déjà validées
