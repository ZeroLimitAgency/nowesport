import Image from "next/image";
import Link from "next/link";
import {
  NewsShowcaseSection,
  PartnersShowcaseSection,
  ShopGridSection,
  TeamsShowcaseSection,
} from "@/components/content-sections";
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
      <section className="relative flex min-h-[100svh] items-end overflow-hidden">
        <Image
          src="/media/jersey.jpeg"
          alt="Visuel maillot NOW eSport 2026"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,14,0.28)_0%,rgba(4,6,12,0.42)_45%,rgba(3,5,9,0.88)_100%)]" />

        <div className="relative z-10 mx-auto w-full max-w-[92rem] px-5 pb-14 sm:px-8 sm:pb-18">
          <p className="section-kicker">Now eSport — New Era</p>
          <h1 className="mt-5 max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-7xl">
            Des rosters qui performent. Une marque qui rayonne.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            Un univers club, média et boutique dans une seule expérience.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/teams" className="primary-cta">Voir les équipes</Link>
            <Link href="/shop" className="secondary-cta">Découvrir la boutique</Link>
          </div>
        </div>
      </section>

      <div className="space-y-4 py-10 sm:py-14">
        <ShopGridSection items={products} productOptions={productOptions} shopCollections={shopCollections} />
        <TeamsShowcaseSection gamesData={games} teamBlocks={getTeamSupportBlocks()} />
        <PartnersShowcaseSection partnersData={partners} />
        <NewsShowcaseSection cards={news} />
      </div>
    </main>
  );
}
