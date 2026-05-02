import { prisma } from "@/lib/prisma";
import { formatNGN } from "@/lib/utils";

type User = {
  id: string;
  name: string | null;
  email: string;
  balance: number;
  role: "ADMIN" | "USER";
  createdAt: string;
  _count: { orders: number };
};

export default async function AdminUsersPage() {
  const users: User[] = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, balance: true, role: true, createdAt: true, _count: { select: { orders: true } } },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Users ({users.length})</h1>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{["Name", "Email", "Balance", "Orders", "Role", "Joined"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs font-medium uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-green-600 font-bold font-mono text-xs">{formatNGN(u.balance)}</td>
                  <td className="px-4 py-3 text-gray-500">{u._count.orders}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === "ADMIN" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-500"}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-gray-100 md:hidden">
          {users.map(u => (
            <div key={u.id} className="px-4 py-4">
              <div className="font-medium text-gray-900 text-sm">{u.name || "—"}</div>
              <div className="mt-1 text-xs text-gray-400 break-all">{u.email}</div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-green-600 font-mono">{formatNGN(u.balance)}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === "ADMIN" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-500"}`}>{u.role}</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">{u._count.orders} orders · Joined {new Date(u.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
