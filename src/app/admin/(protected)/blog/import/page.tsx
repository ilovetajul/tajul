import BulkImport from "@/components/admin/BulkImport";

export default function ImportBlogPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Bulk Import Articles</h1>
      <BulkImport type="blog" templateUrl="/templates/blog-template.csv" redirectTo="/admin/blog" />
    </div>
  );
}
