"use client";
import { useState } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";

export default function BulkImport({
  type,
  templateUrl,
  redirectTo,
}: {
  type: "project" | "blog";
  templateUrl: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; total: number; errors: any[] } | null>(null);

  function handleFile(file: File) {
    setParseError("");
    setResult(null);
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if (res.errors.length > 0) {
          setParseError(res.errors[0].message);
          setRows([]);
          return;
        }
        setRows(res.data as any[]);
      },
      error: (err) => setParseError(err.message),
    });
  }

  async function handleImport() {
    setImporting(true);
    const endpoint = type === "project" ? "/api/admin/projects/bulk" : "/api/admin/blog/bulk";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const data = await res.json();
    setImporting(false);
    setResult(data);
    if (data.created > 0) router.refresh();
  }

  return (
    <div className="glass max-w-2xl space-y-4 p-6">
      <div>
        <p className="mb-2 text-sm text-white/70">
          Upload a CSV with one {type === "project" ? "project" : "blog post"} per row. Not sure of the
          columns? Start from the template — fill it in with any spreadsheet app (Google Sheets, Excel)
          and export/download it as CSV before uploading here. The template's{" "}
          <span className="text-white/50">titleBn</span> / <span className="text-white/50">{type === "project" ? "descriptionBn" : "contentBn"}</span>{" "}
          columns are optional — fill them in for a Bengali version, or leave them blank.
        </p>
        <a href={templateUrl} download className="btn-outline inline-block !px-4 !py-2 text-sm">
          Download CSV Template
        </a>
      </div>

      <div>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="block w-full text-sm text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white"
        />
        {parseError && <p className="mt-2 text-sm text-red-400">Couldn't read that file: {parseError}</p>}
      </div>

      {rows.length > 0 && !result && (
        <div className="rounded-lg bg-white/5 p-4">
          <p className="text-sm text-white/80">
            Found <span className="font-semibold text-white">{rows.length}</span> row{rows.length === 1 ? "" : "s"} in{" "}
            <span className="text-white/50">{fileName}</span>. All will be imported as{" "}
            <span className="text-yellow-400">drafts</span> unless a row's status column says "published".
            Review each one afterward from the list to add links or images.
          </p>
          <div className="mt-3 max-h-40 overflow-y-auto text-xs text-white/50">
            {rows.slice(0, 8).map((r, i) => (
              <div key={i} className="truncate">{i + 1}. {r.title || "(missing title)"}</div>
            ))}
            {rows.length > 8 && <div>...and {rows.length - 8} more</div>}
          </div>
          <button onClick={handleImport} disabled={importing} className="btn-primary mt-4 disabled:opacity-50">
            {importing ? "Importing..." : `Import ${rows.length} row${rows.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-lg bg-white/5 p-4">
          <p className="font-medium text-white">
            Created {result.created} of {result.total}.
          </p>
          {result.errors.length > 0 && (
            <div className="mt-2 space-y-1 text-sm text-red-400">
              {result.errors.map((e: any, i: number) => (
                <div key={i}>Row {e.row} ({e.title}): {e.error}</div>
              ))}
            </div>
          )}
          <a href={redirectTo} className="btn-outline mt-3 inline-block !px-4 !py-2 text-sm">
            View the list →
          </a>
        </div>
      )}
    </div>
  );
}
