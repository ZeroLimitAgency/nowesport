# Guide de test admin NOW eSport

## 1. Créer un admin Supabase

1. Crée un utilisateur dans Supabase Auth (e-mail + mot de passe ou invitation).
2. Ouvre le SQL Editor Supabase.
3. Remplace l'e-mail ci-dessous puis exécute :

```sql
update public.profiles
set role = 'admin'
where email = 'admin@nowesport.org';
```

4. Vérifie que le profil existe et que `role = 'admin'` :

```sql
select id, email, role
from public.profiles
where email = 'admin@nowesport.org';
```

## 2. Accéder à `/admin`

1. Va sur `/login`.
2. Connecte-toi avec l'e-mail admin.
3. Ouvre `/admin`.
4. Un utilisateur non-admin doit être renvoyé vers `/compte`.

## 3. Activer la preview pendant la maintenance

### Depuis un compte admin

1. Connecte-toi avec un profil `role = 'admin'`.
2. Ouvre `/api/admin/preview?next=/`.
3. Le cookie `now-preview` est posé pour permettre de voir le site malgré la maintenance.
4. Pour sortir de la preview : `/api/admin/preview/clear`.

### Avec un token serveur

1. Définis `PREVIEW_SECRET` dans l'environnement.
2. Ouvre `/api/admin/preview?token=TON_SECRET&next=/admin`.

## 4. Créer un produit

1. Ouvre `/admin/products`.
2. Remplis au minimum : `Nom`, `Slug`, `Type`, `Prix cents`, `Devise`.
3. Coche `Actif / public` si le produit doit apparaître en boutique.
4. Enregistre.
5. Vérifie que le produit apparaît dans la liste admin puis sur `/shop` si public.

## 5. Créer une variante

1. Dans `/admin/products`, ouvre le bloc du produit.
2. Dans le formulaire `Ajouter variante`, remplis `Nom`, `SKU`, `Taille`, `Couleur`, `Stock`.
3. Coche `Variante active`.
4. Enregistre.
5. Vérifie que le stock agrégé du produit augmente et que la variante est listée.

## 6. Tester le panier

1. Ouvre `/cart` en preview ou hors maintenance.
2. Ajoute un produit depuis la sélection.
3. Utilise `+` et `-` pour modifier la quantité.
4. Vérifie le total.
5. Descends la quantité à `0` pour supprimer la ligne.
6. Si un stock est défini, vérifie que la quantité ne dépasse pas le stock disponible.

## 7. Changer le statut d'une commande

1. Ouvre `/admin/orders`.
2. Choisis une commande.
3. Sélectionne un statut : `pending`, `paid`, `processing`, `shipped`, `completed`, `refunded`.
4. Ajoute un message d'historique.
5. Enregistre.
6. Ouvre `/admin/orders/[id]` et vérifie que l'historique contient l'événement.

## 8. Variables d'environnement à vérifier

- Supabase : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Preview : `PREVIEW_SECRET`, optionnellement `ADMIN_PREVIEW_EMAILS`.
- Maintenance : `NEXT_PUBLIC_MAINTENANCE_MODE` en fallback si `site_settings` n'est pas disponible.
- Stripe placeholder : `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- Site URL : `NEXT_PUBLIC_SITE_URL`.
