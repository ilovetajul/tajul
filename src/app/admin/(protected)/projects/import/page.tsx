import BulkImport from "@/components/admin/BulkImport";

export default function ImportProjectsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Bulk Import Projects</h1>
      <BulkImport type="project" templateUrl="/templates/projects-template.csv" redirectTo="/admin/projects" />
    </div>
  );
}
