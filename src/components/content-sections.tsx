import Link from "next/link";
import type { SiteLocale } from "@/lib/cms";
import type {
  EventCard,
  GameCard,
  PartnerCard,
  ProductCard,
  TeamSupportBlock,
} from "@/lib/content";

type SectionLocale = SiteLocale;

const sectionCopy = {
  fr: {
    shopKicker: "Collections",
    shopTitle: "La base de la boutique",
    shopCta: "Découvrir les produits",
    productOptions: "Options produit",
    viewItem: "Voir l’article",
    rostersKicker: "Rosters",
    rostersTitle: "Découvrir nos rosters",
    rostersLead: "Sélection compétitive NOW : équipes, staff et créateurs structurés par jeu.",
    viewPage: "Voir la page",
    partnersKicker: "Partenaires",
    partnersTitle: "Découvrir nos partenaires",
    partnersLead: "Un écosystème premium autour de la performance, des activations et du merch.",
    eventsKicker: "Événements",
    eventsTitle: "Timeline d’événements",
    eventsLead: "Activations, media days et rendez-vous clés de la saison NOW.",
    fallbackPartner: "Partenaire NOW",
    eventVisual: "Activation NOW",
    shopEmptyTitle: "La boutique se prépare",
    shopEmptyBody: "Les premiers articles seront ajoutés depuis l’administration. En attendant, la page reste disponible sans commande inactive.",
    rosterEmptyTitle: "Les rosters seront présentés bientôt",
    rosterEmptyBody: "Les équipes, joueurs et staffs seront publiés depuis l’administration dès que les informations finales seront prêtes.",
    partnersEmptyTitle: "Les partenaires seront affichés ici",
    partnersEmptyBody: "Les logos et présentations partenaires seront ajoutés sans inventer de collaboration temporaire.",
    eventsEmptyTitle: "Aucun événement publié",
    eventsEmptyBody: "Les rendez-vous publics seront ajoutés depuis l’administration dès validation du calendrier.",
  },
  en: {
    shopKicker: "Collections",
    shopTitle: "Shop essentials",
    shopCta: "Browse products",
    productOptions: "Product options",
    viewItem: "View item",
    rostersKicker: "Rosters",
    rostersTitle: "Explore our rosters",
    rostersLead: "NOW competitive lineup: teams, staff and creators organized by game.",
    viewPage: "View page",
    partnersKicker: "Partners",
    partnersTitle: "Explore our partners",
    partnersLead: "A premium ecosystem around performance, activations and merch.",
    eventsKicker: "Events",
    eventsTitle: "Event timeline",
    eventsLead: "Activations, media days and key NOW season milestones.",
    fallbackPartner: "NOW partner",
    eventVisual: "NOW activation",
    shopEmptyTitle: "The shop is being prepared",
    shopEmptyBody: "Products will be added from the admin. Until then, the page stays clean without inactive checkout links.",
    rosterEmptyTitle: "Rosters will be introduced soon",
    rosterEmptyBody: "Teams, players and staff will be published from the admin once the final information is ready.",
    partnersEmptyTitle: "Partners will appear here",
    partnersEmptyBody: "Partner logos and descriptions will be added without temporary fake collaborations.",
    eventsEmptyTitle: "No published event",
    eventsEmptyBody: "Public events will be added from the admin once the calendar is confirmed.",
  },
} satisfies Record<SectionLocale, Record<string, string>>;

function copy(locale: SectionLocale = "fr") {
  return sectionCopy[locale];
}


function PublicEmptyState({ title, body, href = "/" }: { title: string; body: string; href?: string }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-dashed border-white/14 bg-[radial-gradient(circle_at_top,rgba(244,108,160,0.16),transparent_34%),linear-gradient(180deg,#141218_0%,#08080a_100%)] p-8 text-center sm:p-10">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.6rem] border border-white/10 bg-white/[0.04] text-3xl font-black uppercase italic tracking-[-0.08em] text-white">NOW</div>
      <h3 className="mt-6 text-2xl font-black uppercase tracking-[-0.04em] text-white sm:text-3xl">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/58">{body}</p>
      <Link href={href} className="secondary-cta mt-6 inline-flex">Retour à l’accueil</Link>
    </div>
  );
}

function ProductFallbackVisual({ label = "NOW" }: { label?: string }) {
  return (
    <>
      <div className="absolute inset-x-[18%] top-[5%] h-[78%] rounded-[2rem_2rem_2.4rem_2.4rem] bg-[linear-gradient(180deg,#17171b_0%,#060606_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]" />
      <div className="absolute inset-x-[28%] top-[12%] h-5 rounded-full border-4 border-[var(--color-accent)]/80" />
      <div className="absolute top-[30%] text-center text-5xl font-black uppercase italic tracking-[-0.08em] text-white">
        {label}
      </div>
      <div className="absolute bottom-[18%] h-[2px] w-24 bg-[var(--color-accent)]" />
    </>
  );
}

export function ShopGridSection({
  items,
  productOptions,
  shopCollections,
  locale = "fr",
}: {
  items: ProductCard[];
  productOptions: { label: string; value: string }[];
  shopCollections: { name: string; label: string; description: string }[];
  locale?: SectionLocale;
}) {
  const t = copy(locale);

  return (
    <section className="mx-auto w-full max-w-[92rem] px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <p className="section-kicker">{t.shopKicker}</p>
          <h2 className="section-title">{t.shopTitle}</h2>
        </div>
        <Link href="/shop" className="section-link w-full sm:w-auto">
          {t.shopCta}
        </Link>
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
              {t.productOptions}
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

        {items.length ? <div className="grid gap-5 md:grid-cols-2">
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
                  <div className="relative mx-auto mt-7 flex h-64 w-full max-w-[16rem] items-center justify-center overflow-hidden rounded-[1.5rem]">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <ProductFallbackVisual label={index === 0 ? "NEVER" : "NOW"} />
                    )}
                  </div>
                </div>

                <div className="px-2 pb-2 pt-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{item.name}</h3>
                      <p className="mt-1 text-sm text-white/50">{item.category}</p>
                    </div>
                    <span className="w-fit rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/70">
                      {item.price}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/56">
                    {item.description}
                  </p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-[var(--color-accent-soft)]">
                    {t.viewItem}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div> : <PublicEmptyState title={t.shopEmptyTitle} body={t.shopEmptyBody} />}
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
  locale = "fr",
}: {
  gamesData: GameCard[];
  teamBlocks: TeamSupportBlock[];
  locale?: SectionLocale;
}) {
  const t = copy(locale);

  return (
    <section className="mx-auto w-full max-w-[92rem] px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">{t.rostersKicker}</p>
          <h2 className="section-title">{t.rostersTitle}</h2>
        </div>
        <p className="max-w-xl rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold leading-6 text-white/70">
          {t.rostersLead}
        </p>
      </div>

      {gamesData.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {gamesData.map((game) => (
          <Link
            key={game.slug}
            href={`/roster/${game.slug}`}
            className="group overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#17151b_0%,#0b0b0d_100%)] transition duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)]/30"
          >
            <div className={`relative h-64 ${visualClass(game.visual)}`}>
              {game.bannerUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={game.bannerUrl} alt={game.game} className="absolute inset-0 h-full w-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_28%),linear-gradient(180deg,transparent_28%,rgba(0,0,0,0.72)_100%)]" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
                    {game.subtitle}
                  </p>
                  <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
                    {game.game}
                  </h3>
                </div>
                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/35 text-lg font-black uppercase text-white/80">
                  {game.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={game.logoUrl} alt={`Logo ${game.game}`} className="h-full w-full object-cover" />
                  ) : (
                    game.game.slice(0, 1)
                  )}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div> : <PublicEmptyState title={t.rosterEmptyTitle} body={t.rosterEmptyBody} href="/roster" />}

      {gamesData.length ? <div className="mt-8 grid gap-5 md:grid-cols-2">
        {gamesData.map((game) => (
          <Link
            key={`${game.slug}-detail`}
            href={`/roster/${game.slug}`}
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
              {t.viewPage}
            </span>
          </Link>
        ))}
      </div> : null}

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
  locale = "fr",
}: {
  partnersData: PartnerCard[];
  locale?: SectionLocale;
}) {
  const t = copy(locale);

  return (
    <section className="mx-auto w-full max-w-[92rem] px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">{t.partnersKicker}</p>
          <h2 className="section-title">{t.partnersTitle}</h2>
        </div>
        <p className="max-w-xl rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold leading-6 text-white/70">
          {t.partnersLead}
        </p>
      </div>

      {partnersData.length ? <div className="grid gap-5 md:grid-cols-3">
        {partnersData.map((partner, index) => (
          <a
            key={`${partner.name}-${index}`}
            href={partner.href || "/partners"}
            target={partner.href ? "_blank" : undefined}
            rel={partner.href ? "noreferrer" : undefined}
            className="group overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#18181d_0%,#0a0a0c_100%)] transition duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)]/35"
          >
            <div
              className={`flex h-56 items-center justify-center overflow-hidden ${
                index === 0
                  ? "bg-[linear-gradient(135deg,#27111c,#121217)]"
                  : index === 1
                    ? "bg-[radial-gradient(circle_at_top,rgba(244,108,160,0.4),transparent_30%),linear-gradient(135deg,#19191d,#09090b)]"
                    : "bg-[linear-gradient(145deg,#ffffff,#d8c7d0)] text-black"
              }`}
            >
              {partner.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partner.imageUrl} alt={partner.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid place-items-center gap-3 text-center">
                  <span className="text-5xl font-black uppercase tracking-[-0.06em]">
                    {partner.name.slice(0, 2)}
                  </span>
                  <span className="rounded-full border border-current/20 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.22em] opacity-70">
                    {t.fallbackPartner}
                  </span>
                </div>
              )}
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
      </div> : <PublicEmptyState title={t.partnersEmptyTitle} body={t.partnersEmptyBody} href="/partners" />}
    </section>
  );
}

export function EventsTimelineSection({
  eventsData,
  locale = "fr",
}: {
  eventsData: EventCard[];
  locale?: SectionLocale;
}) {
  const t = copy(locale);

  return (
    <section className="mx-auto w-full max-w-[92rem] px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">{t.eventsKicker}</p>
          <h2 className="section-title">{t.eventsTitle}</h2>
        </div>
        <p className="max-w-xl rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold leading-6 text-white/70">
          {t.eventsLead}
        </p>
      </div>

      {eventsData.length ? <div className="grid gap-8">
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
              {event.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.imageUrl} alt={event.title} className="h-[18rem] w-full object-cover sm:h-[22rem]" />
              ) : (
                <div
                  className={`grid h-[18rem] place-items-center px-5 text-center sm:h-[22rem] ${
                    event.tone === "studio"
                      ? "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_28%),linear-gradient(135deg,#2b2326,#121317)]"
                      : "bg-[linear-gradient(180deg,rgba(255,178,120,0.92),rgba(146,72,34,0.45))]"
                  }`}
                >
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-white/70">
                      {t.eventVisual}
                    </p>
                    <p className="mt-3 text-4xl font-black uppercase italic tracking-[-0.08em] text-white sm:text-6xl">
                      NOW
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-4 px-5 py-5">
                <div className="flex flex-col gap-2 text-sm text-white/42 sm:flex-row sm:items-center sm:justify-between">
                  <span>{event.location}</span>
                  <span>{event.date}</span>
                </div>
                <p className="text-sm leading-6 text-white/58">{event.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div> : <PublicEmptyState title={t.eventsEmptyTitle} body={t.eventsEmptyBody} href="/events" />}
    </section>
  );
}
