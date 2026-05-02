"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, Package, RefreshCw, LogOut, Shield } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "AcctMarket";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/upstream", label: "Upstream", icon: RefreshCw },
];

export function AdminSidebar() {
  const path = usePathname();

  return (
    <div className="flex h-full min-h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-100 px-6">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900">
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-gray-900">{APP_NAME} Admin</span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {links.map((link) => {
          const active = path === link.href || (link.href !== "/admin" && path.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active ? "border border-gray-900 bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-100 px-3 pb-4 pt-3">
        <Link
          href="/dashboard"
          className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900"
        >
          <Package className="h-4 w-4" />
          User Dashboard
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
