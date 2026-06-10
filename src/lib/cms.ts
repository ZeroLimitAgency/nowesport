import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";
import {
  footerLegalLinks,
  footerSocials,
  navItems,
  productOptions,
  shopCollections,
} from "@/data/site";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type SiteLocale = "fr" | "en";

export type CmsBlock = {
  area: string;
  key: string;
  title: string;
  body: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  mediaUrl?: string;
  metadata?: Record<string, unknown>;
};

export type CmsNavigationItem = {
  label: string;
  href: string;
  placement: "header" | "footer_legal" | string;
  sortOrder: number;
};

export type CmsSocialLink = {
  label: string;
  href: string;
  platform: string;
  sortOrder: number;
};

export type CmsContent = {
  locale: SiteLocale;
  blocks: Record<string, CmsBlock>;
  navigation: CmsNavigationItem[];
  legalNavigation: CmsNavigationItem[];
  socialLinks: CmsSocialLink[];
};

export const locales: SiteLocale[] = ["fr", "en"];

export function normalizeLocale(value?: string | null): SiteLocale {
  return value === "en" ? "en" : "fr";
}

export async function getCurrentLocale(): Promise<SiteLocale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("now-locale")?.value);
}

const defaultBlocksByLocale: Record<SiteLocale, Record<string, CmsBlock>> = {
  fr: {
    "home.hero": {
      area: "home",
      key: "hero",
      eyebrow: "Accueil",
      title: "NOW eSport",
      body: "Une entrée plein écran avec vidéo, partenaires et accès rapide aux temps forts NOW.",
      ctaLabel: "Découvrir la boutique",
      ctaHref: "/shop",
      secondaryCtaLabel: "Voir les rosters",
      secondaryCtaHref: "/roster",
      mediaUrl: "/media/now-academy.mp4",
      metadata: {
        poster: "/media/jersey.jpeg",
        videoHref: "https://youtu.be/F7VLXWSbRoE?si=vzBYyV9froSyNNC7",
        sponsors: ["GENESIS", "leo express", "tp-link"],
      },
    },
    "shop.intro": {
      area: "shop",
      key: "intro",
      eyebrow: "Boutique",
      title: "Produits, collections et personnalisation",
      body: "La boutique NOW rassemble les drops, les pièces performance et les options de personnalisation essentielles.",
    },
    "shop.banner": {
      area: "shop",
      key: "banner",
      eyebrow: "Boutique",
      title: "Découvrir notre maillot 2026",
      body: "Une promesse nette, un call to action clair et une entrée rapide vers les produits.",
      ctaLabel: "Acheter maintenant",
      ctaHref: "/shop",
      secondaryCtaLabel: "Voir la collection Crystal",
      secondaryCtaHref: "/shop",
    },
    "roster.intro": {
      area: "roster",
      key: "intro",
      eyebrow: "Roster",
      title: "Équipes, joueurs et créateurs NOW",
      body: "Retrouve les équipes NOW, les joueurs, le staff et les créateurs qui portent la structure.",
    },
    "events.intro": {
      area: "events",
      key: "intro",
      eyebrow: "Événements",
      title: "Timeline d'événements et d'activations",
      body: "Suis les activations, media days, annonces et rendez-vous qui rythment la saison NOW.",
    },
    "partners.intro": {
      area: "partners",
      key: "intro",
      eyebrow: "Partenaires",
      title: "Blocs partenaires avec image, texte et lien",
      body: "Découvre les partenaires qui accompagnent NOW eSport sur la performance, l'image et les activations.",
    },
    "maintenance.main": {
      area: "maintenance",
      key: "main",
      eyebrow: "NOW eSport",
      title: "Site en maintenance",
      body: "Nous préparons la nouvelle version du site. Les administrateurs peuvent se connecter pour prévisualiser le site.",
      ctaLabel: "Nous contacter",
      ctaHref: "https://discord.gg/K5AxWfD7tc",
      secondaryCtaLabel: "Connexion admin",
      secondaryCtaHref: "/login?next=/",
    },
    "legal.mentions-legales": {
      area: "legal",
      key: "mentions-legales",
      eyebrow: "Légal",
      title: "Mentions légales",
      body: "Éditeur, hébergement, propriété intellectuelle et contact légal NOW eSport.",
      metadata: {
        sections: [
          "NOW eSport édite ce site pour présenter sa structure, ses équipes, ses partenaires et sa boutique.",
          "Les informations d'hébergement, de contact et de responsabilité peuvent être complétées depuis le dashboard admin.",
        ],
      },
    },
    "legal.confidentialite": {
      area: "legal",
      key: "confidentialite",
      eyebrow: "Légal",
      title: "Politique de confidentialité",
      body: "Collecte, usage et protection des données personnelles des utilisateurs.",
      metadata: { sections: ["Les données de compte, commande et contact sont utilisées pour fournir les services du site."] },
    },
    "legal.cgv": {
      area: "legal",
      key: "cgv",
      eyebrow: "Légal",
      title: "Conditions générales de vente",
      body: "Conditions applicables aux commandes passées sur la boutique NOW eSport.",
      metadata: { sections: ["Les prix, moyens de paiement, livraisons et retours sont à compléter depuis le CMS."] },
    },
    "footer.main": {
      area: "footer",
      key: "main",
      title: "NOW eSport",
      body: "Boutique, roster et événements.",
    },
  },
  en: {
    "home.hero": {
      area: "home",
      key: "hero",
      eyebrow: "Home",
      title: "NOW eSport",
      body: "A full-screen entry with video, partners and fast access to NOW highlights.",
      ctaLabel: "Discover the shop",
      ctaHref: "/shop",
      secondaryCtaLabel: "View rosters",
      secondaryCtaHref: "/roster",
      mediaUrl: "/media/now-academy.mp4",
      metadata: {
        poster: "/media/jersey.jpeg",
        videoHref: "https://youtu.be/F7VLXWSbRoE?si=vzBYyV9froSyNNC7",
        sponsors: ["GENESIS", "leo express", "tp-link"],
      },
    },
    "shop.intro": {
      area: "shop",
      key: "intro",
      eyebrow: "Shop",
      title: "Products, collections and customization",
      body: "The NOW shop brings together drops, performance pieces and essential customization options.",
    },
    "shop.banner": {
      area: "shop",
      key: "banner",
      eyebrow: "Shop",
      title: "Discover our 2026 jersey",
      body: "A clear promise, a direct call to action and a fast entry point to products.",
      ctaLabel: "Shop now",
      ctaHref: "/shop",
      secondaryCtaLabel: "View Crystal collection",
      secondaryCtaHref: "/shop",
    },
    "roster.intro": {
      area: "roster",
      key: "intro",
      eyebrow: "Roster",
      title: "NOW teams, players and creators",
      body: "Discover the NOW teams, players, staff and creators representing the organization.",
    },
    "events.intro": {
      area: "events",
      key: "intro",
      eyebrow: "Events",
      title: "Events and activation timeline",
      body: "Follow activations, media days, announcements and key milestones throughout the NOW season.",
    },
    "partners.intro": {
      area: "partners",
      key: "intro",
      eyebrow: "Partners",
      title: "Partner blocks with image, text and link",
      body: "Meet the partners supporting NOW eSport across performance, brand image and activations.",
    },
    "maintenance.main": {
      area: "maintenance",
      key: "main",
      eyebrow: "NOW eSport",
      title: "Site under maintenance",
      body: "We are preparing the new site. Administrators can sign in to preview the website.",
      ctaLabel: "Contact us",
      ctaHref: "https://discord.gg/K5AxWfD7tc",
      secondaryCtaLabel: "Admin login",
      secondaryCtaHref: "/login?next=/",
    },
    "legal.mentions-legales": {
      area: "legal",
      key: "mentions-legales",
      eyebrow: "Legal",
      title: "Legal notice",
      body: "Publisher, hosting, intellectual property and NOW eSport legal contact.",
      metadata: { sections: ["NOW eSport publishes this website to present its structure, teams, partners and shop."] },
    },
    "legal.confidentialite": {
      area: "legal",
      key: "confidentialite",
      eyebrow: "Legal",
      title: "Privacy policy",
      body: "Collection, use and protection of users' personal data.",
      metadata: { sections: ["Account, order and contact data are used to provide the site's services."] },
    },
    "legal.cgv": {
      area: "legal",
      key: "cgv",
      eyebrow: "Legal",
      title: "Terms of sale",
      body: "Terms applicable to orders placed on the NOW eSport shop.",
      metadata: { sections: ["Prices, payment methods, delivery and returns can be completed from the CMS."] },
    },
    "footer.main": {
      area: "footer",
      key: "main",
      title: "NOW eSport",
      body: "Shop, roster and events.",
    },
  },
};

const defaultNavigationByLocale: Record<SiteLocale, CmsNavigationItem[]> = {
  fr: [
    ...navItems.map((item, index) => ({ ...item, placement: "header", sortOrder: index })),
    ...footerLegalLinks.map((item, index) => ({ ...item, placement: "footer_legal", sortOrder: index })),
  ],
  en: [
    { label: "Home", href: "/", placement: "header", sortOrder: 0 },
    { label: "Shop", href: "/shop", placement: "header", sortOrder: 1 },
    { label: "Roster", href: "/roster", placement: "header", sortOrder: 2 },
    { label: "Partners", href: "/partners", placement: "header", sortOrder: 3 },
    { label: "Events", href: "/events", placement: "header", sortOrder: 4 },
    { label: "Cart", href: "/cart", placement: "header", sortOrder: 5 },
    { label: "Account", href: "/compte", placement: "header", sortOrder: 6 },
    { label: "Legal notice", href: "/legal/mentions-legales", placement: "footer_legal", sortOrder: 0 },
    { label: "Privacy", href: "/legal/confidentialite", placement: "footer_legal", sortOrder: 1 },
    { label: "Terms", href: "/legal/cgv", placement: "footer_legal", sortOrder: 2 },
  ],
};

const defaultSocialLinks: CmsSocialLink[] = footerSocials.map((item, index) => ({
  label: item.label,
  href: item.href,
  platform: item.label.toLowerCase(),
  sortOrder: index,
}));

export function getDefaultCmsContent(locale: SiteLocale): CmsContent {
  const navigation = defaultNavigationByLocale[locale];

  return {
    locale,
    blocks: defaultBlocksByLocale[locale],
    navigation: navigation.filter((item) => item.placement === "header"),
    legalNavigation: navigation.filter((item) => item.placement === "footer_legal"),
    socialLinks: defaultSocialLinks,
  };
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function getMetadataList(block: CmsBlock, key: string): string[] {
  const value = block.metadata?.[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function getShopPresentation() {
  return { productOptions, shopCollections };
}


type CmsBlockRow = {
  area: string;
  block_key: string;
  title: string | null;
  body: string | null;
  eyebrow: string | null;
  cta_label: string | null;
  cta_href: string | null;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
  media_url: string | null;
  metadata: unknown;
  locale?: SiteLocale;
};

type CmsNavigationRow = {
  label: string;
  href: string;
  placement: string;
  sort_order: number | null;
  locale?: SiteLocale;
};

function textFallback(...values: Array<string | null | undefined>): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
}

function mergeBlockFallback(
  key: string,
  locale: SiteLocale,
  row?: CmsBlockRow,
  frRow?: CmsBlockRow,
): CmsBlock {
  const localBlock = defaultBlocksByLocale[locale][key];
  const frBlock = defaultBlocksByLocale.fr[key];
  const baseBlock = localBlock ?? frBlock ?? { area: row?.area ?? frRow?.area ?? "site", key: row?.block_key ?? frRow?.block_key ?? key, title: "", body: "" };

  return {
    area: row?.area ?? frRow?.area ?? baseBlock.area,
    key: row?.block_key ?? frRow?.block_key ?? baseBlock.key,
    title: textFallback(row?.title, frRow?.title, localBlock?.title, frBlock?.title) ?? "",
    body: textFallback(row?.body, frRow?.body, localBlock?.body, frBlock?.body) ?? "",
    eyebrow: textFallback(row?.eyebrow, frRow?.eyebrow, localBlock?.eyebrow, frBlock?.eyebrow),
    ctaLabel: textFallback(row?.cta_label, frRow?.cta_label, localBlock?.ctaLabel, frBlock?.ctaLabel),
    ctaHref: textFallback(row?.cta_href, frRow?.cta_href, localBlock?.ctaHref, frBlock?.ctaHref),
    secondaryCtaLabel: textFallback(row?.secondary_cta_label, frRow?.secondary_cta_label, localBlock?.secondaryCtaLabel, frBlock?.secondaryCtaLabel),
    secondaryCtaHref: textFallback(row?.secondary_cta_href, frRow?.secondary_cta_href, localBlock?.secondaryCtaHref, frBlock?.secondaryCtaHref),
    mediaUrl: textFallback(row?.media_url, frRow?.media_url, localBlock?.mediaUrl, frBlock?.mediaUrl),
    metadata: {
      ...frBlock?.metadata,
      ...localBlock?.metadata,
      ...asObject(frRow?.metadata),
      ...asObject(row?.metadata),
    },
  };
}

function navigationFallback(
  rows: CmsNavigationRow[],
  locale: SiteLocale,
  placement: "header" | "footer_legal",
) {
  const localizedRows = rows.filter((item) => item.locale === locale && item.placement === placement);
  const frRows = rows.filter((item) => item.locale === "fr" && item.placement === placement);
  const selectedRows = localizedRows.length > 0 ? localizedRows : frRows;

  if (selectedRows.length === 0) {
    const fallback = getDefaultCmsContent(locale);
    return placement === "header" ? fallback.navigation : fallback.legalNavigation;
  }

  return selectedRows
    .map((item) => ({
      label: item.label,
      href: item.href,
      placement: item.placement,
      sortOrder: item.sort_order ?? 0,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getSiteCmsContent(locale: SiteLocale): Promise<CmsContent> {
  noStore();

  const fallback = getDefaultCmsContent(locale);

  if (!hasSupabaseEnv()) {
    return fallback;
  }

  try {
    const supabase = await createClient();
    const requestedLocales = locale === "en" ? ["fr", "en"] : ["fr"];
    const [blocksResult, navigationResult, socialLinksResult] = await Promise.all([
      supabase
        .from("site_content_blocks")
        .select("locale, area, block_key, title, body, eyebrow, cta_label, cta_href, secondary_cta_label, secondary_cta_href, media_url, metadata")
        .in("locale", requestedLocales)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("site_navigation")
        .select("locale, label, href, placement, sort_order")
        .in("locale", requestedLocales)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("site_social_links")
        .select("label, href, platform, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

    if (blocksResult.error || navigationResult.error || socialLinksResult.error) {
      return fallback;
    }

    const rows = ((blocksResult.data ?? []) as CmsBlockRow[]);
    const localizedBlocks = new Map(rows.filter((block) => block.locale === locale).map((block) => [`${block.area}.${block.block_key}`, block]));
    const frBlocks = new Map(rows.filter((block) => block.locale === "fr").map((block) => [`${block.area}.${block.block_key}`, block]));
    const blockKeys = new Set([
      ...Object.keys(defaultBlocksByLocale[locale]),
      ...Object.keys(defaultBlocksByLocale.fr),
      ...localizedBlocks.keys(),
      ...frBlocks.keys(),
    ]);
    const cmsBlocks = Object.fromEntries(
      [...blockKeys].map((key) => [key, mergeBlockFallback(key, locale, localizedBlocks.get(key), frBlocks.get(key))]),
    );

    const navigationRows = ((navigationResult.data ?? []) as CmsNavigationRow[]);
    const headerNavigation = navigationFallback(navigationRows, locale, "header");
    const legalNavigation = navigationFallback(navigationRows, locale, "footer_legal");
    const socialLinks = (socialLinksResult.data ?? []).map((item) => ({
      label: item.label,
      href: item.href,
      platform: item.platform ?? item.label.toLowerCase(),
      sortOrder: item.sort_order ?? 0,
    }));

    return {
      locale,
      blocks: cmsBlocks,
      navigation: headerNavigation,
      legalNavigation,
      socialLinks: socialLinks.length > 0 ? socialLinks : fallback.socialLinks,
    };
  } catch {
    return fallback;
  }
}
