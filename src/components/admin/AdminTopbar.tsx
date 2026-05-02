"use client";
import Link from "next/link";
import { Shield, User, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { formatNGN } from "@/lib/utils";

export function AdminTopbar({ user }: { user: any }) {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/user").then((r) => r.json()).then((d) => setBalance(d?.balance ?? 0));
  }, []);

  return (
    <header className="flex h-auto min-h-16 flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Admin Console</p>
        <h1 className="text-sm font-medium text-gray-500">
          Managing <span className="font-semibold text-gray-900">{user?.name || user?.email}</span>
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
        >
          <User className="h-3.5 w-3.5" />
          User View
        </Link>
        <div className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm">
          <Wallet className="h-3.5 w-3.5 text-green-600" />
          <span className="font-mono font-semibold text-green-600">{balance !== null ? formatNGN(balance) : "..."}</span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-900 text-sm font-bold text-white">
          <Shield className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
