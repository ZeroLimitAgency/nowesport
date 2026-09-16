/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { SiteLocale } from "@/lib/cms";
import type { RosterMemberCard, RosterTeamCard } from "@/lib/content";

const rosterCopy = {
  fr: { active: "Équipes actives", explore: "Découvrir l’équipe", members: "membres", empty: "Aucune équipe n’est disponible pour le moment.", back: "Tous les rosters", players: "Joueurs", staff: "Staff", points: "points", earnings: "gains", team: "Équipe", roster: "Roster" },
  en: { active: "Active teams", explore: "Explore the team", members: "members", empty: "No team is available at the moment.", back: "All rosters", players: "Players", staff: "Staff", points: "points", earnings: "earnings", team: "Team", roster: "Roster" },
} as const;

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function socialLabel(platform: string) {
  const labels: Record<string, string> = { x: "X", instagram: "Instagram", twitch: "Twitch", youtube: "YouTube", tiktok: "TikTok", liquipedia: "Liquipedia", website: "Web" };
  return labels[platform] ?? platform;
}

export function RosterLanding({ teams, locale, title, description, eyebrow }: { teams: RosterTeamCard[]; locale: SiteLocale; title: string; description: string; eyebrow?: string }) {
  const t = rosterCopy[locale];
  return <>
    <header className="roster-index-hero">
      <div className="roster-crystals" aria-hidden="true"><i /><i /><i /></div>
      <div className="roster-shell roster-index-heading">
        <p className="section-kicker">{eyebrow ?? t.roster}</p>
        <h1 className="now-display">{title}</h1>
        <p>{description}</p>
      </div>
    </header>
    <section className="roster-index-content" aria-labelledby="active-rosters">
      <div className="roster-shell">
        <div className="roster-section-label"><span>01</span><h2 id="active-rosters" className="now-display">{t.active}</h2></div>
        {teams.length ? <div className={`roster-team-list ${teams.length === 1 ? "is-single" : ""}`}>{teams.map((team, index) => <Link href={`/roster/${team.slug}`} className="roster-team-feature" key={team.slug}>
          <div className="roster-team-image">
            {team.bannerUrl ? <img src={team.bannerUrl} alt={`${team.name} — ${team.game}`} loading={index ? "lazy" : "eager"} /> : <div className="roster-image-fallback" aria-hidden="true"><i /><i /></div>}
            <div className="roster-team-overlay" />
            <span className="roster-team-number">{String(index + 1).padStart(2, "0")}</span>
            {team.logoUrl || team.gameIconUrl ? <div className="roster-team-logo"><img src={team.logoUrl ?? team.gameIconUrl ?? ""} alt={`Logo ${team.name}`} /></div> : null}
          </div>
          <div className="roster-team-body">
            <div><p className="roster-overline">{team.game}{team.category ? ` · ${team.category}` : ""}</p><h3 className="now-display">{team.name}</h3></div>
            <p className="roster-team-description">{team.description}</p>
            <div className="roster-team-footer"><span>{team.members.length} {t.members}</span><strong>{t.explore} <b aria-hidden="true">↗</b></strong></div>
          </div>
        </Link>)}</div> : <div className="roster-empty"><span className="now-display" aria-hidden="true">NOW</span><p>{t.empty}</p></div>}
      </div>
    </section>
  </>;
}

export function RosterDetail({ team, locale }: { team: RosterTeamCard; locale: SiteLocale }) {
  const t = rosterCopy[locale];
  const players = team.members.filter(member => member.roleType === "Player" || member.role === "Player");
  const staff = team.members.filter(member => !players.includes(member));
  const groups = [{ id: "players", title: t.players, members: players }, { id: "staff", title: t.staff, members: staff }].filter(group => group.members.length);
  const roleCounts = Array.from(new Set(team.members.map(member => member.role))).map(role => ({ role, count: team.members.filter(member => member.role === role).length })).filter(item => item.count);
  return <>
    <header className="roster-detail-hero">
      {team.bannerUrl ? <img src={team.bannerUrl} alt={`${team.name} — ${team.game}`} className="roster-detail-banner" /> : <div className="roster-detail-fallback" aria-hidden="true"><i /><i /><i /></div>}
      <div className="roster-detail-shade" />
      <div className="roster-shell roster-detail-content">
        <Link href="/roster" className="roster-back">← {t.back}</Link>
        <div className="roster-detail-identity">
          <div><p className="section-kicker">{team.category ?? t.roster} · {team.game}</p><h1 className="now-display">{team.name}</h1><p className="roster-detail-description">{team.description}</p></div>
          <div className="roster-detail-mark">{team.logoUrl || team.gameIconUrl ? <img src={team.logoUrl ?? team.gameIconUrl ?? ""} alt={`Logo ${team.name}`} /> : initials(team.name)}</div>
        </div>
      </div>
    </header>
    <div className="roster-detail-main roster-shell">
      {roleCounts.length ? <section className="roster-role-stats" aria-label={locale === "fr" ? "Composition de l’équipe" : "Team composition"}>{roleCounts.map(item => <div key={item.role}><strong className="now-display">{item.count}</strong><span>{item.role}</span></div>)}</section> : null}
      {groups.map((group, index) => <section className="roster-member-section" key={group.id} aria-labelledby={`${group.id}-title`}>
        <div className="roster-section-label"><span>{String(index + 1).padStart(2, "0")}</span><h2 id={`${group.id}-title`} className="now-display">{group.title}</h2><small>{group.members.length}</small></div>
        <div className="roster-member-grid">{group.members.map(member => <AthleteCard member={member} team={team} locale={locale} key={`${member.displayName}-${member.role}`} />)}</div>
      </section>)}
    </div>
  </>;
}

function AthleteCard({ member, team, locale }: { member: RosterMemberCard; team: RosterTeamCard; locale: SiteLocale }) {
  const t = rosterCopy[locale];
  const formatter = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  return <article className="athlete-card">
    <div className="athlete-portrait">{member.photoUrl ? <img src={member.photoUrl} alt={member.displayName} loading="lazy" /> : <div className="athlete-fallback"><i aria-hidden="true" /><span className="now-display">{initials(member.displayName)}</span></div>}<span className="athlete-role">{member.role}</span></div>
    <div className="athlete-body">
      <div className="athlete-identity"><div><p>{team.game}{member.nationality ? ` · ${member.nationality}` : ""}</p><h3 className="now-display">{member.pseudo ?? member.displayName}</h3>{(member.firstName || member.lastName) ? <span>{[member.firstName, member.lastName].filter(Boolean).join(" ")}</span> : null}</div></div>
      {(member.rankingPoints !== null && member.rankingPoints !== undefined) || member.prizeEarnings ? <div className="athlete-stats">{member.rankingPoints !== null && member.rankingPoints !== undefined ? <div><strong className="now-display">{member.rankingPoints}</strong><span>{t.points}</span></div> : null}{member.prizeEarnings ? <div><strong className="now-display">{formatter.format(member.prizeEarnings)}</strong><span>{t.earnings}</span></div> : null}</div> : null}
      {member.bio ? <p className="athlete-bio">{member.bio}</p> : null}
      {Object.keys(member.socialLinks).length ? <nav className="athlete-socials" aria-label={`${member.displayName} — ${locale === "fr" ? "réseaux sociaux" : "social links"}`}>{Object.entries(member.socialLinks).map(([platform, href]) => <a key={platform} href={href} target="_blank" rel="noopener noreferrer">{socialLabel(platform)}<span aria-hidden="true">↗</span></a>)}</nav> : null}
    </div>
  </article>;
}
