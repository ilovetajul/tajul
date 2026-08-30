import { prisma } from "@/lib/prisma";
import TimelineItem from "@/components/TimelineItem";
import { formatDate } from "@/lib/utils";

export default async function EducationPage() {
  const items = await prisma.education.findMany({ orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }] });
  return (
    <section className="section-padding container-xl max-w-3xl">
      <h1 className="mb-10 text-3xl font-bold text-white">Education</h1>
      {items.length === 0 ? (
        <p className="text-white/40">No education entries yet. Add one from /admin/education.</p>
      ) : (
        <div>
          {items.map((e) => (
            <TimelineItem
              key={e.id}
              dateLabel={`${formatDate(e.startDate)} — ${formatDate(e.endDate)}`}
              title={e.degree}
              subtitle={`${e.institution}${e.subject ? " · " + e.subject : ""}`}
              body={e.description}
            />
          ))}
        </div>
      )}
    </section>
  );
}
