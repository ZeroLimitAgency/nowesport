import { AuthPanel } from "@/components/auth-panel";
import { PageIntro } from "@/components/sections";
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
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro
        kicker="Login"
        title="Connexion client et admin"
        description="La connexion Supabase est centralisée ici pour les clients, le suivi des commandes et l'accès admin à la preview quand la maintenance reste active."
      />
      <section className="mx-auto w-full max-w-[92rem] px-5 pb-12 sm:px-8">
        {isConfigured ? (
          <AuthPanel
            hasUser={Boolean(userEmail)}
            userEmail={userEmail ?? undefined}
            nextPath={nextPath}
          />
        ) : (
          <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
              Supabase manquant
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">
              Renseigne NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY pour activer la connexion.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
