import { createClient } from "@supabase/supabase-js";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";
import { resolveMaintenanceMode } from "@/lib/maintenance-policy";

export const MAINTENANCE_RETRY_AFTER_SECONDS = 3600;

export async function isMaintenanceEnabled(): Promise<boolean> {
  const env = getOptionalSupabasePublicEnv();

  if (env) {
    try {
      const supabase = createClient(env.url, env.publishableKey, {
        auth: { persistSession: false },
      });
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();

      if (!error && typeof data?.value === "boolean") return resolveMaintenanceMode(data.value, process.env.NEXT_PUBLIC_MAINTENANCE_MODE);
      if (error) console.error("Maintenance: lecture du réglage Supabase impossible.");
    } catch {
      console.error("Maintenance: source Supabase indisponible, utilisation du fallback.");
    }
  }

  return resolveMaintenanceMode(undefined, process.env.NEXT_PUBLIC_MAINTENANCE_MODE);
}

export function isPreviewDeployment() {
  return Boolean(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production");
}
