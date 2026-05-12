# NOW eSport

Frontend Next.js pour NOW eSport, pensé pour un fonctionnement autonome côté GitHub, Vercel, Supabase et Stripe.

## Stack

- `Next.js 16`
- `React 19`
- `Supabase` pour l'auth, la base et les contenus
- `Stripe` pour le paiement
- `GitHub Actions` pour la CI
- `Vercel` pour le déploiement

## Philosophie de déploiement

Le projet est désormais préparé pour :

- un repo GitHub comme source principale
- une CI automatique via GitHub Actions
- un déploiement GitHub → Vercel
- une exécution autonome sans dépendre d'un PC local

## Variables d'environnement

Copier [`.env.example`](</D:\St0ckage\OneDrive\Documents\GitHub\nowesport\.env.example>) vers `.env.local` en local, puis reporter les mêmes variables dans :

- `GitHub Secrets / Variables` si besoin de workflows avancés
- `Vercel Project Settings > Environment Variables`

Variables attendues :

- `NEXT_PUBLIC_SITE_URL`
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

Commande de vérification complète :

```bash
npm run check
```

## CI GitHub

Le workflow [ci.yml](</D:\St0ckage\OneDrive\Documents\GitHub\nowesport\.github\workflows\ci.yml>) exécute automatiquement :

- installation
- lint
- build

à chaque `push` et `pull_request`.

## Vercel

Le projet est compatible avec Vercel sans script custom.

À configurer dans Vercel :

1. importer le repo GitHub
2. définir les variables d'environnement
3. connecter Supabase et Stripe côté domaine réel
4. créer le webhook Stripe vers `/api/stripe/webhook`

## Stripe

La documentation de raccord Stripe/Supabase est ici :

- [stripe/README.md](</D:\St0ckage\OneDrive\Documents\GitHub\nowesport\stripe\README.md>)

## Supabase

Le schéma de base est ici :

- [supabase/schema.sql](</D:\St0ckage\OneDrive\Documents\GitHub\nowesport\supabase\schema.sql>)
- [supabase/README.md](</D:\St0ckage\OneDrive\Documents\GitHub\nowesport\supabase\README.md>)
