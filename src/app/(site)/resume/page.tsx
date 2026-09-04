import { prisma } from "@/lib/prisma";
import { normalizeUrl } from "@/lib/utils";

export default async function ResumePage() {
  const profile = await prisma.profile.findUnique({ where: { id: "profile" } }).catch(() => null);

  return (
    <section className="section-padding container-xl max-w-2xl text-center">
      <h1 className="mb-6 text-3xl font-bold text-white">Resume</h1>
      {profile?.resumeUrl ? (
        <div className="glass mx-auto p-10">
          <p className="mb-6 text-white/70">The latest version of my CV is always available here.</p>
          <a href={normalizeUrl(profile.resumeUrl)!} target="_blank" rel="noopener noreferrer" className="btn-primary">Download / View CV</a>
        </div>
      ) : (
        <p className="text-white/40">No CV uploaded yet. Upload one from /admin/profile.</p>
      )}
    </section>
  );
}
