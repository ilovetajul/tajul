import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  const media = await prisma.media.update({
    where: { id: params.id },
    data: { altText: b.altText, title: b.title },
  });
  return NextResponse.json(media);
}

// Checks whether a media URL is referenced anywhere else before letting it be deleted
// (PART 49 — media delete safety). Pass ?force=true to delete anyway.
async function findUsages(url: string) {
  const [projectsThumb, projectImages, posts, profile, settings, experience, education] = await Promise.all([
    prisma.project.findMany({ where: { thumbnailUrl: url }, select: { id: true, title: true } }),
    prisma.projectImage.findMany({ where: { url }, select: { projectId: true, project: { select: { title: true } } } }),
    prisma.blogPost.findMany({ where: { featuredImg: url }, select: { id: true, title: true } }),
    prisma.profile.findFirst({ where: { OR: [{ photoUrl: url }, { coverPhotoUrl: url }, { resumeUrl: url }] } }),
    prisma.siteSetting.findFirst({ where: { OR: [{ favicon: url }, { ogImage: url }] } }),
    prisma.experience.findMany({ where: { companyLogo: url }, select: { id: true, company: true } }),
    prisma.education.findMany({ where: { certificateUrl: url }, select: { id: true, institution: true } }),
  ]);

  const usages: string[] = [
    ...projectsThumb.map((p) => `Project thumbnail: ${p.title}`),
    ...projectImages.map((pi) => `Project gallery: ${pi.project.title}`),
    ...posts.map((p) => `Blog post: ${p.title}`),
    ...(profile ? ["Profile (photo/cover/resume)"] : []),
    ...(settings ? ["Site settings (favicon/OG image)"] : []),
    ...experience.map((e) => `Experience logo: ${e.company}`),
    ...education.map((e) => `Education certificate: ${e.institution}`),
  ];
  return usages;
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const force = new URL(req.url).searchParams.get("force") === "true";

  const media = await prisma.media.findUnique({ where: { id: params.id } });
  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!force) {
    const usages = await findUsages(media.url);
    if (usages.length > 0) {
      return NextResponse.json({ error: "in_use", usages }, { status: 409 });
    }
  }

  // Only remove the underlying file for things we actually stored ourselves.
  if (media.provider === "supabase" && media.bucket && media.storagePath) {
    try {
      await storage.delete({ bucket: media.bucket, storagePath: media.storagePath });
    } catch (err) {
      console.error("Storage delete failed (continuing to remove DB record):", err);
    }
  }

  await prisma.media.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
