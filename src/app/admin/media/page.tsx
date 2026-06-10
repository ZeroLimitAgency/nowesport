import Link from "next/link";
import { deleteMedia, uploadMediaFromLibrary } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
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

const inputClass = "min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm normal-case tracking-normal text-white outline-none focus:border-[var(--color-accent)]/60";

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
        <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-5 sm:p-6">
          <p className="section-kicker">Media Manager</p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">Supabase Storage</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/58">
            Téléverse, prévisualise, copie et supprime les médias publics utilisés par les produits, partenaires, événements, rosters et blocs CMS. Les uploads et suppressions passent par la session admin.
          </p>
          {!hasSupabaseEnv() ? (
            <p className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm text-yellow-100">Supabase n’est pas configuré : le media manager est désactivé.</p>
          ) : null}
        </section>

        <section className="grid gap-4 rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
          <div>
            <p className="section-kicker">Bucket / dossier</p>
            <h3 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em] text-white">Choisir l’espace média</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {mediaBuckets.map((item) => (
              <Link
                key={item}
                href={`/admin/media?bucket=${item}`}
                className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${item === bucket ? "border-[var(--color-accent)]/60 bg-[var(--color-accent)]/15 text-white" : "border-white/10 bg-white/[0.03] text-white/62"}`}
              >
                {mediaBucketLabels[item]}
              </Link>
            ))}
          </div>
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]" action="/admin/media">
            <input type="hidden" name="bucket" value={bucket} />
            <input name="folder" defaultValue={folder} className={inputClass} placeholder="Dossier optionnel, ex : home/hero" />
            <button type="submit" className="secondary-cta">Ouvrir le dossier</button>
          </form>
        </section>

        <section className="grid gap-4 rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-5 sm:p-6">
          <div>
            <p className="section-kicker">Upload</p>
            <h3 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em] text-white">Téléverser dans {mediaBucketLabels[bucket]}</h3>
          </div>
          <form action={uploadMediaFromLibrary} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input type="hidden" name="bucket" value={bucket} />
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              Dossier
              <input name="folder" defaultValue={folder} className={inputClass} placeholder="Optionnel" />
            </label>
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              Fichier
              <input required type="file" name="file" accept=".png,.jpg,.jpeg,.webp,.mp4,image/png,image/jpeg,image/webp,video/mp4" className={`${inputClass} py-3 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.14em] file:text-white`} />
            </label>
            <button type="submit" className="primary-cta self-end">Téléverser</button>
          </form>
          <p className="text-xs leading-5 text-white/42">Formats autorisés : png, jpg, jpeg, webp et mp4. Limites : {maxImageSizeBytes / 1024 / 1024} Mo pour les images, {maxVideoSizeBytes / 1024 / 1024} Mo pour les vidéos CMS.</p>
        </section>

        <section className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Fichiers</p>
              <h3 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em] text-white">{files.length} média(s)</h3>
            </div>
            <p className="text-sm text-white/45">Bucket : {bucket}{folder ? ` · dossier : ${folder}` : ""}</p>
          </div>

          {files.length === 0 ? (
            <p className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5 text-sm text-white/55">Aucun fichier dans ce bucket/dossier pour le moment.</p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {files.map((file) => (
              <article key={file.path} className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                <div className="overflow-hidden rounded-[1.1rem] border border-white/8 bg-black/30">
                  {isImageUrl(file.publicUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file.publicUrl} alt={file.name} className="h-56 w-full object-cover" />
                  ) : isVideoUrl(file.publicUrl) ? (
                    <video src={file.publicUrl} controls className="h-56 w-full object-cover" />
                  ) : (
                    <div className="flex h-56 items-center justify-center text-sm text-white/45">Prévisualisation indisponible</div>
                  )}
                </div>
                <div className="grid gap-2">
                  <h4 className="break-all text-sm font-bold text-white">{file.path}</h4>
                  <p className="text-xs text-white/42">{formatBytes(file.size)} · {file.contentType ?? "type inconnu"}</p>
                  <input readOnly value={file.publicUrl} className={`${inputClass} text-xs`} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <MediaCopyButton value={file.publicUrl} />
                  <form action={deleteMedia}>
                    <input type="hidden" name="bucket" value={file.bucket} />
                    <input type="hidden" name="path" value={file.path} />
                    <button type="submit" className="secondary-cta border-red-400/30 text-red-100">Supprimer</button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
