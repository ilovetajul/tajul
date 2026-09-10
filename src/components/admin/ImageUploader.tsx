"use client";
import { useEffect, useState } from "react";

const inputCls = "w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none";

export default function ImageUploader({
  value,
  onChange,
  label = "Image",
  folder = "general",
}: {
  value: string | null | undefined;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
}) {
  const [tab, setTab] = useState<"upload" | "library" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");

  useEffect(() => {
    if (tab === "library") {
      setLibraryLoading(true);
      fetch("/api/admin/media?type=image")
        .then((r) => r.json())
        .then((d) => setLibraryItems(d.items || []))
        .finally(() => setLibraryLoading(false));
    }
  }, [tab]);

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    setUploading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Upload failed");
      return;
    }
    const media = await res.json();
    onChange(media.url);
  }

  function handleExternalUrl() {
    if (!externalUrl.trim()) return;
    // Register it in the Media Library too, so it shows up for reuse elsewhere —
    // but don't block the form on that request.
    fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: externalUrl.trim(), provider: "external_url", folder }),
    }).catch(() => {});
    onChange(externalUrl.trim());
    setExternalUrl("");
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-white/60">{label}</label>

      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mb-2 h-28 w-28 rounded-lg object-cover" />
      )}

      <div className="mb-2 flex gap-1 text-xs">
        {(["upload", "library", "url"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 ${tab === t ? "bg-primary text-white" : "bg-white/10 text-white/60"}`}
          >
            {t === "upload" ? "Upload" : t === "library" ? "Media Library" : "External URL"}
          </button>
        ))}
      </div>

      {tab === "upload" && (
        <div>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="block w-full text-sm text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white"
          />
          {uploading && <p className="mt-1 text-xs text-white/60">Uploading...</p>}
        </div>
      )}

      {tab === "library" && (
        <div className="max-h-56 overflow-y-auto rounded-lg bg-white/5 p-2">
          {libraryLoading ? (
            <p className="p-2 text-xs text-white/60">Loading...</p>
          ) : libraryItems.length === 0 ? (
            <p className="p-2 text-xs text-white/60">No media uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {libraryItems.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChange(m.url)}
                  className="aspect-square overflow-hidden rounded-lg border border-white/10 hover:border-primary"
                  title={m.originalFilename || m.filename}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "url" && (
        <div className="flex gap-2">
          <input
            placeholder="https://example.com/image.jpg"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            className={inputCls}
          />
          <button type="button" onClick={handleExternalUrl} className="btn-outline shrink-0 !px-4 !py-2">Use</button>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
