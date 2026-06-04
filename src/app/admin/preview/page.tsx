import Link from "next/link";
import { PageIntro } from "@/components/sections";

export default function AdminPreviewPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro
        kicker="Admin preview"
        title="Voir le site pendant la maintenance"
        description="Les admins peuvent ouvrir une session de preview, puis naviguer sur le site réel même si la maintenance publique répond toujours aux visiteurs."
      />
      <section className="mx-auto grid w-full max-w-[92rem] gap-5 px-5 pb-12 sm:px-8 lg:grid-cols-2">
        <article className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#171219_0%,#09090b_100%)] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
            Accès par compte admin
          </p>
          <p className="mt-4 text-sm leading-6 text-white/58">
            Connecte-toi avec un compte dont public.profiles.role vaut admin, puis ouvre l&apos;activation preview. La route valide la session Supabase côté serveur.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className="secondary-cta">
              Se connecter
            </Link>
            <a href="/api/admin/preview?next=/" className="primary-cta">
              Activer la preview
            </a>
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
            Accès par token
          </p>
          <p className="mt-4 text-sm leading-6 text-white/58">
            En environnement de preview, ajoute PREVIEW_SECRET côté serveur et ouvre /api/admin/preview?token=TON_SECRET&next=/ pour poser le cookie temporaire.
          </p>
          <p className="mt-4 text-sm leading-6 text-white/40">
            Pour fermer la session : /api/admin/preview/clear.
          </p>
        </article>
      </section>
    </main>
  );
}
