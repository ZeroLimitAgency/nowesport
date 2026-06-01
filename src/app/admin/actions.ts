"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function getAdminClient() {
  const { isConfigured, user } = await requireAdmin();

  if (!isConfigured || !user) {
    redirect("/login?next=/admin");
  }

  return { supabase: await createClient(), user };
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function requiredText(formData: FormData, key: string, label: string) {
  const value = text(formData, key);
  if (!value) {
    throw new Error(`${label} est obligatoire.`);
  }
  return value;
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}

function adminError(scope: string, error: { message?: string } | null) {
  return new Error(`${scope} : ${error?.message ?? "action impossible."}`);
}

const orderStatuses = new Set(["pending", "paid", "processing", "shipped", "completed", "refunded"]);

function intValue(formData: FormData, key: string, fallback = 0) {
  const raw = text(formData, key);
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : fallback;
}

export async function updateMaintenanceSetting(formData: FormData) {
  const { supabase, user } = await getAdminClient();
  const enabled = formData.get("maintenance_mode") === "on";
  const { error } = await supabase.from("site_settings").upsert({
    key: "maintenance_mode",
    value: enabled,
    value_type: "boolean",
    label: "Maintenance publique",
    is_public: true,
    updated_by: user.id,
  });

  if (error) {
    throw adminError("Paramètres maintenance", error);
  }

  revalidatePath("/admin/settings");
}

export async function saveProduct(formData: FormData) {
  const { supabase } = await getAdminClient();
  const id = nullableText(formData, "id");
  const payload = {
    slug: requiredText(formData, "slug", "Slug produit"),
    name: requiredText(formData, "name", "Nom produit"),
    category: nullableText(formData, "category"),
    product_type: text(formData, "product_type") === "digital" ? "digital" : "physical",
    requires_shipping: text(formData, "product_type") !== "digital",
    short_description: nullableText(formData, "short_description"),
    description: nullableText(formData, "description"),
    price_cents: intValue(formData, "price_cents"),
    currency: text(formData, "currency") || "EUR",
    hero_image_url: nullableText(formData, "hero_image_url"),
    is_public: formData.get("is_public") === "on",
    stripe_product_id: nullableText(formData, "stripe_product_id"),
    stripe_price_id: nullableText(formData, "stripe_price_id"),
    sort_order: intValue(formData, "sort_order"),
  };

  const query = id
    ? supabase.from("products").update(payload).eq("id", id)
    : supabase.from("products").insert(payload);
  const { error } = await query;

  if (error) {
    throw adminError("Produit", error);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await getAdminClient();
  const id = text(formData, "id");
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw adminError("Suppression produit", error);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function toggleProductStatus(formData: FormData) {
  const { supabase } = await getAdminClient();
  const id = text(formData, "id");
  const isPublic = formData.get("is_public") === "true";
  const { error } = await supabase
    .from("products")
    .update({ is_public: !isPublic })
    .eq("id", id);

  if (error) {
    throw adminError("Statut produit", error);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function saveProductVariant(formData: FormData) {
  const { supabase } = await getAdminClient();
  const id = nullableText(formData, "variant_id");
  const productId = text(formData, "product_id");
  const payload = {
    product_id: productId,
    sku: nullableText(formData, "sku"),
    name: requiredText(formData, "name", "Nom variante"),
    size: nullableText(formData, "size"),
    color: nullableText(formData, "color"),
    stock_quantity: intValue(formData, "stock_quantity"),
    price_cents: nullableText(formData, "price_cents")
      ? intValue(formData, "price_cents")
      : null,
    stripe_price_id: nullableText(formData, "stripe_price_id"),
    is_active: formData.get("is_active") === "on",
    sort_order: intValue(formData, "sort_order"),
  };

  const query = id
    ? supabase.from("product_variants").update(payload).eq("id", id)
    : supabase.from("product_variants").insert(payload);
  const { error } = await query;

  if (error) {
    throw adminError("Variante", error);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function deleteProductVariant(formData: FormData) {
  const { supabase } = await getAdminClient();
  const id = text(formData, "variant_id");
  const { error } = await supabase.from("product_variants").delete().eq("id", id);

  if (error) {
    throw adminError("Suppression variante", error);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function updateOrderStatus(formData: FormData) {
  const { supabase, user } = await getAdminClient();
  const orderId = text(formData, "order_id");
  const status = text(formData, "status");
  const message = nullableText(formData, "message");

  if (!orderStatuses.has(status)) {
    throw new Error("Statut de commande invalide.");
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (updateError) {
    throw adminError("Commande", updateError);
  }

  const { error: historyError } = await supabase.from("order_status_events").insert({
    order_id: orderId,
    status,
    message,
    created_by: user.id,
  });

  if (historyError) {
    throw adminError("Historique commande", historyError);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function saveEvent(formData: FormData) {
  const { supabase } = await getAdminClient();
  const id = nullableText(formData, "id");
  const payload = {
    slug: requiredText(formData, "slug", "Slug événement"),
    title: requiredText(formData, "title", "Titre événement"),
    event_date: requiredText(formData, "event_date", "Date événement"),
    location: nullableText(formData, "location"),
    description: nullableText(formData, "description"),
    image_url: nullableText(formData, "image_url"),
    external_url: nullableText(formData, "external_url"),
    is_public: formData.get("is_public") === "on",
    sort_order: intValue(formData, "sort_order"),
  };

  const query = id
    ? supabase.from("events").update(payload).eq("id", id)
    : supabase.from("events").insert(payload);
  const { error } = await query;

  if (error) {
    throw adminError("Événement", error);
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function deleteEvent(formData: FormData) {
  const { supabase } = await getAdminClient();
  const id = text(formData, "id");
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    throw adminError("Suppression événement", error);
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function savePartner(formData: FormData) {
  const { supabase } = await getAdminClient();
  const id = nullableText(formData, "id");
  const payload = {
    slug: requiredText(formData, "slug", "Slug partenaire"),
    name: requiredText(formData, "name", "Nom partenaire"),
    role_label: nullableText(formData, "role_label"),
    description: nullableText(formData, "description"),
    image_url: nullableText(formData, "image_url"),
    external_url: nullableText(formData, "external_url"),
    is_public: formData.get("is_public") === "on",
    sort_order: intValue(formData, "sort_order"),
  };

  const query = id
    ? supabase.from("partners").update(payload).eq("id", id)
    : supabase.from("partners").insert(payload);
  const { error } = await query;

  if (error) {
    throw adminError("Partenaire", error);
  }

  revalidatePath("/admin/partners");
  revalidatePath("/partners");
}

export async function deletePartner(formData: FormData) {
  const { supabase } = await getAdminClient();
  const id = text(formData, "id");
  const { error } = await supabase.from("partners").delete().eq("id", id);

  if (error) {
    throw adminError("Suppression partenaire", error);
  }

  revalidatePath("/admin/partners");
  revalidatePath("/partners");
}
