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

/**
 * Ensures an admin-entered external URL actually has a protocol.
 * Without this, a value like "example.com" renders as <a href="example.com">,
 * which the browser resolves RELATIVE to the current page — so clicking it
 * just navigates within your own site instead of leaving it. This fixes both
 * newly-saved URLs and URLs that were already saved without a protocol.
 */
export function normalizeUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
