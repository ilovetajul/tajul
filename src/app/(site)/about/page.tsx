import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { normalizeUrl } from "@/lib/utils";

const SOCIAL_LINKS: [string, string][] = [
  ["facebook", "Facebook"], ["twitter", "X / Twitter"], ["instagram", "Instagram"],
  ["linkedin", "LinkedIn"], ["github", "GitHub"], ["website", "Website"],
  ["whatsapp", "WhatsApp"], ["telegram", "Telegram"], ["messenger", "Messenger"], ["skype", "Skype"],
];

export default async function AboutPage() {
  const profile = await prisma.profile.findUnique({ where: { id: "profile" } }).catch(() => null);
  const socials = profile
    ? SOCIAL_LINKS.filter(([key]) => (profile as any)[key]).map(([key, label]) => ({
        label,
        url: normalizeUrl((profile as any)[key]),
      }))
    : [];

  return (
    <section className="section-padding container-xl">
      <h1 className="mb-10 text-3xl font-bold text-white">About Me</h1>
      <div className="grid gap-10 md:grid-cols-[280px_1fr]">
        <div className="glass relative aspect-square w-full overflow-hidden">
          {profile?.photoUrl ? (
            <Image src={profile.photoUrl} alt={profile.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-white/30">No photo yet</div>
          )}
        </div>
        <div className="space-y-4 text-white/80">
          {profile?.objective && <p>{profile.objective}</p>}
          {profile?.biography && <p className="whitespace-pre-line">{profile.biography}</p>}
          {!profile?.biography && !profile?.objective && (
            <p className="text-white/40">Add your full biography from /admin/profile.</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/60">
            {profile?.location && <span className="glass px-3 py-1.5">📍 {profile.location}</span>}
            {profile?.email && <span className="glass px-3 py-1.5">✉️ {profile.email}</span>}
            {profile?.phone && <span className="glass px-3 py-1.5">📞 {profile.phone}</span>}
          </div>
          {socials.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/70 hover:bg-white/20 hover:text-white"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
