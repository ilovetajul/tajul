import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Project</h1>
      <ProjectForm initial={JSON.parse(JSON.stringify(project))} />
    </div>
  );
}
