export function resolveMaintenanceMode(databaseValue: unknown, environmentValue?: string) {
  return typeof databaseValue === "boolean" ? databaseValue : environmentValue !== "off";
}
