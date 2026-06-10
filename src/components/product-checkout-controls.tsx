"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProductCard } from "@/lib/content";

function variantLabel(variant: NonNullable<ProductCard["variants"]>[number]) {
  return [variant.name, variant.size, variant.color].filter(Boolean).join(" · ");
}

export function ProductCheckoutControls({ product }: { product: ProductCard }) {
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = variants.find((variant) => variant.id === variantId) ?? null;
  const maxQuantity = selectedVariant?.stock && selectedVariant.stock > 0
    ? selectedVariant.stock
    : 25;
  const checkoutHref = useMemo(() => {
    const params = new URLSearchParams({ quantity: String(quantity) });
    if (variantId) {
      params.set("variant", variantId);
    }
    return `/checkout/${product.slug}?${params.toString()}`;
  }, [product.slug, quantity, variantId]);

  const disabledReason = !product.stripePriceId && !selectedVariant?.stripePriceId
    ? "Le paiement en ligne sera activé au lancement de ce produit."
    : hasVariants && !selectedVariant
      ? "Sélectionne une taille ou une variante avant de payer."
      : selectedVariant && selectedVariant.stock <= 0
        ? "Cette variante est en rupture de stock."
        : null;

  return (
    <div className="mt-8 grid gap-4">
      {hasVariants ? (
        <label className="grid gap-2 text-sm font-semibold text-white/70">
          Variante obligatoire
          <select
            required
            value={variantId}
            onChange={(event) => {
              setVariantId(event.target.value);
              setQuantity(1);
            }}
            className="min-h-13 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm text-white outline-none focus:border-[var(--color-accent)]/60"
          >
            <option value="">Choisir une variante</option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id} disabled={variant.stock <= 0}>
                {variantLabel(variant)} · {variant.stock > 0 ? `${variant.stock} en stock` : "rupture"}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="grid max-w-44 gap-2 text-sm font-semibold text-white/70">
        Quantité
        <input
          type="number"
          min={1}
          max={maxQuantity}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Math.min(Number(event.target.value) || 1, maxQuantity)))}
          className="min-h-13 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm text-white outline-none focus:border-[var(--color-accent)]/60"
        />
      </label>

      {disabledReason ? (
        <>
          <button type="button" disabled className="primary-cta w-full cursor-not-allowed opacity-50 sm:w-auto">
            Paiement bientôt disponible
          </button>
          <p className="text-sm leading-6 text-white/46">{disabledReason}</p>
        </>
      ) : (
        <>
          <Link href={checkoutHref} className="primary-cta w-full sm:w-auto">
            Payer sur le site
          </Link>
          <p className="text-sm leading-6 text-white/46">
            Paiement sécurisé via Stripe Checkout intégré. Les produits physiques demanderont les informations de livraison.
          </p>
        </>
      )}
    </div>
  );
}
