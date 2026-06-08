import { TeamsShowcaseSection } from "@/components/content-sections";
import { PageIntro } from "@/components/sections";
import { getCurrentLocale, getSiteCmsContent } from "@/lib/cms";
import { getPublicGames, getTeamSupportBlocks } from "@/lib/content";

export default async function RosterPage() {
  const locale = await getCurrentLocale();
  const [games, cms] = await Promise.all([getPublicGames(), getSiteCmsContent(locale)]);
  const intro = cms.blocks["roster.intro"];

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro kicker={intro.eyebrow ?? "Roster"} title={intro.title} description={intro.body} />
      <TeamsShowcaseSection
        gamesData={games}
        teamBlocks={getTeamSupportBlocks()}
      />
    </main>
  );
}
