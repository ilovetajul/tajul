import type { Metadata } from "next";
import "./globals.css";
import { prisma } from "@/lib/prisma";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.siteSetting.findUnique({ where: { id: "settings" } }).catch(() => null);

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

  return (
    <html lang="en">
      <body className="font-sans">
        <div className="bg-circles">
          <div className="circle-1" />
          <div className="circle-2" />
          <div className="circle-3" />
          <div className="circle-4" />
        </div>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
