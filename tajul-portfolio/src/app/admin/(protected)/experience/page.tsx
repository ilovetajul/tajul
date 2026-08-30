"use client";
import { useEffect, useState } from "react";

const inputCls = "w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none";
const empty = { company: "", position: "", department: "", employmentType: "", startDate: "", endDate: "", current: false, responsibilities: "", achievements: "", technologies: "" };

export default function AdminExperiencePage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/experience");
    setItems(await res.json());
  }
  useEffect(() => { load(); }, []);

  function set(key: string, value: any) { setForm((f: any) => ({ ...f, [key]: value })); }

  function edit(item: any) {
    setEditingId(item.id);
    setForm({
      ...item,
      startDate: item.startDate?.slice(0, 10) || "",
      endDate: item.endDate?.slice(0, 10) || "",
      technologies: (item.technologies || []).join(", "),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, technologies: form.technologies.split(",").map((t: string) => t.trim()).filter(Boolean) };
    const url = editingId ? `/api/admin/experience/${editingId}` : "/api/admin/experience";
    await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    setForm(empty);
    setEditingId(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/admin/experience/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Experience</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="glass divide-y divide-white/10">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <div className="font-medium text-white">{it.position} · {it.company}</div>
                <div className="text-xs text-white/40">{it.startDate?.slice(0, 10)} — {it.current ? "Present" : it.endDate?.slice(0, 10)}</div>
              </div>
              <div className="flex gap-2 text-sm">
                <button onClick={() => edit(it)} className="btn-outline !px-4 !py-2">Edit</button>
                <button onClick={() => remove(it.id)} className="rounded-full border border-red-400/30 px-4 py-2 text-red-400 hover:bg-red-400/10">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="p-4 text-white/40">No experience entries yet.</p>}
        </div>

        <form onSubmit={handleSubmit} className="glass h-fit space-y-3 p-6">
          <h2 className="font-semibold text-white">{editingId ? "Edit Entry" : "Add Entry"}</h2>
          <input placeholder="Company" required value={form.company} onChange={(e) => set("company", e.target.value)} className={inputCls} />
          <input placeholder="Position" required value={form.position} onChange={(e) => set("position", e.target.value)} className={inputCls} />
          <input placeholder="Department" value={form.department} onChange={(e) => set("department", e.target.value)} className={inputCls} />
          <input placeholder="Employment type (Full-time, etc.)" value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)} className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" required value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls} />
            <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputCls} disabled={form.current} />
          </div>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={form.current} onChange={(e) => set("current", e.target.checked)} /> Currently working here
          </label>
          <textarea placeholder="Responsibilities" value={form.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} rows={3} className={inputCls} />
          <textarea placeholder="Achievements" value={form.achievements} onChange={(e) => set("achievements", e.target.value)} rows={2} className={inputCls} />
          <input placeholder="Technologies/tools (comma separated)" value={form.technologies} onChange={(e) => set("technologies", e.target.value)} className={inputCls} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? "Saving..." : editingId ? "Save" : "Add"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="btn-outline">Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
