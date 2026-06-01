import { PageIntro } from "@/components/sections";
import { UpdatePasswordForm } from "@/components/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro
        kicker="Sécurité"
        title="Réinitialisation du mot de passe"
        description="Choisis un nouveau mot de passe pour sécuriser ton compte NOW eSport."
      />
      <section className="mx-auto w-full max-w-[92rem] px-5 pb-12 sm:px-8">
        <UpdatePasswordForm />
      </section>
    </main>
  );
}
