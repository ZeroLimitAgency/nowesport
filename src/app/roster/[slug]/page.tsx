import { notFound } from "next/navigation";
import { getPublicRosterTeamBySlug } from "@/lib/content";

export function generateStaticParams() {
  return [];
}

const roleBuckets = ["Player", "Coach", "Manager", "Analyst", "Content Creator", "Staff"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function socialLabel(platform: string) {
  const labels: Record<string, string> = {
    x: "X",
    instagram: "Instagram",
    twitch: "Twitch",
    youtube: "YouTube",
    tiktok: "TikTok",
    liquipedia: "Liquipedia",
    website: "Lien",
  };
  return labels[platform] ?? platform;
}

export default async function RosterTeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = await getPublicRosterTeamBySlug(slug);

  if (!team) {
    notFound();
  }

  const players = team.members.filter((member) => member.roleType === "Player" || member.role === "Player");
  const staff = team.members.filter((member) => !players.includes(member));
  const groups = [
    { title: "Joueurs", members: players },
    { title: "Staff", members: staff },
  ].filter((group) => group.members.length);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="mx-auto w-full max-w-[92rem] px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
        <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,#171219_0%,#08080a_100%)]">
          <div className="relative min-h-[25rem]">
            {team.bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={team.bannerUrl} alt={`Bannière ${team.name}`} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,108,160,0.32),transparent_35%),linear-gradient(135deg,#18141a,#070708)]" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.10)_0%,rgba(0,0,0,0.78)_100%)]" />
            <div className="relative z-10 flex min-h-[25rem] flex-col justify-end gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="section-kicker">{team.category ?? "Roster"} · {team.game}</p>
                <h1 className="mt-4 text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-white sm:text-7xl">
                  {team.name}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">{team.description}</p>
              </div>
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/40 text-4xl font-black uppercase text-white shadow-2xl backdrop-blur">
                {team.gameIconUrl || team.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={team.gameIconUrl ?? team.logoUrl ?? ""} alt={`Logo ${team.game}`} className="h-full w-full object-cover" />
                ) : initials(team.game)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roleBuckets.map((role) => {
            const count = team.members.filter((member) => member.roleType === role || member.role === role).length;
            return (
              <div key={role} className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
                <p className="text-3xl font-black text-white">{count}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/42">{role}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-8">
          {groups.map((group) => (
            <section key={group.title}>
              <div className="mb-5">
                <p className="section-kicker">{team.name}</p>
                <h2 className="section-title">{group.title}</h2>
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                {group.members.map((member) => (
                  <article key={`${member.displayName}-${member.role}`} className="grid overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(135deg,#151319_0%,#09090b_100%)] sm:grid-cols-[15rem_1fr]">
                    <div className="flex min-h-64 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(244,108,160,0.24),transparent_35%),#0d0d10] text-5xl font-black uppercase text-white/78">
                      {member.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={member.photoUrl} alt={member.displayName} className="h-full w-full object-cover" />
                      ) : initials(member.displayName)}
                    </div>
                    <div className="flex flex-col justify-between p-5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">{member.role}</span>
                          {member.nationality ? <span className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/48">{member.nationality}</span> : null}
                          <span className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/48">{team.game}</span>
                        </div>
                        <h3 className="mt-4 text-4xl font-black uppercase tracking-[-0.06em] text-white">{member.pseudo ?? member.displayName}</h3>
                        {(member.firstName || member.lastName) ? <p className="mt-1 text-sm text-white/42">{[member.firstName, member.lastName].filter(Boolean).join(" ")}</p> : null}
                        <div className="mt-4 flex flex-wrap gap-3">
                          {member.rankingPoints ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"><p className="text-lg font-black text-white">{member.rankingPoints}</p><p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/35">points</p></div> : null}
                          {member.prizeEarnings ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"><p className="text-lg font-black text-white">{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(member.prizeEarnings)}</p><p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/35">gains</p></div> : null}
                        </div>
                        {member.bio ? <p className="mt-4 text-sm leading-6 text-white/56">{member.bio}</p> : null}
                      </div>
                      {Object.entries(member.socialLinks).length ? (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {Object.entries(member.socialLinks).map(([platform, href]) => (
                            <a key={platform} href={href} className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/62 transition hover:border-[var(--color-accent)]/40 hover:text-white">
                              {socialLabel(platform)}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
