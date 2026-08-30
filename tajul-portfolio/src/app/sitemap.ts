import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const projects = await prisma.project.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }).catch(() => []);
  const posts = await prisma.blogPost.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }).catch(() => []);

  const staticPages = ["", "/about", "/projects", "/experience", "/education", "/skills", "/blog", "/resume", "/contact"].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
  }));

  return [
    ...staticPages,
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: p.updatedAt })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
