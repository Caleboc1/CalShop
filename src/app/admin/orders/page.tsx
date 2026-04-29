import { prisma } from "@/lib/prisma";
import { formatNGN } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    take: 100, orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } }, product: true },
  });
  const total = await prisma.order.count();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Orders ({total.toLocaleString()})</h1>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{["User", "Product", "Qty", "Charge", "Status", "Credentials", "Date"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs font-medium uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{o.user.email}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium text-xs max-w-[150px] truncate">{o.product.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{o.quantity}</td>
                  <td className="px-4 py-3 text-green-600 font-bold font-mono text-xs">{formatNGN(o.charge)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{o.credentials?.length || 0} delivered</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
