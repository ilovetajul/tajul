import { prisma } from "@/lib/prisma";
import BlogCard from "@/components/BlogCard";
import Link from "next/link";

export default async function BlogPage({ searchParams }: { searchParams: { category?: string } }) {
  const categories = await prisma.blogCategory.findMany({ orderBy: { name: "asc" } });
  const activeCat = searchParams.category;

  const posts = await prisma.blogPost.findMany({
    where: { status: "published", ...(activeCat ? { category: { slug: activeCat } } : {}) },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <section className="section-padding container-xl">
      <h1 className="mb-6 text-3xl font-bold text-white">Thoughts</h1>
      <div className="mb-10 flex flex-wrap gap-2">
        <Link href="/blog" className={`rounded-full px-4 py-1.5 text-sm ${!activeCat ? "bg-primary text-white" : "glass text-white/70"}`}>All</Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/blog?category=${c.slug}`} className={`rounded-full px-4 py-1.5 text-sm ${activeCat === c.slug ? "bg-primary text-white" : "glass text-white/70"}`}>
            {c.name}
          </Link>
        ))}
      </div>
      {posts.length === 0 ? (
        <p className="text-white/40">No published articles yet. Write one from /admin/blog.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => <BlogCard key={p.id} post={p} />)}
        </div>
      )}
    </section>
  );
}
