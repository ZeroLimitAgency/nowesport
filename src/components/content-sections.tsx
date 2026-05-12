import Link from "next/link";
import type {
  EventCard,
  GameCard,
  NewsCard,
  PartnerCard,
  ProductCard,
  TeamSupportBlock,
} from "@/lib/content";

export function ShopGridSection({
  items,
  productOptions,
  shopCollections,
}: {
  items: ProductCard[];
  productOptions: { label: string; value: string }[];
  shopCollections: { name: string; label: string; description: string }[];
}) {
  return (
    <section className="mx-auto w-full max-w-[92rem] px-5 py-10 sm:px-8">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="section-kicker">Collections</p>
          <h2 className="section-title">La base de la boutique</h2>
        </div>
        <span className="section-link">Découvrir les produits</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-4">
          {shopCollections.map((item) => (
            <article
              key={item.name}
              className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#171318_0%,#0b0b0d_100%)] p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-soft)]">
                {item.label}
              </p>
              <h3 className="mt-3 text-2xl font-black uppercase tracking-[-0.04em] text-white">
                {item.name}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/56">{item.description}</p>
            </article>
          ))}

          <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">
              Options produit
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {productOptions.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.2rem] border border-white/8 bg-black/20 px-4 py-4"
                >
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-sm text-white/48">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {items.map((item, index) => (
            <Link
              key={item.slug}
              href={`/shop/${item.slug}`}
              className="group rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#f7f2f6_0%,#ffffff_40%,#0c0b0d_40%,#0c0b0d_100%)] p-[1px] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
            >
              <div className="h-full rounded-[calc(1.8rem-1px)] bg-black p-4">
                <div className="relative overflow-hidden rounded-[1.3rem] bg-[linear-gradient(160deg,#faf7f9_0%,#eadbe4_33%,#18151a_34%,#09090a_100%)] p-6">
                  <div className="absolute right-3 top-3 rounded-full border border-black/8 bg-black/8 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-black/60">
                    {item.category}
                  </div>
                  <div className="relative mx-auto mt-7 flex h-64 w-full max-w-[16rem] items-center justify-center">
                    <div className="absolute inset-x-[18%] top-[5%] h-[78%] rounded-[2rem_2rem_2.4rem_2.4rem] bg-[linear-gradient(180deg,#17171b_0%,#060606_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]" />
                    <div className="absolute inset-x-[28%] top-[12%] h-5 rounded-full border-4 border-[var(--color-accent)]/80" />
                    <div className="absolute top-[30%] text-center text-5xl font-black uppercase italic tracking-[-0.08em] text-white">
                      {index === 0 ? "NEVER" : "NOW"}
                    </div>
                    <div className="absolute bottom-[18%] h-[2px] w-24 bg-[var(--color-accent)]" />
                  </div>
                </div>

                <div className="px-2 pb-2 pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{item.name}</h3>
                      <p className="mt-1 text-sm text-white/50">{item.category}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/70">
                      {item.price}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/56">
                    {item.description}
                  </p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-[var(--color-accent-soft)]">
                    Voir l&apos;article
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function visualClass(visual: string) {
  if (visual === "fortnite") return "bg-[linear-gradient(135deg,#503c84,#1d1536)]";
  if (visual === "cs2") return "bg-[linear-gradient(135deg,#a14f1f,#2c1308)]";
  if (visual === "rocket") return "bg-[linear-gradient(135deg,#1468b8,#0b1d44)]";
  return "bg-[linear-gradient(135deg,#8f214a,#240d18)]";
}

export function TeamsShowcaseSection({
  gamesData,
  teamBlocks,
}: {
  gamesData: GameCard[];
  teamBlocks: TeamSupportBlock[];
}) {
  return (
    <section className="mx-auto w-full max-w-[92rem] px-5 py-10 sm:px-8">
      <div className="mb-8">
        <p className="section-kicker">Rosters</p>
        <h2 className="section-title">Découvrir nos rosters</h2>
      </div>

      <div className="mx-auto mb-10 max-w-xl rounded-full border border-white/10 bg-white/[0.05] px-6 py-4 text-center text-sm font-semibold text-white/76">
        Découvrir nos rosters
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {gamesData.map((game) => (
          <Link
            key={game.slug}
            href={`/teams/${game.slug}`}
            className="group overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#17151b_0%,#0b0b0d_100%)] transition duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)]/30"
          >
            <div className={`relative h-64 ${visualClass(game.visual)}`}>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(0,0,0,0.55)_100%)]" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
                  {game.subtitle}
                </p>
                <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
                  {game.game}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {gamesData.map((game) => (
          <Link
            key={`${game.slug}-detail`}
            href={`/teams/${game.slug}`}
            className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#121216_0%,#09090b_100%)] p-5 transition duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)]/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-soft)]">
                  {game.game}
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  {game.subtitle}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-sm font-black uppercase tracking-[0.24em] text-white/72">
                N
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {game.rosters.map((roster) => (
                <div
                  key={roster.name}
                  className="rounded-[1.2rem] border border-white/8 bg-black/25 px-4 py-4"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-soft)]">
                    {roster.name}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    {roster.members.join(" · ")}
                  </p>
                </div>
              ))}
            </div>
            <span className="mt-5 inline-flex text-sm font-semibold text-[var(--color-accent-soft)]">
              Voir la page
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {teamBlocks.map((item) => (
          <article
            key={item.title}
            className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#121216_0%,#09090b_100%)] p-6"
          >
            <h3 className="text-3xl font-black uppercase tracking-[-0.05em] text-white">
              {item.title}
            </h3>
            <p className="mt-4 text-base leading-7 text-white/56">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PartnersShowcaseSection({
  partnersData,
}: {
  partnersData: PartnerCard[];
}) {
  return (
    <section className="mx-auto w-full max-w-[92rem] px-5 py-10 sm:px-8">
      <div className="mb-8">
        <p className="section-kicker">Partenaires</p>
        <h2 className="section-title">Découvrir nos partenaires</h2>
      </div>

      <div className="mx-auto mb-10 max-w-xl rounded-full border border-white/10 bg-white/[0.05] px-6 py-4 text-center text-sm font-semibold text-white/76">
        Découvrir nos partenaires
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {partnersData.map((partner, index) => (
          <a
            key={`${partner.name}-${index}`}
            href={partner.href}
            className="group overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#18181d_0%,#0a0a0c_100%)] transition duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)]/35"
          >
            <div
              className={`flex h-56 items-center justify-center ${
                index === 0
                  ? "bg-[linear-gradient(135deg,#27111c,#121217)]"
                  : index === 1
                    ? "bg-[radial-gradient(circle_at_top,rgba(244,108,160,0.4),transparent_30%),linear-gradient(135deg,#19191d,#09090b)]"
                    : "bg-[linear-gradient(145deg,#ffffff,#d8c7d0)] text-black"
              }`}
            >
              <span className="text-5xl font-black uppercase tracking-[-0.06em]">
                {partner.name.slice(0, 2)}
              </span>
            </div>
            <div className="px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/38">
                {partner.role}
              </p>
              <h3 className="mt-2 text-xl font-bold text-white">{partner.name}</h3>
              <p className="mt-2 text-sm leading-6 text-white/45">{partner.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function EventsTimelineSection({ eventsData }: { eventsData: EventCard[] }) {
  return (
    <section className="mx-auto w-full max-w-[92rem] px-5 py-10 sm:px-8">
      <div className="mb-8">
        <p className="section-kicker">Événements</p>
        <h2 className="section-title">Timeline d&apos;événements</h2>
      </div>

      <div className="mx-auto mb-10 max-w-xl rounded-full border border-white/10 bg-white/[0.05] px-6 py-4 text-center text-sm font-semibold text-white/76">
        Découvrir nos événements
      </div>

      <div className="grid gap-8">
        {eventsData.map((event, index) => (
          <article
            key={`${event.title}-${event.date}`}
            className="grid gap-4 lg:grid-cols-[18rem_1fr]"
          >
            <div className="relative pl-10 lg:pl-12">
              <span className="absolute left-0 top-2 h-4 w-4 rounded-full border-4 border-[#0b0b0d] bg-[var(--color-accent)] shadow-[0_0_0_6px_rgba(233,53,133,0.12)]" />
              {index < eventsData.length - 1 ? (
                <span className="absolute left-[0.45rem] top-6 h-[calc(100%+2rem)] w-px bg-white/10" />
              ) : null}
              <h3 className="text-3xl font-black leading-none tracking-[-0.05em] text-white">
                {event.title}
              </h3>
              <p className="mt-2 text-sm text-white/48">{event.date}</p>
            </div>

            <div className="overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#15151a_0%,#0a0a0c_100%)]">
              <div
                className={`h-[22rem] ${
                  event.tone === "studio"
                    ? "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_28%),linear-gradient(135deg,#2b2326,#121317)]"
                    : "bg-[linear-gradient(180deg,rgba(255,178,120,0.92),rgba(146,72,34,0.45))]"
                }`}
              />
              <div className="space-y-4 px-5 py-5">
                <div className="flex items-center justify-between text-sm text-white/42">
                  <span>{event.location}</span>
                  <span>{event.date}</span>
                </div>
                <p className="text-sm leading-6 text-white/58">{event.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function NewsShowcaseSection({ cards }: { cards: NewsCard[] }) {
  return (
    <section className="mx-auto w-full max-w-[92rem] px-5 py-10 sm:px-8">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="section-kicker">News</p>
          <h2 className="section-title">Dernières actus et annonces</h2>
        </div>
        <Link href="/news" className="section-link">
          Toutes les news
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {cards.map((card, index) => (
          <a
            key={`${card.title}-${index}`}
            href={card.href}
            className="overflow-hidden rounded-[1.8rem] border border-white/8 bg-[#46212e] transition duration-300 hover:-translate-y-1"
          >
            <div
              className={`flex h-56 items-end p-5 ${
                index === 0
                  ? "bg-[linear-gradient(180deg,rgba(255,130,193,0.95),rgba(153,29,82,0.65))]"
                  : index === 1
                    ? "bg-[linear-gradient(180deg,rgba(70,155,247,0.92),rgba(27,63,98,0.55))]"
                    : "bg-[linear-gradient(180deg,rgba(48,48,58,0.2),rgba(24,24,29,0.92))]"
              }`}
            >
              <span className="rounded-full border border-white/20 bg-black/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/80">
                {card.tag}
              </span>
            </div>
            <div className="space-y-4 px-5 py-5">
              <h3 className="text-2xl font-bold leading-tight text-white">{card.title}</h3>
              <p className="text-sm leading-6 text-white/55">{card.excerpt}</p>
              <div className="flex items-center justify-between text-sm text-white/40">
                <span>{card.date}</span>
                <span className="rounded-full border border-white/10 px-3 py-2">
                  Voir sur X
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
