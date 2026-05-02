import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { DashboardMobileNav } from "@/components/dashboard/DashboardMobileNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64">
        <DashboardSidebar />
      </aside>
      <div className="flex flex-col flex-1 lg:ml-64 min-h-screen">
        <div className="sticky top-0 z-30">
          <DashboardTopbar user={session.user} />
        </div>
        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-28 lg:pb-6">{children}</main>
      </div>
      <DashboardMobileNav />
    </div>
  );
}
