import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import { prisma } from "@/lib/prisma";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/blog", label: "Blog / Thoughts" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/education", label: "Education" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Site Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const unreadMessages = await prisma.message.count({ where: { read: false } }).catch(() => 0);

  return (
    <div className="min-h-screen bg-dark md:flex">
      <div className="bg-circles">
        <div className="circle-1" /><div className="circle-2" /><div className="circle-3" /><div className="circle-4" />
      </div>
      <aside className="glass m-4 shrink-0 p-4 md:w-56">
        <div className="mb-6 px-2 text-lg font-bold text-gradient">Admin</div>
        <nav className="flex flex-row flex-wrap gap-1 md:flex-col">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
              {n.label}
              {n.href === "/admin/messages" && unreadMessages > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">{unreadMessages}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-white/10 pt-4">
          <Link href="/" className="block px-3 py-2 text-sm text-white/50 hover:text-white">← View Site</Link>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
