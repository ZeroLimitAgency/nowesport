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
  imageUrl?: string | null;
  variants?: Array<{
    id: string;
    name: string;
    size?: string | null;
    color?: string | null;
    stock: number;
    stripePriceId?: string | null;
  }>;
};
export type RosterMemberCard = {
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  pseudo?: string | null;
  role: string;
  roleType: string;
  nationality?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  rankingPoints?: number | null;
  prizeEarnings?: number | null;
  socialLinks: Record<string, string>;
};

export type RosterTeamCard = {
  slug: string;
  name: string;
  game: string;
  gameSlug?: string | null;
  category?: string | null;
  description: string;
  logoUrl?: string | null;
  gameIconUrl?: string | null;
  bannerUrl?: string | null;
  members: RosterMemberCard[];
};

export type GameCard = (typeof games)[number] & {
  logoUrl?: string | null;
  gameIconUrl?: string | null;
  bannerUrl?: string | null;
  rosters: Array<{
    name: string;
    members: string[];
  }>;
};
export type PartnerCard = (typeof partners)[number] & { imageUrl?: string | null };
export type EventCard = (typeof events)[number] & { imageUrl?: string | null };
export type TeamSupportBlock = (typeof teamSupportBlocks)[number];

function formatPrice(priceCents: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}


export async function getPublicProducts(): Promise<ProductCard[]> {
  noStore();

  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "slug, name, category, description, short_description, price_cents, currency, hero_image_url, stripe_product_id, stripe_price_id",
    )
    .eq("is_public", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(`Lecture produits Supabase impossible : ${error.message}`);
    return [];
  }

  return (data ?? []).map((item) => ({
    slug: item.slug,
    name: item.name,
    category: item.category ?? "Collection",
    price: typeof item.price_cents === "number" ? formatPrice(item.price_cents, item.currency ?? "EUR") : "Prix à venir",
    description: item.short_description ?? item.description ?? "",
    imageUrl: item.hero_image_url,
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
      "id, slug, name, category, description, short_description, price_cents, currency, hero_image_url, product_type, requires_shipping, allow_custom_name, allow_custom_number, allow_flocking, stripe_product_id, stripe_price_id",
    )
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    console.error(`Lecture produit Supabase impossible : ${error.message}`);
    return null;
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
    console.error(`Lecture variantes Supabase impossible : ${variantsError.message}`);
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
    price: typeof data.price_cents === "number" ? formatPrice(data.price_cents, data.currency ?? "EUR") : "Prix à venir",
    description: data.short_description ?? data.description ?? "",
    imageUrl: data.hero_image_url,
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

function normalizeSocialLinks(value: unknown, fallback?: string | null) {
  const links = value && typeof value === "object" && !Array.isArray(value)
    ? Object.fromEntries(
        Object.entries(value as Record<string, unknown>).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string" && Boolean(entry[1]),
        ),
      )
    : {};

  if (fallback && !links.website) {
    links.website = fallback;
  }

  return links;
}

export async function getPublicRosterTeams(): Promise<RosterTeamCard[]> {
  noStore();

  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const [{ data: teamsData, error: teamsError }, { data: membersData, error: membersError }] = await Promise.all([
    supabase
      .from("rosters")
      .select("id, slug, name, category, description, logo_url, game_icon_url, banner_url, sort_order, games(slug, name)")
      .eq("is_public", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("roster_members")
      .select("roster_id, first_name, last_name, pseudo, display_name, role_type, role_label, nationality, country, bio, photo_url, avatar_url, ranking_points, prize_earnings, social_links, social_url, sort_order")
      .eq("is_public", true)
      .order("sort_order", { ascending: true }),
  ]);

  const error = teamsError ?? membersError;
  if (error) {
    console.error(`Lecture rosters Supabase impossible : ${error.message}`);
    return [];
  }

  return (teamsData ?? []).map((team) => {
    const game = Array.isArray(team.games) ? team.games[0] : team.games;
    const members = (membersData ?? [])
      .filter((member) => member.roster_id === team.id)
      .map((member) => ({
        displayName: member.pseudo ?? member.display_name,
        firstName: member.first_name,
        lastName: member.last_name,
        pseudo: member.pseudo ?? member.display_name,
        role: member.role_label ?? "Player",
        roleType: member.role_type ?? member.role_label ?? "Player",
        nationality: member.nationality ?? member.country,
        bio: member.bio,
        photoUrl: member.photo_url ?? member.avatar_url,
        rankingPoints: member.ranking_points,
        prizeEarnings: member.prize_earnings,
        socialLinks: normalizeSocialLinks(member.social_links, member.social_url),
      }));

    return {
      slug: team.slug,
      name: team.name,
      game: game?.name ?? team.category ?? "NOW eSport",
      gameSlug: game?.slug ?? null,
      category: team.category,
      description: team.description ?? "",
      logoUrl: team.logo_url,
      gameIconUrl: team.game_icon_url ?? team.logo_url,
      bannerUrl: team.banner_url,
      members,
    };
  });
}

export async function getPublicRosterTeamBySlug(slug: string): Promise<RosterTeamCard | null> {
  const teams = await getPublicRosterTeams();
  return teams.find((item) => item.slug === slug) ?? null;
}

export async function getPublicGames(): Promise<GameCard[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const teams = await getPublicRosterTeams();

  return teams.map((team) => ({
    slug: team.slug,
    game: team.name,
    subtitle: team.game,
    description: team.description,
    visual: team.gameSlug ?? "now",
    logoUrl: team.logoUrl,
    gameIconUrl: team.gameIconUrl,
    bannerUrl: team.bannerUrl,
    rosters: [
      {
        name: team.category ?? team.game,
        members: team.members.map((member) => member.displayName),
      },
    ],
  }));
}

export async function getPublicGameBySlug(slug: string): Promise<GameCard | null> {
  const gamesData = await getPublicGames();
  return gamesData.find((item) => item.slug === slug) ?? null;
}

export async function getPublicPartners(): Promise<PartnerCard[]> {
  noStore();

  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("name, role_label, description, image_url, external_url")
    .eq("is_public", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(`Lecture partenaires Supabase impossible : ${error.message}`);
    return [];
  }

  return (data ?? []).map((item) => ({
    name: item.name,
    role: item.role_label ?? "Partenaire",
    description: item.description ?? "",
    imageUrl: item.image_url,
    href: item.external_url ?? "",
  }));
}

export async function getPublicEvents(): Promise<EventCard[]> {
  noStore();

  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("title, event_date, location, description, image_url")
    .eq("is_public", true)
    .order("event_date", { ascending: false });

  if (error) {
    console.error(`Lecture événements Supabase impossible : ${error.message}`);
    return [];
  }

  return (data ?? []).map((item, index) => ({
    title: item.title,
    date: item.event_date ? new Date(item.event_date).toLocaleDateString("fr-FR") : "Date à venir",
    location: item.location ?? "",
    description: item.description ?? "",
    imageUrl: item.image_url,
    tone: index % 2 === 0 ? "studio" : "sunset",
  }));
}

export function getTeamSupportBlocks(): TeamSupportBlock[] {
  return teamSupportBlocks;
}
