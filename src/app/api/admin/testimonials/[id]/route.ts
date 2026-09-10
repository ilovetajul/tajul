import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const item = await prisma.testimonial.update({
    where: { id: params.id },
    data: {
      name: b.name,
      designation: b.designation,
      company: b.company,
      quote: b.quote,
      avatarUrl: b.avatarUrl,
      linkedinUrl: b.linkedinUrl,
      projectId: b.projectId || null,
      featured: b.featured,
      status: b.status,
      sortOrder: b.sortOrder,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.testimonial.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
