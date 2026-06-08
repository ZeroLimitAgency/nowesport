import { createClient } from "@/lib/supabase/server";

export type CheckoutLineInput = {
  slug: string;
  quantity?: number;
  variantId?: string | null;
};

export type CheckoutLine = {
  productId: string;
  productSlug: string;
  productName: string;
  productType: "physical" | "digital";
  requiresShipping: boolean;
  variantId: string | null;
  variantName: string | null;
  variantLabel: string | null;
  quantity: number;
  stripePriceId: string;
};

export type CheckoutMetadataLine = {
  product_id: string;
  product_slug: string;
  product_name: string;
  product_type: "physical" | "digital";
  requires_shipping: boolean;
  variant_id: string | null;
  variant_name: string | null;
  quantity: number;
  stripe_price_id: string;
};

const maxCheckoutQuantity = 25;

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  product_type: string | null;
  requires_shipping: boolean | null;
  stripe_price_id: string | null;
  product_variants?: Array<{
    id: string;
    name: string;
    size: string | null;
    color: string | null;
    stock_quantity: number;
    stripe_price_id: string | null;
    is_active: boolean;
  }> | null;
};

function normalizeQuantity(quantity: number | undefined) {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.max(1, Math.min(Math.floor(quantity ?? 1), maxCheckoutQuantity));
}

function formatVariantLabel(variant: ProductRow["product_variants"] extends Array<infer T> | null | undefined ? T : never) {
  return [variant.name, variant.size, variant.color].filter(Boolean).join(" · ");
}

export function encodeCheckoutItemsMetadata(lines: CheckoutLine[]) {
  return JSON.stringify(
    lines.map((line) => ({
      p: line.productId,
      v: line.variantId,
      q: line.quantity,
      t: line.productType,
      r: line.requiresShipping,
    })),
  );
}

export function parseCheckoutItemsMetadata(raw: string | null | undefined): CheckoutMetadataLine[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((line) => ({
        product_id: String(line.product_id ?? line.p ?? ""),
        product_slug: String(line.product_slug ?? line.s ?? ""),
        product_name: String(line.product_name ?? line.n ?? ""),
        product_type: (line.product_type === "digital" || line.t === "digital" ? "digital" : "physical") as "digital" | "physical",
        requires_shipping: Boolean(line.requires_shipping ?? line.r),
        variant_id: line.variant_id || line.v ? String(line.variant_id ?? line.v) : null,
        variant_name: line.variant_name || line.vn ? String(line.variant_name ?? line.vn) : null,
        quantity: Number(line.quantity ?? line.q ?? 1),
        stripe_price_id: String(line.stripe_price_id ?? line.price ?? ""),
      }))
      .filter((line) => Boolean(line.product_id));
  } catch {
    return [];
  }
}

export async function resolveCheckoutLines(items: CheckoutLineInput[]) {
  const normalizedItems = items
    .map((item) => ({
      slug: item.slug.trim(),
      quantity: normalizeQuantity(item.quantity),
      variantId: item.variantId?.trim() || null,
    }))
    .filter((item) => item.slug);

  if (!normalizedItems.length) {
    throw new Error("Aucun produit valide pour le checkout.");
  }

  const supabase = await createClient();
  const slugs = Array.from(new Set(normalizedItems.map((item) => item.slug)));
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, product_type, requires_shipping, stripe_price_id, product_variants(id, name, size, color, stock_quantity, stripe_price_id, is_active)")
    .in("slug", slugs)
    .eq("is_public", true);

  if (error) {
    throw new Error(`Lecture produits checkout impossible : ${error.message}`);
  }

  const products = new Map((data as ProductRow[] | null ?? []).map((product) => [product.slug, product]));

  return normalizedItems.map((item) => {
    const product = products.get(item.slug);
    if (!product) {
      throw new Error(`Produit introuvable pour le checkout : ${item.slug}.`);
    }

    const activeVariants = (product.product_variants ?? []).filter((variant) => variant.is_active);
    const hasVariants = activeVariants.length > 0;
    const selectedVariant = item.variantId
      ? activeVariants.find((variant) => variant.id === item.variantId)
      : null;

    if (hasVariants && !selectedVariant) {
      throw new Error(`Selectionne une variante pour ${product.name} avant de payer.`);
    }

    if (selectedVariant && selectedVariant.stock_quantity < item.quantity) {
      throw new Error(`Stock insuffisant pour ${product.name} (${formatVariantLabel(selectedVariant)}).`);
    }

    const stripePriceId = selectedVariant?.stripe_price_id ?? product.stripe_price_id;
    if (!stripePriceId) {
      throw new Error(`Stripe n'est pas configure pour ${product.name}.`);
    }

    const productType = product.product_type === "digital" ? "digital" : "physical";

    return {
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productType,
      requiresShipping: product.requires_shipping ?? productType !== "digital",
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
      variantLabel: selectedVariant ? formatVariantLabel(selectedVariant) : null,
      quantity: item.quantity,
      stripePriceId,
    } satisfies CheckoutLine;
  });
}
