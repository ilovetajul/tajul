"use client";
import { useEffect, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";

const inputCls = "w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none";
const empty = { name: "", designation: "", company: "", quote: "", avatarUrl: "", linkedinUrl: "", projectId: "", featured: false, status: "draft" };

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/testimonials");
    setItems(await res.json());
  }
  useEffect(() => {
    load();
    fetch("/api/admin/projects").then((r) => r.json()).then(setProjects);
  }, []);

  function set(key: string, value: any) { setForm((f: any) => ({ ...f, [key]: value })); }

  function edit(item: any) {
    setEditingId(item.id);
    setForm({ ...item, projectId: item.projectId || "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editingId ? `/api/admin/testimonials/${editingId}` : "/api/admin/testimonials";
    await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setForm(empty);
    setEditingId(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    load();
  }

  async function togglePublish(t: any) {
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, status: t.status === "published" ? "draft" : "published" }),
    });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Testimonials</h1>
      <p className="mb-6 text-sm text-white/60">
        Real quotes only — this section stays hidden on the homepage until at least one testimonial is published.
      </p>
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="glass divide-y divide-white/10">
          {items.map((t) => (
            <div key={t.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
              <div>
                <div className="font-medium text-white">
                  {t.name} {t.featured && <span className="ml-2 text-xs text-primary">★ featured</span>}
                </div>
                <div className="text-xs text-white/50">
                  {[t.designation, t.company].filter(Boolean).join(" · ")} · <span className={t.status === "published" ? "text-secondary" : "text-yellow-400"}>{t.status}</span>
                </div>
                <p className="mt-1 max-w-md text-sm text-white/70">"{t.quote.slice(0, 100)}{t.quote.length > 100 ? "..." : ""}"</p>
              </div>
              <div className="flex gap-2 text-sm">
                <button onClick={() => togglePublish(t)} className="btn-outline !px-3 !py-1.5">
                  {t.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => edit(t)} className="btn-outline !px-3 !py-1.5">Edit</button>
                <button onClick={() => remove(t.id)} className="rounded-full border border-red-400/30 px-3 py-1.5 text-red-400 hover:bg-red-400/10">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="p-4 text-white/50">No testimonials yet.</p>}
        </div>

        <form onSubmit={handleSubmit} className="glass h-fit space-y-3 p-6">
          <h2 className="font-semibold text-white">{editingId ? "Edit Testimonial" : "Add Testimonial"}</h2>
          <input placeholder="Name" required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Designation" value={form.designation} onChange={(e) => set("designation", e.target.value)} className={inputCls} />
            <input placeholder="Company" value={form.company} onChange={(e) => set("company", e.target.value)} className={inputCls} />
          </div>
          <textarea placeholder="Testimonial quote" required rows={4} value={form.quote} onChange={(e) => set("quote", e.target.value)} className={inputCls} />
          <ImageUploader label="Avatar (optional)" value={form.avatarUrl} onChange={(url) => set("avatarUrl", url)} folder="general" />
          <input placeholder="LinkedIn URL (optional)" value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} className={inputCls} />
          <select value={form.projectId} onChange={(e) => set("projectId", e.target.value)} className={inputCls}>
            <option value="">No linked project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
            Featured (shows on homepage)
          </label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? "Saving..." : editingId ? "Save" : "Add"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="btn-outline">Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
