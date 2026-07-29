import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { legalPages } from "@/data/site";
import { SITE_URL } from "@/lib/seo";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";
import { isMaintenanceEnabled } from "@/lib/maintenance";
import { isSeoPublishableProduct, isSeoPublishableRoster } from "@/lib/publication";

export const dynamic = "force-dynamic";

type DynamicEntry = { path: string; updatedAt?: string | null; priority: number };

async function getDynamicEntries(): Promise<DynamicEntry[]> {
  const env = getOptionalSupabasePublicEnv();
  if (!env) return [];

  try {
    const supabase = createClient(env.url, env.publishableKey, { auth: { persistSession: false } });
    const [productsResult, rostersResult] = await Promise.all([
      supabase.from("products").select("slug, updated_at, name, short_description, description, price_cents, is_public, product_variants(price_cents, stock_quantity, is_active)").eq("is_public", true),
      supabase.from("rosters").select("slug, updated_at, name, description, is_public, is_active").eq("is_public", true).eq("is_active", true),
    ]);

    if (productsResult.error) console.error("Sitemap: impossible de lire les produits publics.");
    if (rostersResult.error) console.error("Sitemap: impossible de lire les rosters publics.");

    const products = (productsResult.data ?? [])
      .filter(isSeoPublishableProduct)
      .map((item) => ({ path: `/shop/${item.slug}`, updatedAt: item.updated_at, priority: 0.7 }));
    const rosters = (rostersResult.data ?? [])
      .filter(isSeoPublishableRoster)
      .map((item) => ({ path: `/roster/${item.slug}`, updatedAt: item.updated_at, priority: 0.7 }));
    return [...products, ...rosters];
  } catch (error) {
    console.error("Sitemap: source de contenu dynamique indisponible.", error instanceof Error ? error.message : "Erreur inconnue");
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (await isMaintenanceEnabled()) {
    return [{ url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 }];
  }
  const staticEntries: DynamicEntry[] = [
    { path: "/", priority: 1 },
    { path: "/shop", priority: 0.9 },
    { path: "/roster", priority: 0.9 },
    { path: "/events", priority: 0.8 },
    { path: "/partners", priority: 0.7 },
    ...legalPages.map((page) => ({ path: `/legal/${page.slug}`, priority: 0.3 })),
  ];
  const entries = [...staticEntries, ...(await getDynamicEntries())];

  return entries.map((entry) => ({
    url: new URL(entry.path, SITE_URL).toString(),
    ...(entry.updatedAt ? { lastModified: new Date(entry.updatedAt) } : {}),
    changeFrequency: entry.path === "/" ? "weekly" : entry.path.startsWith("/legal/") ? "yearly" : "weekly",
    priority: entry.priority,
  }));
}
