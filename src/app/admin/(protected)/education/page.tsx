"use client";
import { useEffect, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";

const inputCls = "w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none";
const empty = { institution: "", degree: "", subject: "", startDate: "", endDate: "", description: "", certificateUrl: "", institutionUrl: "", location: "", status: "completed", isCertification: false, issuer: "", credentialId: "" };

export default function AdminEducationPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/education");
    setItems(await res.json());
  }
  useEffect(() => { load(); }, []);

  function set(key: string, value: any) { setForm((f: any) => ({ ...f, [key]: value })); }

  function edit(item: any) {
    setEditingId(item.id);
    setForm({ ...item, startDate: item.startDate?.slice(0, 10) || "", endDate: item.endDate?.slice(0, 10) || "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editingId ? `/api/admin/education/${editingId}` : "/api/admin/education";
    await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setForm(empty);
    setEditingId(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/admin/education/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Education</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="glass divide-y divide-white/10">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <div className="font-medium text-white">
                  {it.degree} {it.isCertification && <span className="ml-2 rounded-full bg-secondary/20 px-2 py-0.5 text-xs text-secondary">Certification</span>}
                </div>
                <div className="text-xs text-white/60">{it.institution} · {it.startDate?.slice(0, 10)} — {it.endDate?.slice(0, 10)}</div>
              </div>
              <div className="flex gap-2 text-sm">
                <button onClick={() => edit(it)} className="btn-outline !px-4 !py-2">Edit</button>
                <button onClick={() => remove(it.id)} className="rounded-full border border-red-400/30 px-4 py-2 text-red-400 hover:bg-red-400/10">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="p-4 text-white/60">No education entries yet.</p>}
        </div>

        <form onSubmit={handleSubmit} className="glass h-fit space-y-3 p-6">
          <h2 className="font-semibold text-white">{editingId ? "Edit Entry" : "Add Entry"}</h2>
          <input placeholder="Institution" required value={form.institution} onChange={(e) => set("institution", e.target.value)} className={inputCls} />
          <input placeholder="Degree / course" required value={form.degree} onChange={(e) => set("degree", e.target.value)} className={inputCls} />
          <input placeholder="Subject" value={form.subject} onChange={(e) => set("subject", e.target.value)} className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" required value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls} />
            <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputCls} />
          </div>
          <input placeholder="Location" value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls} />
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
            <option value="completed">Completed</option>
            <option value="ongoing">Ongoing</option>
          </select>
          <textarea placeholder="Description" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className={inputCls} />
          <input placeholder="Institution URL" value={form.institutionUrl} onChange={(e) => set("institutionUrl", e.target.value)} className={inputCls} />
          <ImageUploader label="Certificate (image or PDF)" value={form.certificateUrl} onChange={(url) => set("certificateUrl", url)} folder="certificates" />

          <label className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white/70">
            <input type="checkbox" checked={form.isCertification} onChange={(e) => set("isCertification", e.target.checked)} />
            This is a certification — show it in the Certifications section
          </label>
          {form.isCertification && (
            <div className="space-y-3 rounded-lg bg-white/5 p-3">
              <input placeholder="Issuing organization (leave blank to use Institution)" value={form.issuer} onChange={(e) => set("issuer", e.target.value)} className={inputCls} />
              <input placeholder="Credential ID (optional)" value={form.credentialId} onChange={(e) => set("credentialId", e.target.value)} className={inputCls} />
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? "Saving..." : editingId ? "Save" : "Add"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="btn-outline">Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
