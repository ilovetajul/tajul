import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await prisma.siteSetting.findUnique({ where: { id: "settings" } });
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const settings = await prisma.siteSetting.upsert({
    where: { id: "settings" },
    update: b,
    create: { id: "settings", ...b },
  });
  return NextResponse.json(settings);
}
