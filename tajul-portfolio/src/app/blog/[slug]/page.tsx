import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import type { Metadata } from "next";
import BlogCard from "@/components/BlogCard";

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

  return (
    <article className="section-padding container-xl max-w-3xl">
      {post.category && (
        <Link href={`/blog?category=${post.category.slug}`} className="text-sm uppercase tracking-wide text-white/40">
          {post.category.name}
        </Link>
      )}
      <h1 className="mt-2 text-3xl font-bold text-white">{post.title}</h1>
      {post.publishedAt && (
        <p className="mt-1 text-sm text-white/40">
          {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      )}

      {post.featuredImg && (
        <div className="glass relative my-8 h-72 w-full overflow-hidden">
          <Image src={post.featuredImg} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <div className="prose prose-invert max-w-none text-white/80">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      {post.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">#{t}</span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-xl font-semibold text-white">Related Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <BlogCard key={p.id} post={p} />)}
          </div>
        </div>
      )}
    </article>
  );
}
