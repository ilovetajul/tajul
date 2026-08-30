import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

async function getProject(slug: string) {
  return prisma.project.findFirst({
    where: { slug, status: "published" },
    include: { category: true, images: true },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return {};
  return { title: project.title, description: project.shortDesc };
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug);
  if (!project) notFound();

  return (
    <article className="section-padding container-xl">
      <div className="mb-6">
        {project.category && <div className="text-sm uppercase tracking-wide text-white/40">{project.category.name}</div>}
        <h1 className="mt-1 text-3xl font-bold text-white">{project.title}</h1>
      </div>

      {project.thumbnailUrl && (
        <div className="glass relative mb-8 h-72 w-full overflow-hidden md:h-96">
          <Image src={project.thumbnailUrl} alt={project.title} fill className="object-cover" />
        </div>
      )}

      <div className="grid gap-10 md:grid-cols-[1fr_260px]">
        <div className="prose prose-invert max-w-none whitespace-pre-line text-white/80">
          {project.description}
        </div>

        <aside className="glass h-fit space-y-3 p-5 text-sm">
          {project.role && <div><span className="text-white/40">Role: </span>{project.role}</div>}
          {project.client && <div><span className="text-white/40">Client: </span>{project.client}</div>}
          {project.projectDate && <div><span className="text-white/40">Date: </span>{formatDate(project.projectDate)}</div>}
          {project.technologies.length > 0 && (
            <div>
              <span className="text-white/40">Technologies:</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {project.technologies.map((t) => (
                  <span key={t} className="rounded-full bg-white/10 px-2.5 py-1 text-xs">{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2 pt-2">
            {project.liveUrl && <a href={project.liveUrl} target="_blank" className="btn-outline justify-center">Live Site</a>}
            {project.demoUrl && <a href={project.demoUrl} target="_blank" className="btn-outline justify-center">Demo</a>}
            {project.githubUrl && <a href={project.githubUrl} target="_blank" className="btn-outline justify-center">GitHub</a>}
            {project.docsUrl && <a href={project.docsUrl} target="_blank" className="btn-outline justify-center">Docs</a>}
          </div>
        </aside>
      </div>

      {project.images.length > 0 && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.images.map((img) => (
            <div key={img.id} className="glass relative h-52 overflow-hidden">
              <Image src={img.url} alt={project.title} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
