import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { isMaintenanceEnabled, isPreviewDeployment } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

const privateRoutes = [
  "/api/", "/admin", "/auth", "/login", "/account", "/compte",
  "/profile", "/profil", "/cart", "/panier", "/checkout", "/maintenance",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (isPreviewDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" }, host: SITE_URL };
  }
  const maintenance = await isMaintenanceEnabled();

  if (maintenance) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: privateRoutes,
      },
      sitemap: `${SITE_URL}/sitemap.xml`,
      host: SITE_URL,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: privateRoutes,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
