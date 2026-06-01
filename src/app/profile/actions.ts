"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const { user, isConfigured } = await requireUser("/profile");

  if (!isConfigured || !user) {
    redirect("/login?next=/profile");
  }

  const payload = {
    username: String(formData.get("username") ?? "").trim() || null,
    full_name: String(formData.get("full_name") ?? "").trim() || null,
    avatar_url: String(formData.get("avatar_url") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    country: String(formData.get("country") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim() || null,
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile");
  revalidatePath("/compte");
}
