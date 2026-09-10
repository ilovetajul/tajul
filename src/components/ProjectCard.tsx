import Link from "next/link";
import Image from "next/image";

export default function ProjectCard({ project }: { project: any }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="glass group block overflow-hidden transition-transform hover:-translate-y-1"
    >
      <div className="relative h-48 w-full bg-white/5">
        {project.thumbnailUrl ? (
          <Image src={project.thumbnailUrl} alt={project.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-white/50">No image</div>
        )}
        {project.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-white">
            Featured
          </span>
        )}
      </div>
      <div className="p-5">
        {project.category && (
          <div className="mb-1 text-xs uppercase tracking-wide text-white/60">{project.category.name}</div>
        )}
        <h3 className="text-lg font-semibold text-white group-hover:text-gradient">{project.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/60">{project.shortDesc}</p>
      </div>
    </Link>
  );
}
