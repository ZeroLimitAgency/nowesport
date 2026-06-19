import { AdminShell } from "@/components/admin-shell";
import { AdminEmptyState, AdminPageHeader, AdminStatusBadge } from "@/components/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Profile = { id: string; email: string | null; username: string | null; role: string; created_at: string };

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { isConfigured } = await requireAdmin();
  let profiles: Profile[] = [];

  if (isConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, email, username, role, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    profiles = (data as Profile[] | null) ?? [];
  }

  return (
    <AdminShell>
      <div className="grid gap-6"><AdminPageHeader kicker="Utilisateurs" title="Comptes et rôles" description="Vue simple des profils Supabase utiles à l’administration." />
        <div className="grid gap-4">
        {profiles.map((profile) => (
          <article key={profile.id} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-white/58">
              <strong className="text-white">{profile.username ?? profile.email ?? profile.id}</strong>
              <AdminStatusBadge tone={profile.role === "admin" ? "success" : "default"}>{profile.role}</AdminStatusBadge>
              <span>{new Date(profile.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
          </article>
        ))}
        {!profiles.length ? <AdminEmptyState title="Aucun utilisateur" description="Les profils Supabase apparaîtront ici après création de compte." /> : null}
        </div>
      </div>
    </AdminShell>
  );
}
