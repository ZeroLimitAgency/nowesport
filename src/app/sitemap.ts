import type { MetadataRoute } from "next";
import { collectionItems, games, legalPages } from "@/data/site";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nowesport.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/shop",
    "/boutique",
    "/roster",
    "/events",
    "/partners",
    "/partenaires",
    "/profile",
    "/profil",
    "/cart",
    "/panier",
    "/login",
    "/compte",
    "/account",
  ];

  const productRoutes = collectionItems.map((item) => `/shop/${item.slug}`);
  const rosterRoutes = games.map((item) => `/roster/${item.slug}`);
  const legalRoutes = legalPages.map((item) => `/legal/${item.slug}`);

  return [...staticRoutes, ...productRoutes, ...rosterRoutes, ...legalRoutes].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
    }),
  );
}
