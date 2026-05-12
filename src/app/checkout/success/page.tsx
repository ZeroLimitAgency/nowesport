import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="mx-auto flex w-full max-w-[56rem] px-5 py-16 sm:px-8 sm:py-24">
        <div className="w-full rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,#171219_0%,#09090b_100%)] px-6 py-10 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:px-10">
          <p className="section-kicker">Paiement</p>
          <h1 className="mt-4 text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-white sm:text-7xl">
            Paiement confirmé
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Stripe a bien validé le paiement. La prochaine étape sera de relier
            ce succès à tes commandes Supabase via le webhook.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/compte" className="primary-cta">
              Aller à mon compte
            </Link>
            <Link href="/shop" className="secondary-cta">
              Retour à la boutique
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
