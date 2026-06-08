import {
  deleteSiteNavigationItem,
  deleteSiteSocialLink,
  saveSiteContentBlock,
  saveSiteNavigationItem,
  saveSiteSocialLink,
} from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { getDefaultCmsContent, locales, type SiteLocale } from "@/lib/cms";
import { requireAdmin } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type AdminContentBlock = {
  locale: SiteLocale;
  area: string;
  block_key: string;
  title: string;
  body: string | null;
  eyebrow: string | null;
  cta_label: string | null;
  cta_href: string | null;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
  media_url: string | null;
  metadata: Record<string, unknown> | null;
  is_active: boolean;
  sort_order: number;
};

type AdminNavigationItem = {
  id: string;
  locale: SiteLocale;
  placement: string;
  label: string;
  href: string;
  is_active: boolean;
  sort_order: number;
};

type AdminSocialLink = {
  id: string;
  platform: string;
  label: string;
  href: string;
  is_active: boolean;
  sort_order: number;
};

export const dynamic = "force-dynamic";

const inputClass = "min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--color-accent)]/60";
const textareaClass = `${inputClass} min-h-28 py-3`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
      {label}
      {children}
    </label>
  );
}

function contentKey(block: Pick<AdminContentBlock, "locale" | "area" | "block_key">) {
  return `${block.locale}.${block.area}.${block.block_key}`;
}

function LocaleBadge({ locale }: { locale: SiteLocale }) {
  return (
    <span className={`rounded-full px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.2em] ${locale === "fr" ? "bg-blue-400/15 text-blue-100" : "bg-pink-400/15 text-pink-100"}`}>
      {locale === "fr" ? "Français" : "English"}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`rounded-full px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] ${active ? "bg-emerald-400/15 text-emerald-100" : "bg-yellow-300/15 text-yellow-100"}`}>
      {active ? "Publié" : "Brouillon"}
    </span>
  );
}

function seededBlocks() {
  return locales.flatMap((locale) => {
    const defaults = getDefaultCmsContent(locale).blocks;
    return Object.values(defaults).map((block, index) => ({
      locale,
      area: block.area,
      block_key: block.key,
      title: block.title,
      body: block.body,
      eyebrow: block.eyebrow ?? null,
      cta_label: block.ctaLabel ?? null,
      cta_href: block.ctaHref ?? null,
      secondary_cta_label: block.secondaryCtaLabel ?? null,
      secondary_cta_href: block.secondaryCtaHref ?? null,
      media_url: block.mediaUrl ?? null,
      metadata: block.metadata ?? {},
      is_active: true,
      sort_order: index,
    }));
  });
}

function mergeWithDefaults(blocks: AdminContentBlock[]) {
  const byKey = new Map(blocks.map((block) => [contentKey(block), block]));
  return seededBlocks().map((fallback) => byKey.get(contentKey(fallback)) ?? fallback);
}

async function getAdminContent() {
  if (!hasSupabaseEnv()) {
    return { blocks: seededBlocks(), navigation: [], socialLinks: [], isConfigured: false, hasCmsTables: false };
  }

  try {
    const supabase = await createClient();
    const [{ data: blocks, error: blocksError }, { data: navigation, error: navigationError }, { data: socialLinks, error: socialError }] = await Promise.all([
      supabase
        .from("site_content_blocks")
        .select("locale, area, block_key, title, body, eyebrow, cta_label, cta_href, secondary_cta_label, secondary_cta_href, media_url, metadata, is_active, sort_order")
        .order("locale", { ascending: true })
        .order("area", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase
        .from("site_navigation")
        .select("id, locale, placement, label, href, is_active, sort_order")
        .order("locale", { ascending: true })
        .order("placement", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase
        .from("site_social_links")
        .select("id, platform, label, href, is_active, sort_order")
        .order("sort_order", { ascending: true }),
    ]);

    const hasCmsTables = !blocksError && !navigationError && !socialError;

    return {
      blocks: mergeWithDefaults(((blocks ?? []) as AdminContentBlock[])),
      navigation: ((navigation ?? []) as AdminNavigationItem[]),
      socialLinks: ((socialLinks ?? []) as AdminSocialLink[]),
      isConfigured: true,
      hasCmsTables,
    };
  } catch {
    return { blocks: seededBlocks(), navigation: [], socialLinks: [], isConfigured: true, hasCmsTables: false };
  }
}

function BlockForm({ block }: { block: AdminContentBlock }) {
  return (
    <form action={saveSiteContentBlock} className="grid gap-4 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
      <input type="hidden" name="locale" value={block.locale} />
      <input type="hidden" name="area" value={block.area} />
      <input type="hidden" name="block_key" value={block.block_key} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <LocaleBadge locale={block.locale} />
            <StatusBadge active={block.is_active} />
            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/55">{block.area}.{block.block_key}</span>
          </div>
          <h3 className="mt-3 text-2xl font-black uppercase tracking-[-0.04em] text-white">{block.title}</h3>
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold text-white/72">
          <input type="checkbox" name="is_active" defaultChecked={block.is_active} className="h-5 w-5 accent-pink-500" />
          Actif
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Eyebrow / kicker"><input name="eyebrow" defaultValue={block.eyebrow ?? ""} className={inputClass} /></Field>
        <Field label="Titre"><input required name="title" defaultValue={block.title} className={inputClass} /></Field>
        <Field label="CTA principal"><input name="cta_label" defaultValue={block.cta_label ?? ""} className={inputClass} /></Field>
        <Field label="Lien CTA"><input name="cta_href" defaultValue={block.cta_href ?? ""} className={inputClass} /></Field>
        <Field label="CTA secondaire"><input name="secondary_cta_label" defaultValue={block.secondary_cta_label ?? ""} className={inputClass} /></Field>
        <Field label="Lien secondaire"><input name="secondary_cta_href" defaultValue={block.secondary_cta_href ?? ""} className={inputClass} /></Field>
        <Field label="Image / vidéo URL"><input name="media_url" defaultValue={block.media_url ?? ""} className={inputClass} /></Field>
        <Field label="Ordre"><input type="number" name="sort_order" defaultValue={block.sort_order} className={inputClass} /></Field>
      </div>
      <Field label="Texte"><textarea name="body" defaultValue={block.body ?? ""} className={textareaClass} /></Field>
      <Field label="Metadata JSON (sponsors, sections légales, poster...)">
        <textarea name="metadata" defaultValue={JSON.stringify(block.metadata ?? {}, null, 2)} className={`${textareaClass} font-mono text-xs normal-case tracking-normal`} />
      </Field>
      <p className="text-xs leading-5 text-white/42">Les liens et médias doivent être des URL http(s), mailto ou des chemins internes commençant par /. Un JSON invalide est refusé à la sauvegarde.</p>
      <button type="submit" className="primary-cta w-fit">Sauvegarder le bloc</button>
    </form>
  );
}

function NavigationForm({ item }: { item?: AdminNavigationItem }) {
  return (
    <form action={saveSiteNavigationItem} className="grid gap-3 rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Field label="Langue">
          <select name="locale" defaultValue={item?.locale ?? "fr"} className={inputClass}>
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>
        </Field>
        <Field label="Emplacement">
          <select name="placement" defaultValue={item?.placement ?? "header"} className={inputClass}>
            <option value="header">Header</option>
            <option value="footer_legal">Footer légal</option>
          </select>
        </Field>
        <Field label="Libellé"><input required name="label" defaultValue={item?.label ?? ""} className={inputClass} /></Field>
        <Field label="Lien"><input required name="href" defaultValue={item?.href ?? ""} className={inputClass} /></Field>
        <Field label="Ordre"><input type="number" name="sort_order" defaultValue={item?.sort_order ?? 0} className={inputClass} /></Field>
        <label className="flex items-center gap-3 text-sm font-semibold text-white/72 sm:pt-7">
          <input type="checkbox" name="is_active" defaultChecked={item?.is_active ?? true} className="h-5 w-5 accent-pink-500" />
          Actif
        </label>
      </div>
      <p className="text-xs leading-5 text-white/42">Le lien doit être une URL http(s), mailto ou un chemin interne commençant par /.</p>
      <button type="submit" className="primary-cta w-fit">{item ? "Sauvegarder le lien" : "Ajouter le lien"}</button>
    </form>
  );
}

function SocialForm({ item }: { item?: AdminSocialLink }) {
  return (
    <form action={saveSiteSocialLink} className="grid gap-3 rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Field label="Plateforme"><input required name="platform" defaultValue={item?.platform ?? ""} className={inputClass} /></Field>
        <Field label="Libellé"><input required name="label" defaultValue={item?.label ?? ""} className={inputClass} /></Field>
        <Field label="Lien"><input required name="href" defaultValue={item?.href ?? ""} className={inputClass} /></Field>
        <Field label="Ordre"><input type="number" name="sort_order" defaultValue={item?.sort_order ?? 0} className={inputClass} /></Field>
        <label className="flex items-center gap-3 text-sm font-semibold text-white/72 sm:pt-7">
          <input type="checkbox" name="is_active" defaultChecked={item?.is_active ?? true} className="h-5 w-5 accent-pink-500" />
          Actif
        </label>
      </div>
      <p className="text-xs leading-5 text-white/42">Le lien social doit être une URL externe http(s) valide.</p>
      <button type="submit" className="primary-cta w-fit">{item ? "Sauvegarder le réseau" : "Ajouter le réseau"}</button>
    </form>
  );
}

export default async function AdminContentPage() {
  await requireAdmin();
  const { blocks, navigation, socialLinks, isConfigured, hasCmsTables } = await getAdminContent();

  return (
    <AdminShell>
      <div className="grid gap-6">
        <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-5 sm:p-6">
          <p className="section-kicker">Contenu du site</p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">CMS global FR/EN</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/58">
            Les produits, événements, partenaires et rosters restent dans leurs modules métier. Cette page pilote les textes globaux, CTA, liens, médias, maintenance, navigation, réseaux sociaux et pages légales sans demander à l’admin d’ouvrir Supabase.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/50">En cas d’erreur, le formulaire affiche un message serveur lisible : champ obligatoire, URL invalide ou JSON metadata incorrect.</p>
          {!isConfigured ? (
            <p className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm text-yellow-100">Supabase n’est pas configuré : seuls les contenus de fallback sont affichés.</p>
          ) : null}
          {isConfigured && !hasCmsTables ? (
            <p className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm text-yellow-100">Applique le nouveau schéma Supabase pour activer l’édition persistante des tables CMS.</p>
          ) : null}
        </section>

        <section className="grid gap-4">
          <div>
            <p className="section-kicker">Blocs éditoriaux</p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.04em] text-white">Home, boutique, roster, événements, maintenance et légal</h2>
          </div>
          {blocks.map((block) => <BlockForm key={contentKey(block)} block={block} />)}
        </section>

        <section className="grid gap-4 rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-5 sm:p-6">
          <div>
            <p className="section-kicker">Navigation</p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.04em] text-white">Header et footer légal</h2>
          </div>
          <NavigationForm />
          {navigation.length === 0 ? <p className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/55">Aucun lien CMS Supabase pour le moment : le site utilise la navigation de fallback locale.</p> : null}
          {navigation.map((item) => (
            <div key={item.id} className="grid gap-3">
              <NavigationForm item={item} />
              <form action={deleteSiteNavigationItem}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="secondary-cta border-red-400/30 text-red-100">Supprimer ce lien</button>
              </form>
            </div>
          ))}
        </section>

        <section className="grid gap-4 rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-5 sm:p-6">
          <div>
            <p className="section-kicker">Réseaux sociaux</p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.04em] text-white">Liens publics du footer</h2>
          </div>
          <SocialForm />
          {socialLinks.length === 0 ? <p className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/55">Aucun réseau social CMS Supabase pour le moment : le site utilise les liens de fallback locaux.</p> : null}
          {socialLinks.map((item) => (
            <div key={item.id} className="grid gap-3">
              <SocialForm item={item} />
              <form action={deleteSiteSocialLink}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="secondary-cta border-red-400/30 text-red-100">Supprimer ce réseau</button>
              </form>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}
