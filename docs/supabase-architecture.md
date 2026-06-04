# NOW eSport — architecture Supabase cible

## Audit du schéma actuel

Le schéma existant couvre déjà une partie de la plateforme : profils, jeux, rosters, partenaires, événements, produits, variantes, commandes et lignes de commandes. Les manques pour passer d'une vitrine à une plateforme utilisable sont :

- le format `news` doit être retiré du schéma, des policies et des triggers ;
- les statuts de commande doivent être alignés sur le cycle demandé : `pending`, `paid`, `processing`, `shipped`, `completed`, `refunded` ;
- les profils doivent porter un pseudo public et des informations personnelles éditables ;
- le catalogue doit distinguer produits physiques et numériques, variantes et stock ;
- le panier doit être persistant pour les utilisateurs connectés ;
- la maintenance doit être pilotable par une table de paramètres et non uniquement par variable d'environnement ;
- l'admin doit pouvoir lire les métriques et gérer les contenus sans exposer ces écrans publiquement.

## Tables proposées

### Identité et accès

| Table | Rôle | Relations principales |
| --- | --- | --- |
| `profiles` | profil applicatif lié à `auth.users` | `id -> auth.users.id` |
| `user_addresses` | adresses livraison/facturation | `user_id -> profiles.id` |
| `user_audit_events` | historique sécurité/admin | `user_id -> profiles.id` |

Champs clés `profiles` : `role`, `email`, `username`, `full_name`, `avatar_url`, `phone`, `birthdate`, `country`, `city`, `marketing_opt_in`.

### Catalogue et stock

| Table | Rôle | Relations principales |
| --- | --- | --- |
| `products` | fiche produit physique/numérique | parent des variantes |
| `product_variants` | taille, couleur, SKU, prix Stripe optionnel | `product_id -> products.id` |
| `inventory_movements` | traçabilité du stock | `product_variant_id -> product_variants.id` |

Champs clés `products` : `product_type ('physical','digital')`, `fulfillment_type`, `requires_shipping`, `price_cents`, `stripe_product_id`, `stripe_price_id`, `metadata`.

### Panier et checkout

| Table | Rôle | Relations principales |
| --- | --- | --- |
| `carts` | panier actif par user ou invité | `user_id -> profiles.id` |
| `cart_items` | lignes panier persistantes | `cart_id -> carts.id`, `product_id`, `product_variant_id` |

Les invités utilisent `guest_token`. À la connexion, le panier local peut être fusionné vers le panier utilisateur actif.

### Commandes et achats

| Table | Rôle | Relations principales |
| --- | --- | --- |
| `orders` | commande complète | `user_id -> profiles.id` |
| `order_items` | lignes figées au moment de l'achat | `order_id -> orders.id` |
| `order_status_events` | timeline client/admin | `order_id -> orders.id` |
| `digital_entitlements` | accès numériques achetés | `order_item_id -> order_items.id`, `user_id -> profiles.id` |

Statuts `orders.status` : `pending`, `paid`, `processing`, `shipped`, `completed`, `refunded`.

### Contenu et réglages

| Table | Rôle | Relations principales |
| --- | --- | --- |
| `games`, `rosters`, `roster_members` | pages roster | `rosters.game_id`, `roster_members.roster_id` |
| `partners` | partenaires | autonome |
| `events` | événements | autonome |
| `site_settings` | paramètres globaux | clé unique |

`site_settings` contient notamment `maintenance_mode`, `maintenance_message`, `preview_notice`.

## RLS et sécurité

- Lecture publique uniquement pour contenus publiés : produits publics, variantes actives, rosters publics, partenaires publics, événements publics.
- Utilisateurs : lecture/modification de leur profil, adresses, panier et commandes.
- Admins : gestion complète via `public.is_admin()` basé sur `profiles.role = 'admin'`.
- Webhooks Stripe : écriture via service role uniquement.
- La maintenance en proxy lit seulement `site_settings.maintenance_mode` avec la clé publique ; l'écriture reste admin-only.

## Plan d'implémentation progressif

1. Nettoyer le schéma (`news` retiré) et ajouter les tables structurantes : profil enrichi, panier, settings, stock, statuts de commande.
2. Finaliser auth : inscription, connexion, déconnexion, reset password, session server, protection routes privées.
3. Vérifier les vues profil/compte contre Supabase réel sans fallback public.
4. Brancher panier local + persistance Supabase utilisateur, puis préparer checkout Stripe multi-lignes.
5. Créer l'admin `/admin` et ses sections : dashboard, produits, commandes, utilisateurs, événements, partenaires, paramètres.
6. Piloter la maintenance via `/admin/settings` et `site_settings`, avec fallback env pour les environnements non configurés.
7. Maintenir les lectures publiques sur les tables Supabase réelles et suivre les derniers contenus statiques dans le rapport readiness.
