"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);

export function EmbeddedCheckoutExperience({
  slug,
  productName,
  variantId,
  quantity,
}: {
  slug: string;
  productName: string;
  variantId?: string | null;
  quantity: number;
}) {
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(
    () => ({
      fetchClientSecret: async () => {
        try {
          const response = await fetch("/api/checkout/embedded-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ slug, variantId, quantity }),
          });

          const payload = (await response.json()) as {
            clientSecret?: string;
            error?: string;
          };

          if (!response.ok || !payload.clientSecret) {
            throw new Error(
              payload.error ??
                "Impossible de créer la session Stripe intégrée pour ce produit.",
            );
          }

          setError(null);
          return payload.clientSecret;
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Erreur inattendue lors de l'initialisation Stripe.",
          );
          throw error;
        }
      },
      onComplete: () => {
        setCompleted(true);
      },
    }),
    [slug, variantId, quantity],
  );

  if (completed) {
    return (
      <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,#171219_0%,#09090b_100%)] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
        <p className="section-kicker">Paiement confirmé</p>
        <h2 className="mt-4 text-4xl font-black uppercase leading-[0.94] tracking-[-0.05em] text-white">
          Merci pour ta commande
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
          Le paiement du produit {productName} est termine. Le webhook
          Stripe va maintenant créer ou mettre à jour la commande dans ton
          espace client.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link href="/compte" className="primary-cta">
            Voir mes commandes
          </Link>
          <Link href="/shop" className="secondary-cta">
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] px-5 py-5">
        <p className="text-sm leading-6 text-white/58">
          Le paiement est intégré directement dans le site via Stripe Checkout
          embedded, sans redirection vers une page hébergée.
        </p>
      </div>

      {error ? (
        <div className="rounded-[1.4rem] border border-[var(--color-accent)]/25 bg-[rgba(233,53,133,0.08)] px-4 py-4 text-sm leading-6 text-[var(--color-accent-soft)]">
          {error}
        </div>
      ) : null}

      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-white">
          <EmbeddedCheckout />
        </div>
      </EmbeddedCheckoutProvider>
    </div>
  );
}
