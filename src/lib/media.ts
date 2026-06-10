export const mediaBuckets = ["products", "roster", "partners", "events", "cms"] as const;

export type MediaBucket = (typeof mediaBuckets)[number];

export const mediaBucketLabels: Record<MediaBucket, string> = {
  products: "Produits",
  roster: "Roster",
  partners: "Partenaires",
  events: "Événements",
  cms: "CMS",
};

export const imageMimeTypes = ["image/png", "image/jpeg", "image/webp"] as const;
export const videoMimeTypes = ["video/mp4"] as const;
export const mediaMimeTypes = [...imageMimeTypes, ...videoMimeTypes] as const;

export const imageExtensions = ["png", "jpg", "jpeg", "webp"] as const;
export const videoExtensions = ["mp4"] as const;
export const mediaExtensions = [...imageExtensions, ...videoExtensions] as const;

export const maxImageSizeBytes = 8 * 1024 * 1024;
export const maxVideoSizeBytes = 50 * 1024 * 1024;

export type MediaFile = {
  bucket: MediaBucket;
  name: string;
  path: string;
  publicUrl: string;
  size: number;
  contentType: string | null;
  updatedAt: string | null;
};

export function isMediaBucket(value: string): value is MediaBucket {
  return (mediaBuckets as readonly string[]).includes(value);
}

export function isImageUrl(value: string) {
  return /\.(png|jpe?g|webp)(\?.*)?$/i.test(value);
}

export function isVideoUrl(value: string) {
  return /\.mp4(\?.*)?$/i.test(value);
}

export function sanitizeMediaFolder(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => part.replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""))
    .filter(Boolean)
    .join("/");
}

export function sanitizeMediaFilename(value: string) {
  const parts = value.split(".");
  const extension = parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  const base = (parts.join(".") || "media")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "media";

  return extension ? `${base}.${extension}` : base;
}
