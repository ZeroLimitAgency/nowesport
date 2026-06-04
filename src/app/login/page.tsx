import { AuthPanel } from "@/components/auth-panel";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function safeNext(value?: string | string[]) {
  const next = Array.isArray(value) ? value[0] : value;
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/compte";
  }
  return next;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const nextPath = safeNext((await searchParams).next);
  const { isConfigured, user, profile } = await getSessionUser();
  const userEmail = profile?.email ?? user?.email;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#050505] px-5 py-12 text-white sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(233,53,133,0.26),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,142,192,0.14),transparent_28%)]" />
      <div className="hero-grid absolute inset-0 opacity-45" aria-hidden="true" />

      <section className="relative z-10 grid w-full max-w-3xl gap-8">
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
            <span className="logo-mark" aria-hidden="true" />
            <span className="text-xs font-black uppercase tracking-[0.28em] text-white/90">
              NOW ESPORT
            </span>
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-[var(--color-accent-soft)]">
            Login
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-black uppercase leading-[0.92] tracking-[-0.06em] sm:text-6xl">
            Connexion client et admin
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
            Accès e-mail sécurisé pour l&apos;espace client, le suivi de commandes
            et la preview admin pendant la maintenance.
          </p>
        </div>

        {!isConfigured ? (
          <div className="mx-auto -mb-3 w-full max-w-xl rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-center text-sm leading-6 text-white/58 backdrop-blur-2xl">
            Supabase n&apos;est pas encore configuré : l&apos;interface reste visible
            pour validation UX, mais la connexion réelle sera active après
            configuration des variables d&apos;environnement.
          </div>
        ) : null}

        <AuthPanel
          hasUser={Boolean(userEmail)}
          userEmail={userEmail ?? undefined}
          nextPath={nextPath}
        />
      </section>
    </main>
  );
}
