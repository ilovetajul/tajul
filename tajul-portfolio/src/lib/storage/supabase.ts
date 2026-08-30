import { createClient } from "@supabase/supabase-js";
import type { StorageProvider, StoredFile } from "./types";

// Server-only client. SUPABASE_SERVICE_ROLE_KEY must NEVER be prefixed with
// NEXT_PUBLIC_ and must never be imported from a "use client" file — this module
// is only ever called from API routes (server code), which is what keeps it safe.
function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set — see .env.example"
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export const MEDIA_BUCKET = "portfolio-media";
export const DOCS_BUCKET = "portfolio-documents";

export const supabaseStorage: StorageProvider = {
  async upload({ buffer, filename, folder, contentType, isDocument }) {
    const supabase = getServiceClient();
    const bucket = isDocument ? DOCS_BUCKET : MEDIA_BUCKET;
    const storagePath = `${folder}/${filename}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, { contentType, upsert: false });

    if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);

    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);

    return { url: data.publicUrl, bucket, storagePath, provider: "supabase" };
  },

  async delete({ bucket, storagePath }) {
    const supabase = getServiceClient();
    const { error } = await supabase.storage.from(bucket).remove([storagePath]);
    if (error) throw new Error(`Supabase Storage delete failed: ${error.message}`);
  },
};
