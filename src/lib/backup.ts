import { prisma } from "@/lib/prisma";

// Central definition of every backupable content type. Both export and restore read
// from this list so they can never drift out of sync with each other.
//
// `order` controls restore sequence — types that other types reference by ID (like
// projectCategories, which projects point to) must be restored first, or the
// foreign-key insert for the dependent record will fail. Cascade-deleted children
// (ProjectImage) are handled implicitly via Prisma's onDelete: Cascade and are never
// listed as their own top-level type — they travel inside their parent Project record.

export const BACKUP_VERSION = "1.0";
export const APPLICATION_ID = "tajul-portfolio";

export type BackupTypeKey =
  | "profile"
  | "siteSettings"
  | "projectCategories"
  | "blogCategories"
  | "skillCategories"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "blogPosts"
  | "testimonials";

export const BACKUP_TYPES: {
  key: BackupTypeKey;
  label: string;
  singleton: boolean; // profile/siteSettings are single records, not lists
  order: number;
}[] = [
  { key: "projectCategories", label: "Project Categories", singleton: false, order: 1 },
  { key: "blogCategories", label: "Blog Categories", singleton: false, order: 1 },
  { key: "skillCategories", label: "Skill Categories", singleton: false, order: 1 },
  { key: "profile", label: "Profile", singleton: true, order: 1 },
  { key: "siteSettings", label: "Site Settings", singleton: true, order: 1 },
  { key: "experience", label: "Experience", singleton: false, order: 1 },
  { key: "education", label: "Education / Certifications", singleton: false, order: 1 },
  { key: "skills", label: "Skills", singleton: false, order: 2 }, // needs skillCategories
  { key: "projects", label: "Projects", singleton: false, order: 2 }, // needs projectCategories
  { key: "blogPosts", label: "Blog Posts", singleton: false, order: 2 }, // needs blogCategories
  { key: "testimonials", label: "Testimonials", singleton: false, order: 3 }, // optionally needs projects
];

/** Fetches full records for the given type, optionally filtered to specific IDs. */
export async function fetchBackupData(key: BackupTypeKey, ids?: string[]) {
  const idFilter = ids && ids.length > 0 ? { id: { in: ids } } : {};
  switch (key) {
    case "profile":
      return prisma.profile.findUnique({ where: { id: "profile" } });
    case "siteSettings":
      return prisma.siteSetting.findUnique({ where: { id: "settings" } });
    case "projectCategories":
      return prisma.projectCategory.findMany({ where: idFilter });
    case "blogCategories":
      return prisma.blogCategory.findMany({ where: idFilter });
    case "skillCategories":
      return prisma.skillCategory.findMany({ where: idFilter });
    case "experience":
      return prisma.experience.findMany({ where: idFilter });
    case "education":
      return prisma.education.findMany({ where: idFilter });
    case "skills":
      return prisma.skill.findMany({ where: idFilter });
    case "projects":
      return prisma.project.findMany({ where: idFilter, include: { images: true } });
    case "blogPosts":
      return prisma.blogPost.findMany({ where: idFilter });
    case "testimonials":
      return prisma.testimonial.findMany({ where: idFilter });
  }
}

/** Lightweight id+label list for populating the admin selection checklist without pulling full records. */
export async function fetchBackupSummary(key: BackupTypeKey) {
  switch (key) {
    case "profile":
      return (await prisma.profile.findUnique({ where: { id: "profile" }, select: { id: true, name: true } }))
        ? [{ id: "profile", label: "Profile" }]
        : [];
    case "siteSettings":
      return (await prisma.siteSetting.findUnique({ where: { id: "settings" }, select: { id: true } }))
        ? [{ id: "settings", label: "Site Settings" }]
        : [];
    case "projectCategories":
      return (await prisma.projectCategory.findMany({ select: { id: true, name: true } })).map((r) => ({ id: r.id, label: r.name }));
    case "blogCategories":
      return (await prisma.blogCategory.findMany({ select: { id: true, name: true } })).map((r) => ({ id: r.id, label: r.name }));
    case "skillCategories":
      return (await prisma.skillCategory.findMany({ select: { id: true, name: true } })).map((r) => ({ id: r.id, label: r.name }));
    case "experience":
      return (await prisma.experience.findMany({ select: { id: true, position: true, company: true } })).map((r) => ({ id: r.id, label: `${r.position} · ${r.company}` }));
    case "education":
      return (await prisma.education.findMany({ select: { id: true, degree: true, institution: true } })).map((r) => ({ id: r.id, label: `${r.degree} · ${r.institution}` }));
    case "skills":
      return (await prisma.skill.findMany({ select: { id: true, name: true } })).map((r) => ({ id: r.id, label: r.name }));
    case "projects":
      return (await prisma.project.findMany({ select: { id: true, title: true } })).map((r) => ({ id: r.id, label: r.title }));
    case "blogPosts":
      return (await prisma.blogPost.findMany({ select: { id: true, title: true } })).map((r) => ({ id: r.id, label: r.title }));
    case "testimonials":
      return (await prisma.testimonial.findMany({ select: { id: true, name: true } })).map((r) => ({ id: r.id, label: r.name }));
  }
}
