import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.testimonial.findMany({
    include: { project: { select: { title: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.name || !b.quote) return NextResponse.json({ error: "Name and quote are required" }, { status: 400 });

  const item = await prisma.testimonial.create({
    data: {
      name: b.name,
      designation: b.designation || null,
      company: b.company || null,
      quote: b.quote,
      avatarUrl: b.avatarUrl || null,
      linkedinUrl: b.linkedinUrl || null,
      projectId: b.projectId || null,
      featured: !!b.featured,
      status: b.status || "draft",
      sortOrder: b.sortOrder ?? 0,
    },
  });
  return NextResponse.json(item);
}
