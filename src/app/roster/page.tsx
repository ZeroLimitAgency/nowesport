import Link from "next/link";
import { PageIntro } from "@/components/sections";
import { getCurrentLocale, getSiteCmsContent } from "@/lib/cms";
import { getPublicRosterTeams } from "@/lib/content";

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export default async function RosterPage() {
  const locale = await getCurrentLocale();
  const [teams, cms] = await Promise.all([getPublicRosterTeams(), getSiteCmsContent(locale)]);
  const intro = cms.blocks["roster.intro"];
  const grouped = teams.reduce<Record<string, typeof teams>>((acc, team) => {
    const key = [team.category ?? "Roster", team.game].filter(Boolean).join(" · ");
    acc[key] = [...(acc[key] ?? []), team];
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro kicker={intro.eyebrow ?? "Roster"} title={intro.title} description={intro.body} />
      <section className="mx-auto w-full max-w-[92rem] px-5 pb-16 sm:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Teams hub</p>
            <h2 className="section-title">Nos rosters</h2>
          </div>
          <p className="max-w-xl rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold leading-6 text-white/65">
            Sélectionne une équipe pour découvrir sa bannière, son jeu, son staff et les cartes membres.
          </p>
        </div>

        {Object.entries(grouped).length ? Object.entries(grouped).map(([group, groupTeams]) => (
          <div key={group} className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">{group}</p>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {groupTeams.map((team) => (
                <article key={team.slug} className="group overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,#151319_0%,#09090b_100%)] shadow-2xl shadow-black/25">
                  <div className="relative h-64 overflow-hidden">
                    {team.bannerUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={team.bannerUrl} alt={`Bannière ${team.name}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : <div className="h-full bg-[radial-gradient(circle_at_top_left,rgba(244,108,160,0.34),transparent_35%),linear-gradient(135deg,#19141c,#070708)]" />}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.82)_100%)]" />
                    <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-accent-soft)]">{team.category ?? "Roster"} · {team.game}</p>
                        <h3 className="mt-2 text-4xl font-black uppercase tracking-[-0.06em] text-white">{team.name}</h3>
                      </div>
                      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/45 text-2xl font-black text-white backdrop-blur">
                        {team.gameIconUrl || team.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={team.gameIconUrl ?? team.logoUrl ?? ""} alt={`Logo ${team.game}`} className="h-full w-full object-cover" />
                        ) : initials(team.game)}
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <p className="text-sm leading-6 text-white/58">{team.description || "Roster NOW eSport."}</p>
                      <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-white/38">{team.members.length} membre(s)</p>
                    </div>
                    <Link href={`/roster/${team.slug}`} className="primary-cta justify-center">Voir l’équipe</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )) : (
          <div className="rounded-[1.8rem] border border-dashed border-white/12 bg-white/[0.03] p-8 text-center text-white/55">
            Aucun roster public n’est disponible pour le moment.
          </div>
        )}
      </section>
    </main>
  );
}
