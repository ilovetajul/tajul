import type { Metadata } from "next";
import "../globals.css";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Every page reads from the database at request time (profile, settings, projects, etc.),
// so we render everything dynamically rather than trying to statically prerender at build
// time — that keeps `next build` from needing a live DATABASE_URL connection to succeed.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSetting.findUnique({ where: { id: "settings" } }).catch(() => null);
  const profile = await prisma.profile.findUnique({ where: { id: "profile" } }).catch(() => null);

  const title = settings?.siteTitle || profile?.name || "Tajul Islam";
  const description =
    settings?.siteDesc || profile?.shortBio || "Merchandiser, engineer, and builder — portfolio and thoughts.";

  return {
    title: { default: title, template: `%s | ${title}` },
    description,
    openGraph: {
      title,
      description,
      images: settings?.ogImage ? [settings.ogImage] : [],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// This layout applies ONLY to the public site (everything except /admin/*), which lives
// in its own separate root layout at src/app/admin/layout.tsx. That split is what stops
// the public Navbar/Footer/background from bleeding into the admin panel — Next.js
// supports multiple independent root layouts this way; route groups like (site) are
// invisible in the URL, so this doesn't change any page's actual address.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.siteSetting.findUnique({ where: { id: "settings" } }).catch(() => null);

  // Maintenance mode intentionally only ever affects THIS layout — it must never be able
  // to lock the admin out of /admin/settings, which is the only place to turn it back off.
  if (settings?.maintenanceMode) {
    return (
      <html lang="en">
        <body className="flex min-h-screen items-center justify-center bg-dark text-white">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Site under maintenance</h1>
            <p className="mt-2 text-white/60">Back shortly. (Turn this off in /admin/settings)</p>
          </div>
        </body>
      </html>
    );
  }

  const session = await getServerSession(authOptions).catch(() => null);

  return (
    <html lang="en">
      <body className="font-sans">
        <div className="bg-circles">
          <div className="circle-1" />
          <div className="circle-2" />
          <div className="circle-3" />
          <div className="circle-4" />
        </div>
        <Navbar isAdmin={!!session} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
