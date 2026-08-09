import type { WorkspacePermission } from "./permissions";

export type WorkspaceNavItem = { label: string; href: string; permission: WorkspacePermission };
export type WorkspaceNavGroup = { label: string; items: WorkspaceNavItem[] };

const groups: WorkspaceNavGroup[] = [
  { label: "Workspace", items: [{ label: "Overview", href: "/workspace", permission: "workspace.dashboard.view" }] },
  { label: "Fortnite", items: [
    { label: "Overview", href: "/workspace/fortnite", permission: "fortnite.dashboard.view" },
    { label: "Players", href: "/workspace/fortnite/players", permission: "players.view" },
    { label: "Scouting", href: "/workspace/fortnite/scouting", permission: "scouting.view" },
    { label: "Performance", href: "/workspace/fortnite/performance", permission: "players.view_performance" },
    { label: "Compare", href: "/workspace/fortnite/compare", permission: "players.performance.compare" },
    { label: "Live Center", href: "/workspace/fortnite/live", permission: "streams.view" },
  ] },
  { label: "Operations", items: [
    { label: "Calendar", href: "/workspace/calendar", permission: "calendar.view" },
    { label: "Tasks", href: "/workspace/tasks", permission: "tasks.view" },
    { label: "Meetings", href: "/workspace/meetings", permission: "meetings.view" },
  ] },
  { label: "Management", items: [
    { label: "Overlay Cloud", href: "/workspace/overlays", permission: "overlays.view" },
    { label: "Contracts", href: "/workspace/contracts", permission: "contracts.view" },
    { label: "Notifications", href: "/workspace/notifications", permission: "notifications.view" },
    { label: "Administration", href: "/admin", permission: "administration.access" },
  ] },
];

export function getWorkspaceNavigation(permissions: readonly WorkspacePermission[]) {
  return groups.map((group) => ({ ...group, items: group.items.filter((item) => permissions.includes(item.permission)) })).filter((group) => group.items.length > 0);
}
