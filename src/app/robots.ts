import type { MetadataRoute } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nowesport.org";

async function isMaintenanceEnabledForRobots() {
  const supabaseEnv = getOptionalSupabasePublicEnv();

  if (supabaseEnv) {
    try {
      const supabase = createSupabaseClient(
        supabaseEnv.url,
        supabaseEnv.publishableKey,
        { auth: { persistSession: false } },
      );
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();

      if (typeof data?.value === "boolean") {
        return data.value;
      }
    } catch {
      // Fallback env below.
    }
  }

  return process.env.NEXT_PUBLIC_MAINTENANCE_MODE !== "off";
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const maintenance = await isMaintenanceEnabledForRobots();

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
