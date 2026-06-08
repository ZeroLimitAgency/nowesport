"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CatalogProduct } from "@/lib/commerce";

type CartLine = {
  slug: string;
  quantity: number;
  variantId?: string | null;
};

const storageKey = "now-cart-v1";

function firstAvailableVariant(product: CatalogProduct) {
  return product.variants.find((variant) => variant.stock > 0) ?? product.variants[0] ?? null;
}

function variantLabel(variant: CatalogProduct["variants"][number]) {
  return [variant.name, variant.size, variant.color].filter(Boolean).join(" · ");
}

function defaultLine(product: CatalogProduct): CartLine {
  return {
    slug: product.slug,
    quantity: 1,
    variantId: firstAvailableVariant(product)?.id ?? null,
  };
}

export function CartClient({ products }: { products: CatalogProduct[] }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [lines, setLinesState] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") {
      return products.slice(0, 1).map(defaultLine);
    }

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return products.slice(0, 1).map(defaultLine);
    }

    try {
      return (JSON.parse(raw) as CartLine[]).map((line) => ({
        ...line,
        variantId: line.variantId ?? null,
      }));
    } catch {
      window.localStorage.removeItem(storageKey);
      return products.slice(0, 1).map(defaultLine);
    }
  });

  function setLines(next: CartLine[] | ((current: CartLine[]) => CartLine[])) {
    setLinesState((current) => {
      const value = typeof next === "function" ? next(current) : next;
      window.localStorage.setItem(storageKey, JSON.stringify(value));
      return value;
    });
  }

  const hydratedLines = lines
    .map((line) => ({ ...line, product: products.find((item) => item.slug === line.slug) }))
    .filter((line): line is CartLine & { product: CatalogProduct } => Boolean(line.product));

  const total = useMemo(
    () => hydratedLines.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0),
    [hydratedLines],
  );

  function updateQuantity(slug: string, quantity: number, variantId?: string | null) {
    const product = products.find((item) => item.slug === slug);
    const variant = product?.variants.find((item) => item.id === variantId);
    const maxQuantity = variant?.stock && variant.stock > 0
      ? variant.stock
      : product?.stock && product.stock > 0
        ? product.stock
        : quantity;

    setLines((current) =>
      current
        .map((line) =>
          line.slug === slug && (line.variantId ?? null) === (variantId ?? null)
            ? { ...line, quantity: Math.min(quantity, maxQuantity) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  function updateVariant(slug: string, currentVariantId: string | null | undefined, nextVariantId: string) {
    setLines((current) =>
      current.map((line) =>
        line.slug === slug && (line.variantId ?? null) === (currentVariantId ?? null)
          ? { ...line, variantId: nextVariantId || null, quantity: 1 }
          : line,
      ),
    );
  }

  function addProduct(slug: string) {
    setLines((current) => {
      const product = products.find((item) => item.slug === slug);
      if (!product) {
        return current;
      }

      const variantId = firstAvailableVariant(product)?.id ?? null;
      const existing = current.find(
        (line) => line.slug === slug && (line.variantId ?? null) === variantId,
      );

      if (existing) {
        const maxStock = variantId
          ? product.variants.find((variant) => variant.id === variantId)?.stock
          : product.stock;
        const nextQuantity = maxStock && maxStock > 0
          ? Math.min(existing.quantity + 1, maxStock)
          : existing.quantity + 1;
        return current.map((line) =>
          line.slug === slug && (line.variantId ?? null) === variantId
            ? { ...line, quantity: nextQuantity }
            : line,
        );
      }
      return [...current, { slug, quantity: 1, variantId }];
    });
  }

  async function startCheckout() {
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: hydratedLines.map((line) => ({
            slug: line.slug,
            quantity: line.quantity,
            variantId: line.variantId ?? null,
          })),
        }),
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Impossible de lancer le checkout panier.");
      }

      window.location.href = payload.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Erreur checkout panier.");
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-4">
        {!hydratedLines.length ? (
          <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5 text-sm leading-6 text-white/58">
            Ton panier est vide. Ajoute un produit depuis la sélection ci-dessous ou retourne à la boutique.
          </div>
        ) : null}

        {hydratedLines.map((line) => {
          const variant = line.product.variants.find((item) => item.id === line.variantId) ?? null;
          const maxQuantity = variant?.stock && variant.stock > 0 ? variant.stock : line.product.stock || 25;

          return (
            <article
              key={`${line.slug}-${line.variantId ?? "default"}`}
              className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-soft)]">
                    {line.product.productType === "digital" ? "Produit numérique" : "Produit physique"}
                  </p>
                  <h2 className="mt-3 text-2xl font-black text-white">
                    {line.product.name}
                  </h2>
                  {line.product.variants.length ? (
                    <label className="mt-4 grid max-w-md gap-2 text-sm text-white/58">
                      Variante
                      <select
                        value={line.variantId ?? ""}
                        onChange={(event) => updateVariant(line.slug, line.variantId, event.target.value)}
                        className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none"
                      >
                        <option value="">Choisir une variante</option>
                        {line.product.variants.map((item) => (
                          <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                            {variantLabel(item)} · {item.stock > 0 ? `${item.stock} en stock` : "rupture"}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-white/54">
                      Stock disponible : {line.product.stock > 0 ? line.product.stock : "illimité / à confirmer"}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => updateQuantity(line.slug, line.quantity - 1, line.variantId)} className="secondary-cta min-h-10 px-4">
                    -
                  </button>
                  <span className="min-w-10 text-center text-sm font-bold text-white">{line.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(line.slug, line.quantity + 1, line.variantId)} className="secondary-cta min-h-10 px-4" disabled={line.quantity >= maxQuantity}>
                    +
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-white/72">{line.product.price}</p>
            </article>
          );
        })}

        <div className="grid gap-3 sm:grid-cols-2">
          {products.slice(0, 4).map((product) => (
            <button
              key={product.slug}
              type="button"
              onClick={() => addProduct(product.slug)}
              className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4 text-left text-sm text-white/72"
            >
              Ajouter {product.name}
            </button>
          ))}
        </div>
      </div>

      <aside className="h-fit rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#171219_0%,#09090b_100%)] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
          Récapitulatif
        </p>
        <div className="mt-5 flex items-center justify-between border-b border-white/10 pb-4 text-sm text-white/58">
          <span>Sous-total</span>
          <span>{(total / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/50">
          Le panier est conservé sur ce navigateur. Le paiement Stripe enverra les lignes sélectionnées, quantités et variantes disponibles.
        </p>
        {checkoutError ? (
          <p className="mt-4 rounded-2xl border border-[var(--color-accent)]/25 bg-[rgba(233,53,133,0.08)] px-4 py-3 text-sm text-[var(--color-accent-soft)]">
            {checkoutError}
          </p>
        ) : null}
        <button
          type="button"
          onClick={startCheckout}
          disabled={!hydratedLines.length || isCheckingOut}
          className="primary-cta mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCheckingOut ? "Ouverture Stripe..." : "Payer le panier"}
        </button>
        <Link href="/shop" className="secondary-cta mt-3 w-full">
          Continuer la boutique
        </Link>
      </aside>
    </div>
  );
}
