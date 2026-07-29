import { EventsTimelineSection } from "@/components/content-sections";
import { PageIntro } from "@/components/sections";
import { getCurrentLocale, getSiteCmsContent } from "@/lib/cms";
import { getPublicEvents } from "@/lib/content";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata({ title: "Événements", description: "Retrouvez les événements publics de NOW Esport.", path: "/events" });

export default async function EventsPage() {
  const locale = await getCurrentLocale();
  const [events, cms] = await Promise.all([getPublicEvents(), getSiteCmsContent(locale)]);
  const intro = cms.blocks["events.intro"];

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro kicker={intro.eyebrow ?? "Events"} title={intro.title} description={intro.body} />
      <EventsTimelineSection eventsData={events} locale={locale} />
    </main>
  );
}
