"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";

const inputCls = "w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none";

export default function BlogForm({ initial }: { initial?: any }) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState({
    title: initial?.title || "",
    excerpt: initial?.excerpt || "",
    content: initial?.content || "",
    featuredImg: initial?.featuredImg || "",
    categoryId: initial?.categoryId || "",
    tags: (initial?.tags || []).join(", "),
    status: initial?.status || "draft",
    seoTitle: initial?.seoTitle || "",
    seoDesc: initial?.seoDesc || "",
  });

  useEffect(() => {
    fetch("/api/admin/categories?type=blog").then((r) => r.json()).then(setCategories);
  }, []);

  function set(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
      categoryId: form.categoryId || null,
    };
    const url = initial ? `/api/admin/blog/${initial.id}` : "/api/admin/blog";
    const method = initial ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) router.push("/admin/blog");
  }

  return (
    <form onSubmit={handleSubmit} className="glass max-w-2xl space-y-4 p-6">
      <input placeholder="Article title" required value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
      <input placeholder="Short excerpt" value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} className={inputCls} />

      <ImageUploader label="Featured image" value={form.featuredImg} onChange={(url) => set("featuredImg", url)} folder="blog" />

      <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
        <option value="">No category</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => set("tags", e.target.value)} className={inputCls} />

      <div className="flex items-center justify-between">
        <label className="text-sm text-white/60">Content (Markdown supported)</label>
        <button type="button" onClick={() => setPreview((p) => !p)} className="text-xs text-primary underline">
          {preview ? "Edit" : "Preview"}
        </button>
      </div>
      {preview ? (
        <div className="prose prose-invert max-w-none rounded-lg bg-white/5 p-4 text-white/80 min-h-[200px] whitespace-pre-line">
          {form.content || "Nothing to preview yet."}
        </div>
      ) : (
        <textarea rows={12} value={form.content} onChange={(e) => set("content", e.target.value)} className={inputCls + " font-mono text-sm"} />
      )}

      <details className="text-sm text-white/60">
        <summary className="cursor-pointer">SEO settings</summary>
        <div className="mt-3 space-y-3">
          <input placeholder="SEO title (optional)" value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className={inputCls} />
          <textarea placeholder="SEO description (optional)" value={form.seoDesc} onChange={(e) => set("seoDesc", e.target.value)} className={inputCls} />
        </div>
      </details>

      <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls + " w-auto"}>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
        {saving ? "Saving..." : initial ? "Save Changes" : "Publish Article"}
      </button>
    </form>
  );
}
