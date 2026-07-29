import type { Metadata } from "next";

export const SITE_NAME = "NOW Esport";
export const SITE_URL = "https://nowesport.org";
export const DEFAULT_DESCRIPTION =
  "Site officiel de NOW Esport : équipes, boutique, événements et partenaires.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

export const privateRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  noarchive: true,
  googleBot: { index: false, follow: false, noimageindex: true },
};

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function cleanDescription(value: string | null | undefined, fallback = DEFAULT_DESCRIPTION) {
  const clean = value?.replace(/\s+/g, " ").trim();
  return clean ? clean.slice(0, 160) : fallback;
}

export function publicMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  type?: "website" | "article";
}): Metadata {
  const safeDescription = cleanDescription(description);
  const url = absoluteUrl(path);
  const images = [{ url: image || DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }];

  return {
    title,
    description: safeDescription,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: safeDescription,
      url,
      siteName: SITE_NAME,
      locale: "fr_FR",
      type,
      images,
    },
    twitter: { card: "summary_large_image", title, description: safeDescription, images },
  };
}

export function jsonLd(value: Record<string, unknown>) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(input: {
  publishable: boolean;
  name: string;
  description: string;
  path: string;
  priceCents: number | null;
  currency: string;
  image?: string | null;
  sku?: string | null;
  outOfStock?: boolean;
}) {
  if (!input.publishable || input.priceCents === null) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    ...(input.image ? { image: [input.image] } : {}),
    ...(input.sku ? { sku: input.sku } : {}),
    offers: {
      "@type": "Offer",
      price: (input.priceCents / 100).toFixed(2),
      priceCurrency: input.currency,
      url: absoluteUrl(input.path),
      availability: input.outOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };
}
