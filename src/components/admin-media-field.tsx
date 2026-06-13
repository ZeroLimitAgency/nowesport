"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { uploadMedia } from "@/app/admin/actions";
import { mediaBucketLabels, type MediaBucket, type MediaFile } from "@/lib/media";

const inputClass = "min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm normal-case tracking-normal text-white outline-none focus:border-[var(--color-accent)]/60";
const ghostButtonClass = "rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/72 transition hover:border-[var(--color-accent)]/40 hover:text-white";

const imagePattern = /\.(png|jpe?g|webp)(\?.*)?$/i;

function isPreviewableImage(value: string) {
  return imagePattern.test(value) || value.includes("/object/public/");
}

type AdminMediaFieldProps = {
  label: string;
  name: string;
  bucket: MediaBucket;
  defaultValue?: string | null;
  options?: MediaFile[];
  acceptVideo?: boolean;
  folder?: string;
  helper?: string;
};

export function AdminMediaField({
  label,
  name,
  bucket,
  defaultValue,
  options = [],
  acceptVideo = false,
  folder = "admin",
  helper,
}: AdminMediaFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = `${name}-${bucket}-media-options`;
  const accept = acceptVideo ? "image/png,image/jpeg,image/webp,video/mp4" : "image/png,image/jpeg,image/webp";
  const selectedOption = useMemo(() => options.find((item) => item.publicUrl === value), [options, value]);

  function chooseFile() {
    inputRef.current?.click();
  }

  function onFileChange(file: File | undefined) {
    if (!file) return;
    const formData = new FormData();
    formData.set("bucket", bucket);
    formData.set("folder", folder);
    formData.set("file", file);
    setStatus("Upload en cours vers Supabase Storage…");

    startTransition(async () => {
      const result = await uploadMedia(formData);
      setValue(result.publicUrl);
      setStatus("Image importée. L’URL sera enregistrée avec le formulaire.");
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="grid gap-3 rounded-[1.35rem] border border-white/8 bg-black/20 p-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>{label}</span>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[0.62rem] text-white/35">{mediaBucketLabels[bucket]}</span>
      </div>

      {value && isPreviewableImage(value) ? (
        <div className="overflow-hidden rounded-[1.1rem] border border-white/10 bg-white/[0.03]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={`Prévisualisation ${label}`} className="h-44 w-full object-cover" />
        </div>
      ) : (
        <div className="grid h-32 place-items-center rounded-[1.1rem] border border-dashed border-white/12 bg-white/[0.025] px-4 text-center text-[0.7rem] leading-5 text-white/35">
          Aucune image importée pour le moment.
        </div>
      )}

      <input type="hidden" name={name} value={value} />
      <input ref={inputRef} type="file" accept={accept} className="sr-only" onChange={(event) => onFileChange(event.target.files?.[0])} />

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={chooseFile} disabled={isPending} className="primary-cta px-4 py-2 text-xs disabled:cursor-wait disabled:opacity-60">
          {value ? "Remplacer l’image" : "Importer une image"}
        </button>
        {value ? (
          <button type="button" onClick={() => { setValue(""); setStatus("Image retirée du formulaire. Enregistre pour appliquer."); }} className={ghostButtonClass}>
            Supprimer l’image
          </button>
        ) : null}
      </div>

      {status ? <p className="normal-case tracking-normal text-[0.72rem] leading-5 text-[var(--color-accent-soft)]">{status}</p> : null}
      {selectedOption ? <p className="normal-case tracking-normal text-[0.68rem] leading-4 text-white/35">Média sélectionné : {selectedOption.path}</p> : null}
      <details className="rounded-2xl border border-white/8 bg-white/[0.025] p-3 normal-case tracking-normal">
        <summary className="cursor-pointer text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white/48">URL manuelle avancée</summary>
        <div className="mt-3 grid gap-2">
          <input value={value} onChange={(event) => setValue(event.target.value)} className={inputClass} list={options.length ? listId : undefined} placeholder="URL publique Supabase ou URL externe" />
          {options.length ? (
            <datalist id={listId}>
              {options.map((item) => (
                <option key={`${item.bucket}:${item.path}`} value={item.publicUrl}>{item.path}</option>
              ))}
            </datalist>
          ) : null}
          <span className="text-[0.68rem] leading-4 text-white/35">
            {helper ?? `Option de secours : colle une URL si nécessaire. Formats : png, jpg, jpeg, webp${acceptVideo ? ", mp4" : ""}.`}
          </span>
        </div>
      </details>
    </div>
  );
}
