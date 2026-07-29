# Checklist SEO de lancement

## Déploiement et domaine

- [ ] Pointer et valider `https://nowesport.org`, forcer HTTPS et une seule variante d'hôte.
- [ ] Définir `NEXT_PUBLIC_MAINTENANCE_MODE=off` et contrôler la valeur `maintenance_mode` dans Supabase : la base est prioritaire.
- [x] Tester localement la home maintenance en 200 et les hubs suspendus en `503`, `Retry-After: 3600` et `X-Robots-Tag: noindex, nofollow, noarchive`.
- [x] Contrôler les redirections 308 des anciennes routes.

## Indexation

- [ ] Ouvrir `/robots.txt` et `/sitemap.xml` en production.
- [x] Vérifier automatiquement que le sitemap normal ne contient aucune route privée et que le sitemap maintenance ne contient que la home.
- [x] Tester les fixtures de publication, les fiches absentes (404) et les espaces privés (`noindex`).
- [x] Valider automatiquement les canonical et aperçus Open Graph sur l'hôte officiel.

## Search Console et outils

- [ ] Créer une propriété Domaine Google Search Console et valider le DNS.
- [ ] Facultativement définir `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` avec la valeur publique fournie par Google ; ne jamais y placer un secret.
- [ ] Soumettre `https://nowesport.org/sitemap.xml`, inspecter l'accueil et surveiller Pages, Core Web Vitals et améliorations.
- [ ] Ajouter Bing Webmaster Tools si retenu et y soumettre le même sitemap.
- [ ] Ne déployer un outil analytics qu'après choix documenté, mécanisme de consentement et exclusion des previews/admin ; tester qu'aucun traceur soumis au consentement ne part avant accord.

## Validation des données

- [ ] Compléter les textes juridiques avec le conseil compétent et leur date de mise à jour.
- [ ] Retirer ou remplacer les textes et médias de démonstration avant lancement.
- [ ] Tester les données structurées avec Rich Results Test et Schema Markup Validator.
- [ ] Tester les images sur mobile, les dimensions, le LCP et le CLS avec PageSpeed Insights ou Lighthouse sur la production.

## Stratégie SEO pendant la maintenance

- [x] Home : 200, `index, follow`, canonical NOW, Open Graph, `Organization` et `WebSite`.
- [x] Robots : racine autorisée, espaces techniques/privés bloqués, sitemap officiel déclaré.
- [x] Sitemap : une seule URL, `https://nowesport.org/`.
- [x] Hubs internes : 503, noindex en header, Retry-After, contenu distinct de la home.
- [x] Admin/auth/API/preview : accessibles à leurs contrôles habituels, jamais indexables.
- [ ] Rejouer `npm test` sur l'artefact exact déployé après configuration des variables de production.
