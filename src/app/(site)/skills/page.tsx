import { prisma } from "@/lib/prisma";

export default async function SkillsPage() {
  const categories = await prisma.skillCategory.findMany({
    include: { skills: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <section className="section-padding container-xl max-w-3xl">
      <h1 className="mb-10 text-3xl font-bold text-white">Skills</h1>
      {categories.length === 0 ? (
        <p className="text-white/50">No skills added yet. Add some from /admin/skills.</p>
      ) : (
        <div className="space-y-10">
          {categories.map((cat) => (
            <div key={cat.id}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">{cat.name}</h2>
              <div className="glass divide-y divide-white/10">
                {cat.skills.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4">
                    {s.icon && <span className="text-2xl">{s.icon}</span>}
                    <div className="min-w-[140px] font-medium text-white">{s.name}</div>
                    {s.yearsExp ? (
                      <span className="rounded-full bg-primary/20 px-3 py-0.5 text-xs text-white">{s.yearsExp}+ yrs</span>
                    ) : s.level ? (
                      <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs text-white/70">{s.level}</span>
                    ) : null}
                    {s.description && <span className="text-sm text-white/60">{s.description}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
