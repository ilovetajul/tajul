"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SignOutButton from "@/components/SignOutButton";

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
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Site Settings" },
  { href: "/admin/backup", label: "Backup & Restore" },
];

export default function AdminSidebar({ unreadMessages }: { unreadMessages: number }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const currentLabel = NAV.find((n) => n.href === pathname)?.label || "Admin";

  return (
    <>
      {/* Mobile top bar — only visible below md */}
      <div className="glass mx-4 mt-4 flex items-center justify-between p-3 md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white"
        >
          ☰
        </button>
        <span className="font-semibold text-white">{currentLabel}</span>
        <Link href="/" className="text-sm text-white/50">View Site</Link>
      </div>

      {/* Backdrop, mobile only, shown while drawer is open */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: slide-in drawer on mobile, static column on desktop */}
      <aside
        className={`glass fixed inset-y-4 left-4 z-50 w-64 overflow-y-auto p-4 transition-transform duration-200 ease-out
          md:static md:z-auto md:m-4 md:w-56 md:shrink-0 md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"}`}
      >
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-lg font-bold text-gradient">Admin</span>
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-white/50 md:hidden">✕</button>
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                  active ? "bg-primary text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {n.label}
                {n.href === "/admin/messages" && unreadMessages > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">{unreadMessages}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 border-t border-white/10 pt-4">
          <Link href="/" className="hidden px-3 py-2 text-sm text-white/50 hover:text-white md:block">← View Site</Link>
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
