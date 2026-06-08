# Guide rapide — CMS admin NOW eSport

## Accéder au CMS

1. Connecte-toi avec un compte admin.
2. Ouvre **Admin > Contenu** (`/admin/content`).
3. Les modules métier restent séparés : produits dans `/admin/products`, événements dans `/admin/events`, partenaires dans `/admin/partners`, roster dans ses tables/module dédié.

## Modifier la home

1. Dans **Blocs éditoriaux**, cherche le bloc `home.hero`.
2. Modifie le titre, le texte, les CTA ou l’URL média.
3. Pour les sponsors, édite `metadata` avec une structure de ce type :

```json
{
  "poster": "/media/jersey.jpeg",
  "videoHref": "https://youtu.be/...",
  "sponsors": ["GENESIS", "leo express", "tp-link"]
}
```

4. Clique sur **Sauvegarder le bloc**.

## Modifier la maintenance

1. Cherche le bloc `maintenance.main`.
2. Modifie le titre, le texte, le CTA contact ou le lien de connexion admin.
3. Sauvegarde le bloc.
4. Le mode maintenance reste activé/désactivé dans **Admin > Paramètres**.

## Modifier la navigation

1. Dans la section **Navigation**, ajoute ou modifie un lien.
2. Choisis la langue `FR` ou `EN`.
3. Choisis l’emplacement : `Header` ou `Footer légal`.
4. Le lien doit être :
   - un chemin interne commençant par `/`, par exemple `/shop` ;
   - ou une URL `https://...` ;
   - ou un lien `mailto:...`.
5. Coche **Actif** pour publier le lien.

## Modifier les liens sociaux

1. Dans **Réseaux sociaux**, renseigne la plateforme, le libellé et l’URL.
2. Les liens sociaux doivent être des URL externes valides (`https://...`).
3. Coche **Actif** pour publier le lien.

## Gérer FR/EN

- Chaque bloc existe en `FR` et en `EN`.
- Le bouton FR/EN du site pose le cookie `now-locale`, puis recharge la page pour relire les textes serveur.
- Si le contenu Supabase EN est absent pour un bloc, le site essaie d’utiliser la version FR publiée.
- Si Supabase n’est pas configuré ou si les tables CMS ne sont pas encore appliquées, le site utilise les fallbacks locaux.

## Erreurs fréquentes

- **JSON invalide** : vérifie les guillemets doubles, les virgules et les accolades.
- **URL invalide** : utilise `https://...`, `mailto:...` ou un chemin interne `/...` selon le champ.
- **Champ obligatoire manquant** : le titre des blocs, les libellés et les liens de navigation doivent être remplis.
