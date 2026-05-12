import { AuthPanel } from "@/components/auth-panel";
import { PageIntro } from "@/components/sections";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function ComptePage() {
  const isConfigured = hasSupabaseEnv();
  let userEmail: string | undefined;
  let orders:
    | Array<{
        id: string;
        status: string;
        payment_status: string;
        total_cents: number;
        currency: string;
        created_at: string;
      }>
    | null = null;

  if (isConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    userEmail = user?.email;

    if (user) {
      const { data } = await supabase
        .from("orders")
        .select("id, status, payment_status, total_cents, currency, created_at")
        .order("created_at", { ascending: false });

      orders = data ?? [];
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro
        kicker="Compte"
        title="Connexion, inscription et espace client"
        description="Cette page devient le point d'entrée du compte client, avec connexion e-mail, création de compte et futurs accès aux commandes."
      />

      <section className="mx-auto w-full max-w-[92rem] px-5 pb-12 sm:px-8">
        {isConfigured ? (
          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <AuthPanel hasUser={Boolean(userEmail)} userEmail={userEmail} />

            <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
                Commandes
              </p>
              {!userEmail ? (
                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">
                  Connecte-toi pour afficher ton historique de commandes et
                  suivre les paiements validés par Stripe.
                </p>
              ) : orders && orders.length > 0 ? (
                <div className="mt-5 grid gap-3">
                  {orders.map((order) => (
                    <article
                      key={order.id}
                      className="rounded-[1.2rem] border border-white/8 bg-black/20 px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          Commande {order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/62">
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/50">
                        <span>
                          {(order.total_cents / 100).toLocaleString("fr-FR", {
                            style: "currency",
                            currency: order.currency,
                          })}
                        </span>
                        <span>{order.payment_status}</span>
                        <span>
                          {new Date(order.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">
                  Aucune commande n&apos;a encore été synchronisée. Dès qu&apos;un
                  paiement Stripe sera confirmé par webhook, elle apparaîtra ici.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
              Supabase manquant
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">
              Les variables Supabase ne sont pas encore lisibles. Vérifie que ton
              fichier <code>.env.local</code> est bien rempli puis redémarre le
              serveur de développement.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
