"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";

const inputCls = "w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none";

export default function ProjectForm({ initial }: { initial?: any }) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: initial?.title || "",
    shortDesc: initial?.shortDesc || "",
    description: initial?.description || "",
    titleBn: initial?.titleBn || "",
    descriptionBn: initial?.descriptionBn || "",
    thumbnailUrl: initial?.thumbnailUrl || "",
    categoryId: initial?.categoryId || "",
    technologies: (initial?.technologies || []).join(", "),
    role: initial?.role || "",
    client: initial?.client || "",
    projectDate: initial?.projectDate ? initial.projectDate.slice(0, 10) : "",
    liveUrl: initial?.liveUrl || "",
    githubUrl: initial?.githubUrl || "",
    demoUrl: initial?.demoUrl || "",
    docsUrl: initial?.docsUrl || "",
    status: initial?.status || "draft",
    featured: initial?.featured || false,
    tags: (initial?.tags || []).join(", "),
  });

  useEffect(() => {
    fetch("/api/admin/categories?type=project").then((r) => r.json()).then(setCategories);
  }, []);

  function set(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      technologies: form.technologies.split(",").map((t: string) => t.trim()).filter(Boolean),
      tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
      categoryId: form.categoryId || null,
    };
    const url = initial ? `/api/admin/projects/${initial.id}` : "/api/admin/projects";
    const method = initial ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) router.push("/admin/projects");
  }

  return (
    <form onSubmit={handleSubmit} className="glass max-w-2xl space-y-4 p-6">
      <input placeholder="Project title" required value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
      <input placeholder="Short description (shown on cards)" value={form.shortDesc} onChange={(e) => set("shortDesc", e.target.value)} className={inputCls} />
      <textarea placeholder="Full description" rows={6} value={form.description} onChange={(e) => set("description", e.target.value)} className={inputCls} />

      <ImageUploader label="Thumbnail" value={form.thumbnailUrl} onChange={(url) => set("thumbnailUrl", url)} folder="projects" />

      <details className="rounded-lg bg-white/5 p-3 text-sm text-white/60">
        <summary className="cursor-pointer font-medium text-white/80">বাংলা অনুবাদ (ঐচ্ছিক) — Bengali translation, optional</summary>
        <div className="mt-3 space-y-3">
          <p className="text-xs text-white/40">খালি রাখলে ভিজিটর শুধু English দেখবে। পূরণ করলে সাইটে English | বাংলা টগল বাটন দেখাবে।</p>
          <input placeholder="শিরোনাম (বাংলা)" value={form.titleBn} onChange={(e) => set("titleBn", e.target.value)} className={inputCls} />
          <textarea placeholder="সম্পূর্ণ বিবরণ (বাংলা)" rows={6} value={form.descriptionBn} onChange={(e) => set("descriptionBn", e.target.value)} className={inputCls} />
        </div>
      </details>

      <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
        <option value="">No category</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <input placeholder="Technologies (comma separated)" value={form.technologies} onChange={(e) => set("technologies", e.target.value)} className={inputCls} />
      <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => set("tags", e.target.value)} className={inputCls} />

      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Your role" value={form.role} onChange={(e) => set("role", e.target.value)} className={inputCls} />
        <input placeholder="Client / company" value={form.client} onChange={(e) => set("client", e.target.value)} className={inputCls} />
      </div>

      <input type="date" value={form.projectDate} onChange={(e) => set("projectDate", e.target.value)} className={inputCls} />

      <input placeholder="Live URL" value={form.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} className={inputCls} />
      <input placeholder="GitHub URL" value={form.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} className={inputCls} />
      <input placeholder="Demo URL" value={form.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} className={inputCls} />
      <input placeholder="Documentation URL" value={form.docsUrl} onChange={(e) => set("docsUrl", e.target.value)} className={inputCls} />

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
          Featured
        </label>
        <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls + " w-auto"}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
        {saving ? "Saving..." : initial ? "Save Changes" : "Create Project"}
      </button>
    </form>
  );
}
