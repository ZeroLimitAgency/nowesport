export type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

export type SupabaseServiceEnv = {
  url: string;
  serviceRoleKey: string;
};

export function getOptionalSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function hasSupabaseEnv() {
  return Boolean(getOptionalSupabasePublicEnv());
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  const env = getOptionalSupabasePublicEnv();

  if (!env) {
    throw new Error("Variables Supabase publiques manquantes.");
  }

  return env;
}

export function getSupabaseServiceEnv(): SupabaseServiceEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Variables Supabase serveur manquantes.");
  }

  return { url, serviceRoleKey };
}
