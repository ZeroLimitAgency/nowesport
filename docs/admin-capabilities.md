# Fonctionnalités admin réellement utilisables

## Produits

- Liste des produits Supabase avec statut public/inactif, type physique/numérique, prix, image, IDs Stripe préparatoires et stock agrégé.
- Création et édition de produits depuis `/admin/products`.
- Suppression de produits depuis `/admin/products`.
- Publication/dépublication via action dédiée.
- Création, édition et suppression de variantes avec SKU, taille, couleur, stock, prix optionnel, prix Stripe et statut actif.
- Fallback catalogue local visible uniquement si Supabase ne renvoie aucun produit réel.

## Commandes

- Liste des commandes depuis `/admin/orders` avec e-mail client, statut de paiement, total, date et lignes de commande.
- Page détail `/admin/orders/[id]` avec informations de livraison, lignes, total et historique.
- Changement de statut parmi `pending`, `paid`, `processing`, `shipped`, `completed`, `refunded`.
- Écriture d'un événement dans `order_status_events` à chaque changement de statut.

## Événements

- Liste Supabase des événements depuis `/admin/events`.
- Création, édition et suppression.
- Champs disponibles : slug, titre, date, lieu, description, image, URL externe, ordre.
- Publication/dépublication via `is_public`.

## Partenaires

- Liste Supabase des partenaires depuis `/admin/partners`.
- Création, édition et suppression.
- Champs disponibles : slug, nom, rôle, logo, URL externe, description, ordre.
- Publication/dépublication via `is_public`.

## Limites volontairement conservées avant Stripe réel

- Les formulaires préparent les IDs Stripe mais ne créent pas encore les produits/prix Stripe.
- Le panier reste local côté navigateur avec une API de lecture Supabase pour utilisateur connecté.
- Les suppressions sont directes et devront recevoir une confirmation UI plus avancée plus tard.
