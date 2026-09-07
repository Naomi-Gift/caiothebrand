import Link from "next/link";
import { getOrders, getMenuItems, getUsers } from "@/lib/api";

export const dynamic = "force-dynamic";

function StatCard({ label, value, href, color }: { label: string; value: number | string; href: string; color: string }) {
  return (
    <Link href={href} className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    RECEIVED: "bg-blue-100 text-blue-700",
    KITCHEN: "bg-amber-100 text-amber-700",
    OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase())}
    </span>
  );
}

export default async function AdminDashboard() {
  const [orders, items, users] = await Promise.all([
    getOrders().catch(() => []),
    getMenuItems().catch(() => []),
    getUsers().catch(() => []),
  ]);

  const pending = orders.filter(o => ["RECEIVED", "KITCHEN"].includes(o.status)).length;
  const revenue = orders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const recent  = orders.slice(0, 6);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Live overview of your restaurant.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Revenue"   value={`₦${revenue.toLocaleString()}`} href="/admin/analytics" color="text-amber-700" />
        <StatCard label="Active Orders"   value={pending}                          href="/admin/orders"    color="text-blue-700" />
        <StatCard label="Menu Items"      value={items.length}                     href="/admin/menu"      color="text-green-700" />
        <StatCard label="Users"           value={users.length}                     href="/admin/users"     color="text-purple-700" />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-amber-700 hover:underline">View all →</Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {recent.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-gray-400">No orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Branch</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{o.id.slice(0,8)}…</td>
                    <td className="px-4 py-3">{o.user?.name ?? o.customerName ?? "Guest"}</td>
                    <td className="px-4 py-3 capitalize">{o.branchId}</td>
                    <td className="px-4 py-3 font-semibold">₦{o.total.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(o.createdAt).toLocaleDateString("en-NG",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
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
