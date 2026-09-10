import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.blogPost.findMany({
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const slug = await uniqueSlug("blogPost", body.title);
  const publishing = body.status === "published";
  // Admin can now set their own publish date instead of it always being "now".
  const publishedAt = body.publishedAt ? new Date(body.publishedAt) : publishing ? new Date() : null;

  const post = await prisma.blogPost.create({
    data: {
      title: body.title,
      slug,
      featuredImg: body.featuredImg || null,
      content: body.content || "",
      titleBn: body.titleBn || null,
      contentBn: body.contentBn || null,
      excerpt: body.excerpt || null,
      categoryId: body.categoryId || null,
      tags: body.tags || [],
      status: body.status || "draft",
      seoTitle: body.seoTitle || null,
      seoDesc: body.seoDesc || null,
      publishedAt,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json(post);
}
