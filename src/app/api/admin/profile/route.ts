import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await prisma.profile.findUnique({ where: { id: "profile" } });
  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();

  const existing = await prisma.profile.findUnique({ where: { id: "profile" } });
  const resumeChanged = b.resumeUrl !== undefined && b.resumeUrl !== existing?.resumeUrl;
  const data = resumeChanged ? { ...b, resumeUpdatedAt: new Date() } : b;

  const profile = await prisma.profile.upsert({
    where: { id: "profile" },
    update: data,
    create: { id: "profile", ...data },
  });
  return NextResponse.json(profile);
}
