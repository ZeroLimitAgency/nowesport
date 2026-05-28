import type { Metadata } from "next";

const discordTicketUrl = "https://discord.gg/K5AxWfD7tc";

export const metadata: Metadata = {
  title: "Maintenance | NOW eSport",
  description: "Le site NOW eSport est temporairement en maintenance.",
};

export default function MaintenancePage() {
  return (
    <main className="fixed inset-0 z-[60] flex min-h-screen items-center justify-center overflow-y-auto bg-[#050505] px-5 py-28 text-white sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(233,53,133,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,142,192,0.16),transparent_28%)]" />
      <div className="hero-grid absolute inset-0 opacity-70" aria-hidden="true" />

      <section className="relative z-10 mx-auto w-full max-w-4xl rounded-[2rem] border border-white/10 bg-black/55 p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:rounded-[2.5rem] sm:p-12">
        <p className="mx-auto inline-flex rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#ff8ec0]">
          NOW eSport
        </p>

        <h1 className="mt-7 text-5xl font-black uppercase leading-[0.9] tracking-[-0.08em] sm:text-7xl lg:text-8xl">
          Site en maintenance
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
          Nous préparons la nouvelle version du site. Il sera bientôt disponible avec toutes les pages finales.
          Merci pour votre patience.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={discordTicketUrl}
            target="_blank"
            rel="noreferrer"
            className="primary-cta w-full sm:w-auto"
          >
            Nous contacter
          </a>
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-white/42">
            Ouvrir un ticket Discord
          </span>
        </div>
      </section>
    </main>
  );
}
