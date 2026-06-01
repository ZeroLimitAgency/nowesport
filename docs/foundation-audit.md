# Audit des fondations NOW eSport

## Routes privées

| Route | Protection attendue | État |
| --- | --- | --- |
| `/admin` | `requireAdmin()` | Protégée, redirige vers `/login?next=/admin` si Supabase/session absente, puis `/compte` si non-admin. |
| `/admin/*` | `requireAdmin()` | Dashboard, produits, commandes, utilisateurs, événements, partenaires et settings appellent tous `requireAdmin()`. |
| `/account` | redirection canonique | Redirige vers `/compte`, qui appelle `requireUser()`. |
| `/compte` | `requireUser('/compte')` | Protégée, historique commandes seulement après session. |
| `/profile` | `requireUser('/profile')` | Protégée, édition profil via server action. |
| `/profil` | redirection canonique | Redirige vers `/profile`, qui appelle `requireUser()`. |
| `/cart` | public avec persistance locale | Panier consultable publiquement ; l'API `/api/cart` ne renvoie un panier Supabase que pour une session connectée. |
| `/panier` | redirection canonique | Redirige vers `/cart`. |

Correction appliquée : l'absence de configuration Supabase ne laisse plus accéder à `/admin`; `requireAdmin()` redirige vers `/login?next=/admin`.

## Schéma Supabase et RLS

Tables auditées : `profiles`, `games`, `rosters`, `roster_members`, `partners`, `events`, `products`, `product_variants`, `carts`, `cart_items`, `orders`, `order_items`, `order_status_events`, `inventory_movements`, `site_settings`.

- RLS est activée sur toutes les tables applicatives.
- Les tables publiques ne sont lisibles que via un flag public (`is_public`, `is_active`) et les variantes publiques vérifient maintenant que leur produit parent est public.
- Les tables sensibles (`profiles`, `carts`, `cart_items`, `orders`, `order_items`, `order_status_events`, `inventory_movements`) sont limitées au propriétaire ou à `public.is_admin()`.
- `site_settings` est lisible publiquement uniquement pour les clés marquées `is_public`; l'écriture reste admin-only.
- Le modèle `news` n'existe plus dans le schéma.

Correction appliquée : la policy publique des variantes produit vérifie le produit parent afin d'éviter d'exposer le stock d'un produit privé.

## Maintenance et preview

- Par défaut, le proxy sert la maintenance si `site_settings.maintenance_mode` vaut `true` ou si le fallback `NEXT_PUBLIC_MAINTENANCE_MODE` n'est pas `off`.
- Les visiteurs publics voient la maintenance.
- Le cookie `now-preview=1` contourne la maintenance.
- `/api/admin/preview` pose le cookie après token `PREVIEW_SECRET` valide ou e-mail admin autorisé.
- `/api/admin/preview/clear` supprime le cookie.
- Les routes `/api`, `/auth/callback`, `/login`, `/admin/preview`, `/maintenance`, `/favicon.ico`, `/_next/*` et `/media/*` restent accessibles pour auth, API et assets.

## Auth flow

- Signup : `AuthPanel` utilise `supabase.auth.signUp()` avec callback sécurisé vers la destination demandée.
- Login : `signInWithPassword()` puis redirection vers `nextPath` validé côté page login.
- Logout : `signOut()` puis retour `/login`.
- Reset password : `resetPasswordForEmail()` redirige vers `/auth/update-password`.
- Update password : `updateUser({ password })` depuis la page dédiée.
- Session persistante : `updateSession()` est appelé par le proxy sur les routes autorisées et les routes en preview.

Correction appliquée : l'inscription ne force plus un pseudo dérivé de l'e-mail pour éviter une collision `profiles.username`.

## UX sans Supabase configuré

- `/login` affiche un message de configuration manquante.
- Les routes privées client redirigent vers `/login` plutôt que de crasher.
- Les pages catalogue/panier utilisent un fallback local contrôlé.
- L'admin n'est pas accessible sans session Supabase admin.

## Absence de news active

Vérification attendue : `rg -n "news|News|/news|actualités|actualites|actus" src supabase` ne doit rien retourner. Les mentions documentaires dans `docs/` décrivent uniquement l'audit de suppression.
