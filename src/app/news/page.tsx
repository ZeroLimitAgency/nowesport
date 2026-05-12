import { NewsShowcaseSection } from "@/components/content-sections";
import { PageIntro } from "@/components/sections";
import { getPublicNews } from "@/lib/content";

export default async function NewsPage() {
  const news = await getPublicNews();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro
        kicker="News"
        title="Images, vidéos, textes, dates et liens"
        description="La section news est déjà structurée pour accueillir tes vraies annonces avec médias, titres, descriptions, dates et redirections choisies."
      />
      <NewsShowcaseSection cards={news} />
    </main>
  );
}
