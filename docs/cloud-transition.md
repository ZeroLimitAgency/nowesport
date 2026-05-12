# Transition GitHub / Codex Cloud

## Objectif

Faire de `GitHub + Codex Cloud + Vercel` l'environnement principal du projet, tout en conservant la compatibilité locale.

## Dépendances encore locales identifiées

### 1. Lancement manuel du serveur

- Le local peut encore utiliser :
  - `scripts/start-production.cmd`
  - `scripts/start-production.sh`
- Ce n'est plus le chemin principal pour exploiter le projet.
- En cloud, l'exécution cible est :
  - GitHub Actions pour la validation
  - Vercel pour l'hébergement et l'exécution

### 2. Variables d'environnement

- Le local dépend de `.env.local`
- En cloud, la source de vérité doit être :
  - Vercel Environment Variables
  - éventuellement GitHub Secrets pour certains workflows futurs

### 3. Configuration Stripe / Supabase manuelle

- La création des produits Stripe, webhooks et variables reste manuelle
- Mais l'application n'a plus besoin d'un PC allumé pour fonctionner une fois déployée

## Ce qui est déjà prêt côté cloud

- CI GitHub via `.github/workflows/ci.yml`
- Build Next.js autonome
- Auth Supabase compatible Vercel
- Checkout Stripe intégré
- Webhook Stripe serveur
- Schéma Supabase versionné dans le repo

## Bonnes pratiques de travail

- Travailler sur une branche dédiée
- Ouvrir une PR avant fusion
- Ne jamais pousser des secrets dans le code
- Définir les URLs de production dans `NEXT_PUBLIC_SITE_URL`

## Prochaines améliorations cloud recommandées

1. Ajouter une preview Vercel par PR si ce n'est pas déjà activé côté Vercel
2. Ajouter une stratégie de migrations Supabase plus outillée
3. Ajouter un workflow de vérification des variables critiques
4. Éventuellement remplacer le `middleware.ts` par `proxy.ts` quand le setup sera stabilisé
