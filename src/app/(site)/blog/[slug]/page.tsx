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

  const profile = await prisma.profile.findUnique({ where: { id: "profile" } }).catch(() => null);
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.seoDesc || undefined,
    image: post.featuredImg || undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: profile ? { "@type": "Person", name: profile.name } : undefined,
    url: `${siteUrl}/blog/${post.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <BlogDetailView post={JSON.parse(JSON.stringify(post))} related={JSON.parse(JSON.stringify(related))} />
    </>
  );
}
