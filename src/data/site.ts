export const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/shop" },
  { label: "Équipes", href: "/teams" },
  { label: "Partenaires", href: "/partners" },
  { label: "Événements", href: "/events" },
  { label: "News", href: "/news" },
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
    "La page d'accueil démarre par un hero pleine hauteur pensé pour recevoir ta vraie vidéo, avec une lecture immersive, une barre du haut minimale et un habillage rose bonbon, noir et blanc.",
  primaryCta: "Découvrir la boutique",
  secondaryCta: "Voir les équipes",
  helper:
    "Quand tu voudras, on branchera ici ta vraie vidéo locale ou un média hébergé.",
  videoHref: "https://www.youtube.com/watch?v=F7VLXWSbRoE",
  videoSrc: "/assets/now-academy.mp4",
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
      "Pièce centrale du drop, pensée pour accueillir tailles, flocage, numéro et variantes plus tard.",
    intro:
      "Le maillot Crystal 2026 est la pièce la plus mise en avant de la boutique. Cette page sert de base pour la future vraie fiche produit.",
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
      "Peut évoluer plus tard avec plusieurs coloris ou visuels.",
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
      "Peut accueillir logos, éditions limitées et futures variantes.",
    ],
  },
];

export const shopCollections = [
  {
    name: "Collection Crystal",
    label: "Drop principal",
    description:
      "La collection mise en avant dans le thème exporté, centrée sur le maillot 2026 et sa lecture premium.",
  },
  {
    name: "Personnalisation",
    label: "Options produit",
    description:
      "Tailles, flocage, numéro, pseudo et variantes disponibles depuis une future fiche produit administrable.",
  },
  {
    name: "Éditorial boutique",
    label: "Mise en avant",
    description:
      "Une bannière forte, un call to action clair, puis des cartes de produits et de collections faciles à mettre à jour.",
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
      "La section Counter-Strike 2 sert de base de travail pour le développement de cette branche du site.",
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
      "La page Rocket League est prête pour accueillir un roster, des visuels et des informations plus détaillées ensuite.",
    rosters: [
      {
        name: "Section Rocket League",
        members: ["Roster à compléter depuis le back-office"],
      },
    ],
  },
  {
    slug: "valorant",
    game: "Valorant",
    subtitle: "Pôle académique",
    visual: "valorant",
    description:
      "La section Valorant sert de base structurée pour ajouter plus tard une équipe, un encadrement et des contenus dédiés.",
    rosters: [
      {
        name: "Section Valorant",
        members: ["Roster à compléter depuis le back-office"],
      },
    ],
  },
];

export const teamSupportBlocks = [
  {
    title: "NOW Team",
    description:
      "Le pôle staff regroupe la direction, le management, la production et l'encadrement des différentes sections.",
  },
  {
    title: "Legends",
    description:
      "Cette page archive les profils marquants passés par la structure, avec la même logique de cartes et de rosters.",
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
      "Partenaire lié à la partie textile, à l'image de marque et aux futures collaborations merch.",
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

export const newsCards = [
  {
    title: "Major 1 : gros heat pour Chrisc",
    excerpt:
      "Le premier gros temps fort compétitif du moment, avec une mise en avant plus nette du joueur sur la scène.",
    tag: "Compétition",
    date: "17/04/2026",
    href: "#",
  },
  {
    title: "Le projet CS2 continue, plus net que jamais",
    excerpt:
      "La structure poursuit son travail sur Counter-Strike 2 avec une direction plus claire et plus ambitieuse.",
    tag: "Roster",
    date: "13/04/2026",
    href: "#",
  },
  {
    title: "Le roster académique est officiellement révélé",
    excerpt:
      "Une nouvelle vague de profils rejoint l'écosystème NOW pour préparer la suite dans un cadre plus construit.",
    tag: "Académie",
    date: "19/03/2026",
    href: "#",
  },
];

export const legalPages = [
  {
    slug: "politique-de-confidentialite",
    title: "Politique de confidentialité",
    kicker: "Informations légales",
    intro:
      "Cette page présentera la manière dont les données personnelles sont collectées, traitées, stockées et protégées sur le site.",
    sections: [
      "Données collectées : formulaire de contact, création de compte, commande, newsletter et navigation.",
      "Finalités : gestion des commandes, relation client, sécurité, amélioration du service et communications liées au site.",
      "Droits : accès, rectification, suppression, limitation, opposition et portabilité selon le cadre légal applicable.",
    ],
  },
  {
    slug: "politique-de-remboursement",
    title: "Politique de remboursement",
    kicker: "Informations légales",
    intro:
      "Cette page précisera les conditions de remboursement, les délais de traitement et les exclusions éventuelles liées aux produits personnalisés.",
    sections: [
      "Conditions générales de retour et de remboursement.",
      "Traitement des produits personnalisés ou sur demande.",
      "Délais, mode de remboursement et contact en cas de litige.",
    ],
  },
  {
    slug: "conditions-d-utilisation",
    title: "Conditions d'utilisation",
    kicker: "Informations légales",
    intro:
      "Cette page définira les règles d'utilisation du site, les responsabilités respectives et les limites applicables aux contenus et services proposés.",
    sections: [
      "Accès au site et comportement attendu de l'utilisateur.",
      "Propriété intellectuelle, contenus et restrictions d'usage.",
      "Limitation de responsabilité et évolution possible des services.",
    ],
  },
  {
    slug: "coordonnees",
    title: "Coordonnées",
    kicker: "Informations légales",
    intro:
      "Cette page servira à regrouper les coordonnées de contact de la structure pour les demandes commerciales, légales ou support client.",
    sections: [
      "Adresse de contact principale.",
      "Adresse e-mail dédiée au support et aux demandes administratives.",
      "Modalités de contact pour les partenariats et questions liées aux commandes.",
    ],
  },
  {
    slug: "mentions-legales",
    title: "Mentions légales",
    kicker: "Informations légales",
    intro:
      "Cette page regroupera les informations légales obligatoires liées à l'éditeur du site, à l'hébergement et à la publication.",
    sections: [
      "Identité de l'éditeur et du responsable de publication.",
      "Informations sur l'hébergeur et les services techniques utilisés.",
      "Cadre juridique de publication du contenu du site.",
    ],
  },
  {
    slug: "conditions-generales-de-vente",
    title: "Conditions générales de vente",
    kicker: "Informations légales",
    intro:
      "Cette page détaillera le cadre contractuel des ventes réalisées sur le site, du panier jusqu'à la livraison et au service après-vente.",
    sections: [
      "Processus de commande, validation et paiement.",
      "Prix, disponibilité, personnalisation et traitement des commandes.",
      "Livraison, réclamations, garanties et résolution des litiges.",
    ],
  },
  {
    slug: "politique-d-expedition",
    title: "Politique d'expédition",
    kicker: "Informations légales",
    intro:
      "Cette page expliquera les délais d'expédition, les zones desservies, les frais éventuels et les informations de suivi des commandes.",
    sections: [
      "Délais de préparation et de remise au transporteur.",
      "Zones desservies, modes de livraison et coûts associés.",
      "Suivi, incident de livraison et gestion des colis retournés.",
    ],
  },
  {
    slug: "preferences-en-matiere-de-cookies",
    title: "Préférences en matière de cookies",
    kicker: "Informations légales",
    intro:
      "Cette page précisera les catégories de cookies utilisées sur le site et la manière de les accepter, refuser ou ajuster.",
    sections: [
      "Cookies nécessaires au fonctionnement du site.",
      "Cookies de mesure, performance et personnalisation.",
      "Modalités de gestion du consentement et de modification des préférences.",
    ],
  },
];

export const footerLegalLinks = legalPages.map((item) => ({
  label: item.title,
  href: `/legal/${item.slug}`,
}));

export const footerSocials = [
  { label: "Instagram", href: "https://instagram.com/noww_esport" },
  { label: "YouTube", href: "#" },
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
