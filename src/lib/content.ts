import { unstable_noStore as noStore } from "next/cache";
import {
  collectionItems,
  events,
  games,
  newsCards,
  partners,
  teamSupportBlocks,
  getGameBySlug,
  getProductBySlug,
} from "@/data/site";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type ProductCard = (typeof collectionItems)[number] & {
  stripePriceId?: string | null;
  stripeProductId?: string | null;
};
export type GameCard = (typeof games)[number];
export type PartnerCard = (typeof partners)[number];
export type EventCard = (typeof events)[number];
export type NewsCard = (typeof newsCards)[number];
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
    return collectionItems;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "slug, name, category, description, short_description, price_cents, currency, stripe_product_id, stripe_price_id",
      )
      .eq("is_public", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return collectionItems;
    }

    return data.map((item, index) => {
      const fallback = collectionItems[index % collectionItems.length];

      return {
        ...fallback,
        slug: item.slug,
        name: item.name,
        category: item.category ?? fallback.category,
        price: formatPrice(item.price_cents, item.currency ?? "EUR"),
        description:
          item.short_description ?? item.description ?? fallback.description,
        intro: item.description ?? fallback.intro,
        stripePriceId: item.stripe_price_id,
        stripeProductId: item.stripe_product_id,
      };
    });
  } catch {
    return collectionItems;
  }
}

export async function getPublicProductBySlug(
  slug: string,
): Promise<ProductCard | null> {
  noStore();

  if (!hasSupabaseEnv()) {
    return getProductBySlug(slug) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, name, category, description, short_description, price_cents, currency, allow_custom_name, allow_custom_number, allow_flocking, stripe_product_id, stripe_price_id",
      )
      .eq("slug", slug)
      .eq("is_public", true)
      .maybeSingle();

    if (error || !data) {
      return getProductBySlug(slug) ?? null;
    }

    const { data: variants } = await supabase
      .from("product_variants")
      .select("name, size, color")
      .eq("product_id", data.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const fallback = getProductBySlug(slug) ?? collectionItems[0];
    const details = [
      data.description ?? fallback.details[0],
      data.allow_custom_name ? "Personnalisation du nom activée." : null,
      data.allow_custom_number ? "Personnalisation du numéro activée." : null,
      data.allow_flocking ? "Flocage activé pour ce produit." : null,
      ...(variants?.length
        ? variants.map((variant) =>
            [variant.name, variant.size, variant.color].filter(Boolean).join(" · "),
          )
        : fallback.details),
    ].filter((item): item is string => Boolean(item));

    return {
      ...fallback,
      slug: data.slug,
      name: data.name,
      category: data.category ?? fallback.category,
      price: formatPrice(data.price_cents, data.currency ?? "EUR"),
      description: data.short_description ?? data.description ?? fallback.description,
      intro: data.description ?? fallback.intro,
      details: Array.from(new Set(details)).slice(0, 6),
      stripePriceId: data.stripe_price_id,
      stripeProductId: data.stripe_product_id,
    };
  } catch {
    return getProductBySlug(slug) ?? null;
  }
}

export async function getPublicGames(): Promise<GameCard[]> {
  noStore();

  if (!hasSupabaseEnv()) {
    return games;
  }

  try {
    const supabase = await createClient();
    const [{ data: gamesData, error: gamesError }, { data: rostersData }, { data: membersData }] =
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

    if (gamesError || !gamesData?.length) {
      return games;
    }

    return gamesData.map((game, index) => {
      const fallback = games[index % games.length];
      const rosters = (rostersData ?? [])
        .filter((roster) => roster.game_id === game.id)
        .map((roster) => ({
          name: roster.name,
          members: (membersData ?? [])
            .filter((member) => member.roster_id === roster.id)
            .map((member) => member.display_name),
        }))
        .filter((roster) => roster.members.length > 0);

      return {
        ...fallback,
        slug: game.slug,
        game: game.name,
        subtitle: game.subtitle ?? fallback.subtitle,
        description: game.description ?? fallback.description,
        visual: game.visual ?? fallback.visual,
        rosters: rosters.length ? rosters : fallback.rosters,
      };
    });
  } catch {
    return games;
  }
}

export async function getPublicGameBySlug(slug: string): Promise<GameCard | null> {
  const gamesData = await getPublicGames();
  return gamesData.find((item) => item.slug === slug) ?? getGameBySlug(slug) ?? null;
}

export async function getPublicPartners(): Promise<PartnerCard[]> {
  noStore();

  if (!hasSupabaseEnv()) {
    return partners;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("partners")
      .select("name, role_label, description, external_url")
      .eq("is_public", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return partners;
    }

    return data.map((item, index) => {
      const fallback = partners[index % partners.length];

      return {
        name: item.name,
        role: item.role_label ?? fallback.role,
        description: item.description ?? fallback.description,
        href: item.external_url ?? fallback.href,
      };
    });
  } catch {
    return partners;
  }
}

export async function getPublicEvents(): Promise<EventCard[]> {
  noStore();

  if (!hasSupabaseEnv()) {
    return events;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("title, event_date, location, description")
      .eq("is_public", true)
      .order("event_date", { ascending: false });

    if (error || !data?.length) {
      return events;
    }

    return data.map((item, index) => {
      const fallback = events[index % events.length];

      return {
        title: item.title,
        date: new Date(item.event_date).toLocaleDateString("fr-FR"),
        location: item.location ?? fallback.location,
        description: item.description ?? fallback.description,
        tone: index % 2 === 0 ? "studio" : "sunset",
      };
    });
  } catch {
    return events;
  }
}

export async function getPublicNews(): Promise<NewsCard[]> {
  noStore();

  if (!hasSupabaseEnv()) {
    return newsCards;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news")
      .select("title, excerpt, tag, external_url, published_at")
      .eq("is_public", true)
      .order("published_at", { ascending: false });

    if (error || !data?.length) {
      return newsCards;
    }

    return data.map((item, index) => {
      const fallback = newsCards[index % newsCards.length];

      return {
        title: item.title,
        excerpt: item.excerpt ?? fallback.excerpt,
        tag: item.tag ?? fallback.tag,
        href: item.external_url ?? fallback.href,
        date: item.published_at
          ? new Date(item.published_at).toLocaleDateString("fr-FR")
          : fallback.date,
      };
    });
  } catch {
    return newsCards;
  }
}

export function getTeamSupportBlocks(): TeamSupportBlock[] {
  return teamSupportBlocks;
}
