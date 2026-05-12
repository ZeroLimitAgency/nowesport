import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="mx-auto flex w-full max-w-[56rem] px-5 py-16 sm:px-8 sm:py-24">
        <div className="w-full rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,#171219_0%,#09090b_100%)] px-6 py-10 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:px-10">
          <p className="section-kicker">Paiement</p>
          <h1 className="mt-4 text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-white sm:text-7xl">
            Paiement annulé
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            La session Stripe a été annulée. Tu peux revenir au produit et
            relancer le checkout quand tu veux.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/shop" className="primary-cta">
              Retour à la boutique
            </Link>
            <Link href="/" className="secondary-cta">
              Revenir à l&apos;accueil
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
