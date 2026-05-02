"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, ClipboardList, Wallet, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardMobileNav() {
  const path = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2">
        {links.map((link) => {
          const active = path === link.href || (link.href !== "/dashboard" && path.startsWith(link.href) && link.href !== "/shop");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-colors",
                active
                  ? "bg-green-50 text-green-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
