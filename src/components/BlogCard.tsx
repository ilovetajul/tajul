import Link from "next/link";
import Image from "next/image";

export default function BlogCard({ post }: { post: any }) {
  return (
    <Link href={`/blog/${post.slug}`} className="glass group block overflow-hidden transition-transform hover:-translate-y-1">
      <div className="relative h-40 w-full bg-white/5">
        {post.featuredImg ? (
          <Image src={post.featuredImg} alt={post.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-white/50">No image</div>
        )}
      </div>
      <div className="p-5">
        {post.category && <div className="mb-1 text-xs uppercase tracking-wide text-white/60">{post.category.name}</div>}
        <h3 className="text-lg font-semibold text-white group-hover:text-gradient">{post.title}</h3>
        {post.excerpt && <p className="mt-1 line-clamp-2 text-sm text-white/60">{post.excerpt}</p>}
      </div>
    </Link>
  );
}
