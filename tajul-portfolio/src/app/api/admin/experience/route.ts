import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.experience.findMany({ orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }] });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.company || !b.position || !b.startDate)
    return NextResponse.json({ error: "Company, position and start date are required" }, { status: 400 });

  const item = await prisma.experience.create({
    data: {
      company: b.company,
      position: b.position,
      department: b.department || null,
      employmentType: b.employmentType || null,
      startDate: new Date(b.startDate),
      endDate: b.endDate ? new Date(b.endDate) : null,
      current: !!b.current,
      responsibilities: b.responsibilities || null,
      achievements: b.achievements || null,
      technologies: b.technologies || [],
      companyUrl: b.companyUrl || null,
      companyLogo: b.companyLogo || null,
      sortOrder: b.sortOrder ?? 0,
    },
  });
  return NextResponse.json(item);
}
