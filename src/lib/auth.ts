import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AppProfile = {
  id: string;
  role?: "admin" | "customer" | string | null;
  email?: string | null;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
};

export async function getSessionUser() {
  if (!hasSupabaseEnv()) {
    return { user: null, profile: null, isConfigured: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, isConfigured: true };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, email, username, full_name, avatar_url, phone, country, city")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: (profile as AppProfile | null) ?? {
      id: user.id,
      email: user.email,
      role: "customer",
    },
    isConfigured: true,
  };
}

export async function requireUser(next = "/compte") {
  const session = await getSessionUser();

  if (!session.isConfigured) {
    return session;
  }

  if (!session.user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser("/admin");

  if (!session.isConfigured || !session.user) {
    redirect("/login?next=/admin");
  }

  if (session.profile?.role !== "admin") {
    redirect("/compte");
  }

  return session;
}
