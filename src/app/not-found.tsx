import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#050505_0%,#050505_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[18rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]" />

      <section className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-[92rem] items-center px-5 py-16 sm:px-8">
        <div className="w-full rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,#171219_0%,#09090b_100%)] px-6 py-12 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:px-10 sm:py-14">
          <p className="section-kicker">Erreur 404</p>
          <h1 className="mt-4 max-w-5xl text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] sm:text-7xl">
            Cette page n&apos;existe pas
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Tu t&apos;es peut-être trompé de lien ou la page a été déplacée. Le
            plus simple est de revenir à l&apos;accueil pour reprendre la
            navigation.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/" className="primary-cta">
              Retourner au site
            </Link>
            <Link href="/shop" className="secondary-cta">
              Aller à la boutique
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
