"use client";
import { useEffect, useState } from "react";

const inputCls = "w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none";
const empty = { name: "", categoryId: "", level: "Intermediate", description: "", yearsExp: "", icon: "" };

export default function AdminSkillsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [newCat, setNewCat] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const skillsRes = await fetch("/api/admin/skills");
    setItems(await skillsRes.json());
  }
  async function loadSkillCategories() {
    // Skill categories aren't exposed via the generic categories route (that route covers
    // project/blog categories). We fetch them directly through the skills payload's
    // `category` relation plus a lightweight helper endpoint alternative: derive uniques.
    const res = await fetch("/api/admin/skills");
    const skills = await res.json();
    const seen = new Map();
    skills.forEach((s: any) => { if (s.category) seen.set(s.category.id, s.category); });
    setCategories(Array.from(seen.values()));
  }
  useEffect(() => { load(); loadSkillCategories(); }, []);

  function set(key: string, value: any) { setForm((f: any) => ({ ...f, [key]: value })); }

  function edit(item: any) {
    setEditingId(item.id);
    setForm({ ...item, categoryId: item.categoryId || "", yearsExp: item.yearsExp || "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editingId ? `/api/admin/skills/${editingId}` : "/api/admin/skills";
    await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setForm(empty);
    setEditingId(null);
    load();
    loadSkillCategories();
  }

  async function remove(id: string) {
    if (!confirm("Delete this skill?")) return;
    await fetch(`/api/admin/skills/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Skills</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="glass divide-y divide-white/10">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <div className="font-medium text-white">{it.name}</div>
                <div className="text-xs text-white/60">{it.category?.name || "Uncategorized"} · {it.level}</div>
              </div>
              <div className="flex gap-2 text-sm">
                <button onClick={() => edit(it)} className="btn-outline !px-4 !py-2">Edit</button>
                <button onClick={() => remove(it.id)} className="rounded-full border border-red-400/30 px-4 py-2 text-red-400 hover:bg-red-400/10">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="p-4 text-white/60">No skills yet.</p>}
        </div>

        <form onSubmit={handleSubmit} className="glass h-fit space-y-3 p-6">
          <h2 className="font-semibold text-white">{editingId ? "Edit Skill" : "Add Skill"}</h2>
          <input placeholder="Skill name" required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
          <input placeholder="Icon (emoji, e.g. 📊 — optional)" value={form.icon} onChange={(e) => set("icon", e.target.value)} className={inputCls} />

          <div className="flex gap-2">
            <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <input placeholder="New category name" value={newCat} onChange={(e) => setNewCat(e.target.value)} className={inputCls} />
            <button
              type="button"
              className="btn-outline shrink-0"
              onClick={async () => {
                if (!newCat.trim()) return;
                const res = await fetch("/api/admin/skill-categories", {
                  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newCat }),
                });
                const cat = await res.json();
                setCategories((c) => [...c, cat]);
                set("categoryId", cat.id);
                setNewCat("");
              }}
            >Add</button>
          </div>

          <select value={form.level} onChange={(e) => set("level", e.target.value)} className={inputCls}>
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
          </select>
          <input type="number" step="0.5" placeholder="Years of experience" value={form.yearsExp} onChange={(e) => set("yearsExp", e.target.value)} className={inputCls} />
          <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className={inputCls} />

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? "Saving..." : editingId ? "Save" : "Add"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="btn-outline">Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
