import slugify from "slugify";
import { prisma } from "@/lib/prisma";

export function makeSlug(text: string) {
  return slugify(text, { lower: true, strict: true });
}

/** Generates a unique slug for a given Prisma model by appending -2, -3, etc. if needed. */
export async function uniqueSlug(
  model: "project" | "blogPost",
  base: string,
  excludeId?: string
) {
  const baseSlug = makeSlug(base);
  let slug = baseSlug;
  let counter = 2;

  // Dynamic model access (prisma.project vs prisma.blogPost) — Prisma's generated types
  // can't express "pick the model at runtime", so we cast to `any` here deliberately.
  const modelClient = (prisma as any)[model];

  while (
    await modelClient.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "Present";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}
