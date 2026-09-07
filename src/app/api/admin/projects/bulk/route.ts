import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug, makeSlug } from "@/lib/utils";

function splitList(value: any): string[] {
  if (!value || typeof value !== "string") return [];
  return value.split(";").map((v) => v.trim()).filter(Boolean);
}

function parseBool(value: any): boolean {
  return ["true", "1", "yes"].includes(String(value || "").trim().toLowerCase());
}

async function resolveCategory(name: any) {
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed) return null;
  const category = await prisma.projectCategory.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed, slug: makeSlug(trimmed) },
  });
  return category.id;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const rows: any[] = Array.isArray(body.rows) ? body.rows : [];
  if (rows.length === 0) return NextResponse.json({ error: "No rows provided" }, { status: 400 });

  let created = 0;
  const errors: { row: number; title: string; error: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const title = (row.title || "").trim();
    if (!title) {
      errors.push({ row: i + 1, title: "(blank)", error: "Missing title — row skipped" });
      continue;
    }
    try {
      const slug = await uniqueSlug("project", title);
      const categoryId = await resolveCategory(row.category);
      await prisma.project.create({
        data: {
          title,
          slug,
          shortDesc: row.shortDesc || "",
          description: row.description || "",
          titleBn: row.titleBn || null,
          descriptionBn: row.descriptionBn || null,
          categoryId,
          technologies: splitList(row.technologies),
          tags: splitList(row.tags),
          role: row.role || null,
          client: row.client || null,
          projectDate: row.projectDate ? new Date(row.projectDate) : null,
          liveUrl: row.liveUrl || null,
          githubUrl: row.githubUrl || null,
          demoUrl: row.demoUrl || null,
          docsUrl: row.docsUrl || null,
          featured: parseBool(row.featured),
          status: row.status === "published" ? "published" : "draft",
        },
      });
      created++;
    } catch (err: any) {
      errors.push({ row: i + 1, title, error: err.message || "Unknown error" });
    }
  }

  return NextResponse.json({ created, errors, total: rows.length });
}
