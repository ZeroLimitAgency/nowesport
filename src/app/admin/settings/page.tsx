import { updateMaintenanceSetting } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { AdminPageHeader, AdminStatusBadge } from "@/components/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { getMaintenanceSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const maintenanceEnabled = await getMaintenanceSetting();

  return (
    <AdminShell>
      <div className="grid gap-6"><AdminPageHeader kicker="Paramètres" title="Réglages du site" description="Options globales présentées sans jargon technique." actions={<AdminStatusBadge tone={maintenanceEnabled ? "warning" : "success"}>Maintenance {maintenanceEnabled ? "active" : "désactivée"}</AdminStatusBadge>} />
      <form action={updateMaintenanceSetting} className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">Maintenance</p>
        <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">Mode maintenance public</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">Active une page d’attente pour les visiteurs tout en gardant l’accès admin et preview.</p>
        <label className="mt-6 flex items-center gap-3 text-sm font-semibold text-white/72">
          <input type="checkbox" name="maintenance_mode" defaultChecked={maintenanceEnabled} className="h-5 w-5 accent-pink-500" />
          Maintenance active
        </label>
        <button type="submit" className="primary-cta mt-6">
          Enregistrer
        </button>
      </form></div>
    </AdminShell>
  );
}
