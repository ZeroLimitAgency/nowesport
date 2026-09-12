import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const load = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("workspace manifest is valid and references existing foundations", async () => {
  const manifest = JSON.parse(await load("workspace.manifest.json"));
  assert.equal(manifest.version, "4.0.0");
  for (const key of ["modules","routes","databaseMigrations","permissions","environmentVariables","storageBuckets","integrations","scheduledJobs","webhooks","portablePaths","nowSpecificPaths","fortniteSpecificPaths"]) assert.ok(Array.isArray(manifest[key]), key);
  assert.ok(manifest.routes.includes("/workspace/fortnite/players"));
  assert.ok(manifest.permissions.includes("administration.access"));
});

test("CEO is complete while Manager Fortnite has no finance or administration", async () => {
  const source = await load("src/workspace/now/presets.ts");
  const manager = source.match(/fortnite_manager: operational/);
  assert.ok(manager);
  const operational = source.slice(source.indexOf("const operational"), source.indexOf("export const"));
  assert.match(operational, /contracts\.view/);
  assert.doesNotMatch(operational, /contracts\.view_financials|finance\.view|administration\.access|workspace\.roles\.manage/);
  const manifest = JSON.parse(await load("workspace.manifest.json"));
  const ceo = source.slice(source.indexOf("ceo:"), source.indexOf("general_director:"));
  for (const permission of manifest.permissions) assert.ok(ceo.includes(`\"${permission}\"`), `CEO missing ${permission}`);
});

test("navigation is permission-driven and protected routes enforce server authorization", async () => {
  const navigation = await load("src/workspace/core/navigation.ts");
  assert.match(navigation, /filter\(\(item\) => permissions\.includes\(item\.permission\)\)/);
  for (const path of ["src/app/workspace/fortnite/page.tsx","src/app/workspace/fortnite/players/page.tsx","src/app/workspace/tasks/page.tsx"]) assert.match(await load(path), /requireWorkspacePermission/);
});

test("RLS enforces organization and department task isolation", async () => {
  const sql = await load("supabase/migrations/20260809_workspace_core_foundations.sql");
  assert.match(sql, /alter table public\.%I enable row level security/);
  assert.match(sql, /workspace_has_permission\('tasks\.view',organization_id\)/);
  assert.match(sql, /department_id is null or department_id in/);
  assert.match(sql, /workspace_player_profiles[\s\S]+roster_member_id uuid not null references public\.roster_members/);
  assert.match(sql, /security definer set search_path = ''/);
});

test("financial response helper removes restricted fields", async () => {
  const source = await load("src/workspace/core/permissions.ts");
  assert.match(source, /hasPermission\(access, \"contracts\.view_financials\"\)/);
  for (const field of ["financial_terms","amount_cents","salary_cents"]) assert.ok(source.includes(field));
});
