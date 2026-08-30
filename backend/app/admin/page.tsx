import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalOrders, pendingOrders, totalItems, totalUsers] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["RECEIVED", "KITCHEN"] } } }),
    prisma.menuItem.count({ where: { available: true } }),
    prisma.user.count(),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { lines: true },
  });

  const stats = [
    { label: "Total Orders",   value: totalOrders,   href: "/admin/orders", color: "bg-blue-50 text-blue-700" },
    { label: "Active Orders",  value: pendingOrders,  href: "/admin/orders", color: "bg-amber-50 text-amber-700" },
    { label: "Menu Items",     value: totalItems,     href: "/admin/menu",   color: "bg-green-50 text-green-700" },
    { label: "Registered Users", value: totalUsers,   href: "/admin/users",  color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Overview of your restaurant operations.</p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-sm font-medium text-gray-500">{s.label}</span>
            <span className={`inline-block w-fit rounded-full px-3 py-1 text-2xl font-bold ${s.color}`}>
              {s.value}
            </span>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-amber-700 hover:underline">
            View all →
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {recentOrders.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-gray-400">No orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">Order ID</th>
                  <th className="px-6 py-3 text-left">Branch</th>
                  <th className="px-6 py-3 text-left">Items</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      {order.id.slice(0, 8)}…
                    </td>
                    <td className="px-6 py-4 capitalize">{order.branchId}</td>
                    <td className="px-6 py-4">{order.lines.length} item{order.lines.length !== 1 ? "s" : ""}</td>
                    <td className="px-6 py-4 font-medium">₦{order.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    RECEIVED:         "bg-blue-100 text-blue-700",
    KITCHEN:          "bg-amber-100 text-amber-700",
    OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
    DELIVERED:        "bg-green-100 text-green-700",
    CANCELLED:        "bg-red-100 text-red-700",
  };
  const label = status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
}
