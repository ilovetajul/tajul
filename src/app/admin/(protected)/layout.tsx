import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const unreadMessages = await prisma.message.count({ where: { read: false } }).catch(() => 0);

  return (
    <div className="min-h-screen bg-dark md:flex">
      <div className="bg-circles">
        <div className="circle-1" /><div className="circle-2" /><div className="circle-3" /><div className="circle-4" />
      </div>
      <AdminSidebar unreadMessages={unreadMessages} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
