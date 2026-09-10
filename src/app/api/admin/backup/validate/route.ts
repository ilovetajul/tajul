import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BACKUP_VERSION, BACKUP_TYPES, type BackupTypeKey } from "@/lib/backup";

const REQUIRED_FIELDS: Partial<Record<BackupTypeKey, string[]>> = {
  projects: ["title"],
  blogPosts: ["title"],
  experience: ["company", "position"],
  education: ["institution", "degree"],
  skills: ["name"],
  testimonials: ["name", "quote"],
  projectCategories: ["name"],
  blogCategories: ["name"],
  skillCategories: ["name"],
};

// Read-only — never touches the database. Powers the "Preview" step before restore.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let data: any;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json(
      { valid: false, errors: ["This file isn't valid JSON — it may be corrupted or not a backup file at all."], counts: {} },
      { status: 200 }
    );
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const counts: Record<string, number> = {};

  if (typeof data !== "object" || data === null) {
    return NextResponse.json({ valid: false, errors: ["Backup file must be a JSON object."], counts: {} });
  }
  if (!data.backupVersion) {
    errors.push("Missing backupVersion field — this may not be a valid portfolio backup file.");
  } else if (data.backupVersion !== BACKUP_VERSION) {
    warnings.push(`Backup was made with version ${data.backupVersion}, this system expects ${BACKUP_VERSION}. Proceeding, but review carefully.`);
  }
  if (!data.content || typeof data.content !== "object") {
    errors.push("Missing or invalid 'content' field — nothing to restore.");
    return NextResponse.json({ valid: false, errors, warnings, counts });
  }

  const knownKeys = new Set(BACKUP_TYPES.map((t) => t.key));
  for (const key of Object.keys(data.content)) {
    if (!knownKeys.has(key as BackupTypeKey)) {
      warnings.push(`Unknown content type "${key}" in backup — it will be ignored.`);
      continue;
    }
    const typeConfig = BACKUP_TYPES.find((t) => t.key === key)!;
    const value = data.content[key];

    if (typeConfig.singleton) {
      counts[key] = value ? 1 : 0;
      continue;
    }

    if (!Array.isArray(value)) {
      errors.push(`Invalid backup file: "${key}" field must be an array.`);
      continue;
    }
    counts[key] = value.length;

    const required = REQUIRED_FIELDS[key as BackupTypeKey];
    if (required) {
      value.forEach((record: any, i: number) => {
        if (!record || typeof record !== "object" || !record.id) {
          errors.push(`"${key}" item #${i + 1} is missing an id.`);
          return;
        }
        for (const field of required) {
          if (!record[field]) {
            errors.push(`"${key}" item #${i + 1} (id: ${record.id}) is missing required field "${field}".`);
          }
        }
      });
    }
  }

  return NextResponse.json({ valid: errors.length === 0, errors, warnings, counts });
}
