import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const item = await prisma.education.update({
    where: { id: params.id },
    data: {
      ...b,
      startDate: b.startDate ? new Date(b.startDate) : undefined,
      endDate: b.endDate ? new Date(b.endDate) : b.endDate === null ? null : undefined,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.education.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
