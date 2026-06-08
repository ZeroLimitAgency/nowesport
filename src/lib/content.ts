import { unstable_noStore as noStore } from "next/cache";
import {
  events,
  games,
  partners,
  teamSupportBlocks,
} from "@/data/site";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type ProductCard = {
  slug: string;
  name: string;
  category: string;
  price: string;
  description: string;
  intro: string;
  details: string[];
  stripePriceId?: string | null;
  stripeProductId?: string | null;
  productType?: "physical" | "digital";
  requiresShipping?: boolean;
  variants?: Array<{
    id: string;
    name: string;
    size?: string | null;
    color?: string | null;
    stock: number;
    stripePriceId?: string | null;
  }>;
};
export type GameCard = (typeof games)[number];
export type PartnerCard = (typeof partners)[number];
export type EventCard = (typeof events)[number];
export type TeamSupportBlock = (typeof teamSupportBlocks)[number];

function formatPrice(priceCents: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}

function emptyWhenSupabaseUnavailable<T>() {
  return [] as T[];
}

export async function getPublicProducts(): Promise<ProductCard[]> {
  noStore();

  if (!hasSupabaseEnv()) {
    return emptyWhenSupabaseUnavailable<ProductCard>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "slug, name, category, description, short_description, price_cents, currency, stripe_product_id, stripe_price_id",
    )
    .eq("is_public", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Lecture produits Supabase impossible : ${error.message}`);
  }

  return (data ?? []).map((item) => ({
    slug: item.slug,
    name: item.name,
    category: item.category ?? "Collection",
    price: formatPrice(item.price_cents, item.currency ?? "EUR"),
    description: item.short_description ?? item.description ?? "",
    intro: item.description ?? item.short_description ?? "",
    details: [item.description, item.short_description]
      .filter((detail): detail is string => Boolean(detail)),
    stripePriceId: item.stripe_price_id,
    stripeProductId: item.stripe_product_id,
  }));
}

export async function getPublicProductBySlug(
  slug: string,
): Promise<ProductCard | null> {
  noStore();

  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, category, description, short_description, price_cents, currency, product_type, requires_shipping, allow_custom_name, allow_custom_number, allow_flocking, stripe_product_id, stripe_price_id",
    )
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Lecture produit Supabase impossible : ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, name, size, color, stock_quantity, stripe_price_id")
    .eq("product_id", data.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (variantsError) {
    throw new Error(`Lecture variantes Supabase impossible : ${variantsError.message}`);
  }

  const details = [
    data.description,
    data.short_description,
    data.allow_custom_name ? "Personnalisation du nom activée." : null,
    data.allow_custom_number ? "Personnalisation du numéro activée." : null,
    data.allow_flocking ? "Flocage activé pour ce produit." : null,
    ...(variants?.length
      ? variants.map((variant) =>
          [variant.name, variant.size, variant.color].filter(Boolean).join(" · "),
        )
      : []),
  ].filter((item): item is string => Boolean(item));

  return {
    slug: data.slug,
    name: data.name,
    category: data.category ?? "Collection",
    price: formatPrice(data.price_cents, data.currency ?? "EUR"),
    description: data.short_description ?? data.description ?? "",
    intro: data.description ?? data.short_description ?? "",
    details: Array.from(new Set(details)).slice(0, 6),
    stripePriceId: data.stripe_price_id,
    stripeProductId: data.stripe_product_id,
    productType: data.product_type === "digital" ? "digital" : "physical",
    requiresShipping: data.requires_shipping ?? data.product_type !== "digital",
    variants: (variants ?? []).map((variant) => ({
      id: variant.id,
      name: variant.name,
      size: variant.size,
      color: variant.color,
      stock: variant.stock_quantity ?? 0,
      stripePriceId: variant.stripe_price_id,
    })),
  };
}

export async function getPublicGames(): Promise<GameCard[]> {
  noStore();

  if (!hasSupabaseEnv()) {
    return emptyWhenSupabaseUnavailable<GameCard>();
  }

  const supabase = await createClient();
  const [{ data: gamesData, error: gamesError }, { data: rostersData, error: rostersError }, { data: membersData, error: membersError }] =
    await Promise.all([
      supabase
        .from("games")
        .select("id, slug, name, subtitle, description, visual")
        .eq("is_public", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("rosters")
        .select("id, game_id, name, category")
        .eq("is_public", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("roster_members")
        .select("roster_id, display_name")
        .eq("is_public", true)
        .order("sort_order", { ascending: true }),
    ]);

  const error = gamesError ?? rostersError ?? membersError;
  if (error) {
    throw new Error(`Lecture rosters Supabase impossible : ${error.message}`);
  }

  return (gamesData ?? []).map((game) => {
    const rosters = (rostersData ?? [])
      .filter((roster) => roster.game_id === game.id)
      .map((roster) => ({
        name: roster.name,
        members: (membersData ?? [])
          .filter((member) => member.roster_id === roster.id)
          .map((member) => member.display_name),
      }));

    return {
      slug: game.slug,
      game: game.name,
      subtitle: game.subtitle ?? "Roster",
      description: game.description ?? "",
      visual: game.visual ?? "now",
      rosters,
    };
  });
}

export async function getPublicGameBySlug(slug: string): Promise<GameCard | null> {
  const gamesData = await getPublicGames();
  return gamesData.find((item) => item.slug === slug) ?? null;
}

export async function getPublicPartners(): Promise<PartnerCard[]> {
  noStore();

  if (!hasSupabaseEnv()) {
    return emptyWhenSupabaseUnavailable<PartnerCard>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("name, role_label, description, external_url")
    .eq("is_public", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Lecture partenaires Supabase impossible : ${error.message}`);
  }

  return (data ?? []).map((item) => ({
    name: item.name,
    role: item.role_label ?? "Partenaire",
    description: item.description ?? "",
    href: item.external_url ?? "#",
  }));
}

export async function getPublicEvents(): Promise<EventCard[]> {
  noStore();

  if (!hasSupabaseEnv()) {
    return emptyWhenSupabaseUnavailable<EventCard>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("title, event_date, location, description")
    .eq("is_public", true)
    .order("event_date", { ascending: false });

  if (error) {
    throw new Error(`Lecture événements Supabase impossible : ${error.message}`);
  }

  return (data ?? []).map((item, index) => ({
    title: item.title,
    date: new Date(item.event_date).toLocaleDateString("fr-FR"),
    location: item.location ?? "",
    description: item.description ?? "",
    tone: index % 2 === 0 ? "studio" : "sunset",
  }));
}

export function getTeamSupportBlocks(): TeamSupportBlock[] {
  return teamSupportBlocks;
}
