import type { Metadata } from "next";
import "../globals.css";

// This is a SEPARATE root layout from src/app/(site)/layout.tsx — Next.js supports
// multiple independent root layouts, selected by which route group a page lives in.
// The admin panel intentionally does NOT reuse the public Navbar/Footer or the
// animated background: those were bleeding through behind the admin UI before (visible
// as "the front page showing behind admin"), and the blur animation running underneath
// admin screens was pure wasted work. Admin gets a plain, solid, fast shell instead.
export const metadata: Metadata = {
  title: "Admin — Tajul Islam",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark font-sans text-white">{children}</body>
    </html>
  );
}
