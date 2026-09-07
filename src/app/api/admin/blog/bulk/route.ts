import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug, makeSlug } from "@/lib/utils";

function splitList(value: any): string[] {
  if (!value || typeof value !== "string") return [];
  return value.split(";").map((v) => v.trim()).filter(Boolean);
}

async function resolveCategory(name: any) {
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed) return null;
  const category = await prisma.blogCategory.upsert({
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
      const slug = await uniqueSlug("blogPost", title);
      const categoryId = await resolveCategory(row.category);
      const publishing = row.status === "published";
      await prisma.blogPost.create({
        data: {
          title,
          slug,
          excerpt: row.excerpt || null,
          content: row.content || "",
          titleBn: row.titleBn || null,
          contentBn: row.contentBn || null,
          categoryId,
          tags: splitList(row.tags),
          status: publishing ? "published" : "draft",
          seoTitle: row.seoTitle || null,
          seoDesc: row.seoDescription || null,
          publishedAt: publishing ? new Date() : null,
        },
      });
      created++;
    } catch (err: any) {
      errors.push({ row: i + 1, title, error: err.message || "Unknown error" });
    }
  }

  return NextResponse.json({ created, errors, total: rows.length });
}
