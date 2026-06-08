import type { MetadataRoute } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { legalPages } from "@/data/site";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nowesport.org";

async function getSupabasePublicRoutes() {
  const supabaseEnv = getOptionalSupabasePublicEnv();

  if (!supabaseEnv) {
    return [];
  }

  const supabase = createSupabaseClient(
    supabaseEnv.url,
    supabaseEnv.publishableKey,
    {
      auth: { persistSession: false },
    },
  );

  const [{ data: products }, { data: games }] = await Promise.all([
    supabase.from("products").select("slug").eq("is_public", true),
    supabase.from("games").select("slug").eq("is_public", true),
  ]);

  return [
    ...(products ?? []).map((item) => `/shop/${item.slug}`),
    ...(games ?? []).map((item) => `/roster/${item.slug}`),
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const supabaseRoutes = await getSupabasePublicRoutes();
  const legalRoutes = legalPages.map((item) => `/legal/${item.slug}`);

  return [...staticRoutes, ...supabaseRoutes, ...legalRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
