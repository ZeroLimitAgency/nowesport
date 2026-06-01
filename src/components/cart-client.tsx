"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CatalogProduct } from "@/lib/commerce";

type CartLine = {
  slug: string;
  quantity: number;
};

const storageKey = "now-cart-v1";

export function CartClient({ products }: { products: CatalogProduct[] }) {
  const [lines, setLinesState] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") {
      return products.slice(0, 1).map((product) => ({ slug: product.slug, quantity: 1 }));
    }

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return products.slice(0, 1).map((product) => ({ slug: product.slug, quantity: 1 }));
    }

    try {
      return JSON.parse(raw) as CartLine[];
    } catch {
      window.localStorage.removeItem(storageKey);
      return products.slice(0, 1).map((product) => ({ slug: product.slug, quantity: 1 }));
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

  function updateQuantity(slug: string, quantity: number) {
    const product = products.find((item) => item.slug === slug);
    const maxQuantity = product?.stock && product.stock > 0 ? product.stock : quantity;

    setLines((current) =>
      current
        .map((line) =>
          line.slug === slug
            ? { ...line, quantity: Math.min(quantity, maxQuantity) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  function addProduct(slug: string) {
    setLines((current) => {
      const existing = current.find((line) => line.slug === slug);
      const product = products.find((item) => item.slug === slug);
      if (!product) {
        return current;
      }

      if (existing) {
        const nextQuantity = product.stock > 0
          ? Math.min(existing.quantity + 1, product.stock)
          : existing.quantity + 1;
        return current.map((line) =>
          line.slug === slug ? { ...line, quantity: nextQuantity } : line,
        );
      }
      return [...current, { slug, quantity: 1 }];
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-4">
        {!hydratedLines.length ? (
          <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5 text-sm leading-6 text-white/58">
            Ton panier est vide. Ajoute un produit depuis la sélection ci-dessous ou retourne à la boutique.
          </div>
        ) : null}

        {hydratedLines.map((line) => (
          <article
            key={line.slug}
            className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-soft)]">
                  {line.product.productType === "digital" ? "Produit numérique" : "Produit physique"}
                </p>
                <h2 className="mt-3 text-2xl font-black text-white">
                  {line.product.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/54">
                  Stock disponible : {line.product.stock > 0 ? line.product.stock : "illimité / à confirmer"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => updateQuantity(line.slug, line.quantity - 1)} className="secondary-cta min-h-10 px-4">
                  -
                </button>
                <span className="min-w-10 text-center text-sm font-bold text-white">{line.quantity}</span>
                <button type="button" onClick={() => updateQuantity(line.slug, line.quantity + 1)} className="secondary-cta min-h-10 px-4">
                  +
                </button>
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold text-white/72">{line.product.price}</p>
          </article>
        ))}

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
          Le panier est persistant côté navigateur et prêt à être synchronisé dans Supabase pour les utilisateurs connectés.
        </p>
        <Link href="/shop" className="primary-cta mt-6 w-full">
          Continuer la boutique
        </Link>
      </aside>
    </div>
  );
}
