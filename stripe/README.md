# Stripe + Supabase

## Modèle retenu

- `Supabase` pilote le contenu du site et l'affichage produit
- `Stripe` pilote le paiement réel et les prix
- le lien entre les deux se fait via :
  - `products.stripe_product_id`
  - `products.stripe_price_id`

## Étapes à faire dans Stripe

1. Créer le produit dans Stripe
2. Créer le prix associé dans Stripe
3. Copier le `price_id` Stripe
4. Le coller dans `public.products.stripe_price_id` côté Supabase
5. Facultatif mais recommandé : copier aussi le `product_id` Stripe dans `public.products.stripe_product_id`

## Exemple SQL

```sql
update public.products
set
  stripe_product_id = 'prod_xxxxx',
  stripe_price_id = 'price_xxxxx'
where slug = 'maillot-crystal-2026';
```

## Webhook Stripe à créer

Créer un endpoint Stripe pointant vers :

```txt
https://ton-domaine.com/api/stripe/webhook
```

Le local reste possible pour test, mais la cible principale devient maintenant le domaine cloud du projet.

Puis récupérer le secret `whsec_...` et le mettre dans les variables d'environnement du projet :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## Événements déjà gérés

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`

## Pages et routes déjà branchées

- checkout intégré produit : `/checkout/[slug]`
- création session embedded : `/api/checkout/embedded-session`
- webhook Stripe : `/api/stripe/webhook`
- fallback hosted checkout : `/api/checkout/session`
- déploiement recommandé : GitHub → Vercel
