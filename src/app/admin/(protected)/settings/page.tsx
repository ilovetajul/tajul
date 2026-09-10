"use client";
import { useEffect, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";

const inputCls = "w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none";

export default function AdminSettingsPage() {
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((s) => setForm(s || {}));
  }, []);

  function set(key: string, value: any) { setForm((f: any) => ({ ...f, [key]: value })); setSaved(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { id, ...payload } = form;
    await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    setSaved(true);
  }

  if (!form) return <p className="text-white/60">Loading...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Site Settings</h1>
      <form onSubmit={handleSubmit} className="glass max-w-2xl space-y-4 p-6">
        <input placeholder="Website title" value={form.siteTitle || ""} onChange={(e) => set("siteTitle", e.target.value)} className={inputCls} />
        <textarea placeholder="Site description" value={form.siteDesc || ""} onChange={(e) => set("siteDesc", e.target.value)} rows={2} className={inputCls} />
        <ImageUploader label="Favicon" value={form.favicon} onChange={(url) => set("favicon", url)} />
        <ImageUploader label="Open Graph share image" value={form.ogImage} onChange={(url) => set("ogImage", url)} />
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm text-white/60">Primary color
            <input type="color" value={form.primaryColor || "#6C63FF"} onChange={(e) => set("primaryColor", e.target.value)} className="mt-1 h-10 w-full rounded-lg bg-white/10" />
          </label>
          <label className="text-sm text-white/60">Secondary color
            <input type="color" value={form.secondaryColor || "#4CAF50"} onChange={(e) => set("secondaryColor", e.target.value)} className="mt-1 h-10 w-full rounded-lg bg-white/10" />
          </label>
        </div>
        <input placeholder="Contact email" value={form.contactEmail || ""} onChange={(e) => set("contactEmail", e.target.value)} className={inputCls} />
        <input placeholder="Contact phone" value={form.contactPhone || ""} onChange={(e) => set("contactPhone", e.target.value)} className={inputCls} />
        <input placeholder="Footer text" value={form.footerText || ""} onChange={(e) => set("footerText", e.target.value)} className={inputCls} />
        <input placeholder="Google Analytics ID (optional)" value={form.gaId || ""} onChange={(e) => set("gaId", e.target.value)} className={inputCls} />
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" checked={!!form.maintenanceMode} onChange={(e) => set("maintenanceMode", e.target.checked)} />
          Maintenance mode (shows a holding page to visitors)
        </label>
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? "Saving..." : "Save Settings"}</button>
        {saved && <span className="ml-3 text-sm text-secondary">Saved ✓</span>}
      </form>
    </div>
  );
}
