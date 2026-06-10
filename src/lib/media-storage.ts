import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { isMediaBucket, mediaBuckets, type MediaBucket, type MediaFile } from "@/lib/media";

type StorageListItem = {
  name: string;
  id: string | null;
  updated_at: string | null;
  created_at: string | null;
  last_accessed_at: string | null;
  metadata: Record<string, unknown> | null;
};

function normalizePrefix(prefix: string) {
  return prefix.trim().replace(/^\/+|\/+$/g, "");
}

function metadataNumber(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata?.[key];
  return typeof value === "number" ? value : 0;
}

function metadataString(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" ? value : null;
}

export async function listMediaFiles(bucket: MediaBucket, folder = ""): Promise<MediaFile[]> {
  if (!hasSupabaseEnv()) return [];

  const prefix = normalizePrefix(folder);
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(bucket).list(prefix || undefined, {
    limit: 100,
    offset: 0,
    sortBy: { column: "updated_at", order: "desc" },
  });

  if (error || !data) return [];

  return (data as StorageListItem[])
    .filter((item) => item.id)
    .map((item) => {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

      return {
        bucket,
        name: item.name,
        path,
        publicUrl: publicUrlData.publicUrl,
        size: metadataNumber(item.metadata, "size"),
        contentType: metadataString(item.metadata, "mimetype"),
        updatedAt: item.updated_at,
      };
    });
}

export async function listMediaOptions(bucket: MediaBucket, folder = "") {
  if (!isMediaBucket(bucket)) return [];
  return listMediaFiles(bucket, folder);
}

export async function listAllMediaOptions() {
  const entries = await Promise.all(mediaBuckets.map((bucket) => listMediaFiles(bucket)));
  return Object.fromEntries(mediaBuckets.map((bucket, index) => [bucket, entries[index]])) as Record<MediaBucket, MediaFile[]>;
}
