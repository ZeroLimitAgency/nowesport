import { notFound } from "next/navigation";
import { updateOrderStatus } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };
type OrderDetail = {
  id: string;
  email: string;
  status: string;
  payment_status: string;
  currency: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  created_at: string;
  shipping_name: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  order_items?: Array<{ id: string; product_name: string; variant_name: string | null; quantity: number; total_price_cents: number }>;
  order_status_events?: Array<{ id: string; status: string; message: string | null; created_at: string }>;
};

const orderStatuses = ["pending", "paid", "processing", "shipped", "completed", "refunded"];

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const { isConfigured } = await requireAdmin();

  if (!isConfigured) {
    notFound();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, email, status, payment_status, currency, subtotal_cents, shipping_cents, tax_cents, total_cents, created_at, shipping_name, shipping_city, shipping_country, order_items(id, product_name, variant_name, quantity, total_price_cents), order_status_events(id, status, message, created_at)")
    .eq("id", id)
    .maybeSingle();

  const order = data as OrderDetail | null;
  if (!order) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
        <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
          <p className="section-kicker">Commande</p>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em] text-white">{order.id.slice(0, 8)}</h2>
          <div className="mt-5 grid gap-3 text-sm text-white/58 sm:grid-cols-2">
            <p>{order.email}</p>
            <p>{order.status} · {order.payment_status}</p>
            <p>{new Date(order.created_at).toLocaleString("fr-FR")}</p>
            <p>{order.shipping_name ?? "Sans nom livraison"} · {order.shipping_city ?? ""} {order.shipping_country ?? ""}</p>
          </div>
          <div className="mt-6 grid gap-3">
            {(order.order_items ?? []).map((item) => (
              <article key={item.id} className="rounded-[1.1rem] border border-white/8 bg-black/20 p-4 text-sm text-white/62">
                <strong className="text-white">{item.quantity}× {item.product_name}</strong>
                {item.variant_name ? <span> · {item.variant_name}</span> : null}
                <span className="float-right">{(item.total_price_cents / 100).toLocaleString("fr-FR", { style: "currency", currency: order.currency })}</span>
              </article>
            ))}
          </div>
          <p className="mt-6 text-3xl font-black text-white">{(order.total_cents / 100).toLocaleString("fr-FR", { style: "currency", currency: order.currency })}</p>
        </section>

        <aside className="grid gap-5">
          <form action={updateOrderStatus} className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-5">
            <input type="hidden" name="order_id" value={order.id} />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">Statut</p>
            <select name="status" defaultValue={order.status} className="mt-4 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none">
              {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <textarea name="message" placeholder="Message visible dans l'historique" className="mt-3 min-h-24 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30" />
            <button type="submit" className="primary-cta mt-4">Mettre à jour</button>
          </form>

          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">Historique</p>
            <div className="mt-4 grid gap-3">
              {(order.order_status_events ?? []).map((event) => (
                <article key={event.id} className="rounded-[1rem] border border-white/8 bg-black/20 p-4 text-sm text-white/58">
                  <strong className="text-white">{event.status}</strong>
                  <p className="mt-1">{event.message ?? "Sans message"}</p>
                  <p className="mt-1 text-xs text-white/38">{new Date(event.created_at).toLocaleString("fr-FR")}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}
