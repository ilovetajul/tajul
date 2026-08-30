import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="glass block p-6 transition-transform hover:-translate-y-1">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-sm text-white/50">{label}</div>
    </Link>
  );
}

export default async function AdminOverviewPage() {
  const [
    totalProjects, publishedProjects, draftProjects,
    totalPosts, publishedPosts,
    experienceCount, educationCount, skillCount, mediaCount,
    totalMessages, unreadMessages,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "published" } }),
    prisma.project.count({ where: { status: "draft" } }),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: "published" } }),
    prisma.experience.count(),
    prisma.education.count(),
    prisma.skill.count(),
    prisma.media.count(),
    prisma.message.count(),
    prisma.message.count({ where: { read: false } }),
  ]);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-white">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Projects" value={totalProjects} href="/admin/projects" />
        <StatCard label="Published Projects" value={publishedProjects} href="/admin/projects" />
        <StatCard label="Draft Projects" value={draftProjects} href="/admin/projects" />
        <StatCard label="Blog Posts" value={totalPosts} href="/admin/blog" />
        <StatCard label="Published Posts" value={publishedPosts} href="/admin/blog" />
        <StatCard label="Media Files" value={mediaCount} href="/admin/media" />
        <StatCard label="Experience Records" value={experienceCount} href="/admin/experience" />
        <StatCard label="Education Records" value={educationCount} href="/admin/education" />
        <StatCard label="Skills" value={skillCount} href="/admin/skills" />
        <StatCard label="Contact Messages" value={totalMessages} href="/admin/messages" />
        <StatCard label="Unread Messages" value={unreadMessages} href="/admin/messages" />
      </div>
    </div>
  );
}
