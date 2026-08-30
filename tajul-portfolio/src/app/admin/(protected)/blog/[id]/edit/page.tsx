import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlogForm from "@/components/admin/BlogForm";

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Article</h1>
      <BlogForm initial={JSON.parse(JSON.stringify(post))} />
    </div>
  );
}
