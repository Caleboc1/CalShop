"use client";
import { useEffect, useState } from "react";
import { formatNGN } from "@/lib/utils";
import { Search, RefreshCw, Download } from "lucide-react";

const USD_TO_NGN = 1620;
const MARKUP = 2.2;

export default function UpstreamPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/upstream");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProducts(Array.isArray(data.products) ? data.products : data.products?.data || []);
      setAccount(data.account);
    } catch (e: any) { setError(e.message || "Failed to fetch from Acctshop"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSync() {
    setSyncing(true); setSyncResult(null);
    const res = await fetch("/api/admin/sync", { method: "POST" });
    const data = await res.json();
    setSyncResult(data); setSyncing(false);
  }

  const filtered = products.filter((p: any) =>
    !search || (p.name || p.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Acctshop Products</h1>
          <p className="text-sm text-gray-500 mt-1">Live products from your upstream supplier</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {account && (
            <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-semibold">
              Balance: <span className="font-mono">${parseFloat(account.balance || "0").toFixed(4)}</span>
            </div>
          )}
          <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-xl">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={handleSync} disabled={syncing} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl">
            <Download className="w-4 h-4" /> {syncing ? "Importing..." : "Import All"}
          </button>
        </div>
      </div>

      {syncResult && (
        <div className={`p-4 rounded-xl border text-sm font-medium ${syncResult.error ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
          {syncResult.error ? `❌ ${syncResult.error}` : `✓ Import complete — ${syncResult.created} imported, ${syncResult.skipped} already existed out of ${syncResult.total} total`}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          ❌ {error} — check that ACCTSHOP_API_KEY is set correctly in your .env
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Products", value: products.length },
          { label: "USD → NGN Rate", value: `$1 = ₦${USD_TO_NGN.toLocaleString()}` },
          { label: "Your Markup", value: `${MARKUP}x = ${((MARKUP - 1) * 100).toFixed(0)}% margin` },
        ].map(item => (
          <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-lg font-extrabold text-gray-900">{item.value}</div>
            <div className="text-xs text-gray-400 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 mx-auto mb-3 animate-spin opacity-40" />
            Fetching from Acctshop...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">No products found</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["ID", "Product Name", "Category", "Their Price (USD)", "Your Price (NGN)", "Profit/unit", "Stock"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs font-medium uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p: any, i: number) => {
                    const theirPriceInUSD = parseFloat(p.price || "0");
                    const yourPrice = Math.ceil(theirPriceInUSD * USD_TO_NGN * MARKUP);
                    const profit = yourPrice - Math.ceil(theirPriceInUSD * USD_TO_NGN);

                    return (
                      <tr key={p.id || i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.id}</td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <div className="text-gray-900 font-medium text-xs leading-snug">{p.name || p.title}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{p.category_name || p.category || "—"}</td>
                        <td className="px-4 py-3 text-red-500 font-mono text-xs">
                          ${theirPriceInUSD.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-green-600 font-mono text-xs font-bold">
                          {formatNGN(yourPrice)}
                        </td>
                        <td className="px-4 py-3 text-violet-600 font-mono text-xs">
                          {formatNGN(profit)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {p.amount || p.stock || p.quantity || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                Showing {filtered.length} of {products.length} products
              </div>
            </div>
            <div className="divide-y divide-gray-100 md:hidden">
              {filtered.map((p: any, i: number) => {
                const theirPriceInUSD = parseFloat(p.price || "0");
                const yourPrice = Math.ceil(theirPriceInUSD * USD_TO_NGN * MARKUP);
                const profit = yourPrice - Math.ceil(theirPriceInUSD * USD_TO_NGN);
                return (
                  <div key={p.id || i} className="px-4 py-4">
                    <div className="text-xs text-gray-400">#{p.id} · {p.category_name || p.category || "—"}</div>
                    <div className="mt-1 font-medium text-gray-900 text-sm">{p.name || p.title}</div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-gray-400">Their price</div>
                        <div className="font-mono text-red-500">${theirPriceInUSD.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Your price</div>
                        <div className="font-mono font-bold text-green-600">{formatNGN(yourPrice)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Profit</div>
                        <div className="font-mono text-violet-600">{formatNGN(profit)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Stock</div>
                        <div className="text-gray-600">{p.amount || p.stock || p.quantity || "—"}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                Showing {filtered.length} of {products.length} products
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
