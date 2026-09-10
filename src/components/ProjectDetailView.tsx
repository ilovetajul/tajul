"use client";
import { useState } from "react";
import Image from "next/image";
import { formatDate, normalizeUrl } from "@/lib/utils";
import Lightbox from "@/components/Lightbox";

function CaseStudySection({ title, body }: { title: string; body?: string | null }) {
  if (!body) return null;
  return (
    <div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="whitespace-pre-line text-white/80">{body}</p>
    </div>
  );
}

export default function ProjectDetailView({ project }: { project: any }) {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const imageUrls: string[] = project.images.map((img: any) => img.url);
  const hasBn = !!(project.titleBn || project.descriptionBn);
  const title = lang === "bn" && project.titleBn ? project.titleBn : project.title;
  const overview = lang === "bn" && project.descriptionBn ? project.descriptionBn : project.description;

  return (
    <article className="section-padding container-xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          {project.category && <div className="text-sm uppercase tracking-wide text-white/50">{project.category.name}</div>}
          <h1 className="mt-1 text-3xl font-bold text-white">{title}</h1>
        </div>
        {hasBn && (
          <div className="inline-flex shrink-0 rounded-full bg-white/10 p-1 text-sm">
            <button onClick={() => setLang("en")} className={`rounded-full px-4 py-1 ${lang === "en" ? "bg-primary text-white" : "text-white/70"}`}>English</button>
            <button onClick={() => setLang("bn")} className={`rounded-full px-4 py-1 ${lang === "bn" ? "bg-primary text-white" : "text-white/70"}`}>বাংলা</button>
          </div>
        )}
      </div>

      {project.thumbnailUrl && (
        <div className="glass relative mb-8 h-72 w-full overflow-hidden md:h-96">
          <Image src={project.thumbnailUrl} alt={title} fill sizes="(max-width: 768px) 100vw, 900px" className="object-cover" />
        </div>
      )}

      <div className="grid gap-10 md:grid-cols-[1fr_260px]">
        <div className="space-y-8">
          <CaseStudySection title="Overview" body={overview} />
          {lang === "en" && (
            <>
              <CaseStudySection title="Problem" body={project.problem} />
              <CaseStudySection title="Approach" body={project.approach} />
              <CaseStudySection title="Solution" body={project.solution} />
              {project.results && (
                <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-5">
                  <h3 className="mb-2 text-lg font-semibold text-white">Results &amp; Impact</h3>
                  <p className="whitespace-pre-line text-white/90">{project.results}</p>
                </div>
              )}
              <CaseStudySection title="Challenges" body={project.challenges} />
              <CaseStudySection title="Lessons Learned" body={project.lessonsLearned} />
            </>
          )}
        </div>

        <aside className="glass h-fit space-y-3 p-5 text-sm">
          {project.role && <div><span className="text-white/50">Role: </span>{project.role}</div>}
          {project.client && <div><span className="text-white/50">Client: </span>{project.client}</div>}
          {project.duration && <div><span className="text-white/50">Duration: </span>{project.duration}</div>}
          {project.projectDate && <div><span className="text-white/50">Date: </span>{formatDate(project.projectDate)}</div>}
          {project.technologies.length > 0 && (
            <div>
              <span className="text-white/50">Technologies:</span>
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
          {project.images.map((img: any, i: number) => (
            <button
              key={img.id}
              onClick={() => setLightboxIndex(i)}
              aria-label={`Open image ${i + 1} of ${project.images.length}`}
              className="glass relative h-52 overflow-hidden text-left"
            >
              <Image src={img.url} alt={title} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform hover:scale-105" />
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={imageUrls}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          alt={title}
        />
      )}
    </article>
  );
}
