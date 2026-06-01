import { unstable_noStore as noStore } from "next/cache";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function getMaintenanceSetting() {
  noStore();

  if (!hasSupabaseEnv()) {
    return process.env.NEXT_PUBLIC_MAINTENANCE_MODE !== "off";
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle();

    if (error || data?.value === undefined || data?.value === null) {
      return process.env.NEXT_PUBLIC_MAINTENANCE_MODE !== "off";
    }

    return data.value === true;
  } catch {
    return process.env.NEXT_PUBLIC_MAINTENANCE_MODE !== "off";
  }
}
