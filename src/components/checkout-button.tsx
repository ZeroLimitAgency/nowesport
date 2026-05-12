"use client";

import Link from "next/link";

export function CheckoutButton({
  slug,
  disabled = false,
}: {
  slug: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-8">
      {disabled ? (
        <button
          type="button"
          disabled
          className="primary-cta w-full cursor-not-allowed opacity-50 sm:w-auto"
        >
          Paiement indisponible
        </button>
      ) : (
        <Link href={`/checkout/${slug}`} className="primary-cta w-full sm:w-auto">
          Payer sur le site
        </Link>
      )}
      <p className="mt-3 text-sm leading-6 text-white/46">
        Paiement sécurisé via Stripe Checkout intégré.
      </p>
    </div>
  );
}
