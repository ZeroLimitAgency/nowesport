# Stripe + Supabase

## Modele retenu

- `Supabase` pilote le contenu du site et l'affichage produit
- `Stripe` pilote le paiement reel et les prix
- le lien entre les deux se fait via :
  - `products.stripe_product_id`
  - `products.stripe_price_id`

## Etat cible

Le flux de reference doit rester :

- GitHub pour le code
- Vercel pour l'execution
- Supabase pour les donnees
- Stripe pour le paiement

Aucun fichier local ne doit etre necessaire au fonctionnement du checkout en production.

## Etapes a faire dans Stripe

1. Creer le produit dans Stripe
2. Creer le prix associe dans Stripe
3. Copier le `price_id` Stripe
4. Le coller dans `public.products.stripe_price_id` cote Supabase
5. Facultatif mais recommande : copier aussi le `product_id` Stripe dans `public.products.stripe_product_id`

## Exemple SQL

```sql
update public.products
set
  stripe_product_id = 'prod_xxxxx',
  stripe_price_id = 'price_xxxxx'
where slug = 'maillot-crystal-2026';
```

## Webhook Stripe a creer

Creer un endpoint Stripe pointant vers un domaine cloud actif du projet :

```txt
https://nowesport.vercel.app/api/stripe/webhook
```

Puis recuperer le secret `whsec_...` et le mettre dans les variables d'environnement du projet :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## Evenements deja geres

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`

## Pages et routes deja branchees

- checkout integre produit : `/checkout/[slug]`
- creation session embedded : `/api/checkout/embedded-session`
- webhook Stripe : `/api/stripe/webhook`
- fallback hosted checkout : `/api/checkout/session`
- deploiement recommande : GitHub -> Vercel

## Checklist avant validation complete

1. Creer au moins un produit et un prix dans Stripe
2. Renseigner `stripe_price_id` dans Supabase pour le produit correspondant
3. Verifier les variables Vercel Stripe et Supabase
4. Declarer le webhook Stripe sur le domaine Vercel actif
5. Realiser un achat test complet jusqu'a l'ecriture dans `orders` et `order_items`
6. Ne considerer la prod Stripe comme validee qu'apres ce test de bout en bout
