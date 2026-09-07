import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { images: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const existing = await prisma.project.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const slug =
    body.title && body.title !== existing.title
      ? await uniqueSlug("project", body.title, params.id)
      : existing.slug;

  // Replace image set if a new list was provided
  if (body.images) {
    await prisma.projectImage.deleteMany({ where: { projectId: params.id } });
  }

  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      title: body.title ?? existing.title,
      slug,
      shortDesc: body.shortDesc ?? existing.shortDesc,
      description: body.description ?? existing.description,
      titleBn: body.titleBn ?? existing.titleBn,
      descriptionBn: body.descriptionBn ?? existing.descriptionBn,
      thumbnailUrl: body.thumbnailUrl ?? existing.thumbnailUrl,
      categoryId: body.categoryId ?? existing.categoryId,
      technologies: body.technologies ?? existing.technologies,
      role: body.role ?? existing.role,
      client: body.client ?? existing.client,
      projectDate: body.projectDate ? new Date(body.projectDate) : existing.projectDate,
      liveUrl: body.liveUrl ?? existing.liveUrl,
      githubUrl: body.githubUrl ?? existing.githubUrl,
      demoUrl: body.demoUrl ?? existing.demoUrl,
      docsUrl: body.docsUrl ?? existing.docsUrl,
      status: body.status ?? existing.status,
      featured: body.featured ?? existing.featured,
      tags: body.tags ?? existing.tags,
      images: body.images?.length
        ? { create: body.images.map((url: string) => ({ url })) }
        : undefined,
    },
  });
  return NextResponse.json(project);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
