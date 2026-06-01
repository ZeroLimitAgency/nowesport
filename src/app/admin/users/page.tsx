import { AdminShell } from "@/components/admin-shell";
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
      <div className="grid gap-4">
        {profiles.map((profile) => (
          <article key={profile.id} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-white/58">
              <strong className="text-white">{profile.username ?? profile.email ?? profile.id}</strong>
              <span>{profile.role}</span>
              <span>{new Date(profile.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
          </article>
        ))}
        {!profiles.length ? <p className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5 text-white/58">Aucun utilisateur à afficher.</p> : null}
      </div>
    </AdminShell>
  );
}
