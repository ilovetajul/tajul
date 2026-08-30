import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/media?search=&type=&provider=&page=1
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const provider = searchParams.get("provider") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = 24; // keeps each request light — matters on Supabase's free tier

  const where = {
    ...(search ? { OR: [{ filename: { contains: search, mode: "insensitive" as const } }, { title: { contains: search, mode: "insensitive" as const } }] } : {}),
    ...(type ? { type } : {}),
    ...(provider ? { provider } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.media.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}

// POST — register a Media record WITHOUT uploading a file (external URL / Google Drive tabs)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  if (!b.url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

  const provider = b.provider === "google_drive" ? "google_drive" : "external_url";

  const media = await prisma.media.create({
    data: {
      url: b.url,
      filename: b.filename || b.url.split("/").pop() || "external-image",
      type: b.type || "image",
      altText: b.altText || null,
      title: b.title || null,
      provider,
      externalId: b.externalId || null,
      folder: b.folder || "general",
    },
  });
  return NextResponse.json(media);
}
