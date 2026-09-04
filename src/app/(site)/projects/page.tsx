import { prisma } from "@/lib/prisma";
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categories = await prisma.projectCategory.findMany({ orderBy: { name: "asc" } });
  const activeCat = searchParams.category;

  const projects = await prisma.project.findMany({
    where: {
      status: "published",
      ...(activeCat ? { category: { slug: activeCat } } : {}),
    },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <section className="section-padding container-xl">
      <h1 className="mb-6 text-3xl font-bold text-white">Projects</h1>
      <div className="mb-10 flex flex-wrap gap-2">
        <Link
          href="/projects"
          className={`rounded-full px-4 py-1.5 text-sm ${!activeCat ? "bg-primary text-white" : "glass text-white/70"}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/projects?category=${c.slug}`}
            className={`rounded-full px-4 py-1.5 text-sm ${activeCat === c.slug ? "bg-primary text-white" : "glass text-white/70"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {projects.length === 0 ? (
        <p className="text-white/40">No published projects yet. Add one from /admin/projects.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </section>
  );
}
