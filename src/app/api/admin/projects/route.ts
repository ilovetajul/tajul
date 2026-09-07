import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    include: { category: true, images: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const slug = await uniqueSlug("project", body.title);

  const project = await prisma.project.create({
    data: {
      title: body.title,
      slug,
      shortDesc: body.shortDesc || "",
      description: body.description || "",
      titleBn: body.titleBn || null,
      descriptionBn: body.descriptionBn || null,
      thumbnailUrl: body.thumbnailUrl || null,
      categoryId: body.categoryId || null,
      technologies: body.technologies || [],
      role: body.role || null,
      client: body.client || null,
      projectDate: body.projectDate ? new Date(body.projectDate) : null,
      liveUrl: body.liveUrl || null,
      githubUrl: body.githubUrl || null,
      demoUrl: body.demoUrl || null,
      docsUrl: body.docsUrl || null,
      status: body.status || "draft",
      featured: !!body.featured,
      tags: body.tags || [],
      images: body.images?.length
        ? { create: body.images.map((url: string) => ({ url })) }
        : undefined,
    },
  });
  return NextResponse.json(project);
}
