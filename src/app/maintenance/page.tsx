import type { Metadata } from "next";
import { MaintenanceControls } from "@/components/maintenance-controls";
import { getCurrentLocale, getSiteCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Maintenance | NOW eSport",
  description: "Le site NOW eSport est temporairement en maintenance.",
};

export default async function MaintenancePage() {
  const locale = await getCurrentLocale();
  const cms = await getSiteCmsContent(locale);

  return (
    <main className="fixed inset-0 z-[60] flex min-h-screen items-center justify-center overflow-y-auto bg-[#050505] px-5 py-28 text-white sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(233,53,133,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,142,192,0.16),transparent_28%)]" />
      <div className="hero-grid absolute inset-0 opacity-70" aria-hidden="true" />

      <MaintenanceControls content={cms.blocks["maintenance.main"]} locale={locale} />
    </main>
  );
}
