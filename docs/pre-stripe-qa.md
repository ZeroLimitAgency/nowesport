# QA métier pré-Stripe — NOW eSport

## 1. Parcours visiteur

- Maintenance : le proxy sert la maintenance aux visiteurs publics tant que `site_settings.maintenance_mode` vaut `true` ou que le fallback env reste actif.
- Preview admin : `/api/admin/preview` accepte un admin réel (`profiles.role = 'admin'`) ou le token explicite `PREVIEW_SECRET`.
- Clear preview : `/api/admin/preview/clear` supprime le cookie `now-preview`.
- Navigation publique : boutique, roster, events et partenaires restent accessibles en preview ou maintenance désactivée.
- News : aucune route, donnée ou lien actif dans `src`/`supabase`.

## 2. Parcours auth

- Login, logout, reset password et update password sont centralisés dans `AuthPanel` et `/auth/update-password`.
- `/compte` et `/profile` passent par `requireUser()`.
- `/profil` et `/account` redirigent vers les routes protégées canoniques.
- UX sans Supabase : `/login` affiche un message clair, les routes privées ne crashent pas.

## 3. Parcours boutique et panier

- Le catalogue public lit Supabase quand des produits publics existent.
- Les fallbacks mock produits/événements/partenaires/rosters ont été retirés des lectures publiques Supabase ; une absence de données réelles doit rester visible.
- Correction appliquée : une fiche produit non trouvée dans Supabase ne retombe plus sur un mock local ; un produit privé, supprimé ou absent renvoie 404.
- Les variantes publiques sont protégées par RLS et le stock est affiché dans le panier.
- Correction appliquée : le panier tolère un stockage local corrompu, affiche un état vide et plafonne l'incrément au stock disponible quand il existe.
- Suppression panier : décrémenter à 0 retire la ligne.

## 4. Parcours compte client

- Le profil est éditable via server action Supabase.
- Les commandes client sont lues depuis `orders` avec `order_items`.
- Les statuts alignés sont : `pending`, `paid`, `processing`, `shipped`, `completed`, `refunded`.
- L'historique d'achat reste vide proprement si aucune commande n'existe.

## 5. Parcours admin

- `/admin` et `/admin/*` appellent `requireAdmin()` et ne sont pas accessibles par simple URL.
- Produits : CRUD, statut actif/inactif, variantes CRUD, stock, image, type produit et champs Stripe préparatoires.
- Commandes : liste, détail, changement de statut et écriture d'historique.
- Événements : CRUD, publication/dépublication, image, URL, description.
- Partenaires : CRUD, publication/dépublication, logo, URL, description.
- Maintenance : toggle via `/admin/settings`.

## 6. Supabase/RLS

- Toutes les tables applicatives ont RLS activée.
- Un non-admin ne peut pas utiliser les actions admin car elles passent par `requireAdmin()` et les policies `public.is_admin()`.
- Les commandes utilisateur sont limitées au propriétaire (`user_id`) ou à son e-mail.
- Les produits publics restent visibles via `is_public = true`.
- Les produits privés ne fuitent pas via les variantes : la policy des variantes exige un produit parent public.

## 7. UX

- Mobile-first : les formulaires admin utilisent des grilles fluides et des cartes empilées.
- États vides : panier vide, aucune commande et absence de Supabase affichent des messages clairs.
- Absence d'image : les champs image/logo sont optionnels et n'empêchent pas la gestion.
- Erreurs Supabase : les server actions remontent le message Supabase afin d'éviter un échec silencieux.

## Bugs trouvés et corrections appliquées

1. Preview admin dépend maintenant de `profiles.role = 'admin'` ou du token explicite `PREVIEW_SECRET`.
2. Fiche produit publique ne retombe plus sur un mock local : un slug absent/non public renvoie 404.
3. Panier local pouvait crasher si `localStorage` contenait un JSON invalide ; correction avec reset automatique.
4. Quantités panier non plafonnées au stock ; correction avec plafonnement si stock connu.
5. Statut commande admin non validé côté server action ; correction avec liste blanche des statuts autorisés.
