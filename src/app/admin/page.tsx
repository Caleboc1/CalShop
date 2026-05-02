import { prisma } from "@/lib/prisma";
import { formatNGN } from "@/lib/utils";

export default async function AdminPage() {
  const [users, orders, revenue, products] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.transaction.aggregate({ where: { type: "CREDIT", status: "COMPLETED" }, _sum: { amount: true } }),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  type RecentOrder = {
    id: string;
    user: { email: string };
    product: { name: string };
    quantity: number;
    charge: number;
    status: string;
    createdAt: string;
  };

  const recentOrders: RecentOrder[] = await prisma.order.findMany({
    take: 10, orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } }, product: true },
  });

  const stats = [
    { label: "Total Users", value: users.toLocaleString() },
    { label: "Total Orders", value: orders.toLocaleString() },
    { label: "Total Revenue", value: formatNGN(revenue._sum.amount || 0) },
    { label: "Active Products", value: products.toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Admin Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="text-2xl font-extrabold text-green-600 font-mono">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900">Recent Orders</h3></div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{["User", "Product", "Qty", "Charge", "Status", "Date"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs font-medium uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 text-xs">{o.user.email}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium text-xs max-w-[160px] truncate">{o.product.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{o.quantity}</td>
                  <td className="px-4 py-3 text-green-600 font-bold font-mono text-xs">{formatNGN(o.charge)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-gray-100 md:hidden">
          {recentOrders.map(o => (
            <div key={o.id} className="px-4 py-4">
              <div className="text-xs text-gray-400">{o.user.email}</div>
              <div className="mt-1 font-medium text-gray-900 text-sm">{o.product.name}</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-green-600 font-mono">{formatNGN(o.charge)}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">Qty: {o.quantity} · {new Date(o.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
