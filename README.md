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

## Organisation

- `src/app` — pages et routes (App Router)
- `src/components` — en-tête, pied de page, modules d'accueil
- `src/lib/site.ts` — coordonnées, navigation, partenaires (logos obligatoires en pied de page)
- `src/assets/brand` — logo, pictos et logos partenaires

## Règles

- Ne jamais committer de secrets : tout passe par `.env.local` (ignoré par git)
- Les logos partenaires et leurs liens du pied de page sont une obligation contractuelle
- Le site reste en `noindex` hors production Vercel (`VERCEL_ENV=production`)
