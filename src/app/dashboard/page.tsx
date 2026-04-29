import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNGN } from "@/lib/utils";
import { Wallet, ShoppingBag, ClipboardList, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [user, totalOrders, completedOrders, recentOrders] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { balance: true, name: true } }),
    prisma.order.count({ where: { userId } }),
    prisma.order.count({ where: { userId, status: "COMPLETED" } }),
    prisma.order.findMany({
      where: { userId }, take: 5,
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const stats = [
    { label: "Wallet Balance", value: formatNGN(user?.balance ?? 0), icon: Wallet, color: "text-green-600", bg: "bg-green-100", href: "/dashboard/wallet" },
    { label: "Total Orders", value: totalOrders.toString(), icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100", href: "/dashboard/orders" },
    { label: "Completed", value: completedOrders.toString(), icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100", href: "/dashboard/orders" },
    { label: "Browse Shop", value: "Shop →", icon: ClipboardList, color: "text-violet-600", bg: "bg-violet-100", href: "/shop" },
  ];

  const statusColors: Record<string, string> = {
    COMPLETED: "text-green-600 bg-green-100",
    PENDING: "text-yellow-600 bg-yellow-100",
    FAILED: "text-red-600 bg-red-100",
    REPLACED: "text-blue-600 bg-blue-100",
    REFUNDED: "text-purple-600 bg-purple-100",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-gray-900">Dashboard</h2>
        <Link href="/shop" className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl transition-colors">
          <ShoppingBag className="w-4 h-4" /> Browse Shop
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-green-300 hover:shadow-sm transition-all group">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recent Orders</h3>
          <Link href="/dashboard/orders" className="text-sm text-green-600 hover:text-green-500 font-semibold flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <ShoppingBag className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No orders yet.</p>
            <Link href="/shop" className="mt-3 inline-block text-green-600 text-sm font-semibold">Browse products →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Product", "Qty", "Total", "Status", "Date"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm truncate max-w-[180px]">{o.product.name}</div>
                      <div className="text-xs text-gray-400">{o.product.category?.name}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{o.quantity}</td>
                    <td className="px-4 py-3 text-green-600 font-bold font-mono text-sm">{formatNGN(o.charge)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[o.status] || "text-gray-500 bg-gray-100"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
