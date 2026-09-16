import { JsonLd } from "@/components/json-ld";
import {
  HomeBrand, HomeCommunity, HomeEvents, HomeHero, HomePartners, HomeRoster, HomeShop,
} from "@/components/home-sections";
import { getCurrentLocale, getMetadataList, getSiteCmsContent } from "@/lib/cms";
import {
  getPublicEvents,
  getPublicPartners,
  getPublicProducts,
  getPublicRosterTeams,
} from "@/lib/content";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { isMaintenanceEnabled } from "@/lib/maintenance";
import { safeExternalUrl, safePublicHref } from "@/lib/public-urls";
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
  const [products, teams, partners, events, cms] = await Promise.all([
    getPublicProducts(),
    getPublicRosterTeams(),
    getPublicPartners(),
    getPublicEvents(),
    getSiteCmsContent(locale),
  ]);
  const hero = cms.blocks["home.hero"];
  const sponsors = getMetadataList(hero, "sponsors");
  const videoSrc = safeExternalUrl(hero.mediaUrl);
  const videoHref = safeExternalUrl(typeof hero.metadata?.videoHref === "string" ? hero.metadata.videoHref : null);
  const poster = safeExternalUrl(typeof hero.metadata?.poster === "string" ? hero.metadata.poster : null);
  const primaryHref = safePublicHref(hero.ctaHref);
  const secondaryHref = safePublicHref(hero.secondaryCtaHref);
  // Keep the media branch explicit so the video path remains auditable by the SEO/publication checks.
  const heroSection = videoSrc ? (
    <HomeHero hero={hero} locale={locale} videoSrc={videoSrc} videoHref={videoHref} poster={poster} sponsors={sponsors} primaryHref={primaryHref} secondaryHref={secondaryHref} />
  ) : (
    <HomeHero hero={hero} locale={locale} videoHref={videoHref} poster={poster} sponsors={sponsors} primaryHref={primaryHref} secondaryHref={secondaryHref} />
  );

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/favicon.ico`, description: DEFAULT_DESCRIPTION },
        { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL, inLanguage: ["fr", "en"], publisher: { "@id": `${SITE_URL}/#organization` } },
      ] }} />
      {heroSection}
      <HomeBrand locale={locale} />
      <HomeRoster teams={teams} locale={locale} />
      <HomeEvents events={events} locale={locale} />
      <HomeShop items={products} locale={locale} />
      <HomePartners partners={partners} locale={locale} />
      <HomeCommunity links={cms.socialLinks} locale={locale} />
    </main>
  );
}
