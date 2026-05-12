# Supabase setup

## 1. Exécuter le schéma

Ouvre le dashboard Supabase, puis :

1. va dans `SQL Editor`
2. crée une nouvelle requête
3. colle le contenu de `supabase/schema.sql`
4. exécute le script

## 2. Donner le rôle admin

Après ta première connexion, ton profil sera créé automatiquement dans `public.profiles`.

Pour te passer admin :

```sql
update public.profiles
set role = 'admin'
where email = 'ton-email@exemple.com';
```

## 3. Ce que fait ce schéma

- crée les tables profils, produits, variantes, commandes et contenus
- crée les tables équipes, rosters et membres
- active les politiques `RLS`
- crée automatiquement un profil à la création d'un utilisateur Supabase
- réserve les écritures complètes aux admins
- laisse les contenus publics en lecture
- laisse chaque client consulter ses propres commandes
