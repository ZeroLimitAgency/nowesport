# Supabase setup

## 1. Exécuter le schéma

Ouvre le dashboard Supabase, puis :

1. va dans `SQL Editor`
2. crée une nouvelle requête
3. colle le contenu de `supabase/schema.sql`
4. exécute le script sur un projet Supabase frais
5. si Supabase répond qu'un objet existe déjà (`type ... already exists`, `relation ... already exists`, etc.), utilise la dernière version du fichier : elle est idempotente pour les types, tables, index, triggers et policies, puis relance le script complet
6. exécute ensuite `supabase/verify.sql` pour vérifier les enums, tables, policies, triggers et settings requis

## 2. Donner le rôle admin

Après ta première connexion, ton profil est créé automatiquement dans `public.profiles` par le trigger `handle_new_user()`.

Pour te passer admin :

```sql
update public.profiles
set role = 'admin'
where lower(email) = lower('ton-email@exemple.com');
```

Déconnecte-toi/reconnecte-toi ensuite, puis ouvre `/admin` ou `/api/admin/preview?next=/`.

## 3. Ce que fait ce schéma

- crée les tables profils, produits, variantes, commandes et contenus
- crée les tables équipes, rosters et membres
- active les politiques `RLS`
- crée automatiquement un profil à la création ou mise à jour d'un utilisateur Supabase
- réserve les écritures complètes aux admins via `public.profiles.role = 'admin'`
- laisse les contenus publics en lecture
- laisse chaque client consulter ses propres commandes
- initialise `site_settings.maintenance_mode` pour piloter la maintenance

## 4. Checklist de déploiement

La checklist complète est dans `docs/supabase-deployment-checklist.md`.
