import { updateProfile } from "@/app/profile/actions";
import type { AppProfile } from "@/lib/auth";

export function ProfileForm({ profile }: { profile: AppProfile }) {
  return (
    <form
      action={updateProfile}
      className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#171219_0%,#09090b_100%)] p-6"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
        Informations personnelles
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-white/58">
          Pseudo
          <input name="username" defaultValue={profile.username ?? ""} className="min-h-13 rounded-full border border-white/10 bg-white/[0.04] px-5 text-white outline-none focus:border-[var(--color-accent)]/60" />
        </label>
        <label className="grid gap-2 text-sm text-white/58">
          Nom complet
          <input name="full_name" defaultValue={profile.full_name ?? ""} className="min-h-13 rounded-full border border-white/10 bg-white/[0.04] px-5 text-white outline-none focus:border-[var(--color-accent)]/60" />
        </label>
        <label className="grid gap-2 text-sm text-white/58 sm:col-span-2">
          Avatar URL
          <input name="avatar_url" defaultValue={profile.avatar_url ?? ""} className="min-h-13 rounded-full border border-white/10 bg-white/[0.04] px-5 text-white outline-none focus:border-[var(--color-accent)]/60" />
        </label>
        <label className="grid gap-2 text-sm text-white/58">
          Téléphone
          <input name="phone" defaultValue={profile.phone ?? ""} className="min-h-13 rounded-full border border-white/10 bg-white/[0.04] px-5 text-white outline-none focus:border-[var(--color-accent)]/60" />
        </label>
        <label className="grid gap-2 text-sm text-white/58">
          Ville
          <input name="city" defaultValue={profile.city ?? ""} className="min-h-13 rounded-full border border-white/10 bg-white/[0.04] px-5 text-white outline-none focus:border-[var(--color-accent)]/60" />
        </label>
        <label className="grid gap-2 text-sm text-white/58">
          Pays
          <input name="country" defaultValue={profile.country ?? ""} className="min-h-13 rounded-full border border-white/10 bg-white/[0.04] px-5 text-white outline-none focus:border-[var(--color-accent)]/60" />
        </label>
      </div>
      <button type="submit" className="primary-cta mt-6">
        Enregistrer
      </button>
    </form>
  );
}
