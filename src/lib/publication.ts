export const PUBLIC_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type SeoVariant = {
  price_cents?: number | null;
  stock_quantity?: number | null;
  is_active?: boolean | null;
};

export type SeoProductRecord = {
  is_public?: boolean | null;
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  short_description?: string | null;
  price_cents?: number | null;
  product_variants?: SeoVariant[] | null;
};

export type SeoRosterRecord = {
  is_public?: boolean | null;
  is_active?: boolean | null;
  slug?: string | null;
  name?: string | null;
  description?: string | null;
};

function text(value: string | null | undefined) {
  return Boolean(value?.trim());
}

export function activeVariants(product: SeoProductRecord) {
  return (product.product_variants ?? []).filter((variant) => variant.is_active !== false);
}

export function getSeoPriceCents(product: SeoProductRecord): number | null {
  const variantPrices = activeVariants(product)
    .map((variant) => variant.price_cents)
    .filter((price): price is number => typeof price === "number" && price > 0);
  if (variantPrices.length) return Math.min(...variantPrices);
  return typeof product.price_cents === "number" && product.price_cents > 0
    ? product.price_cents
    : null;
}

export function isSeoPublishableProduct(product: SeoProductRecord) {
  return product.is_public === true
    && PUBLIC_SLUG_PATTERN.test(product.slug ?? "")
    && text(product.name)
    && text(product.short_description ?? product.description)
    && getSeoPriceCents(product) !== null;
}

export function isSeoProductOutOfStock(product: SeoProductRecord) {
  const variants = activeVariants(product);
  return variants.length > 0
    && variants.every((variant) => (variant.stock_quantity ?? 0) <= 0);
}

export function isSeoPublishableRoster(roster: SeoRosterRecord) {
  return roster.is_public === true
    && roster.is_active === true
    && PUBLIC_SLUG_PATTERN.test(roster.slug ?? "")
    && text(roster.name)
    && text(roster.description);
}
