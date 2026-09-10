import { prisma } from "@/lib/prisma";
import { normalizeUrl } from "@/lib/utils";

export default async function ResumePage() {
  const profile = await prisma.profile.findUnique({ where: { id: "profile" } }).catch(() => null);
  const resumeUrl = profile?.resumeUrl ? normalizeUrl(profile.resumeUrl) : null;
  const isPdf = resumeUrl?.toLowerCase().split("?")[0].endsWith(".pdf");

  return (
    <section className="section-padding container-xl max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold text-white text-center">Resume</h1>
      {resumeUrl ? (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-sm text-white/60">
            {isPdf && <span className="glass px-3 py-1">PDF</span>}
            {profile?.resumeUpdatedAt && (
              <span className="glass px-3 py-1">
                Updated {new Date(profile.resumeUpdatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            )}
          </div>

          {isPdf ? (
            <div className="glass overflow-hidden">
              {/* Inline preview — browsers render PDFs natively in an <object>/<embed>. */}
              <object data={resumeUrl} type="application/pdf" className="h-[70vh] w-full">
                <p className="p-8 text-center text-white/70">
                  Your browser can't preview PDFs inline.{" "}
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    Open it directly instead.
                  </a>
                </p>
              </object>
            </div>
          ) : (
            <div className="glass p-10 text-center">
              <p className="text-white/70">Preview isn't available for this file type, but you can open it directly.</p>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">Download / Open in New Tab</a>
          </div>
        </>
      ) : (
        <p className="text-center text-white/60">No CV uploaded yet. Upload one from /admin/profile.</p>
      )}
    </section>
  );
}
