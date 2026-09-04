"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <div className="flex gap-2">
          <Link href="/admin/projects/import" className="btn-outline">Bulk Import</Link>
          <Link href="/admin/projects/new" className="btn-primary">+ Add Project</Link>
        </div>
      </div>

      {loading ? (
        <p className="text-white/40">Loading...</p>
      ) : projects.length === 0 ? (
        <p className="text-white/40">No projects yet.</p>
      ) : (
        <div className="glass divide-y divide-white/10">
          {projects.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="font-medium text-white">
                  {p.title} {p.featured && <span className="ml-2 text-xs text-primary">★ featured</span>}
                </div>
                <div className="text-xs text-white/40">
                  {p.category?.name || "Uncategorized"} · <span className={p.status === "published" ? "text-secondary" : "text-yellow-400"}>{p.status}</span>
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
