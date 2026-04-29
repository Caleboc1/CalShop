"use client";
import { useEffect, useState } from "react";
import { formatNGN } from "@/lib/utils";
import { ClipboardList, Eye, RefreshCw, Copy, Check } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "text-green-600 bg-green-100",
  PENDING: "text-yellow-600 bg-yellow-100",
  FAILED: "text-red-600 bg-red-100",
  REPLACED: "text-blue-600 bg-blue-100",
  REFUNDED: "text-purple-600 bg-purple-100",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function load(p = 1) {
    setLoading(true);
    const res = await fetch(`/api/orders?page=${p}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  useEffect(() => { load(page); }, [page]);

  async function copyCredentials(orderId: string, credentials: string[]) {
    await navigator.clipboard.writeText(credentials.join("\n"));
    setCopied(orderId);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-gray-900">My Orders <span className="text-gray-400 text-lg font-normal">({total})</span></h2>
        <button onClick={() => load(page)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-xl transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <ClipboardList className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div>
            {orders.map((o: any) => (
              <div key={o.id} className="border-b border-gray-100 last:border-0">
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{o.product?.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{o.product?.category?.name} · Qty: {o.quantity} · {new Date(o.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-bold text-green-600 font-mono text-sm">{formatNGN(o.charge)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] || "text-gray-500 bg-gray-100"}`}>{o.status}</span>
                    {o.credentials?.length > 0 && (
                      <button onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                        className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-500 font-semibold border border-green-200 hover:border-green-300 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Credentials
                      </button>
                    )}
                  </div>
                </div>
                {expanded === o.id && o.credentials?.length > 0 && (
                  <div className="px-5 pb-4">
                    <div className="bg-gray-900 rounded-xl p-4 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">Account Credentials</span>
                        <button onClick={() => copyCredentials(o.id, o.credentials)}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                          {copied === o.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied === o.id ? "Copied!" : "Copy all"}
                        </button>
                      </div>
                      {o.credentials.map((c: string, i: number) => (
                        <div key={i} className="font-mono text-sm text-green-400 py-1 border-b border-gray-800 last:border-0">{c}</div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">⚠️ Save these credentials somewhere safe — they are only shown here.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {total > 20 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Showing {Math.min(page * 20, total)} of {total}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-30 hover:border-gray-300 transition-colors">Prev</button>
              <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-30 hover:border-gray-300 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
