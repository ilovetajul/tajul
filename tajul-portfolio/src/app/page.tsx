import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProjectCard from "@/components/ProjectCard";

export default async function HomePage() {
  const profile = await prisma.profile.findUnique({ where: { id: "profile" } }).catch(() => null);
  const featured = await prisma.project.findMany({
    where: { status: "published", featured: true },
    include: { category: true },
    take: 3,
    orderBy: { sortOrder: "asc" },
  }).catch(() => []);

  return (
    <div>
      <section className="section-padding container-xl grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="text-white/50">Hello, I'm</p>
          <h1 className="mt-1 text-4xl font-extrabold text-white md:text-5xl">
            {profile?.name || "Tajul Islam"}
          </h1>
          <h2 className="mt-2 text-xl font-medium text-gradient">
            {profile?.title || "Merchandiser & Industrial Engineer"}
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            {profile?.shortBio ||
              "Self-motivated, hard-working, and ingenious — building things across engineering, apparel, and technology."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/projects" className="btn-primary">View Projects</Link>
            {profile?.resumeUrl && (
              <a href={profile.resumeUrl} target="_blank" className="btn-outline">Download Resume</a>
            )}
            <Link href="/contact" className="btn-outline">Contact Me</Link>
          </div>
        </div>
        <div className="glass relative mx-auto aspect-square w-72 overflow-hidden md:w-full md:max-w-sm">
          {profile?.photoUrl ? (
            <Image src={profile.photoUrl} alt={profile.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-white/30">Add your photo in /admin/profile</div>
          )}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section-padding container-xl">
          <h2 className="mb-8 text-2xl font-bold text-white">Featured Work</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      <section className="section-padding container-xl text-center text-sm text-white/40">
        This site began as my very first coded project — rebuilt into a platform I keep growing.
      </section>
    </div>
  );
}
