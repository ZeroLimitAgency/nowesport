import { AdminShell } from "@/components/admin-shell";
import { AdminActionButton, AdminCard, AdminPageHeader, AdminSection, AdminStatusBadge } from "@/components/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { getCatalogProducts } from "@/lib/commerce";
import { getMaintenanceSetting } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const shortcuts = [
  ["Modifier contenu", "/admin/content"], ["Ajouter produit", "/admin/products"], ["Ajouter média", "/admin/media"], ["Gérer roster", "/admin/roster"], ["Gérer événements", "/admin/events"], ["Gérer partenaires", "/admin/partners"], ["Voir commandes", "/admin/orders"],
] as const;

export default async function AdminPage() {
  const { isConfigured } = await requireAdmin();
  const [products, maintenanceEnabled] = await Promise.all([getCatalogProducts(), getMaintenanceSetting()]);
  let ordersCount = 0, usersCount = 0, eventsCount = 0, partnersCount = 0, rostersCount = 0;

  if (isConfigured) {
    const supabase = await createClient();
    const [{ count: orders }, { count: users }, { count: events }, { count: partners }, { count: rosters }] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("partners").select("id", { count: "exact", head: true }),
      supabase.from("rosters").select("id", { count: "exact", head: true }),
    ]);
    ordersCount = orders ?? 0; usersCount = users ?? 0; eventsCount = events ?? 0; partnersCount = partners ?? 0; rostersCount = rosters ?? 0;
  }

  const stats = [
    ["Produits", products.length, "Articles visibles ou prêts à publier."], ["Événements", eventsCount, "Timeline et activations publiques."], ["Partenaires", partnersCount, "Sponsors et partenaires du club."], ["Rosters", rostersCount, "Équipes et groupes NOW."], ["Commandes", ordersCount, "Commandes synchronisées Stripe."], ["Utilisateurs", usersCount, "Profils Supabase."],
  ] as const;

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader kicker="Dashboard admin" title="Piloter NOW sans jargon" description="Vue synthétique du site, des raccourcis métier et des volumes principaux. Les réglages techniques restent dans les options avancées des modules." actions={<AdminStatusBadge tone={maintenanceEnabled ? "warning" : "success"}>Maintenance {maintenanceEnabled ? "active" : "désactivée"}</AdminStatusBadge>} />
        <AdminSection kicker="Actions rapides" title="Que veux-tu modifier ?" description="Accès direct aux tâches fréquentes du backoffice.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{shortcuts.map(([label, href]) => <AdminActionButton key={href} href={href} tone={label.startsWith("Ajouter") ? "success" : "default"}>{label}</AdminActionButton>)}</div>
        </AdminSection>
        <AdminSection kicker="État global" title="Contenu et commerce">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{stats.map(([title, value, description]) => <AdminCard key={title}><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-soft)]">{title}</p><p className="mt-4 text-4xl font-black text-white">{value}</p><p className="mt-3 text-sm leading-6 text-white/52">{description}</p></AdminCard>)}</div>
        </AdminSection>
      </div>
    </AdminShell>
  );
}
