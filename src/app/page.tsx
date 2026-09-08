import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import {
  PartnersShowcaseSection,
  ShopGridSection,
  TeamsShowcaseSection,
} from "@/components/content-sections";
import { getCurrentLocale, getMetadataList, getSiteCmsContent } from "@/lib/cms";
import {
  getPublicGames,
  getPublicPartners,
  getPublicProducts,
  getTeamSupportBlocks,
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
  const [products, games, partners, cms] = await Promise.all([
    getPublicProducts(),
    getPublicGames(),
    getPublicPartners(),
    getSiteCmsContent(locale),
  ]);
  const hero = cms.blocks["home.hero"];
  const sponsors = getMetadataList(hero, "sponsors");
  const videoSrc = safeExternalUrl(hero.mediaUrl);
  const videoHref = safeExternalUrl(typeof hero.metadata?.videoHref === "string" ? hero.metadata.videoHref : null);
  const poster = safeExternalUrl(typeof hero.metadata?.poster === "string" ? hero.metadata.poster : null);
  const primaryHref = safePublicHref(hero.ctaHref);
  const secondaryHref = safePublicHref(hero.secondaryCtaHref);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/favicon.ico`, description: DEFAULT_DESCRIPTION },
        { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL, inLanguage: ["fr", "en"], publisher: { "@id": `${SITE_URL}/#organization` } },
      ] }} />
      <section className="relative flex min-h-[100svh] overflow-hidden bg-[#050505] pt-20 sm:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,53,133,0.3),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(93,18,55,0.34),transparent_44%),linear-gradient(145deg,#171219_0%,#050505_65%)]" aria-hidden="true" />
        <div className="hero-grid absolute inset-0 opacity-35" aria-hidden="true" />
        {videoSrc ? (
          <video autoPlay muted loop playsInline preload="metadata" {...(poster ? { poster } : {})} className="absolute inset-0 h-full w-full object-cover" aria-hidden="true">
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.2)_58%,rgba(0,0,0,0.55)_100%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[92rem] flex-1 flex-col justify-end gap-6 px-4 pb-6 sm:px-8 sm:pb-10 lg:flex-row lg:items-end lg:justify-between">
          {sponsors.length ? <div className="order-2 flex min-w-0 flex-wrap items-center gap-x-5 gap-y-2 lg:order-1 lg:max-w-[42%] lg:gap-8" aria-label={locale === "fr" ? "Sponsors" : "Sponsors"}>
            {sponsors.map((sponsor) => <span key={sponsor} className="text-sm font-semibold tracking-wide text-white/80 sm:text-xl lg:text-2xl">{sponsor}</span>)}
          </div> : <div />}

          <div className="order-1 w-full rounded-[1.35rem] border border-white/10 bg-black/55 p-4 text-white backdrop-blur sm:p-6 lg:order-2 lg:max-w-xl">
            <p className="section-kicker">{hero.eyebrow}</p>
            <h1 className="mt-3 text-[clamp(2.15rem,11vw,4rem)] font-black uppercase leading-none tracking-[-0.05em] sm:text-6xl">{hero.title}</h1>
            <p className="mt-3 text-sm leading-6 text-white/75 sm:text-base">{hero.body}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {primaryHref && hero.ctaLabel ? <Link href={primaryHref} className="primary-cta">{hero.ctaLabel}</Link> : null}
              {secondaryHref && hero.secondaryCtaLabel ? <Link href={secondaryHref} className="secondary-cta">{hero.secondaryCtaLabel}</Link> : null}
              {videoHref ? <a href={videoHref} target="_blank" rel="noopener noreferrer" className="secondary-cta">{locale === "fr" ? "Voir la vidéo" : "Watch the video"}</a> : null}
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-4 py-10 sm:py-14">
        <ShopGridSection items={products} locale={locale} />
        <TeamsShowcaseSection gamesData={games} teamBlocks={getTeamSupportBlocks()} locale={locale} />
        <PartnersShowcaseSection partnersData={partners} locale={locale} />
      </div>
    </main>
  );
}
