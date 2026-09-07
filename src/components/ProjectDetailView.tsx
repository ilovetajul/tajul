"use client";
import { useState } from "react";
import Image from "next/image";
import { formatDate, normalizeUrl } from "@/lib/utils";

export default function ProjectDetailView({ project }: { project: any }) {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const hasBn = !!(project.titleBn || project.descriptionBn);
  const title = lang === "bn" && project.titleBn ? project.titleBn : project.title;
  const description = lang === "bn" && project.descriptionBn ? project.descriptionBn : project.description;

  return (
    <article className="section-padding container-xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          {project.category && <div className="text-sm uppercase tracking-wide text-white/40">{project.category.name}</div>}
          <h1 className="mt-1 text-3xl font-bold text-white">{title}</h1>
        </div>
        {hasBn && (
          <div className="inline-flex shrink-0 rounded-full bg-white/10 p-1 text-sm">
            <button onClick={() => setLang("en")} className={`rounded-full px-4 py-1 ${lang === "en" ? "bg-primary text-white" : "text-white/60"}`}>English</button>
            <button onClick={() => setLang("bn")} className={`rounded-full px-4 py-1 ${lang === "bn" ? "bg-primary text-white" : "text-white/60"}`}>বাংলা</button>
          </div>
        )}
      </div>

      {project.thumbnailUrl && (
        <div className="glass relative mb-8 h-72 w-full overflow-hidden md:h-96">
          <Image src={project.thumbnailUrl} alt={title} fill className="object-cover" />
        </div>
      )}

      <div className="grid gap-10 md:grid-cols-[1fr_260px]">
        <div className="prose prose-invert max-w-none whitespace-pre-line text-white/80">
          {description}
        </div>

        <aside className="glass h-fit space-y-3 p-5 text-sm">
          {project.role && <div><span className="text-white/40">Role: </span>{project.role}</div>}
          {project.client && <div><span className="text-white/40">Client: </span>{project.client}</div>}
          {project.projectDate && <div><span className="text-white/40">Date: </span>{formatDate(project.projectDate)}</div>}
          {project.technologies.length > 0 && (
            <div>
              <span className="text-white/40">Technologies:</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {project.technologies.map((t: string) => (
                  <span key={t} className="rounded-full bg-white/10 px-2.5 py-1 text-xs">{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2 pt-2">
            {project.liveUrl && <a href={normalizeUrl(project.liveUrl)!} target="_blank" rel="noopener noreferrer" className="btn-outline justify-center">Live Site</a>}
            {project.demoUrl && <a href={normalizeUrl(project.demoUrl)!} target="_blank" rel="noopener noreferrer" className="btn-outline justify-center">Demo</a>}
            {project.githubUrl && <a href={normalizeUrl(project.githubUrl)!} target="_blank" rel="noopener noreferrer" className="btn-outline justify-center">GitHub</a>}
            {project.docsUrl && <a href={normalizeUrl(project.docsUrl)!} target="_blank" rel="noopener noreferrer" className="btn-outline justify-center">Docs</a>}
          </div>
        </aside>
      </div>

      {project.images.length > 0 && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.images.map((img: any) => (
            <div key={img.id} className="glass relative h-52 overflow-hidden">
              <Image src={img.url} alt={title} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
