/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CmsBlock, CmsSocialLink, SiteLocale } from "@/lib/cms";
import type { EventCard, PartnerCard, ProductCard, RosterTeamCard } from "@/lib/content";

type HomeHeroProps = {
  hero: CmsBlock;
  locale: SiteLocale;
  poster?: string | null;
  primaryHref?: string | null;
  secondaryHref?: string | null;
  sponsors: string[];
  videoHref?: string | null;
  videoSrc?: string | null;
};

const copy = {
  fr: {
    identity: "Notre identité",
    vision: "Construire le futur de l’esport",
    visionBody: "NOW eSport accompagne les talents dans leur progression, avec la compétition, le contenu et la communauté au cœur du projet.",
    pillars: ["Talent", "Progression", "Compétition", "Contenu", "Communauté"],
    roster: "Les visages de NOW",
    rosterBody: "Équipes, joueurs, staff et créateurs qui représentent NOW aujourd’hui.",
    viewRoster: "Voir le roster",
    shop: "Boutique",
    viewShop: "Voir la boutique",
    partners: "Partenaires",
    events: "Événements",
    community: "Communauté",
    communityTitle: "Suivre NOW",
    scroll: "Découvrir NOW",
    watch: "Voir la vidéo",
  },
  en: {
    identity: "Our identity",
    vision: "Building the future of esports",
    visionBody: "NOW eSport supports talent development, with competition, content and community at the heart of the project.",
    pillars: ["Talent", "Progression", "Competition", "Content", "Community"],
    roster: "The faces of NOW",
    rosterBody: "Teams, players, staff and creators representing NOW today.",
    viewRoster: "View roster",
    shop: "Shop",
    viewShop: "Visit the shop",
    partners: "Partners",
    events: "Events",
    community: "Community",
    communityTitle: "Follow NOW",
    scroll: "Discover NOW",
    watch: "Watch the video",
  },
} as const;

export function HomeHero({ hero, locale, videoSrc, videoHref, poster, sponsors, primaryHref, secondaryHref }: HomeHeroProps) {
  const t = copy[locale];
  return <section className={`now-hero ${videoSrc ? "has-media" : "has-fallback"}`} aria-labelledby="home-title">
    {videoSrc ? <video autoPlay muted loop playsInline preload="metadata" poster={poster ?? undefined} className="now-hero-media" aria-hidden="true"><source src={videoSrc} type="video/mp4" /></video> : <div className="now-hero-crystal" aria-hidden="true"><i /><i /><i /></div>}
    <div className="now-hero-shade" aria-hidden="true" />
    <div className="now-hero-content">
      <div className="now-hero-copy">
        {hero.eyebrow ? <p className="section-kicker">{hero.eyebrow}</p> : null}
        <h1 id="home-title" className="now-display now-hero-title">{hero.title}</h1>
        <div className="now-hero-actions">
          {primaryHref && hero.ctaLabel ? <Link href={primaryHref} className="primary-cta">{hero.ctaLabel}</Link> : null}
          {secondaryHref && hero.secondaryCtaLabel ? <Link href={secondaryHref} className="secondary-cta">{hero.secondaryCtaLabel}</Link> : null}
          {videoHref ? <a href={videoHref} target="_blank" rel="noopener noreferrer" className="secondary-cta">{t.watch}</a> : null}
        </div>
      </div>
      {sponsors.length ? <div className="now-hero-sponsors" aria-label="Sponsors">{sponsors.map((sponsor) => <span key={sponsor}>{sponsor}</span>)}</div> : null}
      <a href="#identity" className="now-hero-scroll"><span aria-hidden="true">↓</span>{t.scroll}</a>
    </div>
  </section>;
}

export function HomeBrand({ locale }: { locale: SiteLocale }) {
  const t = copy[locale];
  return <section id="identity" className="now-brand" aria-labelledby="brand-title">
    <div className="now-section-shell now-brand-grid">
      <div><p className="section-kicker">{t.identity}</p><h2 id="brand-title" className="now-display now-brand-title">{t.vision}</h2></div>
      <div className="now-brand-copy"><p>{t.visionBody}</p><ul aria-label={t.identity}>{t.pillars.map((pillar, index) => <li key={pillar}><span>0{index + 1}</span>{pillar}</li>)}</ul></div>
    </div>
  </section>;
}

export function HomeRoster({ teams, locale }: { teams: RosterTeamCard[]; locale: SiteLocale }) {
  if (!teams.length) return null;
  const t = copy[locale];
  return <section className="now-home-section" aria-labelledby="roster-title"><div className="now-section-shell">
    <header className="now-section-heading"><div><p className="section-kicker">Roster</p><h2 id="roster-title" className="now-display">{t.roster}</h2></div><p>{t.rosterBody}</p></header>
    <div className="now-roster-grid">{teams.map((team, index) => <Link href={`/roster/${team.slug}`} className="now-roster-card" key={team.slug}>
      <div className="now-roster-visual">{team.bannerUrl ? <img src={team.bannerUrl} alt="" loading="lazy" /> : <div className="now-card-crystal" aria-hidden="true" />}{team.logoUrl ? <img className="now-roster-logo" src={team.logoUrl} alt="" loading="lazy" /> : null}<span className="now-roster-index">0{index + 1}</span></div>
      <div className="now-roster-info"><div><p>{team.game}</p><h3 className="now-display">{team.name}</h3></div><span>{t.viewRoster} →</span></div>
      {team.members.length ? <ul className="now-member-list">{team.members.slice(0, 5).map((member) => <li key={`${team.slug}-${member.displayName}`}><span>{member.displayName}</span><small>{member.role}</small></li>)}</ul> : null}
    </Link>)}</div>
  </div></section>;
}

export function HomeEvents({ events, locale }: { events: EventCard[]; locale: SiteLocale }) {
  if (!events.length) return null;
  const t = copy[locale];
  const dateLocale = locale === "fr" ? "fr-FR" : "en-GB";
  return <section className="now-home-section"><div className="now-section-shell"><p className="section-kicker">{t.events}</p><h2 className="now-display now-inline-title">{t.events}</h2><div className="now-events-grid">{events.slice(0, 3).map(event => <article key={`${event.title}-${event.date}`} className="now-event-card">{event.imageUrl ? <img src={event.imageUrl} alt="" loading="lazy" /> : null}<div><time>{event.date ? new Date(`${event.date}T12:00:00Z`).toLocaleDateString(dateLocale, { day: "2-digit", month: "short", year: "numeric" }) : ""}</time><h3 className="now-display">{event.title}</h3><p>{event.location}</p>{event.href ? <a href={event.href} target="_blank" rel="noopener noreferrer">{event.title} →</a> : null}</div></article>)}</div></div></section>;
}

export function HomeShop({ items, locale }: { items: ProductCard[]; locale: SiteLocale }) {
  if (!items.length) return null;
  const t = copy[locale];
  return <section className="now-home-section"><div className="now-section-shell"><div className="now-section-heading"><div><p className="section-kicker">{t.shop}</p><h2 className="now-display">{t.shop}</h2></div><Link href="/shop" className="section-link">{t.viewShop}</Link></div><div className="now-products-grid">{items.slice(0, 3).map(item => <Link href={`/shop/${item.slug}`} key={item.slug} className="now-product-card">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} loading="lazy" /> : <div className="now-card-crystal" />}<div><p>{item.category}</p><h3>{item.name}</h3><strong>{item.price}</strong></div></Link>)}</div></div></section>;
}

export function HomePartners({ partners, locale }: { partners: PartnerCard[]; locale: SiteLocale }) {
  if (!partners.length) return null;
  const t = copy[locale];
  return <section className="now-home-section now-partners"><div className="now-section-shell"><p className="section-kicker">{t.partners}</p><h2 className="now-display now-inline-title">{t.partners}</h2><div className="now-partner-grid">{partners.map(partner => { const content = <>{partner.imageUrl ? <img src={partner.imageUrl} alt={partner.name} loading="lazy" /> : <strong>{partner.name}</strong>}<span>{partner.role}</span></>; return partner.href ? <a href={partner.href} target="_blank" rel="noopener noreferrer" key={partner.name}>{content}</a> : <div key={partner.name}>{content}</div>; })}</div></div></section>;
}

export function HomeCommunity({ links, locale }: { links: CmsSocialLink[]; locale: SiteLocale }) {
  if (!links.length) return null;
  const t = copy[locale];
  return <section className="now-community"><div className="now-section-shell"><p className="section-kicker">{t.community}</p><div className="now-community-row"><h2 className="now-display">{t.communityTitle}</h2><nav aria-label={t.communityTitle}>{links.map(link => <a key={`${link.platform}-${link.href}`} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<span aria-hidden="true">↗</span></a>)}</nav></div></div></section>;
}
