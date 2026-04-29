"use client";
import { formatNGN } from "@/lib/utils";
import { Wallet, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function DashboardTopbar({ user }: { user: any }) {
  const [balance, setBalance] = useState<number | null>(null);
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetch("/api/user").then(r => r.json()).then(d => setBalance(d?.balance ?? 0));
  }, []);

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-4 sm:px-6 flex items-center justify-between">
      <h1 className="text-gray-500 text-sm font-medium hidden sm:block">
        Welcome back, <span className="text-gray-900 font-semibold">{user?.name || user?.email}</span>
      </h1>
      <div className="flex items-center gap-3 ml-auto">
        {isAdmin && (
          <Link href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-lg text-xs font-semibold transition-colors">
            <Shield className="w-3.5 h-3.5" /> Admin
          </Link>
        )}
        <Link href="/dashboard/wallet"
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm transition-colors">
          <Wallet className="w-3.5 h-3.5 text-green-600" />
          <span className="font-mono text-green-600 font-semibold">
            {balance !== null ? formatNGN(balance) : "..."}
          </span>
        </Link>
        <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-700 text-sm font-bold">
          {(user?.name || user?.email || "U")[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}
