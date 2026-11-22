"use client";
import { useEffect, useState } from "react";
import { formatNGN } from "@/lib/utils";
import toast from "react-hot-toast";
import { Wallet, ArrowDownToLine, Copy, Check } from "lucide-react";

const MIN_DEPOSIT = 5000;
const ACCOUNT_NUMBER = "2003433441";
const ACCOUNT_BANK = "Kuda Bank";
const ACCOUNT_NAME = "Caleb Ogeneochuko";

type Transaction = {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string | null;
  createdAt: string;
};

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [senderName, setSenderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);

  async function loadWallet() {
    const [userRes, txnsRes] = await Promise.all([fetch("/api/user"), fetch("/api/wallet/transactions")]);
    if (userRes.ok) {
      const user = await userRes.json();
      setBalance(user?.balance ?? 0);
    }
    if (txnsRes.ok) {
      const transactions = await txnsRes.json();
      setTxns(Array.isArray(transactions) ? transactions : []);
    }
  }

  useEffect(() => { void loadWallet(); }, []);

  async function copyAccountNumber() {
    try {
      await navigator.clipboard.writeText(ACCOUNT_NUMBER);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy account number");
    }
  }

  async function handleFund(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < MIN_DEPOSIT) {
      toast.error(`Minimum deposit is ${formatNGN(MIN_DEPOSIT)}`);
      return;
    }
    if (!senderName.trim()) {
      toast.error("Enter the name on the account you transferred from");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount, senderName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit transfer");
      toast.success("Transfer submitted. Your wallet will be credited after review.");
      setAmount("");
      setSenderName("");
      await loadWallet();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit transfer");
    } finally {
      setLoading(false);
    }
  }

  const presets = [5000, 10000, 20000, 50000, 100000, 200000];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h2 className="text-2xl font-extrabold text-gray-900">Wallet</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500"><Wallet className="h-4 w-4 text-green-600" /> Available Balance</div>
          <div className="mb-1 font-mono text-4xl font-extrabold text-gray-900">{formatNGN(balance)}</div>
          <p className="text-xs text-gray-500">Wallet balance available for purchases</p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900"><ArrowDownToLine className="h-4 w-4 text-green-600" /> Fund Wallet</h3>
          <div className="mb-5 border-y border-gray-100 py-4">
            <p className="mb-3 text-xs font-semibold uppercase text-gray-500">Transfer to</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Bank</dt><dd className="font-semibold text-gray-900">{ACCOUNT_BANK}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Account name</dt><dd className="text-right font-semibold text-gray-900">{ACCOUNT_NAME}</dd></div>
              <div className="flex items-center justify-between gap-4"><dt className="text-gray-500">Account number</dt><dd className="flex items-center gap-2 font-mono font-bold text-gray-900"><span>{ACCOUNT_NUMBER}</span><button type="button" onClick={copyAccountNumber} title="Copy account number" aria-label="Copy account number" className="p-1 text-gray-500 hover:text-green-700">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></dd></div>
            </dl>
          </div>

          <form onSubmit={handleFund} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Transfer amount</label>
              <div className="grid grid-cols-3 gap-2">
                {presets.map(value => <button key={value} type="button" onClick={() => setAmount(String(value))} className={`rounded-lg border py-2 text-xs font-semibold ${amount === String(value) ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>{formatNGN(value)}</button>)}
              </div>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min={MIN_DEPOSIT} step="0.01" required className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-mono text-gray-900 focus:border-green-500 focus:outline-none" placeholder={`Minimum ${MIN_DEPOSIT}`} />
              <p className="mt-1 text-xs text-gray-500">Minimum deposit: {formatNGN(MIN_DEPOSIT)}</p>
            </div>
            <div>
              <label htmlFor="senderName" className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Name on sender account</label>
              <input id="senderName" value={senderName} onChange={e => setSenderName(e.target.value)} required maxLength={120} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none" placeholder="Account holder name" />
            </div>
            <button type="submit" disabled={loading || !amount || !senderName.trim()} className="w-full rounded-lg bg-green-700 py-3 font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Submitting..." : "I've sent it"}
            </button>
          </form>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4"><h3 className="font-bold text-gray-900">Transaction History</h3></div>
        {txns.length === 0 ? <div className="py-12 text-center text-sm text-gray-500">No transactions yet</div> : <div className="divide-y divide-gray-100">
          {txns.map(transaction => <div key={transaction.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div><p className="text-sm font-medium text-gray-900">{transaction.description || (transaction.type === "CREDIT" ? "Wallet top-up" : "Purchase")}</p><p className="mt-0.5 text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p></div>
            <div className="text-left sm:text-right"><span className={`font-mono font-bold ${transaction.type === "CREDIT" ? "text-green-700" : "text-red-600"}`}>{transaction.type === "CREDIT" ? "+" : "-"}{formatNGN(transaction.amount)}</span><p className={`mt-0.5 text-xs ${transaction.status === "COMPLETED" ? "text-green-700" : transaction.status === "PENDING" ? "text-amber-700" : "text-gray-500"}`}>{transaction.status === "FAILED" ? "DECLINED" : transaction.status}</p></div>
          </div>)}
        </div>}
      </section>
    </div>
  );
}
