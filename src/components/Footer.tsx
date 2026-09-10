import { prisma } from "@/lib/prisma";

export default async function Footer() {
  const settings = await prisma.siteSetting.findUnique({ where: { id: "settings" } }).catch(() => null);
  return (
    <footer className="mt-24 border-t border-white/10 px-6 py-8 text-center text-sm text-white/50">
      {settings?.footerText || `© ${new Date().getFullYear()} Tajul Islam. All rights reserved.`}
      <div className="mt-1 text-xs text-white/50">
        Evolved from my very first coded website — built line by line, then rebuilt to grow.
      </div>
    </footer>
  );
}
