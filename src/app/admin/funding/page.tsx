"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import toast from "react-hot-toast";
import { formatNGN } from "@/lib/utils";

type FundingRequest = {
  id: string;
  amount: number;
  status: string;
  description: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

export default function AdminFundingPage() {
  const [requests, setRequests] = useState<FundingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/funding", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load funding requests");
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load funding requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function review(transactionId: string, action: "approve" | "decline") {
    setWorkingId(transactionId);
    try {
      const response = await fetch("/api/admin/funding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not review transfer");
      toast.success(action === "approve" ? "Transfer approved and wallet credited" : "Transfer declined");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not review transfer");
    } finally {
      setWorkingId(null);
    }
  }

  const pendingCount = requests.filter(request => request.status === "PENDING").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold text-gray-900">Funding</h1><p className="mt-1 text-sm text-gray-500">{pendingCount} pending transfer{pendingCount === 1 ? "" : "s"}</p></div>
        <button type="button" onClick={() => void load()} disabled={loading} title="Refresh funding requests" aria-label="Refresh funding requests" className="rounded-lg border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? <div className="py-16 text-center text-sm text-gray-500">Loading funding requests...</div> : requests.length === 0 ? <div className="py-16 text-center text-sm text-gray-500">No transfer requests yet</div> : <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>{["Amount", "Customer", "Sender account name", "Submitted", "Status", "Actions"].map(label => <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{label}</th>)}</tr></thead>
              <tbody>{requests.map(request => {
                const sender = request.description?.match(/sender:\s*(.*)$/i)?.[1] || "Not provided";
                const pending = request.status === "PENDING";
                return <tr key={request.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">{formatNGN(request.amount)}</td>
                  <td className="px-4 py-3"><div className="font-medium text-gray-900">{request.user.name || "Customer"}</div><div className="text-xs text-gray-500">{request.user.email}</div></td>
                  <td className="px-4 py-3 text-gray-700">{sender}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{new Date(request.createdAt).toLocaleString("en-NG")}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${request.status === "PENDING" ? "bg-amber-50 text-amber-800" : request.status === "COMPLETED" ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-600"}`}>{request.status === "FAILED" ? "DECLINED" : request.status}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-2">{pending && <><button type="button" onClick={() => void review(request.id, "approve")} disabled={workingId === request.id} title="Approve transfer" className="inline-flex items-center gap-1 rounded-md bg-green-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-50"><Check className="h-3.5 w-3.5" />Approve</button><button type="button" onClick={() => void review(request.id, "decline")} disabled={workingId === request.id} title="Decline transfer" className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"><X className="h-3.5 w-3.5" />Decline</button></>}</div></td>
                </tr>;
              })}</tbody>
            </table>
          </div>
          <div className="divide-y divide-gray-100 md:hidden">{requests.map(request => {
            const sender = request.description?.match(/sender:\s*(.*)$/i)?.[1] || "Not provided";
            const pending = request.status === "PENDING";
            return <div key={request.id} className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="font-mono font-bold text-gray-900">{formatNGN(request.amount)}</p><p className="text-xs text-gray-500">{request.user.name || request.user.email}</p></div><span className="text-xs font-semibold text-gray-600">{request.status === "FAILED" ? "DECLINED" : request.status}</span></div>
              <p className="text-sm text-gray-700">Sender: {sender}</p><p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleString("en-NG")}</p>
              {pending && <div className="flex gap-2 pt-1"><button type="button" onClick={() => void review(request.id, "approve")} disabled={workingId === request.id} className="flex flex-1 items-center justify-center gap-1 rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Check className="h-4 w-4" />Approve</button><button type="button" onClick={() => void review(request.id, "decline")} disabled={workingId === request.id} className="flex flex-1 items-center justify-center gap-1 rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50"><X className="h-4 w-4" />Decline</button></div>}
            </div>;
          })}</div>
        </>}
      </div>
    </div>
  );
}
