# NOW eSport

Frontend Next.js pour NOW eSport, pense pour un fonctionnement autonome cote GitHub, Vercel, Supabase et Stripe.

## Stack

- `Next.js 16`
- `React 19`
- `Supabase` pour l'auth, la base et les contenus
- `Stripe` pour le paiement
- `GitHub Actions` pour la CI
- `Vercel` pour le deploiement

## Philosophie de deploiement

Le projet est prepare pour :

- un repo GitHub comme source principale
- une CI automatique via GitHub Actions
- un deploiement GitHub -> Vercel
- une execution autonome sans dependre d'un PC local
- des medias relies par URL publique, jamais par chemin local

## Variables d'environnement

Le fichier de reference est [`.env.example`](./.env.example).

Source de verite recommandee :

- `Vercel Project Settings > Environment Variables`
- `GitHub Secrets / Variables` seulement si un workflow en a besoin

Variables attendues :

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_HERO_VIDEO_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Commandes

```bash
npm ci
npm run lint
npm run build
```

Commande de verification complete :

```bash
npm run check
```

## CI GitHub

Le workflow [ci.yml](./.github/workflows/ci.yml) execute automatiquement :

- installation
- lint
- build

A chaque `push` et `pull_request`.

## Vercel

Le projet est compatible avec Vercel sans script custom.

A configurer dans Vercel :

1. importer le repo GitHub
2. definir les variables d'environnement
3. connecter Supabase et Stripe cote domaine reel
4. creer le webhook Stripe vers `/api/stripe/webhook`
5. brancher la video hero via `NEXT_PUBLIC_HERO_VIDEO_URL` avec une URL publique

## Stripe

La documentation de raccord Stripe/Supabase est ici :

- [stripe/README.md](./stripe/README.md)

## Supabase

Le schema de base est ici :

- [supabase/schema.sql](./supabase/schema.sql)
- [supabase/README.md](./supabase/README.md)

- Redeploy trigger: sync latest shell/hero fixes.
