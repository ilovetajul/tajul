import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProjectCard from "@/components/ProjectCard";
import TestimonialsSection from "@/components/TestimonialsSection";
import { normalizeUrl } from "@/lib/utils";

export default async function HomePage() {
  const profile = await prisma.profile.findUnique({ where: { id: "profile" } }).catch(() => null);

  let projects = await prisma.project.findMany({
    where: { status: "published", featured: true },
    include: { category: true },
    take: 3,
    orderBy: { sortOrder: "asc" },
  }).catch(() => []);
  const showingFeaturedOnly = projects.length > 0;
  // No project has been marked "featured" yet — fall back to the most recent published
  // ones instead of hiding the whole section over one extra unchecked box in the admin.
  if (!showingFeaturedOnly) {
    projects = await prisma.project.findMany({
      where: { status: "published" },
      include: { category: true },
      take: 3,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }).catch(() => []);
  }

  const [publishedProjectsCount, certificationsCount, skillsCount, currentRole] = await Promise.all([
    prisma.project.count({ where: { status: "published" } }).catch(() => 0),
    prisma.education.count({ where: { isCertification: true } }).catch(() => 0),
    prisma.skill.count().catch(() => 0),
    prisma.experience.findFirst({ where: { current: true }, orderBy: { startDate: "desc" } }).catch(() => null),
  ]);

  const stats = [
    profile?.yearsExperience ? { value: `${profile.yearsExperience}+`, label: "Years Experience" } : null,
    publishedProjectsCount > 0 ? { value: String(publishedProjectsCount), label: "Projects" } : null,
    certificationsCount > 0 ? { value: String(certificationsCount), label: "Certifications" } : null,
    skillsCount > 0 ? { value: String(skillsCount), label: "Skills" } : null,
  ].filter((s): s is { value: string; label: string } => s !== null);

  // Person structured data — verified fields only, nothing invented.
  const socialLinks = profile
    ? [profile.linkedin, profile.github, profile.facebook, profile.twitter, profile.instagram, profile.website]
        .map((u) => normalizeUrl(u))
        .filter((u): u is string => !!u)
    : [];
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const personJsonLd = profile
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: profile.name,
        jobTitle: profile.title,
        description: profile.shortBio || undefined,
        url: siteUrl,
        image: profile.photoUrl || undefined,
        sameAs: socialLinks.length > 0 ? socialLinks : undefined,
        worksFor: currentRole ? { "@type": "Organization", name: currentRole.company } : undefined,
      }
    : null;

  return (
    <div>
      {personJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      )}

      <section className="section-padding container-xl grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="text-white/60">Hello, I'm</p>
          <h1 className="mt-1 text-4xl font-extrabold text-white md:text-5xl">
            {profile?.name || "Tajul Islam"}
          </h1>
          <h2 className="mt-2 text-xl font-medium text-gradient">
            {profile?.title || "Merchandiser & Industrial Engineer"}
          </h2>
          <p className="mt-4 max-w-md text-white/80">
            {profile?.shortBio ||
              "Electrical & Electronic Engineering background, now working in merchandising — I bring an engineer's habit of measuring and systematizing to production execution, including building the CMS running this site myself."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/projects" className="btn-primary">View Projects</Link>
            {profile?.resumeUrl && (
              <a href={normalizeUrl(profile.resumeUrl)!} target="_blank" rel="noopener noreferrer" className="btn-outline">Download Resume</a>
            )}
            <Link href="/contact" className="btn-outline">Get In Touch</Link>
          </div>
        </div>
        <div className="glass relative mx-auto aspect-square w-72 overflow-hidden md:w-full md:max-w-sm">
          {profile?.photoUrl ? (
            <Image src={profile.photoUrl} alt={profile.name} fill sizes="(max-width: 768px) 288px, 400px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-white/50">Add your photo in /admin/profile</div>
          )}
        </div>
      </section>

      {stats.length > 0 && (
        <section className="container-xl px-6 md:px-10">
          <div className="glass grid grid-cols-2 divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
            {stats.map((s) => (
              <div key={s.label} className="p-6 text-center">
                <div className="text-3xl font-extrabold text-gradient">{s.value}</div>
                <div className="mt-1 text-sm text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section-padding container-xl">
        <h2 className="mb-8 text-2xl font-bold text-white">
          {showingFeaturedOnly ? "Featured Work" : "Recent Work"}
        </h2>
        {projects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className="glass p-10 text-center">
            <p className="text-white/70">New projects are on the way — check back soon.</p>
            <div className="mt-4 flex justify-center gap-3">
              <Link href="/experience" className="btn-outline">See Experience</Link>
              <Link href="/skills" className="btn-outline">See Skills</Link>
            </div>
          </div>
        )}
      </section>

      <TestimonialsSection />

      <section className="section-padding container-xl">
        <div className="glass p-8 md:p-10">
          <h2 className="mb-4 text-xl font-bold text-white">From Engineering to Execution</h2>
          <p className="max-w-2xl text-white/80">
            My background is in Electrical &amp; Electronic Engineering. Today I work as a Merchandiser in
            Bangladesh's RMG sector, applying that same engineering discipline — measuring, systematizing,
            documenting — to production, quality, and merchandising execution. On the technology side, I build
            and maintain practical tools myself: this site's CMS, admin panel included, and a workflow that
            uses AI tools for research and content drafting.
          </p>
        </div>
      </section>
    </div>
  );
}
