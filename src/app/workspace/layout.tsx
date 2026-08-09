import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace-shell";
import { privateRobots } from "@/lib/seo";
import { requireWorkspacePermission } from "@/workspace/core/auth";

export const metadata: Metadata = { title: "NOW Workspace", robots: privateRobots, manifest: "/workspace.webmanifest" };
export const dynamic = "force-dynamic";
export default async function Layout({ children }: { children: React.ReactNode }) { const access = await requireWorkspacePermission("workspace.access"); return <WorkspaceShell access={access}>{children}</WorkspaceShell>; }
