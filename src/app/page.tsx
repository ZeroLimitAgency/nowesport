import {
  NewsShowcaseSection,
  PartnersShowcaseSection,
  ShopGridSection,
  TeamsShowcaseSection,
} from "@/components/content-sections";
import {
  HomeHero,
  HomeHighlights,
  ShopBanner,
} from "@/components/sections";
import { productOptions, shopCollections } from "@/data/site";
import {
  getPublicGames,
  getPublicNews,
  getPublicPartners,
  getPublicProducts,
  getTeamSupportBlocks,
} from "@/lib/content";

export default async function Home() {
  const [products, games, partners, news] = await Promise.all([
    getPublicProducts(),
    getPublicGames(),
    getPublicPartners(),
    getPublicNews(),
  ]);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,#5d1237_0%,rgba(93,18,55,0.14)_32%,transparent_65%)]" />
      <HomeHero />
      <HomeHighlights />
      <ShopBanner />
      <ShopGridSection
        items={products}
        productOptions={productOptions}
        shopCollections={shopCollections}
      />
      <TeamsShowcaseSection
        gamesData={games}
        teamBlocks={getTeamSupportBlocks()}
      />
      <PartnersShowcaseSection partnersData={partners} />
      <NewsShowcaseSection cards={news} />
    </main>
  );
}
