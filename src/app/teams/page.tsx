import { TeamsShowcaseSection } from "@/components/content-sections";
import { PageIntro } from "@/components/sections";
import { getPublicGames, getTeamSupportBlocks } from "@/lib/content";

export default async function TeamsPage() {
  const games = await getPublicGames();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro
        kicker="Équipes"
        title="Jeux, rosters, staff et legends"
        description="Chaque jeu peut accueillir plusieurs rosters. La structure est déjà pensée pour Fortnite, Counter-Strike 2, Rocket League, Valorant, puis pour les blocs NOW Team et Legends."
      />
      <TeamsShowcaseSection
        gamesData={games}
        teamBlocks={getTeamSupportBlocks()}
      />
    </main>
  );
}
