import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nowesport.org";
const maintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE !== "off";

export default function robots(): MetadataRoute.Robots {
  if (maintenance) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
