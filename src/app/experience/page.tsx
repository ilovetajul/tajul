import { prisma } from "@/lib/prisma";
import TimelineItem from "@/components/TimelineItem";
import { formatDate } from "@/lib/utils";

export default async function ExperiencePage() {
  const items = await prisma.experience.findMany({ orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }] });
  return (
    <section className="section-padding container-xl max-w-3xl">
      <h1 className="mb-10 text-3xl font-bold text-white">Experience</h1>
      {items.length === 0 ? (
        <p className="text-white/40">No experience entries yet. Add one from /admin/experience.</p>
      ) : (
        <div>
          {items.map((e) => (
            <TimelineItem
              key={e.id}
              dateLabel={`${formatDate(e.startDate)} — ${e.current ? "Present" : formatDate(e.endDate)}`}
              title={`${e.position} · ${e.company}`}
              subtitle={e.department || e.employmentType || undefined}
              body={e.responsibilities}
            />
          ))}
        </div>
      )}
    </section>
  );
}
