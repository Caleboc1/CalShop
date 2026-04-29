"use client";
import { useEffect, useState } from "react";
import { formatNGN } from "@/lib/utils";
import toast from "react-hot-toast";
import { Wallet, ArrowUpRight } from "lucide-react";

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txns, setTxns] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/user").then(r => r.json()).then(d => setBalance(d?.balance ?? 0));
    fetch("/api/wallet/transactions").then(r => r.json()).then(d => setTxns(d || [])).catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      fetch("/api/wallet/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference: ref }) })
        .then(r => r.json()).then(d => {
          if (d.message) { toast.success(`Wallet credited ${d.amount ? formatNGN(d.amount) : ""}`); fetch("/api/user").then(r => r.json()).then(u => setBalance(u?.balance ?? 0)); }
          else toast.error(d.error || "Verification failed");
        });
      window.history.replaceState({}, "", "/dashboard/wallet");
    }
  }, []);

  async function handleFund(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt < 100) { toast.error("Minimum deposit is ₦100"); return; }
    setLoading(true);
    const res = await fetch("/api/wallet/fund", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: amt }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error); return; }
    window.location.href = data.url;
  }

  const presets = [500, 1000, 2000, 5000, 10000, 20000];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-extrabold text-gray-900">Wallet</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4"><Wallet className="w-4 h-4" /> Available Balance</div>
            <div className="text-4xl font-extrabold text-gray-900 mb-1 font-mono">{formatNGN(balance)}</div>
            <p className="text-gray-400 text-xs">Add funds below to make purchases</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-green-600" /> Add Funds
          </h3>
          <form onSubmit={handleFund} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-semibold uppercase tracking-wide">Quick amounts</label>
              <div className="grid grid-cols-3 gap-2">
                {presets.map(p => (
                  <button key={p} type="button" onClick={() => setAmount(String(p))}
                    className={`py-2 text-xs rounded-xl border font-semibold transition-colors ${amount === String(p) ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    {formatNGN(p)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-semibold uppercase tracking-wide">Or enter amount (₦)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="100"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-mono focus:outline-none focus:border-green-500 transition-colors" placeholder="500" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
              {loading ? "Redirecting..." : "Pay with Paystack"}
            </button>
          </form>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900">Transaction History</h3></div>
        {txns.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No transactions yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {txns.map((t: any) => (
              <div key={t.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900 font-medium">{t.description || (t.type === "CREDIT" ? "Wallet top-up" : "Purchase")}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(t.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-bold ${t.type === "CREDIT" ? "text-green-600" : "text-red-500"}`}>
                    {t.type === "CREDIT" ? "+" : "-"}{formatNGN(t.amount)}
                  </span>
                  <p className={`text-xs mt-0.5 ${t.status === "COMPLETED" ? "text-gray-400" : "text-yellow-500"}`}>{t.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
