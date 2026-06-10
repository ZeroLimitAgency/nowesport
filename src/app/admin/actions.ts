"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  imageMimeTypes,
  isMediaBucket,
  maxImageSizeBytes,
  maxVideoSizeBytes,
  mediaMimeTypes,
  sanitizeMediaFilename,
  sanitizeMediaFolder,
  videoMimeTypes,
} from "@/lib/media";

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

const cmsLocales = new Set(["fr", "en"]);
const navigationPlacements = new Set(["header", "footer_legal"]);

function requiredCmsLocale(formData: FormData) {
  const locale = requiredText(formData, "locale", "Langue");
  if (!cmsLocales.has(locale)) {
    throw new Error("Langue CMS invalide. Choisis FR ou EN.");
  }
  return locale;
}

function requiredNavigationPlacement(formData: FormData) {
  const placement = requiredText(formData, "placement", "Emplacement");
  if (!navigationPlacements.has(placement)) {
    throw new Error("Emplacement de navigation invalide. Choisis Header ou Footer légal.");
  }
  return placement;
}

function optionalUrl(formData: FormData, key: string, label: string, options: { allowRelative?: boolean } = {}) {
  const value = nullableText(formData, key);
  if (!value) return null;

  const isRelative = value.startsWith("/") && !value.startsWith("//");
  if (options.allowRelative && isRelative) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:") {
      return value;
    }
  } catch {
    // handled below with a readable admin error
  }

  throw new Error(`${label} doit être une URL valide${options.allowRelative ? " ou un chemin interne commençant par /" : ""}.`);
}

function requiredUrl(formData: FormData, key: string, label: string, options: { allowRelative?: boolean } = {}) {
  const value = optionalUrl(formData, key, label, options);
  if (!value) {
    throw new Error(`${label} est obligatoire.`);
  }
  return value;
}

function intValue(formData: FormData, key: string, fallback = 0) {
  const raw = text(formData, key);
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : fallback;
}


function mediaFileError(message: string) {
  return new Error(`Média : ${message}`);
}

function fileExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function validateMediaFile(file: File) {
  if (!file.size) {
    throw mediaFileError("choisis un fichier non vide.");
  }

  const mimeType = file.type;
  if (!(mediaMimeTypes as readonly string[]).includes(mimeType)) {
    throw mediaFileError("format refusé. Formats autorisés : png, jpg, jpeg, webp et mp4.");
  }

  const extension = fileExtension(file.name);
  const allowedImageExtensions = ["png", "jpg", "jpeg", "webp"];
  const allowedVideoExtensions = ["mp4"];
  const isImage = (imageMimeTypes as readonly string[]).includes(mimeType);
  const isVideo = (videoMimeTypes as readonly string[]).includes(mimeType);

  if (isImage && !allowedImageExtensions.includes(extension)) {
    throw mediaFileError("extension image refusée. Utilise png, jpg, jpeg ou webp.");
  }

  if (isVideo && !allowedVideoExtensions.includes(extension)) {
    throw mediaFileError("extension vidéo refusée. Utilise mp4.");
  }

  const maxSize = isVideo ? maxVideoSizeBytes : maxImageSizeBytes;
  if (file.size > maxSize) {
    const maxMb = Math.floor(maxSize / 1024 / 1024);
    throw mediaFileError(`fichier trop lourd. Limite : ${maxMb} Mo.`);
  }

  return { mimeType, extension };
}

export async function uploadMedia(formData: FormData) {
  const { supabase } = await getAdminClient();
  const bucket = text(formData, "bucket");
  const folder = sanitizeMediaFolder(text(formData, "folder"));
  const file = formData.get("file");

  if (!isMediaBucket(bucket)) {
    throw mediaFileError("bucket invalide.");
  }

  if (!(file instanceof File)) {
    throw mediaFileError("fichier manquant.");
  }

  const { mimeType, extension } = validateMediaFile(file);
  const safeName = sanitizeMediaFilename(file.name);
  const basename = safeName.replace(new RegExp(`\\.${extension}$`, "i"), "");
  const uniqueName = `${basename}-${Date.now()}.${extension}`;
  const path = folder ? `${folder}/${uniqueName}` : uniqueName;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw adminError("Upload média", error);
  }

  revalidatePath("/admin/media");
  revalidatePath("/admin/products");
  revalidatePath("/admin/partners");
  revalidatePath("/admin/events");
  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
}

export async function deleteMedia(formData: FormData) {
  const { supabase } = await getAdminClient();
  const bucket = text(formData, "bucket");
  const path = text(formData, "path");

  if (!isMediaBucket(bucket)) {
    throw mediaFileError("bucket invalide.");
  }

  if (!path || path.includes("..")) {
    throw mediaFileError("chemin invalide.");
  }

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw adminError("Suppression média", error);
  }

  revalidatePath("/admin/media");
  revalidatePath("/admin/products");
  revalidatePath("/admin/partners");
  revalidatePath("/admin/events");
  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
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

function jsonValue(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("Le champ JSON est invalide. Vérifie les guillemets, virgules et accolades.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Le champ JSON doit être un objet, par exemple {\"sections\":[\"Texte\"]}.");
  }

  return parsed as Record<string, unknown>;
}

export async function saveSiteContentBlock(formData: FormData) {
  const { supabase } = await getAdminClient();
  const payload = {
    locale: requiredCmsLocale(formData),
    area: requiredText(formData, "area", "Zone"),
    block_key: requiredText(formData, "block_key", "Clé"),
    title: requiredText(formData, "title", "Titre"),
    body: nullableText(formData, "body"),
    eyebrow: nullableText(formData, "eyebrow"),
    cta_label: nullableText(formData, "cta_label"),
    cta_href: optionalUrl(formData, "cta_href", "Lien CTA", { allowRelative: true }),
    secondary_cta_label: nullableText(formData, "secondary_cta_label"),
    secondary_cta_href: optionalUrl(formData, "secondary_cta_href", "Lien CTA secondaire", { allowRelative: true }),
    media_url: optionalUrl(formData, "media_url", "URL média", { allowRelative: true }),
    metadata: jsonValue(formData, "metadata"),
    is_active: formData.get("is_active") === "on",
    sort_order: intValue(formData, "sort_order"),
  };

  const { error } = await supabase
    .from("site_content_blocks")
    .upsert(payload, { onConflict: "locale,area,block_key" });

  if (error) {
    throw adminError("Contenu du site", error);
  }

  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
}

export async function saveSiteNavigationItem(formData: FormData) {
  const { supabase } = await getAdminClient();
  const id = nullableText(formData, "id");
  const payload = {
    locale: requiredCmsLocale(formData),
    placement: requiredNavigationPlacement(formData),
    label: requiredText(formData, "label", "Libellé"),
    href: requiredUrl(formData, "href", "Lien", { allowRelative: true }),
    is_active: formData.get("is_active") === "on",
    sort_order: intValue(formData, "sort_order"),
  };

  const query = id
    ? supabase.from("site_navigation").update(payload).eq("id", id)
    : supabase.from("site_navigation").insert(payload);
  const { error } = await query;

  if (error) {
    throw adminError("Navigation", error);
  }

  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
}

export async function deleteSiteNavigationItem(formData: FormData) {
  const { supabase } = await getAdminClient();
  const { error } = await supabase.from("site_navigation").delete().eq("id", text(formData, "id"));

  if (error) {
    throw adminError("Suppression navigation", error);
  }

  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
}

export async function saveSiteSocialLink(formData: FormData) {
  const { supabase } = await getAdminClient();
  const id = nullableText(formData, "id");
  const payload = {
    platform: requiredText(formData, "platform", "Plateforme"),
    label: requiredText(formData, "label", "Libellé"),
    href: requiredUrl(formData, "href", "Lien réseau social"),
    is_active: formData.get("is_active") === "on",
    sort_order: intValue(formData, "sort_order"),
  };

  const query = id
    ? supabase.from("site_social_links").update(payload).eq("id", id)
    : supabase.from("site_social_links").insert(payload);
  const { error } = await query;

  if (error) {
    throw adminError("Réseaux sociaux", error);
  }

  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
}

export async function deleteSiteSocialLink(formData: FormData) {
  const { supabase } = await getAdminClient();
  const { error } = await supabase.from("site_social_links").delete().eq("id", text(formData, "id"));

  if (error) {
    throw adminError("Suppression réseau social", error);
  }

  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
}
