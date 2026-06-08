import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type CatalogProduct = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  productType: "physical" | "digital";
  price: string;
  priceCents: number;
  currency: string;
  description: string;
  stock: number;
  variants: Array<{
    id?: string;
    name: string;
    size?: string | null;
    color?: string | null;
    stock: number;
    priceCents?: number | null;
    stripePriceId?: string | null;
  }>;
};

function formatPrice(priceCents: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, category, description, short_description, product_type, price_cents, currency, product_variants(id, name, size, color, stock_quantity, price_cents, stripe_price_id, is_active)")
    .eq("is_public", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Lecture catalogue Supabase impossible : ${error.message}`);
  }

  return (data ?? []).map((product) => {
    const variants = Array.isArray(product.product_variants)
      ? product.product_variants.filter((variant) => variant.is_active)
      : [];
    const stock = variants.reduce(
      (total, variant) => total + (variant.stock_quantity ?? 0),
      0,
    );

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category ?? "Collection",
      productType: product.product_type === "digital" ? "digital" : "physical",
      price: formatPrice(product.price_cents, product.currency ?? "EUR"),
      priceCents: product.price_cents,
      currency: product.currency ?? "EUR",
      description: product.short_description ?? product.description ?? "",
      stock,
      variants: variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        size: variant.size,
        color: variant.color,
        stock: variant.stock_quantity ?? 0,
        priceCents: variant.price_cents,
        stripePriceId: variant.stripe_price_id,
      })),
    };
  });
}
