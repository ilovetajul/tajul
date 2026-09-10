import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BACKUP_TYPES, type BackupTypeKey } from "@/lib/backup";

type Mode = "createOnly" | "updateAndCreate" | "replace";
type TypeResult = { created: number; updated: number; skipped: number; deleted: number };

// Generic handler for every "flat" type — no nested relations to manage beyond a
// plain foreign-key scalar (categoryId, projectId, etc.), which restores fine as-is
// since IDs are preserved exactly from the backup.
async function restoreFlatType(model: any, records: any[], mode: Mode): Promise<TypeResult> {
  let created = 0, updated = 0, skipped = 0, deleted = 0;

  if (mode === "replace") {
    const result = await model.deleteMany({});
    deleted = result.count;
  }

  for (const record of records) {
    if (!record?.id) continue;
    const { id, ...rest } = record;

    if (mode === "replace") {
      await model.create({ data: { id, ...rest } });
      created++;
      continue;
    }

    const existing = await model.findUnique({ where: { id } });
    if (existing) {
      if (mode === "updateAndCreate") {
        await model.update({ where: { id }, data: rest });
        updated++;
      } else {
        skipped++;
      }
    } else {
      await model.create({ data: { id, ...rest } });
      created++;
    }
  }

  return { created, updated, skipped, deleted };
}

// Projects carry a nested `images` array in their backup representation — handled
// specially. Images are only (re)written on CREATE or REPLACE, never touched on a
// plain UPDATE of an already-existing project, to keep that path simple and safe.
async function restoreProjects(tx: typeof prisma, records: any[], mode: Mode): Promise<TypeResult> {
  let created = 0, updated = 0, skipped = 0, deleted = 0;

  if (mode === "replace") {
    const result = await tx.project.deleteMany({}); // cascades to ProjectImage automatically
    deleted = result.count;
  }

  for (const record of records) {
    if (!record?.id) continue;
    const { id, images, ...rest } = record;
    const imageUrls: string[] = Array.isArray(images) ? images.map((img: any) => img.url).filter(Boolean) : [];

    if (mode === "replace") {
      await tx.project.create({
        data: { id, ...rest, images: imageUrls.length ? { create: imageUrls.map((url) => ({ url })) } : undefined },
      });
      created++;
      continue;
    }

    const existing = await tx.project.findUnique({ where: { id } });
    if (existing) {
      if (mode === "updateAndCreate") {
        await tx.project.update({ where: { id }, data: rest });
        updated++;
      } else {
        skipped++;
      }
    } else {
      await tx.project.create({
        data: { id, ...rest, images: imageUrls.length ? { create: imageUrls.map((url) => ({ url })) } : undefined },
      });
      created++;
    }
  }

  return { created, updated, skipped, deleted };
}

async function restoreSingleton(model: any, fixedId: string, record: any, mode: Mode): Promise<TypeResult> {
  if (!record) return { created: 0, updated: 0, skipped: 0, deleted: 0 };
  const { id, ...rest } = record;
  const existing = await model.findUnique({ where: { id: fixedId } });
  if (existing) {
    if (mode === "createOnly") return { created: 0, updated: 0, skipped: 1, deleted: 0 };
    await model.update({ where: { id: fixedId }, data: rest });
    return { created: 0, updated: 1, skipped: 0, deleted: 0 };
  }
  await model.create({ data: { id: fixedId, ...rest } });
  return { created: 1, updated: 0, skipped: 0, deleted: 0 };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = body.data;
  const mode: Mode = ["createOnly", "updateAndCreate", "replace"].includes(body.mode) ? body.mode : "createOnly";
  const requestedTypes: string[] = Array.isArray(body.types) ? body.types : [];

  if (!data?.content || typeof data.content !== "object") {
    return NextResponse.json({ error: "Invalid backup data — nothing to restore." }, { status: 400 });
  }

  const orderedTypes = [...BACKUP_TYPES]
    .filter((t) => requestedTypes.includes(t.key) && data.content[t.key] !== undefined)
    .sort((a, b) => a.order - b.order);

  const results: Record<string, TypeResult> = {};

  try {
    // Whole restore is one transaction: if anything fails (e.g. a referenced category
    // that doesn't exist anywhere), everything rolls back rather than leaving a
    // half-restored, partially-broken state. Fix the reported issue and retry.
    await prisma.$transaction(async (tx) => {
      for (const t of orderedTypes) {
        const key = t.key as BackupTypeKey;
        const value = data.content[key];

        if (t.singleton) {
          const fixedId = key === "profile" ? "profile" : "settings";
          const model = key === "profile" ? tx.profile : tx.siteSetting;
          results[key] = await restoreSingleton(model, fixedId, value, mode);
          continue;
        }

        if (!Array.isArray(value)) continue;

        switch (key) {
          case "projectCategories":
            results[key] = await restoreFlatType(tx.projectCategory, value, mode);
            break;
          case "blogCategories":
            results[key] = await restoreFlatType(tx.blogCategory, value, mode);
            break;
          case "skillCategories":
            results[key] = await restoreFlatType(tx.skillCategory, value, mode);
            break;
          case "experience":
            results[key] = await restoreFlatType(tx.experience, value, mode);
            break;
          case "education":
            results[key] = await restoreFlatType(tx.education, value, mode);
            break;
          case "skills":
            results[key] = await restoreFlatType(tx.skill, value, mode);
            break;
          case "blogPosts":
            results[key] = await restoreFlatType(tx.blogPost, value, mode);
            break;
          case "testimonials":
            results[key] = await restoreFlatType(tx.testimonial, value, mode);
            break;
          case "projects":
            results[key] = await restoreProjects(tx as unknown as typeof prisma, value, mode);
            break;
        }
      }
    });
  } catch (err: any) {
    console.error("Backup restore failed:", err);
    return NextResponse.json(
      {
        error:
          "Restore failed and was fully rolled back — no partial changes were applied. " +
          "This usually means a record references something (like a category) that isn't in the backup and doesn't already exist.",
        detail: err.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, mode, results });
}
