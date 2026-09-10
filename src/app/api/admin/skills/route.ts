import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.skill.findMany({ include: { category: true }, orderBy: [{ sortOrder: "asc" }] });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const item = await prisma.skill.create({
    data: {
      name: b.name,
      categoryId: b.categoryId || null,
      level: b.level || null,
      description: b.description || null,
      icon: b.icon || null,
      yearsExp: b.yearsExp ? parseFloat(b.yearsExp) : null,
      sortOrder: b.sortOrder ?? 0,
    },
  });
  return NextResponse.json(item);
}
