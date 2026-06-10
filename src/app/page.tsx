import Link from "next/link";
import {
  PartnersShowcaseSection,
  ShopGridSection,
  TeamsShowcaseSection,
} from "@/components/content-sections";
import { getCurrentLocale, getMetadataList, getShopPresentation, getSiteCmsContent } from "@/lib/cms";
import {
  getPublicGames,
  getPublicPartners,
  getPublicProducts,
  getTeamSupportBlocks,
} from "@/lib/content";

export default async function Home() {
  const locale = await getCurrentLocale();
  const [products, games, partners, cms] = await Promise.all([
    getPublicProducts(),
    getPublicGames(),
    getPublicPartners(),
    getSiteCmsContent(locale),
  ]);
  const hero = cms.blocks["home.hero"];
  const sponsors = getMetadataList(hero, "sponsors");
  const videoHref = typeof hero.metadata?.videoHref === "string" ? hero.metadata.videoHref : "#";
  const poster = typeof hero.metadata?.poster === "string" ? hero.metadata.poster : "/media/jersey.jpeg";
  const { productOptions, shopCollections } = getShopPresentation();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="relative min-h-[100svh] overflow-hidden">
        <a href={videoHref} target="_blank" rel="noreferrer" className="absolute inset-0 block" aria-label={hero.title}>
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={poster}
            className="h-full w-full object-cover"
          >
            <source src={hero.mediaUrl ?? "/media/now-academy.mp4"} type="video/mp4" />
          </video>
        </a>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.2)_58%,rgba(0,0,0,0.55)_100%)]" />

        <div className="absolute bottom-7 left-5 z-10 flex flex-wrap items-center gap-8 sm:bottom-10 sm:left-8">
          {sponsors.map((sponsor) => (
            <span key={sponsor} className="text-xl font-semibold tracking-wide text-white/88 sm:text-3xl">
              {sponsor}
            </span>
          ))}
        </div>

        <div className="absolute bottom-28 right-5 z-10 max-w-xl rounded-[1.5rem] border border-white/10 bg-black/35 p-5 text-white backdrop-blur sm:right-8">
          <p className="section-kicker">{hero.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">{hero.title}</h1>
          <p className="mt-3 text-sm leading-6 text-white/68 sm:text-base">{hero.body}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {hero.ctaHref && hero.ctaLabel ? <Link href={hero.ctaHref} className="primary-cta">{hero.ctaLabel}</Link> : null}
            {hero.secondaryCtaHref && hero.secondaryCtaLabel ? <Link href={hero.secondaryCtaHref} className="secondary-cta">{hero.secondaryCtaLabel}</Link> : null}
          </div>
        </div>
      </section>

      <div className="space-y-4 py-10 sm:py-14">
        <ShopGridSection items={products} productOptions={productOptions} shopCollections={shopCollections} locale={locale} />
        <TeamsShowcaseSection gamesData={games} teamBlocks={getTeamSupportBlocks()} locale={locale} />
        <PartnersShowcaseSection partnersData={partners} locale={locale} />
      </div>
    </main>
  );
}
