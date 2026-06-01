import { deletePartner, savePartner } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type AdminPartner = {
  id: string;
  slug: string;
  name: string;
  role_label: string | null;
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

function PartnerForm({ partner }: { partner?: AdminPartner }) {
  return (
    <form action={savePartner} className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
      <input type="hidden" name="id" value={partner?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Nom"><input required name="name" defaultValue={partner?.name ?? ""} className={inputClass} /></Field>
        <Field label="Slug"><input required name="slug" defaultValue={partner?.slug ?? ""} className={inputClass} /></Field>
        <Field label="Rôle"><input name="role_label" defaultValue={partner?.role_label ?? ""} className={inputClass} /></Field>
        <Field label="Logo"><input name="image_url" defaultValue={partner?.image_url ?? ""} className={inputClass} /></Field>
        <Field label="URL"><input name="external_url" defaultValue={partner?.external_url ?? ""} className={inputClass} /></Field>
        <Field label="Ordre"><input type="number" name="sort_order" defaultValue={partner?.sort_order ?? 0} className={inputClass} /></Field>
        <label className="flex items-center gap-3 text-sm font-semibold text-white/72 sm:pt-7">
          <input type="checkbox" name="is_public" defaultChecked={partner?.is_public ?? true} className="h-5 w-5 accent-pink-500" />
          Publié
        </label>
      </div>
      <Field label="Description"><textarea name="description" defaultValue={partner?.description ?? ""} className={`${inputClass} min-h-24 py-3`} /></Field>
      <button type="submit" className="primary-cta w-fit">{partner ? "Enregistrer" : "Créer le partenaire"}</button>
    </form>
  );
}

async function getPartners() {
  if (!hasSupabaseEnv()) return { partners: [], isConfigured: false };
  const supabase = await createClient();
  const { data } = await supabase
    .from("partners")
    .select("id, slug, name, role_label, description, image_url, external_url, is_public, sort_order")
    .order("sort_order", { ascending: true });
  return { partners: (data as AdminPartner[] | null) ?? [], isConfigured: true };
}

export default async function AdminPartnersPage() {
  await requireAdmin();
  const { partners, isConfigured } = await getPartners();

  return (
    <AdminShell>
      <div className="grid gap-6">
        <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-5 sm:p-6">
          <p className="section-kicker">Partenaires</p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">Créer un partenaire</h2>
          <div className="mt-5">{isConfigured ? <PartnerForm /> : <p className="text-sm text-white/58">Supabase doit être configuré pour gérer les partenaires.</p>}</div>
        </section>
        <div className="grid gap-4 xl:grid-cols-2">
          {partners.map((partner) => (
            <article key={partner.id} className="grid gap-4 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-soft)]">{partner.is_public ? "Publié" : "Brouillon"} · {partner.role_label}</p>
                  <h2 className="mt-2 text-2xl font-black text-white">{partner.name}</h2>
                  <p className="mt-2 text-sm text-white/50">{partner.external_url}</p>
                </div>
                <form action={deletePartner}>
                  <input type="hidden" name="id" value={partner.id} />
                  <button type="submit" className="secondary-cta border-red-400/30 text-red-100">Supprimer</button>
                </form>
              </div>
              <PartnerForm partner={partner} />
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
