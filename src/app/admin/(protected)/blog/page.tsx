"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reordering, setReordering] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/blog");
    setPosts(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function togglePublish(p: any) {
    await fetch(`/api/admin/blog/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: p.status === "published" ? "draft" : "published" }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    load();
  }

  async function moveItem(id: string, direction: "up" | "down") {
    const idx = posts.findIndex((p) => p.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx === -1 || swapIdx < 0 || swapIdx >= posts.length) return;

    const reordered = [...posts];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];

    setReordering(true);
    await Promise.all(
      reordered.map((p, i) =>
        fetch(`/api/admin/blog/${p.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: i }),
        })
      )
    );
    setReordering(false);
    load();
  }

  const filtered = search.trim()
    ? posts.filter((p) => p.title.toLowerCase().includes(search.trim().toLowerCase()))
    : posts;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Blog / Thoughts</h1>
        <div className="flex gap-2">
          <Link href="/admin/blog/import" className="btn-outline">Bulk Import</Link>
          <Link href="/admin/blog/new" className="btn-primary">+ Write Article</Link>
        </div>
      </div>

      <input
        placeholder="Search articles by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none"
      />
      {search.trim() && (
        <p className="mb-3 text-xs text-white/40">Reordering is disabled while searching — clear the search to drag order.</p>
      )}

      {loading ? (
        <p className="text-white/40">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/40">{search.trim() ? "No articles match your search." : "No articles yet."}</p>
      ) : (
        <div className="glass divide-y divide-white/10">
          {filtered.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                {!search.trim() && (
                  <div className="flex flex-col">
                    <button
                      onClick={() => moveItem(p.id, "up")}
                      disabled={reordering}
                      aria-label="Move up"
                      className="text-white/40 hover:text-white disabled:opacity-30"
                    >▲</button>
                    <button
                      onClick={() => moveItem(p.id, "down")}
                      disabled={reordering}
                      aria-label="Move down"
                      className="text-white/40 hover:text-white disabled:opacity-30"
                    >▼</button>
                  </div>
                )}
                <div>
                  <div className="font-medium text-white">{p.title}</div>
                  <div className="text-xs text-white/40">
                    {p.category?.name || "Uncategorized"} · <span className={p.status === "published" ? "text-secondary" : "text-yellow-400"}>{p.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 text-sm">
                <button onClick={() => togglePublish(p)} className="btn-outline !px-4 !py-2">
                  {p.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <Link href={`/admin/blog/${p.id}/edit`} className="btn-outline !px-4 !py-2">Edit</Link>
                <button onClick={() => remove(p.id)} className="rounded-full border border-red-400/30 px-4 py-2 text-red-400 hover:bg-red-400/10">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
