import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProjectDetailView from "@/components/ProjectDetailView";

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

  return <ProjectDetailView project={JSON.parse(JSON.stringify(project))} />;
}
