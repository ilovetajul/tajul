import { prisma } from "@/lib/prisma";

export default async function SkillsPage() {
  const categories = await prisma.skillCategory.findMany({
    include: { skills: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <section className="section-padding container-xl">
      <h1 className="mb-10 text-3xl font-bold text-white">Skills</h1>
      {categories.length === 0 ? (
        <p className="text-white/40">No skills added yet. Add some from /admin/skills.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {categories.map((cat) => (
            <div key={cat.id} className="glass p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">{cat.name}</h2>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((s) => (
                  <span key={s.id} className="rounded-full bg-white/10 px-3.5 py-1.5 text-sm text-white/80">
                    {s.name}
                    {s.level && <span className="ml-1.5 text-xs text-white/40">· {s.level}</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
