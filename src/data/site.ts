export const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/shop" },
  { label: "Roster", href: "/roster" },
  { label: "Partenaires", href: "/partners" },
  { label: "Événements", href: "/events" },
  { label: "Panier", href: "/cart" },
  { label: "Compte", href: "/compte" },
];

export const promoItems = [
  '10 % avec le code "KEY10"',
  "Nouvelle collection Crystal",
  "Commande ton maillot 2026",
  "Première édition merch",
];

export const heroMedia = {
  badge: "Direction artistique Crystal",
  title: "Une entrée plein écran, nette et vivante",
  description:
    "La page d'accueil s'ouvre sur un hero pleine hauteur, avec une lecture immersive et une direction visuelle rose bonbon, noire et blanche.",
  primaryCta: "Découvrir la boutique",
  secondaryCta: "Voir les équipes",
  helper:
    "Vidéo immersive en arrière-plan, pensée pour poser l'identité NOW dès l'arrivée sur le site.",
  videoHref: "",
  videoSrc:
    process.env.NEXT_PUBLIC_HERO_VIDEO_URL ||
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  videoEmbedSrc: "",
};

export const homeHighlights = [
  {
    title: "NOW eSport",
    description:
      "Le bloc principal présente la structure, sa scène compétitive et son identité. Il sert de point d'entrée éditorial juste après le hero plein écran.",
  },
  {
    title: "NOW Academy",
    description:
      "L'académie met en avant le développement des talents et les rosters en construction, dans une lecture plus posée et plus structurée.",
  },
  {
    title: "NOW Studio",
    description:
      "Le studio couvre l'image, la création de contenu et les activations. Cette partie donne de la matière au site sans casser la direction artistique.",
  },
];

export const collectionItems = [
  {
    slug: "maillot-crystal-2026",
    name: "Maillot Crystal 2026",
    category: "Collection Crystal",
    price: "49,99 EUR",
    description:
      "Pièce centrale du drop, disponible avec tailles, flocage, numéro et variantes.",
    intro:
      "Le maillot Crystal 2026 est la pièce phare de la boutique, présentée avec ses informations essentielles et ses options.",
    details: [
      "Déclinaison principale de la collection Crystal.",
      "Zone prévue pour les visuels, les tailles et les variantes.",
      "Structure prête pour le flocage, le numéro et le pseudo.",
    ],
  },
  {
    slug: "version-manches-longues",
    name: "Version manches longues",
    category: "Performance",
    price: "59,00 EUR",
    description:
      "Déclinaison plus technique avec la même base visuelle pour les périodes plus froides et les activations indoor.",
    intro:
      "Une version plus couverte, pensée comme une extension du maillot principal pour l'entraînement et certaines activations.",
    details: [
      "Lecture plus technique et plus couvrante.",
      "Même direction visuelle que la pièce principale.",
      "Prévue pour recevoir les mêmes options de personnalisation.",
    ],
  },
  {
    slug: "t-shirt-essentiel",
    name: "T-shirt essentiel",
    category: "Lifestyle",
    price: "34,00 EUR",
    description:
      "Format plus léger pour la vie quotidienne, les shoots et les contenus réseaux autour de la structure.",
    intro:
      "Une base plus simple pour porter l'identité NOW en dehors du format maillot.",
    details: [
      "Pièce lifestyle plus légère.",
      "Parfaite pour les shootings, contenus et activations.",
      "Proposé en plusieurs coloris et visuels selon les collections.",
    ],
  },
  {
    slug: "hoodie-equipe",
    name: "Hoodie équipe",
    category: "Noir signature",
    price: "64,00 EUR",
    description:
      "Version plus chaude pour le staff, les joueurs et la communauté, avec une direction visuelle sobre.",
    intro:
      "Une pièce plus dense et plus chaude pour prolonger la direction visuelle Crystal dans un registre plus sobre.",
    details: [
      "Base noire signature.",
      "Pensée pour le staff, la communauté et les activations.",
      "Disponible avec logos, éditions limitées et variantes de collection.",
    ],
  },
];

export const shopCollections = [
  {
    name: "Collection Crystal",
    label: "Drop principal",
    description:
      "Maillot officiel et déclinaisons.",
  },
  {
    name: "Personnalisation",
    label: "Options produit",
    description:
      "Tailles, flocage et options.",
  },
  {
    name: "Éditorial boutique",
    label: "Mise en avant",
    description:
      "Sélection boutique.",
  },
];

export const productOptions = [
  { label: "Tailles", value: "XS, S, M, L, XL" },
  { label: "Flocage", value: "Pseudo, numéro, dos et manches" },
  { label: "Paiement", value: "Carte bancaire et solutions automatisées" },
  { label: "Contenu", value: "Photos, prix, descriptions et variantes" },
];

export const games = [
  {
    slug: "fortnite",
    game: "Fortnite",
    subtitle: "Rosters compétitifs",
    visual: "fortnite",
    description:
      "La section Fortnite reprend la logique la plus riche du thème exporté, avec rosters, talents et lecture par pôles.",
    rosters: [
      {
        name: "Roster professionnel",
        members: ["NOW Chrisc", "NOW Squzy"],
      },
      {
        name: "Roster académique",
        members: ["NOW Azeexu", "NOW Costa", "NOW M1chas"],
      },
      {
        name: "Créateurs de contenu",
        members: ["NOW Flixy"],
      },
    ],
  },
  {
    slug: "counter-strike-2",
    game: "Counter-Strike 2",
    subtitle: "Nouveau chapitre",
    visual: "cs2",
    description:
      "La section Counter-Strike 2 présente l'équipe, son encadrement et ses contenus dédiés.",
    rosters: [
      {
        name: "Encadrement",
        members: ["NOW Crysta"],
      },
    ],
  },
  {
    slug: "rocket-league",
    game: "Rocket League",
    subtitle: "Scène dédiée",
    visual: "rocket",
    description:
      "La page Rocket League présente le roster, les visuels clés et les informations de la section.",
    rosters: [
      {
        name: "Section Rocket League",
        members: ["Roster officiel NOW Rocket League"],
      },
    ],
  },
  {
    slug: "valorant",
    game: "Valorant",
    subtitle: "Pôle académique",
    visual: "valorant",
    description:
      "La section Valorant met en avant l'équipe, l'encadrement et les contenus dédiés à la scène académique.",
    rosters: [
      {
        name: "Section Valorant",
        members: ["Roster officiel NOW Valorant"],
      },
    ],
  },
];

export const teamSupportBlocks = [
  {
    title: "NOW Team",
    description:
      "Direction, management et staff.",
  },
  {
    title: "Legends",
    description:
      "Anciens joueurs et moments marquants.",
  },
];

export const partners = [
  {
    name: "Carré Connecté",
    role: "Gaming Room & Esport",
    description:
      "Partenaire orienté expérience, espace et activation autour de l'univers gaming et événementiel.",
    href: "#",
  },
  {
    name: "AbricoTweaks",
    role: "PC Optimizer",
    description:
      "Partenaire technique positionné sur l'optimisation et la performance des machines de jeu.",
    href: "#",
  },
  {
    name: "BreakDay",
    role: "Merch",
    description:
      "Partenaire lié à la partie textile, à l'image de marque et aux collaborations merch.",
    href: "#",
  },
];

export const events = [
  {
    title: "Winter Keynote - Carré Connecté",
    date: "03/03/2026",
    location: "Paris",
    description:
      "Activation de lancement avec captation, studio et mise en avant du projet dans un format plus éditorial.",
    tone: "studio",
  },
  {
    title: "Media Day - Paris",
    date: "02/03/2026",
    location: "Paris",
    description:
      "Session photo et vidéo pour produire les visuels de saison, les assets hero et les contenus réseaux.",
    tone: "sunset",
  },
];

export const legalPages = [
  {
    slug: "politique-de-confidentialite",
    title: "Politique de confidentialité",
    kicker: "Informations légales",
    intro:
      "NOW eSport collecte uniquement les données nécessaires au fonctionnement du site, à la gestion des comptes, des commandes et de la relation client.",
    sections: [
      "Données traitées : identité, adresse e-mail, informations de livraison, historique de commande, messages envoyés au support et données techniques strictement nécessaires à la sécurité du site.",
      "Finalités : création et sécurisation du compte, paiement, préparation et livraison des commandes, service après-vente, prévention de la fraude et respect des obligations légales.",
      "Destinataires : les équipes habilitées de NOW eSport, Supabase pour l'hébergement applicatif et Stripe pour le paiement. Les données ne sont pas revendues.",
      "Durées : les données de compte sont conservées tant que le compte existe ; les données de commande sont conservées pendant la durée requise par les obligations comptables et légales.",
      "Droits : toute personne peut demander l'accès, la rectification, l'effacement, la limitation ou l'opposition au traitement de ses données, sous réserve des obligations légales applicables.",
      "Contact confidentialité : utilise la page Coordonnées pour toute demande liée aux données personnelles. L'identité de la structure, le cas échéant son SIRET et son contact dédié doivent être complétés avant lancement officiel.",
    ],
  },
  {
    slug: "politique-de-remboursement",
    title: "Politique de remboursement",
    kicker: "Informations légales",
    intro:
      "Cette politique décrit les règles minimales applicables aux retours, remboursements et produits personnalisés achetés sur la boutique NOW eSport.",
    sections: [
      "Pour les produits non personnalisés, le client consommateur dispose en principe d'un délai légal de rétractation de 14 jours à compter de la réception, sous réserve que le produit soit retourné neuf, complet et non porté.",
      "Les produits personnalisés, floqués, fabriqués à la demande ou configurés selon les choix du client peuvent être exclus du droit de rétractation conformément au droit applicable.",
      "Les frais de retour sont à la charge du client sauf erreur de préparation, produit défectueux ou accord écrit contraire du support NOW eSport.",
      "Après réception et contrôle du retour accepté, le remboursement est effectué via le moyen de paiement utilisé lors de la commande, dans un délai raisonnable.",
      "Aucun remboursement ne sera validé pour un produit utilisé, détérioré par le client ou retourné sans accord préalable lorsque cet accord est requis.",
    ],
  },
  {
    slug: "conditions-d-utilisation",
    title: "Conditions d'utilisation",
    kicker: "Informations légales",
    intro:
      "L'utilisation du site NOW eSport implique le respect des présentes conditions et des lois applicables.",
    sections: [
      "Le site permet de consulter l'actualité, les rosters, les partenaires, les événements et la boutique de NOW eSport.",
      "L'utilisateur s'engage à fournir des informations exactes, à ne pas perturber le service et à ne pas utiliser le site à des fins frauduleuses, abusives ou illicites.",
      "Les textes, visuels, marques, logos et contenus du site sont protégés. Toute reproduction ou exploitation non autorisée est interdite.",
      "NOW eSport peut modifier le contenu, suspendre certaines fonctionnalités ou corriger le site à tout moment pour des raisons techniques, commerciales ou de sécurité.",
      "Les liens vers des plateformes externes, réseaux sociaux ou prestataires tiers sont fournis pour information. NOW eSport n'est pas responsable de leur contenu ni de leurs conditions propres.",
    ],
  },
  {
    slug: "coordonnees",
    title: "Coordonnées",
    kicker: "Informations légales",
    intro:
      "Cette page regroupe les informations de contact utiles pour les demandes clients, commerciales, administratives et légales.",
    sections: [
      "Éditeur du site : NOW eSport. Forme juridique, représentant légal, adresse postale et numéro SIRET à compléter si la structure en dispose ou si ces mentions sont obligatoires au moment de la publication.",
      "Support commandes : indiquez l'adresse e-mail officielle de support avant lancement afin que les clients puissent demander une information, un retour ou un suivi de commande.",
      "Demandes partenaires et presse : indiquez l'adresse e-mail commerciale ou le canal de contact officiel de NOW eSport avant publication.",
      "Hébergement : le site est destiné à être hébergé sur Vercel. Les données applicatives sont opérées avec Supabase et les paiements avec Stripe.",
    ],
  },
  {
    slug: "mentions-legales",
    title: "Mentions légales",
    kicker: "Informations légales",
    intro:
      "Les présentes mentions identifient l'éditeur, l'hébergement et les principaux prestataires techniques du site NOW eSport.",
    sections: [
      "Éditeur : NOW eSport. Les informations administratives définitives de la structure (forme juridique, adresse, représentant légal, SIRET le cas échéant) doivent être complétées avant toute communication commerciale officielle si elles sont requises.",
      "Responsable de publication : représentant légal ou responsable désigné de NOW eSport, à compléter avant publication officielle.",
      "Hébergement web : Vercel Inc., plateforme d'hébergement cloud utilisée pour déployer l'application Next.js.",
      "Base de données et authentification : Supabase. Paiements : Stripe. Ces prestataires disposent de leurs propres conditions et politiques de confidentialité.",
      "Propriété intellectuelle : les éléments du site, notamment textes, identité visuelle, logos, noms, contenus esport et visuels boutique, sont protégés et ne peuvent pas être réutilisés sans autorisation.",
    ],
  },
  {
    slug: "conditions-generales-de-vente",
    title: "Conditions générales de vente",
    kicker: "Informations légales",
    intro:
      "Les présentes CGV encadrent les ventes réalisées sur la boutique NOW eSport auprès des clients consommateurs ou professionnels selon le cas.",
    sections: [
      "Produits : les articles proposés sont décrits sur les pages produit avec leur prix, leurs options éventuelles, leur disponibilité et, lorsque nécessaire, leurs variantes de taille ou couleur.",
      "Commande : le client vérifie son panier, ses informations, ses variantes et ses données de livraison avant paiement. La commande devient ferme après confirmation du paiement par Stripe.",
      "Prix : les prix sont affichés en euros. Les frais de livraison, taxes ou frais additionnels éventuels sont indiqués avant validation du paiement lorsque la configuration Stripe les applique.",
      "Paiement : les paiements sont traités par Stripe. NOW eSport ne stocke pas les numéros complets de carte bancaire.",
      "Disponibilité : en cas d'indisponibilité après commande, NOW eSport contacte le client pour proposer une solution, un délai, un remplacement ou un remboursement.",
      "Produits personnalisés : les produits floqués, personnalisés ou fabriqués à la demande peuvent ne pas être repris sauf défaut, erreur ou obligation légale contraire.",
      "Livraison : les modalités, zones et délais indicatifs sont précisés dans la politique d'expédition. Les délais peuvent varier selon la préparation, les prestataires et les périodes d'activité.",
      "Réclamations : toute demande liée à une commande doit mentionner l'e-mail de paiement, le numéro ou identifiant de commande et les informations utiles au traitement.",
    ],
  },
  {
    slug: "politique-d-expedition",
    title: "Politique d'expédition",
    kicker: "Informations légales",
    intro:
      "Cette politique précise les règles de préparation et d'expédition des produits physiques commandés sur la boutique NOW eSport.",
    sections: [
      "Les commandes sont préparées après confirmation du paiement. Les produits personnalisés ou produits à la demande peuvent nécessiter un délai de préparation supplémentaire.",
      "Les zones de livraison doivent être confirmées dans la configuration Stripe et dans les informations affichées au client avant paiement. À défaut, la livraison est limitée aux pays activés dans le checkout.",
      "Les délais affichés sont indicatifs et peuvent varier selon la disponibilité, la personnalisation, les transporteurs, les jours fériés ou les périodes de forte activité.",
      "Le client doit fournir une adresse complète et exacte. NOW eSport ne peut pas être tenu responsable d'un retard ou retour causé par une adresse incorrecte ou incomplète.",
      "En cas de colis endommagé, perdu ou retourné, le client doit contacter le support avec son e-mail de paiement et les éléments de suivi disponibles.",
    ],
  },
  {
    slug: "preferences-en-matiere-de-cookies",
    title: "Préférences en matière de cookies",
    kicker: "Informations légales",
    intro:
      "Le site peut utiliser des cookies ou technologies similaires nécessaires au fonctionnement, à la sécurité et, si activé plus tard, à la mesure d'audience.",
    sections: [
      "Cookies nécessaires : ils permettent notamment la session, le panier local, la sécurité, le paiement et le bon affichage du site. Ils ne nécessitent pas toujours un consentement préalable lorsqu'ils sont strictement indispensables.",
      "Cookies de mesure ou marketing : aucun outil non essentiel ne doit être activé sans base légale appropriée et, lorsque nécessaire, sans consentement préalable de l'utilisateur.",
      "Paiement et authentification : Supabase et Stripe peuvent déposer ou utiliser des informations techniques nécessaires à leurs services lorsque l'utilisateur se connecte ou paie une commande.",
      "Gestion des préférences : si des outils de mesure ou marketing sont ajoutés, une bannière ou un mécanisme de choix devra permettre d'accepter, refuser ou modifier les préférences.",
    ],
  },
];

export const footerLegalLinks = legalPages.map((item) => ({
  label: item.title,
  href: `/legal/${item.slug}`,
}));

export const footerSocials = [
  { label: "Instagram", href: "https://instagram.com/noww_esport" },
  { label: "YouTube", href: "https://youtube.com/@now_esport?si=glCo_IRwSsMpecr9" },
  { label: "TikTok", href: "https://tiktok.com/@noww_esport" },
  { label: "X", href: "https://x.com/noww_esport" },
  { label: "Discord", href: "https://discord.gg/Etn3sSbvJc" },
];

export function getProductBySlug(slug: string) {
  return collectionItems.find((item) => item.slug === slug);
}

export function getGameBySlug(slug: string) {
  return games.find((item) => item.slug === slug);
}

export function getLegalPageBySlug(slug: string) {
  return legalPages.find((item) => item.slug === slug);
}
