# Audit UX admin NOW eSport

## Synthèse
Le panel admin existant fonctionnait côté backend, mais l’expérience ressemblait trop à une table Supabase : champs techniques affichés trop tôt, formulaires longs, hiérarchie faible, états vides pauvres et CTA peu orientés métier. La refonte appliquée garde les actions et tables existantes, mais introduit un système UI admin réutilisable et des écrans plus lisibles.

## Problèmes identifiés par page
- `/admin` : dashboard trop pauvre, pas de statut maintenance réel, pas de raccourcis métier, métriques globales incomplètes.
- `/admin/content` : CMS présenté comme une liste plate de blocs techniques, metadata JSON visible par défaut, langues FR/EN peu guidées.
- `/admin/media` : vocabulaire bucket/dossier trop visible, CTA d’import pas assez prioritaire, état vide minimal, URL technique trop centrale.
- `/admin/products` : formulaire façon SQL avec slug, Stripe IDs, cents et ordre au premier niveau ; CTA génériques ; variantes peu séparées du reste.
- `/admin/roster` : écran dense, ordre/slug visibles trop tôt, création équipe et membres difficiles à distinguer, cartes membres noyées dans les formulaires.
- `/admin/events` : formulaire peu visuel, slug/ordre visibles trop tôt, pas d’introduction métier claire.
- `/admin/partners` : slug et ordre affichés au premier écran, wording “rôle” plus technique que “catégorie/type”.
- `/admin/orders` : liste fonctionnelle mais sans header métier, statuts peu lisibles, état vide non actionnable.
- `/admin/settings` : wording trop technique autour de Supabase/site_settings, statut maintenance pas assez visible.
- `/admin/users` : liste brute sans header, rôle non mis en évidence, état vide faible.

## Corrections appliquées
- Création des composants UI admin réutilisables : `AdminPageHeader`, `AdminSection`, `AdminCard`, `AdminToolbar`, `AdminEmptyState`, `AdminFormGrid`, `AdminField`, `AdminAdvancedPanel`, `AdminDangerZone`, `AdminStatusBadge`, `AdminActionButton`.
- Dashboard enrichi avec statut maintenance, raccourcis métier et compteurs produits, événements, partenaires, rosters, commandes et utilisateurs.
- Roster clarifié : logique “un roster = une équipe”, header explicatif, slug et ordre déplacés dans options avancées, membres présentés en cartes.
- Media manager réorienté vers l’import simple : CTA “Importer un média”, choix par contexte métier, bucket/dossier en options avancées, état vide avec CTA.
- Produits réorganisés : informations principales visibles d’abord, slug/Stripe/ordre cachés en options avancées, CTA plus explicites.
- Événements et partenaires : headers métier, champs techniques déplacés dans options avancées, états Supabase non configuré plus lisibles.
- CMS : metadata JSON cachée dans options avancées et header clarifiant les zones éditoriales.
- Commandes, paramètres et utilisateurs : headers admin cohérents, badges de statut et états vides propres.

## Boutons cassés ou risqués
Aucun bouton cassé n’a été confirmé par les checks statiques. Les actions de suppression restent les server actions existantes ; elles sont maintenant mieux signalées visuellement sur plusieurs pages, mais une confirmation client dédiée reste une limite à traiter si l’équipe veut bloquer les clics accidentels.

## Limites restantes
- Pas de nouvelle grosse feature ajoutée : la refonte reste volontairement structurelle et visuelle.
- Le drag & drop média repose sur le comportement navigateur du champ fichier ; aucune zone client enrichie n’a été ajoutée.
- Certaines suppressions n’ont pas encore de confirmation JavaScript dédiée afin de ne pas réécrire les server actions.
- Les pages gardent les schémas Supabase existants et leurs contraintes de validation côté serveur.
