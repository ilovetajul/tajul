import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const type = new URL(req.url).searchParams.get("type");
  if (type === "blog") {
    await prisma.blogCategory.delete({ where: { id: params.id } });
  } else {
    await prisma.projectCategory.delete({ where: { id: params.id } });
  }
  return NextResponse.json({ ok: true });
}
