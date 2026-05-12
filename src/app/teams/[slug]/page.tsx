import { notFound } from "next/navigation";
import { games } from "@/data/site";
import { getPublicGameBySlug } from "@/lib/content";

export function generateStaticParams() {
  return games.map((item) => ({ slug: item.slug }));
}

function visualClass(visual: string) {
  if (visual === "fortnite") {
    return "bg-[linear-gradient(135deg,#503c84,#1d1536)]";
  }

  if (visual === "cs2") {
    return "bg-[linear-gradient(135deg,#a14f1f,#2c1308)]";
  }

  if (visual === "rocket") {
    return "bg-[linear-gradient(135deg,#1468b8,#0b1d44)]";
  }

  return "bg-[linear-gradient(135deg,#8f214a,#240d18)]";
}

export default async function TeamGamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await getPublicGameBySlug(slug);

  if (!game) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="mx-auto w-full max-w-[92rem] px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
        <div className="overflow-hidden rounded-[2rem] border border-white/8">
          <div className={`relative h-[22rem] ${visualClass(game.visual)}`}>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_25%,rgba(0,0,0,0.68)_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 px-6 py-8 sm:px-8">
              <p className="section-kicker">Équipes</p>
              <h1 className="mt-4 text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-white sm:text-7xl">
                {game.game}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">
                {game.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {game.rosters.map((roster) => (
            <article
              key={roster.name}
              className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#171219_0%,#09090b_100%)] p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-soft)]">
                {game.subtitle}
              </p>
              <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.04em] text-white">
                {roster.name}
              </h2>
              <div className="mt-5 grid gap-3">
                {roster.members.map((member) => (
                  <div
                    key={member}
                    className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-4 text-sm font-semibold text-white/78"
                  >
                    {member}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
