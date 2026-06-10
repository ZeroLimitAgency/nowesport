# Media Manager NOW eSport

Le Media Manager permet aux admins NOW eSport de gérer les fichiers publics sans ouvrir Supabase Studio. Il s’appuie sur Supabase Storage et sur les politiques SQL du schéma projet.

## Buckets

Les buckets créés par `supabase/schema.sql` sont :

| Bucket | Usage | Formats | Limite |
| --- | --- | --- | --- |
| `products` | Images produit boutique | `png`, `jpg`, `jpeg`, `webp` | 8 Mo |
| `roster` | Images roster / joueurs / équipes | `png`, `jpg`, `jpeg`, `webp` | 8 Mo |
| `partners` | Logos et visuels partenaires | `png`, `jpg`, `jpeg`, `webp` | 8 Mo |
| `events` | Visuels événementiels | `png`, `jpg`, `jpeg`, `webp` | 8 Mo |
| `cms` | Médias de blocs CMS, home et maintenance | `png`, `jpg`, `jpeg`, `webp`, `mp4` | 50 Mo |

Tous les buckets sont publics pour permettre au front de charger les médias publiés via les URL Supabase publiques.

## Permissions

Les politiques Storage ajoutées au schéma appliquent les règles suivantes :

- lecture publique des objets dans `products`, `roster`, `partners`, `events` et `cms` ;
- upload réservé aux profils dont `public.profiles.role = 'admin'` via la fonction `public.is_admin()` ;
- modification et suppression réservées aux admins ;
- les actions de l’interface `/admin/media` appellent `requireAdmin()` avant tout upload ou delete.

## Limites fichiers

La validation existe à deux niveaux :

1. Supabase Storage bloque les MIME types et la taille via les colonnes `allowed_mime_types` et `file_size_limit` des buckets.
2. Les actions serveur Next.js refusent les fichiers vides, les MIME types non autorisés, les extensions non autorisées et les fichiers trop lourds.

Limites applicatives :

- images : 8 Mo maximum ;
- vidéos MP4 : 50 Mo maximum ;
- extensions image : `png`, `jpg`, `jpeg`, `webp` ;
- vidéo CMS : `mp4`.

## Uploader un média

1. Aller dans **Admin → Médias** (`/admin/media`).
2. Choisir le bucket correspondant : Produits, Roster, Partenaires, Événements ou CMS.
3. Optionnellement saisir un dossier, par exemple `home/hero` ou `maillots/2026`.
4. Sélectionner le fichier puis cliquer sur **Téléverser**.
5. Copier l’URL publique affichée sur la carte du fichier.

Le nom de fichier est normalisé et suffixé par un timestamp pour éviter les collisions.

## Utiliser une image dans le CMS

1. Uploader le média dans le bucket `cms` depuis `/admin/media?bucket=cms`.
2. Cliquer sur **Copier URL publique**.
3. Aller dans **Admin → Contenu** (`/admin/content`).
4. Coller l’URL dans le champ **Image / vidéo** du bloc voulu, ou sélectionner une URL déjà listée par le champ.
5. Sauvegarder le bloc.

Pour la home, le champ **Image / vidéo** pilote la vidéo ou le média principal du bloc hero. Le JSON `metadata.poster` peut contenir une URL publique d’image pour le poster vidéo.

## Utiliser un média dans les modules métier

Les pages admin suivantes proposent un champ média avec sélection des fichiers déjà présents dans le bucket correspondant, tout en gardant la saisie manuelle d’URL :

- `/admin/products` → bucket `products`, champ image produit ;
- `/admin/partners` → bucket `partners`, champ logo/visuel partenaire ;
- `/admin/events` → bucket `events`, champ image événement ;
- `/admin/content` → bucket `cms`, champ image/vidéo des blocs CMS.

## Limites restantes

- Le premier lot garde un champ URL manuel pour accélérer l’intégration et permettre les URLs externes.
- La sélection se fait par champ avec `datalist` et copie d’URL depuis `/admin/media`, pas encore par modale riche.
- La page `/admin/media` liste les 100 premiers fichiers du bucket/dossier courant.
