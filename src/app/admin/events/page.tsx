import { deleteEvent, saveEvent } from "@/app/admin/actions";
import { AdminMediaField } from "@/components/admin-media-field";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { listMediaOptions } from "@/lib/media-storage";
import { createClient } from "@/lib/supabase/server";

type AdminEvent = {
  id: string;
  slug: string;
  title: string;
  event_date: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
  external_url: string | null;
  is_public: boolean;
  sort_order: number;
};

export const dynamic = "force-dynamic";

const inputClass = "min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--color-accent)]/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">{label}{children}</label>;
}

function EventForm({ event, mediaOptions }: { event?: AdminEvent; mediaOptions?: Awaited<ReturnType<typeof listMediaOptions>> }) {
  return (
    <form action={saveEvent} className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
      <input type="hidden" name="id" value={event?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Titre"><input required name="title" defaultValue={event?.title ?? ""} className={inputClass} /></Field>
        <Field label="Date"><input required type="date" name="event_date" defaultValue={event?.event_date ?? ""} className={inputClass} /></Field>
        <Field label="Lieu"><input name="location" defaultValue={event?.location ?? ""} className={inputClass} /></Field>
        <AdminMediaField label="Grande image événement" name="image_url" bucket="events" folder="timeline" defaultValue={event?.image_url} options={mediaOptions} />
        <Field label="Lien externe"><input name="external_url" defaultValue={event?.external_url ?? ""} className={inputClass} placeholder="https://..." /></Field>
        <Field label="Ordre"><input type="number" name="sort_order" defaultValue={event?.sort_order ?? 0} className={inputClass} /></Field>
        <label className="flex items-center gap-3 text-sm font-semibold text-white/72 sm:pt-7">
          <input type="checkbox" name="is_public" defaultChecked={event?.is_public ?? true} className="h-5 w-5 accent-pink-500" />
          Publié
        </label>
      </div>
      <Field label="Description"><textarea name="description" defaultValue={event?.description ?? ""} className={`${inputClass} min-h-24 py-3`} /></Field>
      <div className="flex flex-wrap items-center justify-between gap-4"><details className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"><summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-white/45">Options avancées</summary><Field label="Slug personnalisé"><input name="slug" defaultValue={event?.slug ?? ""} className={inputClass} placeholder="auto" /></Field></details><button type="submit" className="primary-cta w-fit">{event ? "Enregistrer" : "Créer l'événement"}</button></div>
    </form>
  );
}

async function getEvents() {
  if (!hasSupabaseEnv()) return { events: [], isConfigured: false };
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id, slug, title, event_date, location, description, image_url, external_url, is_public, sort_order")
    .order("event_date", { ascending: false });
  return { events: (data as AdminEvent[] | null) ?? [], isConfigured: true };
}

export default async function AdminEventsPage() {
  await requireAdmin();
  const [{ events, isConfigured }, mediaOptions] = await Promise.all([getEvents(), listMediaOptions("events")]);

  return (
    <AdminShell>
      <div className="grid gap-6">
        <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-5 sm:p-6">
          <p className="section-kicker">Événements</p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">Créer un événement</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">Ajoute une grande image, une date, un lieu et un lien externe. Le slug est généré automatiquement.</p>
          <div className="mt-5">{isConfigured ? <EventForm mediaOptions={mediaOptions} /> : <p className="text-sm text-white/58">Supabase doit être configuré pour gérer les événements.</p>}</div>
        </section>
        {events.map((event) => (
          <article key={event.id} className="grid gap-4 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-soft)]">{event.is_public ? "Publié" : "Brouillon"} · {event.event_date}</p>
                <h2 className="mt-2 text-2xl font-black text-white">{event.title}</h2>
                <p className="mt-2 text-sm text-white/50">{event.location}</p>
              </div>
              <form action={deleteEvent}>
                <input type="hidden" name="id" value={event.id} />
                <button type="submit" className="secondary-cta border-red-400/30 text-red-100">Supprimer</button>
              </form>
            </div>
            <EventForm event={event} mediaOptions={mediaOptions} />
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
