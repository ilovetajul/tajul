import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function TestimonialsSection() {
  const testimonials = await prisma.testimonial.findMany({
    where: { status: "published", featured: true },
    take: 4,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  }).catch(() => []);

  if (testimonials.length === 0) return null;

  return (
    <section className="section-padding container-xl">
      <h2 className="mb-8 text-2xl font-bold text-white">What People Say</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {testimonials.map((t) => (
          <div key={t.id} className="glass p-6">
            <p className="text-white/90">"{t.quote}"</p>
            <div className="mt-4 flex items-center gap-3">
              {t.avatarUrl ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image src={t.avatarUrl} alt={t.name} fill sizes="40px" className="object-cover" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm text-white/70">
                  {t.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="text-xs text-white/60">{[t.designation, t.company].filter(Boolean).join(" · ")}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
