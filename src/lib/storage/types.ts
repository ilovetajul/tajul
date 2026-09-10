// Provider-agnostic storage contract. Anything that wants to store a file (upload API,
// a future migration script, etc.) talks to this interface — never to Supabase directly.
// Swapping Supabase for S3/Cloudflare R2/Cloudinary later means writing one new file
// here and changing one line in index.ts; nothing else in the app needs to change.

export type StoredFile = {
  url: string; // public URL to use in <img>/<a> tags
  bucket: string;
  storagePath: string; // path within the bucket, needed to delete later
  provider: "supabase";
};

export interface StorageProvider {
  upload(params: {
    buffer: Buffer;
    filename: string; // sanitized, unique filename
    folder: string; // e.g. "projects", "blog", "profile"
    contentType: string;
    isDocument: boolean; // true -> portfolio-documents bucket, false -> portfolio-media
  }): Promise<StoredFile>;

  delete(params: { bucket: string; storagePath: string }): Promise<void>;
}
