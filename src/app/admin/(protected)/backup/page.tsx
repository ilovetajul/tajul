"use client";
import { useEffect, useState } from "react";

const TYPE_LABELS: Record<string, string> = {
  projectCategories: "Project Categories",
  blogCategories: "Blog Categories",
  skillCategories: "Skill Categories",
  profile: "Profile",
  siteSettings: "Site Settings",
  experience: "Experience",
  education: "Education / Certifications",
  skills: "Skills",
  projects: "Projects",
  blogPosts: "Blog Posts",
  testimonials: "Testimonials",
};
const TYPE_ORDER = Object.keys(TYPE_LABELS);

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function backupFilename() {
  const d = new Date();
  return `portfolio-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}-${pad(d.getMinutes())}.json`;
}
function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function BackupRestorePage() {
  // --- Export state ---
  const [summary, setSummary] = useState<Record<string, { id: string; label: string }[]>>({});
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [filterText, setFilterText] = useState<Record<string, string>>({});
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [exporting, setExporting] = useState(false);

  // --- Import state ---
  const [fileName, setFileName] = useState("");
  const [parsedBackup, setParsedBackup] = useState<any>(null);
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[]; warnings: string[]; counts: Record<string, number> } | null>(null);
  const [restoreTypes, setRestoreTypes] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"createOnly" | "updateAndCreate" | "replace">("createOnly");
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<any>(null);
  const [importError, setImportError] = useState("");

  useEffect(() => {
    fetch("/api/admin/backup/summary")
      .then((r) => r.json())
      .then((data) => {
        setSummary(data);
        setLoadingSummary(false);
      });
  }, []);

  function toggleItem(type: string, id: string) {
    setSelected((prev) => {
      const next = new Set(prev[type] || []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [type]: next };
    });
  }
  function selectAllInType(type: string) {
    const ids = (summary[type] || []).map((i) => i.id);
    setSelected((prev) => ({ ...prev, [type]: new Set(ids) }));
  }
  function clearType(type: string) {
    setSelected((prev) => ({ ...prev, [type]: new Set() }));
  }
  function selectEverything() {
    const all: Record<string, Set<string>> = {};
    for (const type of TYPE_ORDER) all[type] = new Set((summary[type] || []).map((i) => i.id));
    setSelected(all);
  }
  function clearEverything() {
    setSelected({});
  }

  const totalSelected = Object.values(selected).reduce((sum, set) => sum + set.size, 0);

  async function exportSelected() {
    const selections: Record<string, string[]> = {};
    for (const [type, ids] of Object.entries(selected)) {
      if (ids.size > 0) selections[type] = Array.from(ids);
    }
    if (Object.keys(selections).length === 0) {
      alert("Select at least one item first.");
      return;
    }
    setExporting(true);
    const res = await fetch("/api/admin/backup/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selections }),
    });
    const data = await res.json();
    setExporting(false);
    downloadJson(data, backupFilename());
  }

  async function exportAll() {
    setExporting(true);
    const selections: Record<string, "all"> = {};
    for (const type of TYPE_ORDER) selections[type] = "all";
    const res = await fetch("/api/admin/backup/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selections }),
    });
    const data = await res.json();
    setExporting(false);
    downloadJson(data, backupFilename());
  }

  function handleFile(file: File) {
    setFileName(file.name);
    setValidation(null);
    setRestoreResult(null);
    setImportError("");
    const reader = new FileReader();
    reader.onload = async () => {
      let parsed;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        setImportError("This file isn't valid JSON — it may be corrupted or not a backup file.");
        return;
      }
      setParsedBackup(parsed);
      const res = await fetch("/api/admin/backup/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const result = await res.json();
      setValidation(result);
      // Default: select every type actually present with data, for restore.
      const present = new Set(Object.keys(result.counts || {}).filter((k) => result.counts[k] > 0));
      setRestoreTypes(present);
    };
    reader.readAsText(file);
  }

  async function runRestore() {
    if (mode === "replace") {
      const confirmed = confirm(
        "Replace mode deletes ALL existing records of each selected type before restoring from the backup. " +
        "This cannot be undone. Are you sure?"
      );
      if (!confirmed) return;
    }
    setRestoring(true);
    setRestoreResult(null);
    const res = await fetch("/api/admin/backup/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: parsedBackup, mode, types: Array.from(restoreTypes) }),
    });
    const result = await res.json();
    setRestoring(false);
    setRestoreResult(result);
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Backup &amp; Restore</h1>
      <p className="mb-6 text-sm text-white/60">
        Export your content as an offline JSON backup, or restore from one. Never includes your admin
        password, sessions, or any secrets — only content you've created (projects, posts, experience, etc).
      </p>

      {/* ---------------- EXPORT ---------------- */}
      <div className="glass mb-8 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Export</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={selectEverything} className="btn-outline !px-3 !py-1.5 text-sm">Select All</button>
            <button onClick={clearEverything} className="btn-outline !px-3 !py-1.5 text-sm">Clear Selection</button>
            <button onClick={exportSelected} disabled={exporting || totalSelected === 0} className="btn-outline !px-4 !py-1.5 text-sm disabled:opacity-40">
              Export Selected ({totalSelected})
            </button>
            <button onClick={exportAll} disabled={exporting} className="btn-primary !px-4 !py-1.5 text-sm disabled:opacity-50">
              {exporting ? "Exporting..." : "Export All"}
            </button>
          </div>
        </div>

        {loadingSummary ? (
          <p className="text-white/50">Loading content...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {TYPE_ORDER.map((type) => {
              const items = summary[type] || [];
              const filter = (filterText[type] || "").toLowerCase();
              const visible = filter ? items.filter((i) => i.label.toLowerCase().includes(filter)) : items;
              const selectedSet = selected[type] || new Set<string>();
              return (
                <div key={type} className="rounded-lg bg-white/5 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{TYPE_LABELS[type]} ({items.length})</span>
                    <div className="flex gap-1 text-xs">
                      <button onClick={() => selectAllInType(type)} className="text-primary underline">All</button>
                      <button onClick={() => clearType(type)} className="text-white/50 underline">None</button>
                    </div>
                  </div>
                  {items.length > 4 && (
                    <input
                      placeholder="Filter..."
                      value={filterText[type] || ""}
                      onChange={(e) => setFilterText((f) => ({ ...f, [type]: e.target.value }))}
                      className="mb-2 w-full rounded bg-white/10 px-2 py-1 text-xs text-white placeholder-white/40 outline-none"
                    />
                  )}
                  <div className="max-h-32 space-y-1 overflow-y-auto text-sm">
                    {visible.length === 0 ? (
                      <p className="text-xs text-white/40">Nothing here yet.</p>
                    ) : (
                      visible.map((item) => (
                        <label key={item.id} className="flex items-center gap-2 text-white/80">
                          <input type="checkbox" checked={selectedSet.has(item.id)} onChange={() => toggleItem(type, item.id)} />
                          <span className="truncate">{item.label}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------------- IMPORT ---------------- */}
      <div className="glass p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Import / Restore</h2>
        <input
          type="file"
          accept="application/json"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="block w-full text-sm text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white"
        />
        {importError && <p className="mt-2 text-sm text-red-400">{importError}</p>}

        {validation && (
          <div className="mt-4 rounded-lg bg-white/5 p-4">
            <p className="mb-2 text-sm text-white/70">File: {fileName}</p>

            {validation.errors.length > 0 && (
              <div className="mb-3 space-y-1">
                {validation.errors.map((e, i) => <p key={i} className="text-sm text-red-400">⚠ {e}</p>)}
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div className="mb-3 space-y-1">
                {validation.warnings.map((w, i) => <p key={i} className="text-sm text-yellow-400">Note: {w}</p>)}
              </div>
            )}

            {validation.valid ? (
              <>
                <p className="mb-2 text-sm font-medium text-white">Preview — choose what to restore:</p>
                <div className="mb-4 space-y-1">
                  {Object.entries(validation.counts)
                    .filter(([, count]) => count > 0)
                    .map(([type, count]) => (
                      <label key={type} className="flex items-center justify-between rounded bg-white/5 px-3 py-1.5 text-sm text-white/80">
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={restoreTypes.has(type)}
                            onChange={() =>
                              setRestoreTypes((prev) => {
                                const next = new Set(prev);
                                if (next.has(type)) next.delete(type);
                                else next.add(type);
                                return next;
                              })
                            }
                          />
                          {TYPE_LABELS[type] || type}
                        </span>
                        <span className="text-white/50">{count}</span>
                      </label>
                    ))}
                </div>

                <p className="mb-2 text-sm font-medium text-white">Restore mode:</p>
                <div className="mb-4 space-y-2 text-sm text-white/80">
                  <label className="flex items-start gap-2">
                    <input type="radio" checked={mode === "createOnly"} onChange={() => setMode("createOnly")} className="mt-1" />
                    <span><strong>Create Missing Only</strong> (safest, default) — adds anything not already in your database; never touches or overwrites existing records.</span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input type="radio" checked={mode === "updateAndCreate"} onChange={() => setMode("updateAndCreate")} className="mt-1" />
                    <span><strong>Update Existing + Create Missing</strong> — updates records that already exist (matched by ID) and adds anything new.</span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input type="radio" checked={mode === "replace"} onChange={() => setMode("replace")} className="mt-1" />
                    <span><strong>Replace Selected Data</strong> — deletes all existing records of each selected type first, then restores from backup. Cannot be undone.</span>
                  </label>
                </div>

                <button onClick={runRestore} disabled={restoring || restoreTypes.size === 0} className="btn-primary disabled:opacity-50">
                  {restoring ? "Restoring..." : "Restore Backup"}
                </button>
              </>
            ) : (
              <p className="text-sm text-white/60">Fix the errors above and re-upload before restoring.</p>
            )}
          </div>
        )}

        {restoreResult && (
          <div className="mt-4 rounded-lg bg-white/5 p-4">
            {restoreResult.error ? (
              <p className="text-sm text-red-400">{restoreResult.error}</p>
            ) : (
              <>
                <p className="mb-2 text-sm font-medium text-secondary">Restore complete.</p>
                <div className="space-y-1 text-sm text-white/80">
                  {Object.entries(restoreResult.results || {}).map(([type, r]: [string, any]) => (
                    <p key={type}>
                      {TYPE_LABELS[type] || type}: {r.created} created, {r.updated} updated, {r.skipped} skipped
                      {r.deleted > 0 ? `, ${r.deleted} replaced` : ""}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
