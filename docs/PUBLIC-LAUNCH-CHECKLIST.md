# NOW Esport — Public launch checklist

Cette checklist sépare ce qui est garanti par le code de ce qui exige une décision ou une configuration humaine en production. Elle ne contient aucun secret.

## CODE COMPLETE

- [x] La racine reste une page de pré-lancement indexable en HTTP 200 lorsque la maintenance est active.
- [x] Les autres pages publiques renvoient HTTP 503 avec `Retry-After` et `X-Robots-Tag` pendant la maintenance.
- [x] Le sitemap de maintenance ne contient que `https://nowesport.org/`.
- [x] Les routes privées restent `noindex`.
- [x] Le hero possède un fallback graphique sans asset fictif ou manquant.
- [x] Une vidéo hero CMS valide conserve autoplay, muted, loop et playsInline avec un preload limité aux métadonnées.
- [x] Le catalogue masque les produits qui ne satisfont pas les critères commerciaux déterministes.
- [x] Les options universelles fictives ne sont plus affichées dans le shop.
- [x] Produits, rosters, partenaires et événements conservent des empty states sans fausses données.
- [x] Les URL externes publiques sont limitées à HTTP/HTTPS et sécurisées à l'ouverture.
- [x] Le menu mobile gère le focus, Échap et un focus trap léger.
- [x] Les liens et contrôles ont un focus visible.
- [x] Les requêtes CMS et maintenance sont dédupliquées dans une même passe de rendu, sans cache persistant.

## HUMAN / PRODUCTION CONFIGURATION REQUIRED

### Identité et contenu

- [ ] Fournir le vrai média hero dans le CMS, si une vidéo doit être diffusée.
- [ ] Fournir un poster réel via une URL HTTP/HTTPS, si la vidéo en nécessite un.
- [ ] Relire et publier les textes CMS finaux FR et EN.
- [ ] Vérifier que chaque sponsor affiché correspond à une relation réelle et validée.
- [ ] Vérifier les rosters, joueurs, rôles, photos, slugs et liens sociaux réels.
- [ ] Vérifier les partenaires, logos, descriptions et URL réels.
- [ ] Vérifier les événements, dates, lieux, images et URL réels.

### Informations légales obligatoires

Avant de désactiver la maintenance, fournir et faire valider dans le CMS :

- [ ] raison sociale ou identité exacte de l'éditeur ;
- [ ] forme juridique ;
- [ ] adresse du siège ou adresse légale publiable ;
- [ ] SIRET/SIREN et immatriculation, si applicables ;
- [ ] nom du représentant légal ;
- [ ] e-mail juridique et e-mail de support ;
- [ ] identité et coordonnées de l'hébergeur définitif ;
- [ ] politique de confidentialité définitive ;
- [ ] politique cookies conforme aux outils réellement activés ;
- [ ] CGU ;
- [ ] si le shop ouvre : CGV, rétractation/remboursement, livraison, zones, délais et produits personnalisés.

### Shop et paiement

- [ ] Décider explicitement si le shop est ouvert ou fermé au lancement.
- [ ] Si fermé, laisser tous les produits non prêts hors du catalogue public.
- [ ] Si ouvert, vérifier pour chaque produit : slug, nom, description, vraie image, prix positif, stock, variantes et Stripe Price ID.
- [ ] Configurer les clés Stripe live uniquement dans les variables d'environnement de production.
- [ ] Configurer et vérifier le webhook Stripe de production.
- [ ] Vérifier les pays, adresses et frais de livraison.
- [ ] Effectuer un achat réel de bout en bout, puis vérifier commande, paiement, stock, succès, annulation et compte client.

### Infrastructure et publication

- [ ] Vérifier le projet Supabase de production, les migrations déjà approuvées et les politiques RLS.
- [ ] Configurer les variables publiques et serveur nécessaires sans les copier dans ce document.
- [ ] Vérifier `maintenance_mode=true` pendant toute la recette.
- [ ] Vérifier le domaine `https://nowesport.org`, DNS, HTTPS et redirections.
- [ ] Réaliser une QA mobile réelle en 320×568, 375×667, 390×844, 430×932, 768×1024, 1024×768 et 1440×900.
- [ ] Vérifier navigation clavier, contrastes, contenus longs et absence d'overflow horizontal.
- [ ] Vérifier canonical, Open Graph, Twitter, robots, sitemap et JSON-LD sur le domaine final.
- [ ] Configurer et valider Google Search Console.
- [ ] Une fois tous les points précédents validés, passer `maintenance_mode` à `false` dans Supabase et contrôler immédiatement le site public.
