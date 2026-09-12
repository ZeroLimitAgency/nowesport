"use server";
import { revalidatePath } from "next/cache";
import { requireWorkspacePermission } from "@/workspace/core/auth";
import { createClient } from "@/lib/supabase/server";

export async function createTask(formData: FormData) {
  const access = await requireWorkspacePermission("tasks.create");
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2 || title.length > 160) throw new Error("Le titre doit contenir entre 2 et 160 caractères.");
  const supabase = await createClient();
  const { error } = await supabase.from("workspace_tasks").insert({ organization_id: access.organizationId, department_id: access.departmentId, title, description: String(formData.get("description") ?? "").trim() || null, priority: String(formData.get("priority") ?? "normal"), created_by: access.memberId });
  if (error) throw new Error("La tâche n’a pas pu être créée.");
  revalidatePath("/workspace/tasks");
}

export async function updateTaskStatus(formData: FormData) {
  const access = await requireWorkspacePermission("tasks.edit");
  const id = String(formData.get("id") ?? ""); const status = String(formData.get("status") ?? "");
  if (!id || !["todo", "in_progress", "blocked", "review", "done", "archived"].includes(status)) throw new Error("Mise à jour invalide.");
  const supabase = await createClient();
  const { error } = await supabase.from("workspace_tasks").update({ status }).eq("id", id).eq("organization_id", access.organizationId);
  if (error) throw new Error("La tâche n’a pas pu être mise à jour.");
  revalidatePath("/workspace/tasks");
}
