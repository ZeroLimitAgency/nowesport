import "server-only";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasPermission, type WorkspaceAccess, type WorkspacePermission, type WorkspaceScope } from "./permissions";

export async function getWorkspaceAccess(): Promise<WorkspaceAccess | null> {
  const session = await requireUser("/workspace");
  if (!session.isConfigured || !session.user) return null;
  const supabase = await createClient();
  const { data: member } = await supabase.from("workspace_members").select("id, organization_id, display_name, department_id, role_id").eq("user_id", session.user.id).eq("is_active", true).maybeSingle();
  if (!member) return null;
  const [{ data: grants }, { data: scopes }] = await Promise.all([
    supabase.from("workspace_role_permissions").select("permissions(key)").eq("role_id", member.role_id),
    supabase.from("workspace_member_scopes").select("scope_type, scope_id").eq("member_id", member.id),
  ]);
  const permissions = (grants ?? []).map((grant) => (grant.permissions as unknown as { key: WorkspacePermission } | null)?.key).filter(Boolean) as WorkspacePermission[];
  return { memberId: member.id, organizationId: member.organization_id, displayName: member.display_name, departmentId: member.department_id, permissions, scopes: (scopes ?? []).map((scope) => ({ type: scope.scope_type, id: scope.scope_id })) as WorkspaceScope[] };
}

export async function requireWorkspacePermission(permission: WorkspacePermission) {
  const access = await getWorkspaceAccess();
  if (!access || !hasPermission(access, "workspace.access")) redirect("/workspace-forbidden");
  if (!hasPermission(access, permission)) redirect("/workspace-forbidden");
  return access;
}
