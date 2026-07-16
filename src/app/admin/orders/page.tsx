import Link from "next/link";
import { updateOrderStatus } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { AdminEmptyState, AdminPageHeader, AdminStatusBadge } from "@/components/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Order = {
  id: string;
  email: string;
  status: string;
  payment_status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  order_items?: Array<{ product_name: string; quantity: number }>;
};

const orderStatuses = ["pending", "paid", "processing", "shipped", "completed", "refunded"];

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { isConfigured } = await requireAdmin();
  let orders: Order[] = [];

  if (isConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("id, email, status, payment_status, total_cents, currency, created_at, order_items(product_name, quantity)")
      .order("created_at", { ascending: false })
      .limit(50);
    orders = (data as Order[] | null) ?? [];
  }

  return (
    <AdminShell>
      <div className="grid gap-6"><AdminPageHeader kicker="Commandes" title="Suivi des commandes" description="Liste lisible des commandes Stripe/Supabase avec changement de statut et accès au détail." />
        <div className="grid gap-4">
        {orders.map((order) => (
          <article key={order.id} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-white/58">
                  <strong className="text-white">{order.id.slice(0, 8).toUpperCase()}</strong>
                  <span className="min-w-0 break-all">{order.email}</span>
                  <AdminStatusBadge tone={order.payment_status === "paid" ? "success" : "warning"}>{order.payment_status}</AdminStatusBadge>
                  <span>{new Date(order.created_at).toLocaleDateString("fr-FR")}</span>
                </div>
                <p className="mt-3 text-2xl font-black text-white">
                  {(order.total_cents / 100).toLocaleString("fr-FR", { style: "currency", currency: order.currency })}
                </p>
                <p className="mt-2 break-words text-sm text-white/48">
                  {(order.order_items ?? []).map((item) => `${item.quantity}× ${item.product_name}`).join(" · ") || "Aucune ligne synchronisée"}
                </p>
              </div>
              <form action={updateOrderStatus} className="grid min-w-0 gap-3 rounded-[1.2rem] border border-white/8 bg-black/20 p-4 lg:min-w-80">
                <input type="hidden" name="order_id" value={order.id} />
                <select name="status" defaultValue={order.status} className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none">
                  {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <input name="message" placeholder="Message historique" className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-white/30" />
                <div className="grid gap-2 sm:flex sm:flex-wrap">
                  <button type="submit" className="secondary-cta">Changer statut</button>
                  <Link href={`/admin/orders/${order.id}`} className="secondary-cta">Détail</Link>
                </div>
              </form>
            </div>
          </article>
        ))}
        {!orders.length ? <AdminEmptyState title="Aucune commande" description="Les nouvelles commandes synchronisées depuis Stripe apparaîtront ici." /> : null}
        </div>
      </div>
    </AdminShell>
  );
}
