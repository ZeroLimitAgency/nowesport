export const WORKSPACE_PERMISSIONS = [
  "workspace.access", "workspace.dashboard.view", "fortnite.access", "fortnite.dashboard.view",
  "players.view", "players.create", "players.edit", "players.archive", "players.view_performance",
  "scouting.view", "scouting.create", "scouting.edit", "scouting.archive", "scouting.compare",
  "scouting.refresh", "scouting.notes.view", "scouting.notes.create", "scouting.notes.direction_view", "scouting.scores.manage",
  "streams.view", "streams.manage", "streams.analytics.view", "streams.goals.view", "streams.goals.manage", "streams.compare", "calendar.view", "calendar.create", "calendar.edit", "calendar.delete",
  "tasks.view", "tasks.create", "tasks.edit", "tasks.assign", "tasks.delete", "meetings.view",
  "meetings.create", "meetings.edit", "contracts.view", "contracts.create", "contracts.edit",
  "contracts.view_financials", "finance.view", "notifications.view", "notifications.manage_preferences", "notifications.push.manage", "notifications.test",
  "workspace.users.view", "workspace.users.manage", "workspace.roles.view", "workspace.roles.manage",
  "players.performance.refresh", "players.performance.compare", "analytics.export",
  "overlays.view", "overlays.create", "overlays.edit", "overlays.publish", "overlays.assign", "overlays.tokens.manage", "overlays.campaigns.view", "overlays.campaigns.manage",
  "administration.access",
] as const;

export type WorkspacePermission = (typeof WORKSPACE_PERMISSIONS)[number];
export type WorkspaceScope = { type: "organization" | "department" | "team" | "resource"; id: string };
export type WorkspaceAccess = {
  memberId: string;
  organizationId: string;
  displayName: string;
  departmentId: string | null;
  permissions: WorkspacePermission[];
  scopes: WorkspaceScope[];
};

export function hasPermission(access: Pick<WorkspaceAccess, "permissions">, permission: WorkspacePermission) {
  return access.permissions.includes(permission);
}

export function canAccessScope(access: WorkspaceAccess, scope: WorkspaceScope) {
  return access.organizationId === scope.id && scope.type === "organization" ||
    access.scopes.some((candidate) => candidate.type === "organization" && candidate.id === access.organizationId || candidate.type === scope.type && candidate.id === scope.id);
}

export function omitFinancialFields<T extends Record<string, unknown>>(record: T, access: Pick<WorkspaceAccess, "permissions">) {
  if (hasPermission(access, "contracts.view_financials")) return record;
  const safe: Record<string, unknown> = { ...record };
  delete safe.financial_terms;
  delete safe.amount_cents;
  delete safe.salary_cents;
  return safe;
}
