import { AdminCard } from "@/components/admin-cards";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getCatalogProducts } from "@/lib/commerce";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { isConfigured } = await requireAdmin();
  const products = await getCatalogProducts();
  let ordersCount = 0;
  let usersCount = 0;

  if (isConfigured) {
    const supabase = await createClient();
    const [{ count: orders }, { count: users }] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);
    ordersCount = orders ?? 0;
    usersCount = users ?? 0;
  }

  return (
    <AdminShell>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminCard title="Produits" value={String(products.length)} description="Catalogue public et variantes prêtes pour Stripe." />
        <AdminCard title="Commandes" value={String(ordersCount)} description="Commandes synchronisées depuis Stripe." />
        <AdminCard title="Utilisateurs" value={String(usersCount)} description="Comptes Supabase et profils client." />
        <AdminCard title="Maintenance" value="Preview" description="Accès admin conservé pendant la maintenance." />
      </div>
    </AdminShell>
  );
}
