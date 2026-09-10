import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.education.findMany({ orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }] });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.institution || !b.degree || !b.startDate)
    return NextResponse.json({ error: "Institution, degree and start date are required" }, { status: 400 });

  const item = await prisma.education.create({
    data: {
      institution: b.institution,
      degree: b.degree,
      subject: b.subject || null,
      startDate: new Date(b.startDate),
      endDate: b.endDate ? new Date(b.endDate) : null,
      description: b.description || null,
      certificateUrl: b.certificateUrl || null,
      institutionUrl: b.institutionUrl || null,
      location: b.location || null,
      status: b.status || "completed",
      isCertification: !!b.isCertification,
      issuer: b.issuer || null,
      credentialId: b.credentialId || null,
      sortOrder: b.sortOrder ?? 0,
    },
  });
  return NextResponse.json(item);
}
