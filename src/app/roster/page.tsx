import { RosterLanding } from "@/components/roster-sections";
import { getCurrentLocale, getSiteCmsContent } from "@/lib/cms";
import { getPublicRosterTeams } from "@/lib/content";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata({ title: "Rosters", description: "Découvrez les équipes et membres officiels publiés par NOW Esport.", path: "/roster" });

export default async function RosterPage() {
  const locale = await getCurrentLocale();
  const [teams, cms] = await Promise.all([getPublicRosterTeams(), getSiteCmsContent(locale)]);
  const intro = cms.blocks["roster.intro"];
  return <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]"><RosterLanding teams={teams} locale={locale} title={intro.title} description={intro.body} eyebrow={intro.eyebrow} /></main>;
}
