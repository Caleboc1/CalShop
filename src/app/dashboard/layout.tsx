import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64">
        <DashboardSidebar />
      </aside>
      <div className="flex flex-col flex-1 md:ml-64 min-h-screen">
        <div className="sticky top-0 z-30">
          <DashboardTopbar user={session.user} />
        </div>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
