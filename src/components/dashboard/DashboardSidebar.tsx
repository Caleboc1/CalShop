"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, ClipboardList, Wallet, Settings, LogOut, Package } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "AcctMarket";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/shop", label: "Browse Shop", icon: ShoppingBag },
  { href: "/dashboard/orders", label: "My Orders", icon: ClipboardList },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const path = usePathname();
  return (
    <div className="w-64 h-full min-h-screen border-r border-gray-200 flex flex-col bg-white">
      <div className="h-16 px-6 border-b border-gray-100 flex items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center">
            <Package className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-gray-900">{APP_NAME}</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {links.map((l) => {
          const active = path === l.href || (l.href !== "/dashboard" && path.startsWith(l.href) && l.href !== "/shop");
          return (
            <Link key={l.href} href={l.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active ? "bg-green-50 text-green-700 border border-green-200" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              )}>
              <l.icon className="w-4 h-4" />{l.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
