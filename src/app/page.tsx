import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
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
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { isMaintenanceEnabled } from "@/lib/maintenance";
import { cookies } from "next/headers";

export default async function Home() {
  const locale = await getCurrentLocale();
  const [maintenance, cookieStore] = await Promise.all([isMaintenanceEnabled(), cookies()]);
  const isPreview = cookieStore.get("now-preview")?.value === "1";
  if (maintenance && !isPreview) {
    const cms = await getSiteCmsContent(locale);
    const content = cms.blocks["maintenance.main"];
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#050505] px-5 py-20 text-white">
        <JsonLd data={{ "@context": "https://schema.org", "@graph": [
          { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/favicon.ico`, description: DEFAULT_DESCRIPTION },
          { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL, inLanguage: ["fr", "en"], publisher: { "@id": `${SITE_URL}/#organization` } },
        ] }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(233,53,133,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,142,192,0.16),transparent_28%)]" />
        <section className="relative z-10 mx-auto w-full max-w-4xl rounded-[2.5rem] border border-white/10 bg-black/55 p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-14" aria-labelledby="prelaunch-title">
          <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-3">
            <span className="logo-mark" aria-hidden="true" />
            <span className="text-xs font-black uppercase tracking-[0.28em]">NOW ESPORT</span>
          </div>
          <h1 id="prelaunch-title" className="mt-8 text-5xl font-black uppercase leading-[0.9] tracking-[-0.07em] sm:text-7xl">
            {content.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
            {content.body || DEFAULT_DESCRIPTION}
          </p>
          {cms.socialLinks.length ? <nav aria-label="Réseaux sociaux officiels" className="mt-8 flex flex-wrap justify-center gap-3">
            {cms.socialLinks.map((link) => <a key={link.href} href={link.href} rel="noreferrer" className="secondary-cta">{link.label}</a>)}
          </nav> : null}
        </section>
      </main>
    );
  }
  const [products, games, partners, cms] = await Promise.all([
    getPublicProducts(),
    getPublicGames(),
    getPublicPartners(),
    getSiteCmsContent(locale),
  ]);
  const hero = cms.blocks["home.hero"];
  const sponsors = getMetadataList(hero, "sponsors");
  const videoHref = typeof hero.metadata?.videoHref === "string" && hero.metadata.videoHref.trim() ? hero.metadata.videoHref : null;
  const poster = typeof hero.metadata?.poster === "string" ? hero.metadata.poster : "/media/jersey.jpeg";
  const { productOptions, shopCollections } = getShopPresentation();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/favicon.ico`, description: DEFAULT_DESCRIPTION },
        { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL, inLanguage: ["fr", "en"], publisher: { "@id": `${SITE_URL}/#organization` } },
      ] }} />
      <section className="relative min-h-[calc(100svh-0px)] overflow-hidden sm:min-h-[100svh]">
        {videoHref ? (
          <a href={videoHref} target="_blank" rel="noreferrer" className="absolute inset-0 block" aria-label={hero.title}>
            <video autoPlay muted loop playsInline preload="auto" poster={poster} className="h-full w-full object-cover">
              <source src={hero.mediaUrl ?? "/media/now-academy.mp4"} type="video/mp4" />
            </video>
          </a>
        ) : (
          <div className="absolute inset-0" aria-hidden="true">
            <video autoPlay muted loop playsInline preload="auto" poster={poster} className="h-full w-full object-cover">
              <source src={hero.mediaUrl ?? "/media/now-academy.mp4"} type="video/mp4" />
            </video>
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.2)_58%,rgba(0,0,0,0.55)_100%)]" />

        <div className="absolute bottom-5 left-4 right-4 z-10 flex flex-wrap items-center gap-3 sm:bottom-10 sm:left-8 sm:right-auto sm:gap-8">
          {sponsors.map((sponsor) => (
            <span key={sponsor} className="text-sm font-semibold tracking-wide text-white/78 sm:text-3xl">
              {sponsor}
            </span>
          ))}
        </div>

        <div className="absolute bottom-24 left-4 right-4 z-10 rounded-[1.35rem] border border-white/10 bg-black/45 p-4 text-white backdrop-blur sm:bottom-28 sm:left-auto sm:right-8 sm:max-w-xl sm:p-5">
          <p className="section-kicker">{hero.eyebrow}</p>
          <h1 className="mt-3 text-[clamp(2.15rem,12vw,4rem)] font-black uppercase leading-none tracking-[-0.05em] sm:text-6xl">{hero.title}</h1>
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
