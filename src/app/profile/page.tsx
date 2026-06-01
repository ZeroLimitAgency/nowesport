import Link from "next/link";
import { ProfileForm } from "@/components/profile-form";
import { PageIntro } from "@/components/sections";
import { profileFields } from "@/data/commerce";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { isConfigured, profile, user } = await requireUser("/profile");

  if (!isConfigured || !profile) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <PageIntro
          kicker="Profil"
          title="Configuration Supabase requise"
          description="Le profil utilisateur réel sera disponible dès que Supabase Auth sera configuré sur cet environnement."
        />
      </main>
    );
  }

  const displayName = profile.username ?? profile.full_name ?? user?.email ?? "Compte NOW";

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro
        kicker="Profil"
        title="Profil utilisateur"
        description="Gère ton avatar, ton pseudo et tes informations personnelles rattachées à ton compte NOW eSport."
      />
      <section className="mx-auto grid w-full max-w-[92rem] gap-5 px-5 pb-12 sm:px-8 lg:grid-cols-[0.78fr_1.22fr]">
        <article className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#171219_0%,#09090b_100%)] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] text-2xl font-black uppercase text-white">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                displayName.slice(0, 2)
              )}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
                Session active
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.04em] text-white">
                {displayName}
              </h2>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-white/58">
            {profile.email ?? user?.email}
          </p>
          <Link href="/compte" className="primary-cta mt-6">
            Suivre mes commandes
          </Link>
        </article>

        <ProfileForm profile={profile} />

        <div className="grid gap-4 lg:col-span-2 sm:grid-cols-2 lg:grid-cols-4">
          {profileFields.map((field) => (
            <article
              key={field.label}
              className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5"
            >
              <p className="text-sm font-semibold text-white">{field.label}</p>
              <p className="mt-2 text-sm leading-6 text-white/52">{field.value}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
