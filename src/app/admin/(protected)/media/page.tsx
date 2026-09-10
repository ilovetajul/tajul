"use client";
import { useEffect, useState, useCallback } from "react";

const inputCls = "rounded-lg bg-white/10 px-4 py-2.5 text-white placeholder-white/40 outline-none text-sm";
const FOLDERS = ["general", "profile", "cover", "projects", "blog", "skills", "certificates"];

function formatBytes(bytes?: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MediaLibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [folder, setFolder] = useState("general");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", altText: "" });
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; usages?: string[] } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), ...(search ? { search } : {}), ...(type ? { type } : {}) });
    const res = await fetch(`/api/admin/media?${params}`);
    const data = await res.json();
    setItems(data.items || []);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [page, search, type]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(file: File) {
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
    setPage(1);
    load();
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
  }

  async function saveEdit(id: string) {
    await fetch(`/api/admin/media/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    setEditingId(null);
    load();
  }

  async function doDelete(id: string, force = false) {
    const res = await fetch(`/api/admin/media/${id}${force ? "?force=true" : ""}`, { method: "DELETE" });
    if (res.status === 409) {
      const data = await res.json();
      setConfirmDelete({ id, usages: data.usages });
      return;
    }
    setConfirmDelete(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Media Library</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select value={folder} onChange={(e) => setFolder(e.target.value)} className={inputCls}>
            {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <label className="btn-primary cursor-pointer">
            {uploading ? "Uploading..." : "+ Upload"}
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              disabled={uploading}
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <div className="mb-6 flex flex-wrap gap-2">
        <input placeholder="Search filename or title..." value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} className={inputCls + " flex-1 min-w-[200px]"} />
        <select value={type} onChange={(e) => { setPage(1); setType(e.target.value); }} className={inputCls}>
          <option value="">All types</option>
          <option value="image">Images</option>
          <option value="pdf">PDFs</option>
        </select>
      </div>

      {loading ? (
        <p className="text-white/60">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-white/60">No media yet — upload your first file above.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <div key={m.id} className="glass overflow-hidden">
              <div className="relative h-32 bg-white/5">
                {m.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt={m.altText || m.filename} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl">📄</div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs text-white/70">{m.originalFilename || m.filename}</p>
                <p className="text-[11px] text-white/60">
                  {m.width && m.height ? `${m.width}×${m.height} · ` : ""}{formatBytes(m.size)} · {m.provider}
                </p>

                {editingId === m.id ? (
                  <div className="mt-2 space-y-1">
                    <input placeholder="Title" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className={inputCls + " w-full !py-1.5 text-xs"} />
                    <input placeholder="Alt text" value={editForm.altText} onChange={(e) => setEditForm((f) => ({ ...f, altText: e.target.value }))} className={inputCls + " w-full !py-1.5 text-xs"} />
                    <div className="flex gap-1">
                      <button onClick={() => saveEdit(m.id)} className="flex-1 rounded bg-primary py-1 text-xs text-white">Save</button>
                      <button onClick={() => setEditingId(null)} className="flex-1 rounded bg-white/10 py-1 text-xs text-white/70">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-1 text-xs">
                    <button onClick={() => copyUrl(m.url)} className="rounded bg-white/10 px-2 py-1 text-white/70 hover:bg-white/20">Copy URL</button>
                    <button onClick={() => { setEditingId(m.id); setEditForm({ title: m.title || "", altText: m.altText || "" }); }} className="rounded bg-white/10 px-2 py-1 text-white/70 hover:bg-white/20">Edit</button>
                    <button onClick={() => doDelete(m.id)} className="rounded bg-red-400/10 px-2 py-1 text-red-400 hover:bg-red-400/20">Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline !px-4 !py-2 disabled:opacity-30">Prev</button>
          <span className="px-3 py-2 text-white/50">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-outline !px-4 !py-2 disabled:opacity-30">Next</button>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="glass-strong max-w-sm p-6">
            <h3 className="mb-2 font-semibold text-white">This file is currently in use</h3>
            <ul className="mb-4 list-inside list-disc text-sm text-white/70">
              {confirmDelete.usages?.map((u, i) => <li key={i}>{u}</li>)}
            </ul>
            <p className="mb-4 text-sm text-white/50">Deleting it will leave those places pointing at a missing image. Delete anyway?</p>
            <div className="flex gap-2">
              <button onClick={() => doDelete(confirmDelete.id, true)} className="flex-1 rounded-full bg-red-500 py-2 text-sm text-white">Delete Anyway</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-full bg-white/10 py-2 text-sm text-white/70">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
