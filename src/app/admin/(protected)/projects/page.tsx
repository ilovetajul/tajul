"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reordering, setReordering] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/projects");
    setProjects(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function togglePublish(p: any) {
    await fetch(`/api/admin/projects/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: p.status === "published" ? "draft" : "published" }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    load();
  }

  // Re-sequences everyone's sortOrder based on the swapped order. Doing the whole list
  // every time (not just the two swapped items) keeps this correct even before any
  // ordering has ever been set (e.g. bulk-imported items, which all start at sortOrder 0).
  async function moveItem(id: string, direction: "up" | "down") {
    const idx = projects.findIndex((p) => p.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx === -1 || swapIdx < 0 || swapIdx >= projects.length) return;

    const reordered = [...projects];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];

    setReordering(true);
    await Promise.all(
      reordered.map((p, i) =>
        fetch(`/api/admin/projects/${p.id}`, {
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
    ? projects.filter((p) => p.title.toLowerCase().includes(search.trim().toLowerCase()))
    : projects;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <div className="flex gap-2">
          <Link href="/admin/projects/import" className="btn-outline">Bulk Import</Link>
          <Link href="/admin/projects/new" className="btn-primary">+ Add Project</Link>
        </div>
      </div>

      <input
        placeholder="Search projects by title..."
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
        <p className="text-white/40">{search.trim() ? "No projects match your search." : "No projects yet."}</p>
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
                  <div className="font-medium text-white">
                    {p.title} {p.featured && <span className="ml-2 text-xs text-primary">★ featured</span>}
                  </div>
                  <div className="text-xs text-white/40">
                    {p.category?.name || "Uncategorized"} · <span className={p.status === "published" ? "text-secondary" : "text-yellow-400"}>{p.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 text-sm">
                <button onClick={() => togglePublish(p)} className="btn-outline !px-4 !py-2">
                  {p.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <Link href={`/admin/projects/${p.id}/edit`} className="btn-outline !px-4 !py-2">Edit</Link>
                <button onClick={() => remove(p.id)} className="rounded-full border border-red-400/30 px-4 py-2 text-red-400 hover:bg-red-400/10">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
