"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ImageUploader from "./ImageUploader";

const inputCls = "w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none";
const toolBtnCls = "rounded-md bg-white/10 px-2.5 py-1.5 text-sm text-white/80 hover:bg-white/20";

export default function BlogForm({ initial }: { initial?: any }) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [highlightColor, setHighlightColor] = useState("#fde047");
  const [form, setForm] = useState({
    title: initial?.title || "",
    excerpt: initial?.excerpt || "",
    content: initial?.content || "",
    titleBn: initial?.titleBn || "",
    contentBn: initial?.contentBn || "",
    featuredImg: initial?.featuredImg || "",
    categoryId: initial?.categoryId || "",
    tags: (initial?.tags || []).join(", "),
    status: initial?.status || "draft",
    // Left blank = auto-set to "now" when you hit Publish. Pick a date to backdate
    // or schedule the article's displayed publish date yourself.
    publishedAt: initial?.publishedAt ? String(initial.publishedAt).slice(0, 10) : "",
    seoTitle: initial?.seoTitle || "",
    seoDesc: initial?.seoDesc || "",
  });

  useEffect(() => {
    fetch("/api/admin/categories?type=blog").then((r) => r.json()).then(setCategories);
  }, []);

  function set(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // --- Markdown toolbar: reads/writes the textarea's current selection directly ---
  function getSelection() {
    const el = textareaRef.current;
    if (!el) return null;
    return { start: el.selectionStart, end: el.selectionEnd, el };
  }

  function wrapSelection(before: string, after: string, placeholder: string) {
    const sel = getSelection();
    if (!sel) return;
    const { start, end, el } = sel;
    const current = form.content;
    const selected = current.slice(start, end) || placeholder;
    const next = current.slice(0, start) + before + selected + after + current.slice(end);
    set("content", next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function prefixLines(prefix: string) {
    const sel = getSelection();
    if (!sel) return;
    const { start, end, el } = sel;
    const current = form.content;
    const lineStart = current.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = current.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = current.length;
    const block = current.slice(lineStart, lineEnd);
    const prefixed = block
      .split("\n")
      .map((line: string) => (line.startsWith(prefix) ? line : prefix + line))
      .join("\n");
    const next = current.slice(0, lineStart) + prefixed + current.slice(lineEnd);
    set("content", next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(lineStart, lineStart + prefixed.length);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
      categoryId: form.categoryId || null,
      publishedAt: form.publishedAt || undefined,
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

      <div>
        <label className="mb-1 block text-sm text-white/60">Publish date</label>
        <input
          type="date"
          value={form.publishedAt}
          onChange={(e) => set("publishedAt", e.target.value)}
          className={inputCls}
        />
        <p className="mt-1 text-xs text-white/60">Leave blank to use today's date automatically when you publish.</p>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm text-white/60">Content (Markdown supported)</label>
        <button type="button" onClick={() => setPreview((p) => !p)} className="text-xs text-primary underline">
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {!preview && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-white/5 p-2">
          <button type="button" onClick={() => wrapSelection("**", "**", "bold text")} className={toolBtnCls + " font-bold"} title="Bold">B</button>
          <button type="button" onClick={() => wrapSelection("*", "*", "italic text")} className={toolBtnCls + " italic"} title="Italic">I</button>
          <button type="button" onClick={() => prefixLines("## ")} className={toolBtnCls} title="Heading">H2</button>
          <button type="button" onClick={() => prefixLines("### ")} className={toolBtnCls} title="Subheading">H3</button>
          <button type="button" onClick={() => prefixLines("- ")} className={toolBtnCls} title="Bullet list">• List</button>
          <button type="button" onClick={() => prefixLines("> ")} className={toolBtnCls} title="Quote">" Quote</button>
          <button type="button" onClick={() => wrapSelection("`", "`", "code")} className={toolBtnCls + " font-mono"} title="Inline code">{"</>"}</button>
          <button type="button" onClick={() => wrapSelection("[", "](https://)", "link text")} className={toolBtnCls} title="Link">🔗 Link</button>
          <div className="flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-1">
            <input
              type="color"
              value={highlightColor}
              onChange={(e) => setHighlightColor(e.target.value)}
              className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
              title="Highlight color"
            />
            <button
              type="button"
              onClick={() =>
                wrapSelection(
                  `<mark style="background-color:${highlightColor};color:#111827;padding:0 2px;border-radius:2px">`,
                  "</mark>",
                  "highlighted text"
                )
              }
              className="px-1.5 text-sm text-white/80 hover:text-white"
            >
              Highlight
            </button>
          </div>
        </div>
      )}

      {preview ? (
        <div className="prose prose-invert max-w-none rounded-lg bg-white/5 p-4 text-white/80 min-h-[200px]">
          {form.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{form.content}</ReactMarkdown>
          ) : (
            "Nothing to preview yet."
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          rows={14}
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          className={inputCls + " font-mono text-sm"}
        />
      )}

      <details className="rounded-lg bg-white/5 p-3 text-sm text-white/60">
        <summary className="cursor-pointer font-medium text-white/80">বাংলা অনুবাদ (ঐচ্ছিক) — Bengali translation, optional</summary>
        <div className="mt-3 space-y-3">
          <p className="text-xs text-white/60">খালি রাখলে ভিজিটর শুধু English দেখবে। পূরণ করলে সাইটে English | বাংলা টগল বাটন দেখাবে। Markdown (যেমন **bold**) এখানেও কাজ করবে।</p>
          <input placeholder="শিরোনাম (বাংলা)" value={form.titleBn} onChange={(e) => set("titleBn", e.target.value)} className={inputCls} />
          <textarea placeholder="সম্পূর্ণ কনটেন্ট (বাংলা)" rows={10} value={form.contentBn} onChange={(e) => set("contentBn", e.target.value)} className={inputCls + " font-mono text-sm"} />
        </div>
      </details>

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
