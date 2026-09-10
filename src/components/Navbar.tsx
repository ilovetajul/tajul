"use client";
import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/education", label: "Education" },
  { href: "/skills", label: "Skills" },
  { href: "/blog", label: "Thoughts" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 glass-strong mx-4 mt-4 rounded-2xl px-5 py-3 md:mx-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gradient">
          Tajul Islam
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="rounded-full bg-primary/90 px-4 py-1.5 text-white hover:bg-primary">
              Admin
            </Link>
          )}
        </nav>
        <button
          className="text-white md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <nav className="mt-4 flex flex-col gap-3 text-sm text-white/80 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" onClick={() => setOpen(false)} className="font-medium text-primary">
              → Admin Panel
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
