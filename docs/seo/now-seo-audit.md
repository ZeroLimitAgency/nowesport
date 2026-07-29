# Audit SEO de lancement — NOW Esport

Date : 29 juillet 2026. Domaine canonique : `https://nowesport.org`.

## 1. Verdict avant / après

### Avant — non prêt

Le domaine dépendait d'une variable publique pouvant accepter une URL de preview ; les métadonnées publiques étaient presque toutes héritées et non spécifiques ; le sitemap contenait connexion, compte, panier et doublons, attribuait la date courante à toutes les URL et pouvait échouer sur Supabase. Des routes alias étaient servies en 200. Les fiches n'avaient ni métadonnées dynamiques ni données structurées. Les zones privées n'avaient pas de politique uniforme `noindex`.

### Après — fondations prêtes, contenu à valider

Le domaine est centralisé et verrouillé, les routes publiques principales ont canonical et aperçus, les espaces privés sont `noindex`, les alias connus sont des 308, le sitemap est filtré et tolérant aux erreurs, et les fiches publiées complètes alimentent automatiquement les métadonnées et JSON-LD. Le lancement reste conditionné au contenu réel, aux textes juridiques et aux vérifications de production.

## 2. Priorités de l'audit

### Bloquants corrigés

- URLs privées et alias dans le sitemap ;
- absence de `noindex` homogène sur admin, auth, checkout, panier et compte ;
- canonical susceptible d'utiliser une valeur Vercel/locale ;
- réponse maintenance dupliquée : le proxy renvoie déjà un vrai `503` avec `X-Robots-Tag` et conserve l'accès admin/preview ;
- fiches absentes déjà traitées avec `notFound()`, donc vraie 404.

### Importants corrigés

- métadonnées dédiées et dynamiques ;
- Open Graph/Twitter et image 1200 × 630 générée localement, sans police distante ;
- données structurées sécurisées contre l'injection de balise ;
- redirections permanentes des variantes françaises et de `/teams` ;
- manifeste et méthode de vérification Search Console.

### Améliorations restantes

- ajouter une table d'historique des slugs et une redirection pilotée par la base ; l'admin normalise déjà les nouveaux slugs, mais ne conserve pas encore les anciens ;
- ajouter des pages événement individuelles seulement lorsque le modèle fournit slug, dates ISO, statut, lieu et contenu suffisant ;
- migrer les images de contenu vers `next/image` après définition contractuelle des hôtes Supabase et des dimensions stockées ; les balises actuelles réservent leur espace par conteneur mais ne bénéficient pas de l'optimiseur ;
- ajuster la valeur actuelle de `Retry-After: 3600` si une fenêtre de maintenance plus précise est connue ;
- mesurer LCP/INP/CLS sur la production. La vidéo du hero (`preload="auto"`) est un candidat LCP/réseau à réévaluer et devrait idéalement utiliser un poster optimisé et `preload="metadata"`.

### Contenu à compléter

Les valeurs CMS livrées avec le dépôt comprennent des formulations de démonstration et des listes statiques (produits, jeux, membres, sponsors). Les fonctions publiques utilisent Supabase et retournent un état vide sans configuration, mais tous ces placeholders doivent être audités avant lancement. Ne pas les publier comme faits. Voir `now-content-checklist.md`.

## 3. Cartographie des routes

| Route | Type / rendu | Indexation | Canonical / sitemap | Risques et traitement |
|---|---|---|---|---|
| `/` | publique, serveur dynamique | oui | `/`, oui | Organization + WebSite ; contenu CMS à valider |
| `/shop` | publique, serveur | oui | `/shop`, oui | état vide propre ; liens produits publics |
| `/shop/[slug]` | dynamique, serveur, 404 si absent | conditionnelle | soi-même, si complet | noindex si description/prix manquent ; Product + breadcrumb si complet |
| `/roster` | publique, serveur | oui | `/roster`, oui | état vide ; liens vers équipes publiques |
| `/roster/[slug]` | dynamique, serveur, 404 si absent | conditionnelle | soi-même, si complet | noindex sans description ; breadcrumb |
| `/events` | publique, serveur | oui | `/events`, oui | aucune page détail actuelle ; aucun faux Event JSON-LD |
| `/partners` | publique, serveur | oui | `/partners`, oui | partenaires publics uniquement |
| `/legal/[slug]` | publique, serveur, liste fermée | oui | soi-même, oui | breadcrumb ; fond juridique à finaliser |
| `/boutique`, `/partenaires`, `/teams`, `/teams/[slug]` | alias | non, 308 | destination | duplication supprimée |
| `/login`, `/auth/*` | auth / route ou serveur | non | aucun | noindex/noarchive et robots.txt |
| `/admin`, `/admin/*` | privé serveur | non | aucun | authentification réelle + noindex/noarchive |
| `/account`, `/compte`, `/profile`, `/profil` | privé serveur | non | aucun | alias 308 ; session requise sur pages finales |
| `/cart`, `/panier` | transactionnel | non | aucun | alias 308 ; panier exclu |
| `/checkout/*` | transactionnel dynamique | non | aucun | noindex ; produit absent en 404 |
| `/maintenance` | technique serveur | non | aucun | noindex ; proxy public en 503 |
| `/api/*`, `/auth/callback` | Route Handlers | non | aucun | bloqués au crawl ; contrôle d'accès distinct |
| `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image` | métadonnées techniques | utilitaires | URL officielle | générés par conventions Next.js 16 |
| route inconnue | 404 serveur | non | aucun | `not-found.tsx`, vrai statut 404 |

Les paramètres `next`, `variant` et `quantity` n'ont aucune URL indexable : ils n'apparaissent pas au sitemap, et les segments concernés sont privés/noindex. La langue est le seul paramètre fonctionnel indirect, via cookie.

## 4. Métadonnées et indexation

- Global : modèle `%s | NOW Esport`, `metadataBase`, description neutre, auteur/éditeur organisationnel, manifest, canonical, Open Graph et Twitter.
- Publiques : `/shop`, `/roster`, `/events`, `/partners`, `/legal/[slug]`.
- Dynamiques : produit depuis nom/description/image/prix/slug ; roster depuis nom/description/jeu/catégorie/image/slug.
- Privées : layouts de segment pour admin, auth, login, checkout, compte, profil, panier et maintenance avec `noindex, nofollow, noarchive`.
- Une fiche incomplète n'est pas annoncée au sitemap et reçoit `noindex`. Une fiche inexistante appelle `notFound()`.

## 5. Sitemap

Routes statiques : accueil, boutique, roster, événements, partenaires et les pages légales reliées au footer. Routes dynamiques : produits publics avec nom, description et prix ; rosters publics avec nom et description. `updated_at` est utilisé quand présent ; aucune fausse date courante n'est injectée. La route est dynamique pour refléter les publications.

Les requêtes sont indépendantes, les erreurs sont journalisées côté serveur sans détail exposé au visiteur et les routes statiques restent disponibles si Supabase ou sa configuration manque. Admin, auth, compte, panier, checkout, alias, brouillons et contenus incomplets sont exclus.

En maintenance, la même source de vérité réduit automatiquement le sitemap à `https://nowesport.org/`. Aucun hub, contenu dynamique ou espace privé n'est alors annoncé.

## 6. Robots et maintenance

En fonctionnement normal, tous les contenus publics sont autorisés ; API, admin, auth, login, espaces personnels, transactionnels et maintenance sont interdits au crawl. Le sitemap et l'hôte officiels sont déclarés.

La source de vérité maintenance est `site_settings.maintenance_mode` dans Supabase ; l'environnement est seulement le fallback. En maintenance, robots autorise la racine et continue de déclarer le sitemap, tout en bloquant les espaces techniques et privés. Le proxy sert la racine en 200, suspend les hubs internes en 503 avec `Retry-After` et `X-Robots-Tag: noindex, nofollow, noarchive`, et conserve login, callback, administration protégée, preview, API et assets. `robots.txt` n'est jamais présenté comme une protection d'accès.

## Stratégie SEO pendant la maintenance

- `/` reste en HTTP 200 et `index, follow` : cette page de pré-lancement contient un H1, le nom et le logo NOW Esport, une description sobre, le canonical officiel, Open Graph/Twitter et les graphes `Organization`/`WebSite`.
- `/shop`, `/roster`, `/events`, `/partners` et leurs contenus sont suspendus en 503. Ils ne recopient jamais la home et portent un header `noindex, nofollow, noarchive` ainsi que `Retry-After: 3600`.
- `/robots.txt` ne contient pas `Disallow: /` en production : le crawler doit pouvoir explorer la home et constater les statuts/headers des contenus suspendus.
- `/sitemap.xml` ne contient que la home. Il retrouve automatiquement son contenu complet dès que `site_settings.maintenance_mode` vaut `false` (ou que le fallback vaut `off` sans Supabase).
- `/admin`, `/login`, `/auth/callback`, `/api`, les routes de preview et les assets restent accessibles à leur logique normale. L'administration continue d'exiger une session et un rôle admin ; toutes les interfaces privées restent `noindex`.
- Les tests HTTP natifs Node démarrent le vrai build Next.js successivement avec le fallback activé puis désactivé et vérifient statuts, headers, robots, sitemap, canonical et JSON-LD.

## 7. Données structurées

- accueil : `Organization` et `WebSite`, limités au nom, URL, logo et description réels ; aucun fondateur, adresse, récompense ou partenaire inventé ;
- fiches : `BreadcrumbList` ;
- produit : `Product` et `Offer` uniquement pour un produit public disposant d'un prix et d'une description ; stock dérivé des variantes ;
- aucun `Event` ou `FAQPage` sans page et contenu visible suffisamment complet.

Le helper sérialise côté serveur et échappe `<` conformément au guide Next.js afin de limiter l'injection JSON-LD.

## 8. URLs, canonical et changements de slug

`https://nowesport.org` est la seule origine SEO. `trailingSlash: false` fixe une forme canonique et Next.js normalise les slashs. Les alias connus redirigent en 308. Les slugs admin sont normalisés en minuscules ASCII.

Limite : il n'existe pas encore de modèle `slug_history`. Avant de rendre un slug éditable en production, créer cette table avec type, ancien slug, nouveau slug, date et unicité, puis résoudre l'ancien slug via `permanentRedirect()`. Ne pas changer un slug publié avant cette migration.

## 9. Boutique, roster et événements

La boutique ne génère pas de fiches fictives et n'expose que `is_public=true`. Les variantes restent sur l'URL canonique du produit ; les paramètres de checkout sont noindex. Un produit épuisé peut rester indexable et indique `OutOfStock`; un produit sans prix/description est exclu.

Les équipes publiques sont rendues dans le HTML serveur et liées depuis le hub. Les joueurs restent intégrés à l'équipe : aucune page individuelle pauvre n'est créée. Les événements sont rendus sur la liste ; l'absence actuelle de slug et de page détail empêche volontairement `Event` et les URL événementielles.

## 10. Performance et images

Aucune Google Font ni import distant de police n'est présent : la pile système rend le build autonome. L'image Open Graph est générée localement. Les composants publics restent Server Components ; seul le shell de navigation et les contrôles interactifs hydratent du JavaScript.

Les images Supabase restent des `<img>` car le schéma ne stocke pas encore largeur/hauteur et les hôtes ne sont pas contractualisés. Avant migration vers `next/image`, ajouter dimensions/alt au CMS, configurer des `remotePatterns` stricts et s'assurer que les URL sont publiques et non signées. Auditer la vidéo hero, les animations, le menu et les grilles avec données réelles sur mobile.

## 11. Multilingue

La langue dépend actuellement du cookie `now-locale` sur une URL identique. Le document reçoit le bon `lang`, mais une même URL ne permet pas à un crawler de sélectionner et stabiliser deux versions ; aucun `hreflang` n'est donc ajouté artificiellement.

Migration recommandée : routes `/fr/...` et `/en/...`, contenu humainement validé, canonical propre à chaque langue, alternates `fr`, `en` et `x-default`, et variantes dans le sitemap. Conserver le sélecteur cookie uniquement comme préférence/redirection. Ne pas créer les URL anglaises avant que leur contenu soit complet.

## 13. Schéma Supabase et publication confirmés

Le schéma versionné confirme `products.slug`, `name`, `description`, `short_description`, `price_cents` (obligatoire), `currency`, `is_public`, `updated_at`; et `product_variants.price_cents`, `stock_quantity`, `is_active`. Il n'existe pas de colonne métier `status` sur les produits : la publication repose sur `is_public`. La règle SEO accepte un prix strictement positif du produit ou, si nécessaire, le prix positif le plus bas d'une variante active.

Pour les équipes, les colonnes sont `rosters.slug`, `name`, `description`, `is_public`, `is_active`, `updated_at`. Une équipe doit être publique, active, avoir un slug normalisé, un nom et une description. Les politiques RLS publiques limitent déjà les lectures anonymes à `is_public=true`; les requêtes applicatives ajoutent explicitement ces filtres et `is_active=true` pour les rosters.

## 14. Vérifications automatiques ajoutées

Les fixtures sans données sensibles couvrent produit complet, incomplet, privé, prix de variante, épuisé, sans image ; roster complet, incomplet, privé et inactif. Les tests valident également l'échappement JSON-LD, les URL officielles, les colonnes SQL, l'absence d'origine temporaire sur les surfaces SEO, les 404 dynamiques, les alias 308, le noindex privé et les deux modes HTTP de maintenance.

## 15. Maillage, analytics et actions manuelles

La navigation et le footer relient les hubs publics et pages légales ; les listes relient les fiches publiées, et les breadcrumbs renforcent les parcours profonds. Les pages privées ne sont pas ajoutées artificiellement au maillage SEO.

Aucun outil analytics n'est injecté. Toute future intégration doit attendre une décision, le consentement requis, la documentation des cookies, et exclure admin, preview et trafic interne. Les actions Search Console, domaine, sitemap, contenus et validation figurent dans `now-seo-launch-checklist.md`.
