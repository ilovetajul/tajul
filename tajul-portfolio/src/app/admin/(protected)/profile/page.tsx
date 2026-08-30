"use client";
import { useEffect, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";

const inputCls = "w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none";

const FIELDS: [string, string][] = [
  ["name", "Full name"], ["title", "Professional title"], ["location", "Location"],
  ["email", "Email"], ["phone", "Phone"],
  ["facebook", "Facebook URL"], ["twitter", "Twitter/X URL"], ["instagram", "Instagram URL"],
  ["linkedin", "LinkedIn URL"], ["github", "GitHub URL"], ["website", "Website URL"],
  ["whatsapp", "WhatsApp URL"], ["skype", "Skype URL"], ["telegram", "Telegram URL"], ["messenger", "Messenger URL"],
];

export default function AdminProfilePage() {
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/profile").then((r) => r.json()).then((p) => setForm(p || {}));
  }, []);

  function set(key: string, value: any) {
    setForm((f: any) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { id, updatedAt, ...payload } = form;
    await fetch("/api/admin/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    setSaved(true);
  }

  if (!form) return <p className="text-white/40">Loading...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Profile</h1>
      <form onSubmit={handleSubmit} className="glass max-w-2xl space-y-4 p-6">
        <ImageUploader label="Profile photo" value={form.photoUrl} onChange={(url) => set("photoUrl", url)} folder="profile" />
        <ImageUploader label="Resume / CV (PDF)" value={form.resumeUrl} onChange={(url) => set("resumeUrl", url)} />

        {FIELDS.map(([key, label]) => (
          <input key={key} placeholder={label} value={form[key] || ""} onChange={(e) => set(key, e.target.value)} className={inputCls} />
        ))}

        <textarea placeholder="Short bio (shown on homepage)" value={form.shortBio || ""} onChange={(e) => set("shortBio", e.target.value)} rows={3} className={inputCls} />
        <textarea placeholder="Career objective" value={form.objective || ""} onChange={(e) => set("objective", e.target.value)} rows={3} className={inputCls} />
        <textarea placeholder="Full biography" value={form.biography || ""} onChange={(e) => set("biography", e.target.value)} rows={6} className={inputCls} />

        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Saving..." : "Save Profile"}
        </button>
        {saved && <span className="ml-3 text-sm text-secondary">Saved ✓</span>}
      </form>
    </div>
  );
}
