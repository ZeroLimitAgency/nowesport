import { EventsTimelineSection } from "@/components/content-sections";
import { PageIntro } from "@/components/sections";
import { getPublicEvents } from "@/lib/content";

export default async function EventsPage() {
  const events = await getPublicEvents();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro
        kicker="Événements"
        title="Timeline d'événements et d'activations"
        description="La page événements reprend la logique timeline avec points reliés, grande image associée, titre, date et description, dans l'esprit du visuel de référence."
      />
      <EventsTimelineSection eventsData={events} />
    </main>
  );
}
