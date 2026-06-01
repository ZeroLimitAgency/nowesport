import Link from "next/link";
import { AuthPanel } from "@/components/auth-panel";
import { PageIntro } from "@/components/sections";
import { orderSteps } from "@/data/commerce";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  status: string;
  payment_status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  order_items?: Array<{ product_name: string; quantity: number }>;
};

const statusLabels: Record<string, string> = {
  pending: "Commande reçue",
  paid: "Paiement validé",
  processing: "Préparation",
  shipped: "Expédiée",
  completed: "Terminée",
  refunded: "Remboursée",
};

export default async function ComptePage() {
  const { isConfigured, user, profile } = await requireUser("/compte");
  let orders: OrderRow[] = [];

  if (isConfigured && user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("id, status, payment_status, total_cents, currency, created_at, order_items(product_name, quantity)")
      .order("created_at", { ascending: false });

    orders = (data as OrderRow[] | null) ?? [];
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro
        kicker="Compte"
        title="Espace client et suivi commandes"
        description="Retrouve ta session, ton profil, tes achats et le suivi des commandes validées par Stripe."
      />

      <section className="mx-auto w-full max-w-[92rem] px-5 pb-12 sm:px-8">
        {!isConfigured ? (
          <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
              Supabase requis
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">
              Configure Supabase Auth pour activer les comptes utilisateurs, les profils et l&apos;historique de commandes.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
            <AuthPanel
              hasUser={Boolean(user)}
              userEmail={profile?.email ?? user?.email ?? undefined}
            />

            <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
                    Commandes
                  </p>
                  <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">
                    Historique achats
                  </h2>
                </div>
                <Link href="/profile" className="secondary-cta">
                  Modifier profil
                </Link>
              </div>

              {orders.length > 0 ? (
                <div className="mt-6 grid gap-4">
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
                          {statusLabels[order.status] ?? order.status}
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
                        <span>{new Date(order.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                      {order.order_items?.length ? (
                        <p className="mt-3 text-sm leading-6 text-white/48">
                          {order.order_items
                            .map((item) => `${item.quantity}× ${item.product_name}`)
                            .join(" · ")}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-sm leading-6 text-white/58">
                    Aucune commande pour le moment. Dès qu&apos;un paiement Stripe sera confirmé, le suivi apparaîtra ici.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {orderSteps.slice(0, 3).map((step) => (
                      <span key={step} className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/52">
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
