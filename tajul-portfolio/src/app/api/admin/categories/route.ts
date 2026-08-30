import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

// ?type=project or ?type=blog
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const type = new URL(req.url).searchParams.get("type");
  const items =
    type === "blog"
      ? await prisma.blogCategory.findMany({ orderBy: { name: "asc" } })
      : await prisma.projectCategory.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const slug = makeSlug(b.name);

  const item =
    b.type === "blog"
      ? await prisma.blogCategory.create({ data: { name: b.name, slug } })
      : await prisma.projectCategory.create({ data: { name: b.name, slug } });
  return NextResponse.json(item);
}
