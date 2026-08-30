import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const slug =
    body.title && body.title !== existing.title
      ? await uniqueSlug("blogPost", body.title, params.id)
      : existing.slug;

  const nowPublishing = body.status === "published" && existing.status !== "published";

  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      title: body.title ?? existing.title,
      slug,
      featuredImg: body.featuredImg ?? existing.featuredImg,
      content: body.content ?? existing.content,
      excerpt: body.excerpt ?? existing.excerpt,
      categoryId: body.categoryId ?? existing.categoryId,
      tags: body.tags ?? existing.tags,
      status: body.status ?? existing.status,
      seoTitle: body.seoTitle ?? existing.seoTitle,
      seoDesc: body.seoDesc ?? existing.seoDesc,
      publishedAt: nowPublishing ? new Date() : existing.publishedAt,
    },
  });
  return NextResponse.json(post);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
