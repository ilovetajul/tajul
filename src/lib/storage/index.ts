import { supabaseStorage, MEDIA_BUCKET, DOCS_BUCKET } from "./supabase";
import type { StorageProvider } from "./types";

// Single switch point: this is the only line that needs to change to move providers.
export const storage: StorageProvider = supabaseStorage;
export { MEDIA_BUCKET, DOCS_BUCKET };

export const ALLOWED_TYPES: Record<string, "image" | "pdf" | "document"> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "image/svg+xml": "image",
  "application/pdf": "pdf",
};
export const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function sanitizeFilename(name: string) {
  return `${Date.now()}-${name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
}

/** Folder names allowed for uploads, matching PART 6's suggested structure. */
export const MEDIA_FOLDERS = [
  "profile",
  "cover",
  "projects",
  "blog",
  "skills",
  "certificates",
  "general",
] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];
