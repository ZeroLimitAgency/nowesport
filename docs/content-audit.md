# Audit contenu hardcodé et architecture CMS NOW eSport

## Objectif

Supabase reste la base de données, mais l’administrateur ne doit plus modifier les textes publics directement dans Supabase. Le contenu global est piloté depuis `/admin/content`, tandis que les modules métier restent séparés : produits, événements, partenaires et rosters.

## Audit des contenus hardcodés

| Zone publique | Contenu identifié | Statut CMS de cette livraison |
| --- | --- | --- |
| Home | Hero, texte, CTA, vidéo, poster, lien vidéo, sponsors | Migré vers `site_content_blocks` (`home.hero`) avec metadata JSON pour `sponsors`, `poster`, `videoHref`. |
| Shop | Intro de page, bannière, CTA | Migré vers `site_content_blocks` (`shop.intro`, `shop.banner`). Les produits restent dans `admin/products`. |
| Product page | Libellés d’interface produit et options génériques | Produits/variantes restent dans le module métier. Les options génériques restent en fallback local à migrer ensuite si besoin. |
| Roster | Intro de page | Migré vers `site_content_blocks` (`roster.intro`). Jeux, rosters et joueurs restent en tables métier. |
| Events | Intro de page | Migré vers `site_content_blocks` (`events.intro`). Les événements restent dans `admin/events`. |
| Partners | Intro de page | Migré vers `site_content_blocks` (`partners.intro`). Les partenaires restent dans `admin/partners`. |
| Maintenance | Titre, texte, CTA contact, lien admin | Migré vers `site_content_blocks` (`maintenance.main`). |
| Legal pages | Mentions légales, confidentialité, CGV | Migré vers `site_content_blocks` (`legal.*`) avec sections dans `metadata.sections`. |
| Header | Navigation FR/EN | Migré vers `site_navigation`. |
| Footer | Texte, liens légaux, réseaux sociaux | Texte migré vers `site_content_blocks` (`footer.main`), liens légaux vers `site_navigation`, réseaux vers `site_social_links`. |
| Traductions FR/EN | Header/footer et textes principaux | Le bouton FR/EN pose un cookie `now-locale` et recharge la route, donc les Server Components relisent réellement le contenu CMS de la langue choisie. |
| Images/vidéos | Hero, futures images/vidéos éditoriales | `media_url` sur les blocs et table `site_media` prévue. |

## Schéma CMS proposé

- `site_sections` : catalogue des zones éditoriales (`home`, `shop`, `maintenance`, `legal`, etc.).
- `site_content_blocks` : blocs éditables par langue avec titre, texte, CTA, media URL et metadata JSON.
- `site_navigation` : liens header et footer légal par langue.
- `site_social_links` : réseaux sociaux globaux.
- `site_media` : bibliothèque simple d’images, vidéos, embeds et fichiers.

## Séparation métier conservée

- `admin/products` reste responsable des produits, variantes, prix, Stripe et stock.
- `admin/events` reste responsable des événements.
- `admin/partners` reste responsable des partenaires.
- Les tables `games`, `rosters`, `roster_members` restent la source métier pour le roster.
- `admin/content` ne gère que le contenu global transverse.

## Implémentation progressive

Cette livraison pose la base CMS, les fallbacks de sécurité et la page d’édition globale. Les prochaines étapes recommandées sont :

1. Ajouter une vraie interface de bibliothèque média avec upload Supabase Storage.
2. Ajouter un module `/admin/roster` si l’administration roster doit être complète côté site.
3. Migrer les derniers micro-libellés d’interface produit vers un groupe `product.ui` si l’équipe veut une traduction exhaustive.
4. Brancher le HTML de maintenance du middleware sur le CMS si la page maintenance proxy doit aussi être 100 % dynamique.
