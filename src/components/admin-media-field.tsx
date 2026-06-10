import Link from "next/link";
import { mediaBucketLabels, type MediaBucket, type MediaFile } from "@/lib/media";

const inputClass = "min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm normal-case tracking-normal text-white outline-none focus:border-[var(--color-accent)]/60";

type AdminMediaFieldProps = {
  label: string;
  name: string;
  bucket: MediaBucket;
  defaultValue?: string | null;
  options?: MediaFile[];
  acceptVideo?: boolean;
};

export function AdminMediaField({ label, name, bucket, defaultValue, options = [], acceptVideo = false }: AdminMediaFieldProps) {
  const listId = `${name}-${bucket}-media-options`;

  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
      <span className="flex flex-wrap items-center justify-between gap-2">
        <span>{label}</span>
        <Link href={`/admin/media?bucket=${bucket}`} className="text-[0.65rem] text-[var(--color-accent-soft)] underline-offset-4 hover:underline">
          Téléverser / choisir ({mediaBucketLabels[bucket]})
        </Link>
      </span>
      <input name={name} defaultValue={defaultValue ?? ""} className={inputClass} list={options.length ? listId : undefined} placeholder="URL publique Supabase ou URL manuelle" />
      {options.length ? (
        <datalist id={listId}>
          {options.map((item) => (
            <option key={`${item.bucket}:${item.path}`} value={item.publicUrl}>{item.path}</option>
          ))}
        </datalist>
      ) : null}
      <span className="text-[0.68rem] leading-4 text-white/35">
        Colle une URL manuelle ou choisis un média déjà présent. Formats : png, jpg, jpeg, webp{acceptVideo ? ", mp4" : ""}.
      </span>
    </label>
  );
}
