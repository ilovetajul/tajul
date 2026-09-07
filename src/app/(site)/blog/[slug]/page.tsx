import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogDetailView from "@/components/BlogDetailView";

async function getPost(slug: string) {
  return prisma.blogPost.findFirst({ where: { slug, status: "published" }, include: { category: true } });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return {};
  return { title: post.seoTitle || post.title, description: post.seoDesc || post.excerpt || undefined };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const related = await prisma.blogPost.findMany({
    where: { status: "published", id: { not: post.id }, categoryId: post.categoryId || undefined },
    take: 3,
  });

  return <BlogDetailView post={JSON.parse(JSON.stringify(post))} related={JSON.parse(JSON.stringify(related))} />;
}
