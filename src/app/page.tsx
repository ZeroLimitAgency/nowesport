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
      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(73,100,255,0.25),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(243,82,159,0.25),transparent_30%),linear-gradient(180deg,#09090c_0%,#050507_100%)]" />
        <div className="mx-auto grid w-full max-w-[92rem] gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="section-kicker">Now eSport — Digital Club Experience</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-7xl">
              Une structure premium, pensée comme une marque lifestyle.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
              Direction créative inspirée des codes modernes : hero court, navigation
              centrée sur les verticales, visuels éditoriaux et blocs commerce plus
              agressifs.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop" className="primary-cta">Explorer la boutique</Link>
              <Link href="/teams" className="secondary-cta">Voir les rosters</Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Live channels", "08"],
              ["Drops actifs", "14"],
              ["Partenaires", "12"],
              ["Articles", "56"],
            ].map(([label, value]) => (
              <article key={label} className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{label}</p>
                <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">{value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="space-y-4 py-10 sm:py-14">
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
      </div>
    </main>
  );
}
