# Cazenave Pièces Auto — site e-commerce

Refonte du site [cazenave.net](https://cazenave.net) : casse auto et centre VHU agréé à Colomiers (31),
vente en ligne de pièces auto d'occasion. Stock, clients et commandes pilotés par l'API Opisto,
paiement Stripe, déploiement Vercel.

## Stack

- Next.js 16 (App Router, TypeScript) et Tailwind CSS 4
- Postgres (Neon) via Drizzle ORM — réplique locale du stock Opisto, synchronisée toutes les 30 minutes
- Stripe pour le paiement, remontée du règlement dans Opisto
- Recherche par plaque d'immatriculation via un fournisseur tiers, avec mise en cache

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs
npm run dev
```

Le site tourne sur http://localhost:3000.

## Base de données et synchronisation Opisto

- Schéma Drizzle dans `src/db/schema.ts` (familles, sous-catégories, marques, modèles, véhicules, pièces, état de sync).
  Migrations générées avec `npm run db:generate` dans `drizzle/`, appliquées automatiquement au premier accès.
- En développement, sans `DATABASE_URL` : Postgres embarqué PGlite dans `.data/pglite` (ignoré par git).
  Sur Vercel : `DATABASE_URL` = chaîne Neon (pooled).
- Connecteur Opisto dans `src/lib/opisto/` : client (jeton 14 jours partagé en base, quotas), mapper, moteur de sync.
- Synchronisation : `POST /api/sync` (jeton `SYNC_SECRET`), `npm run sync` (delta) ou `npm run sync:full`
  (parcours complet, ~240 appels). Le workflow `.github/workflows/sync-opisto.yml` appelle l'API toutes les
  30 minutes ; secrets GitHub à créer : `SITE_URL` et `SYNC_SECRET`. Un parcours complet de réconciliation
  est refait automatiquement toutes les 24 h.
- `CATALOG_SOURCE=demo` force le jeu de démonstration (aussi utilisé sur Vercel tant que `DATABASE_URL` manque).

## Commandes et paiement

- Tunnel : `/panier` → `/commande` (coordonnées, retrait ou livraison, CGV) → paiement → `/commande/confirmation`.
- `POST /api/checkout` vérifie les pièces (disponibles, expédiables si livraison), fige les montants et crée la
  commande en base (`orders`, statut `pending`), puis renvoie l'adresse de paiement.
- Paiement : Stripe Checkout dès que `STRIPE_SECRET_KEY` est renseignée. Le webhook `POST /api/stripe/webhook`
  (secret `STRIPE_WEBHOOK_SECRET`, événements `checkout.session.completed`, `…async_payment_succeeded`,
  `…async_payment_failed`, `checkout.session.expired`) finalise la commande ; la page de confirmation vérifie
  aussi la session directement. Sans clé Stripe, hors production, un paiement simulé (`/commande/paiement-test`)
  permet de tester tout le tunnel.
- Après paiement (`src/lib/orders/fulfill.ts`) : client Opisto retrouvé par e-mail ou créé, `POST /ordersV2`
  (réserve les pièces), `PUT /orders/{id}/payments/{id}` (règlement CB, n° de transaction Stripe), contrôle du
  total Opisto, e-mails client et atelier (`ORDERS_TO_EMAIL`). En cas d'échec Opisto, la commande passe en
  `opisto_failed` et l'atelier reçoit un e-mail pour la saisir à la main. `ORDERS_DRY_RUN=1` évite les appels Opisto.

## Organisation

- `src/app` — pages et routes (App Router)
- `src/components` — en-tête, pied de page, modules d'accueil
- `src/lib/site.ts` — coordonnées, navigation, partenaires (logos obligatoires en pied de page)
- `src/lib/catalog` — accès au catalogue (`db.ts` base synchronisée, `demo.ts` jeu de démonstration, `links.ts` pour les composants client)
- `src/lib/opisto` — client API, mapping et synchronisation du stock
- `src/db` — connexion (Neon ou PGlite) et schéma Drizzle
- `src/assets/brand` — logo, pictos et logos partenaires

## Règles

- Ne jamais committer de secrets : tout passe par `.env.local` (ignoré par git)
- Les logos partenaires et leurs liens du pied de page sont une obligation contractuelle
- Le site reste en `noindex` hors production Vercel (`VERCEL_ENV=production`)
