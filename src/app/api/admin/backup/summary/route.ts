import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BACKUP_TYPES, fetchBackupSummary } from "@/lib/backup";

// Lightweight id+label lists per type, for the selection checklist in the admin UI —
// deliberately not fetching full records here (PART 4 performance requirement).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result: Record<string, { id: string; label: string }[]> = {};
  for (const t of BACKUP_TYPES) {
    result[t.key] = (await fetchBackupSummary(t.key)) || [];
  }
  return NextResponse.json(result);
}
