import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BACKUP_VERSION, APPLICATION_ID, BACKUP_TYPES, fetchBackupData, type BackupTypeKey } from "@/lib/backup";

// Body: { selections: { [type]: "all" | string[] } }. Only keys present get exported.
// NEVER touches the Admin model — password hashes, sessions, and tokens are simply
// not part of BACKUP_TYPES, so there's no accidental-inclusion path to guard against.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const selections: Record<string, "all" | string[]> = body.selections || {};

  const content: Record<string, unknown> = {};
  for (const t of BACKUP_TYPES) {
    const selection = selections[t.key];
    if (!selection) continue; // this type wasn't requested — omit entirely
    const ids = selection === "all" ? undefined : selection;
    content[t.key] = await fetchBackupData(t.key, ids);
  }

  const backup = {
    backupVersion: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    application: APPLICATION_ID,
    content,
  };

  return NextResponse.json(backup);
}
