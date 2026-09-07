"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import BlogCard from "@/components/BlogCard";

export default function BlogDetailView({ post, related }: { post: any; related: any[] }) {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const hasBn = !!(post.titleBn || post.contentBn);
  const title = lang === "bn" && post.titleBn ? post.titleBn : post.title;
  const content = lang === "bn" && post.contentBn ? post.contentBn : post.content;

  return (
    <article className="section-padding container-xl max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {post.category && (
            <Link href={`/blog?category=${post.category.slug}`} className="text-sm uppercase tracking-wide text-white/40">
              {post.category.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-bold text-white">{title}</h1>
          {post.publishedAt && (
            <p className="mt-1 text-sm text-white/40">
              {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </div>
        {hasBn && (
          <div className="inline-flex shrink-0 rounded-full bg-white/10 p-1 text-sm">
            <button onClick={() => setLang("en")} className={`rounded-full px-4 py-1 ${lang === "en" ? "bg-primary text-white" : "text-white/60"}`}>English</button>
            <button onClick={() => setLang("bn")} className={`rounded-full px-4 py-1 ${lang === "bn" ? "bg-primary text-white" : "text-white/60"}`}>বাংলা</button>
          </div>
        )}
      </div>

      {post.featuredImg && (
        <div className="glass relative my-8 h-72 w-full overflow-hidden">
          <Image src={post.featuredImg} alt={title} fill className="object-cover" />
        </div>
      )}

      <div className="prose prose-invert max-w-none text-white/80">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
      </div>

      {post.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((t: string) => (
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
