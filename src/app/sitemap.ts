import type { MetadataRoute } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { legalPages } from "@/data/site";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nowesport.org";

async function getSupabasePublicRoutes() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return [];
  }

  const supabase = createSupabaseClient(url, key, {
    auth: { persistSession: false },
  });

  const [{ data: products }, { data: games }] = await Promise.all([
    supabase.from("products").select("slug").eq("is_public", true),
    supabase.from("games").select("slug").eq("is_public", true),
  ]);

  return [
    ...((products ?? []).map((item) => `/shop/${item.slug}`)),
    ...((games ?? []).map((item) => `/roster/${item.slug}`)),
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
