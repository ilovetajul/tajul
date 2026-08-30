"use client";
import { useEffect, useState } from "react";

const inputCls = "flex-1 rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none";

function CategoryList({ type, title }: { type: "project" | "blog"; title: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");

  async function load() {
    const res = await fetch(`/api/admin/categories?type=${type}`);
    setItems(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, type }) });
    setName("");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/admin/categories/${id}?type=${type}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="glass p-6">
      <h2 className="mb-4 font-semibold text-white">{title}</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {items.map((c) => (
          <span key={c.id} className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/80">
            {c.name}
            <button onClick={() => remove(c.id)} className="text-red-400">×</button>
          </span>
        ))}
        {items.length === 0 && <p className="text-sm text-white/40">No categories yet.</p>}
      </div>
      <form onSubmit={add} className="flex gap-2">
        <input placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        <button type="submit" className="btn-primary shrink-0">Add</button>
      </form>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Categories</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <CategoryList type="project" title="Project Categories" />
        <CategoryList type="blog" title="Blog Categories" />
      </div>
    </div>
  );
}
