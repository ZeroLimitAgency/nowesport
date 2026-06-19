import Link from "next/link";
import { deleteMedia, uploadMediaFromLibrary } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { AdminActionButton, AdminAdvancedPanel, AdminEmptyState, AdminField, AdminPageHeader, AdminSection, AdminToolbar, adminInputClass } from "@/components/admin-ui";
import { MediaCopyButton } from "@/components/media-copy-button";
import { requireAdmin } from "@/lib/auth";
import {
  isImageUrl,
  isMediaBucket,
  isVideoUrl,
  maxImageSizeBytes,
  maxVideoSizeBytes,
  mediaBucketLabels,
  mediaBuckets,
  type MediaBucket,
} from "@/lib/media";
import { listMediaFiles } from "@/lib/media-storage";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

const inputClass = adminInputClass;

function formatBytes(bytes: number) {
  if (!bytes) return "Taille inconnue";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

function getBucket(searchParams: Record<string, string | string[] | undefined>): MediaBucket {
  const raw = searchParams.bucket;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && isMediaBucket(value) ? value : "cms";
}

function getFolder(searchParams: Record<string, string | string[] | undefined>) {
  const raw = searchParams.folder;
  return Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
}

export default async function AdminMediaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const resolvedSearchParams = await searchParams;
  const bucket = getBucket(resolvedSearchParams);
  const folder = getFolder(resolvedSearchParams);
  const files = hasSupabaseEnv() ? await listMediaFiles(bucket, folder) : [];

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader kicker="Médias" title="Importer et réutiliser des images" description="Ajoute une image ou une vidéo depuis ton ordinateur sans manipuler Supabase Storage. Les notions bucket/dossier sont rangées dans les options avancées." actions={<AdminActionButton href="#upload" tone="success">Importer un média</AdminActionButton>} />
        {!hasSupabaseEnv() ? <AdminEmptyState title="Media manager indisponible" description="Supabase n’est pas configuré : les imports, suppressions et listes de fichiers sont désactivés." /> : null}

        <AdminSection kicker="Type de média" title="Où sera utilisé ce fichier ?" description="Choisis un contexte simple : produit, roster, partenaire, événement ou CMS.">
          <AdminToolbar>
            {mediaBuckets.map((item) => (
              <Link key={item} href={`/admin/media?bucket=${item}`} className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${item === bucket ? "border-[var(--color-accent)]/60 bg-[var(--color-accent)]/15 text-white" : "border-white/10 bg-white/[0.03] text-white/62"}`}>{mediaBucketLabels[item]}</Link>
            ))}
          </AdminToolbar>
          <AdminAdvancedPanel title="Options avancées : bucket et dossier">
            <form className="grid gap-3 sm:grid-cols-[1fr_auto]" action="/admin/media">
              <input type="hidden" name="bucket" value={bucket} />
              <AdminField label="Dossier technique"><input name="folder" defaultValue={folder} className={inputClass} placeholder="Optionnel, ex : home/hero" /></AdminField>
              <AdminActionButton type="submit">Ouvrir le dossier</AdminActionButton>
            </form>
          </AdminAdvancedPanel>
        </AdminSection>

        <AdminSection kicker="Upload" title="Importer un média" description={`Formats autorisés : png, jpg, jpeg, webp et mp4. Limites : ${maxImageSizeBytes / 1024 / 1024} Mo images, ${maxVideoSizeBytes / 1024 / 1024} Mo vidéos CMS.`}>
          <form id="upload" action={uploadMediaFromLibrary} className="grid gap-4 rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.03] p-5 md:grid-cols-[1fr_auto] md:items-end">
            <input type="hidden" name="bucket" value={bucket} />
            <input type="hidden" name="folder" value={folder} />
            <AdminField label="Glisse-dépose ou choisis un fichier" hint={`Destination : ${mediaBucketLabels[bucket]}${folder ? ` / ${folder}` : ""}`}>
              <input required type="file" name="file" accept=".png,.jpg,.jpeg,.webp,.mp4,image/png,image/jpeg,image/webp,video/mp4" className={`${inputClass} py-3 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.14em] file:text-white`} />
            </AdminField>
            <AdminActionButton type="submit" tone="success">Importer un média</AdminActionButton>
          </form>
        </AdminSection>

        <AdminSection kicker="Bibliothèque" title={`${files.length} média(s)`} description="Prévisualise, copie l’URL publique ou supprime un fichier devenu inutile.">
          {files.length === 0 ? <AdminEmptyState title="Aucun média ici" description="Importe ton premier fichier avec le bouton ci-dessus ou change de type de média." action={<AdminActionButton href="#upload" tone="success">Importer un média</AdminActionButton>} /> : null}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {files.map((file) => (
              <article key={file.path} className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                <div className="overflow-hidden rounded-[1.1rem] border border-white/8 bg-black/30">
                  {isImageUrl(file.publicUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file.publicUrl} alt={file.name} className="h-56 w-full object-cover" />
                  ) : isVideoUrl(file.publicUrl) ? <video src={file.publicUrl} controls className="h-56 w-full object-cover" /> : <div className="flex h-56 items-center justify-center text-sm text-white/45">Prévisualisation indisponible</div>}
                </div>
                <div className="grid gap-2"><h4 className="break-all text-sm font-bold text-white">{file.name}</h4><p className="text-xs text-white/42">{formatBytes(file.size)} · {file.contentType ?? "type inconnu"}</p><input readOnly value={file.publicUrl} className={`${inputClass} text-xs`} /></div>
                <div className="flex flex-wrap gap-2"><MediaCopyButton value={file.publicUrl} /><form action={deleteMedia}><input type="hidden" name="bucket" value={file.bucket} /><input type="hidden" name="path" value={file.path} /><AdminActionButton type="submit" tone="danger">Supprimer</AdminActionButton></form></div>
              </article>
            ))}
          </div>
        </AdminSection>
      </div>
    </AdminShell>
  );
}
