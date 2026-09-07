import { getOrders } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import OrderStatusSelect from "./OrderStatusSelect";

export const dynamic = "force-dynamic";
const FILTERS = ["ALL","RECEIVED","KITCHEN","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"] as const;
type Filter = typeof FILTERS[number];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = (FILTERS.includes(status as Filter) ? status : "ALL") as Filter;
  const orders = await getOrders(filter).catch(() => []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <a key={f} href={f === "ALL" ? "/admin/orders" : `/admin/orders?status=${f}`}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${filter === f ? "border-amber-700 bg-amber-700 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
            {f === "ALL" ? "All" : f.replace(/_/g," ").toLowerCase().replace(/^\w/,c=>c.toUpperCase())}
          </a>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {orders.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-gray-400">No orders found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Branch</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{o.id.slice(0,8)}…</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{o.user?.name ?? o.customerName ?? "Guest"}</div>
                    <div className="text-xs text-gray-400">{o.user?.email ?? o.customerEmail ?? ""}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{o.branchId}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${o.fulfillment === "DELIVERY" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {o.fulfillment.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {o.lines.map(l => (
                      <div key={l.id} className="truncate max-w-[140px] text-xs">{l.quantity}× {l.name}</div>
                    ))}
                  </td>
                  <td className="px-4 py-3 font-semibold">₦{o.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(o.createdAt).toLocaleDateString("en-NG",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                  </td>
                  <td className="px-4 py-3"><OrderStatusSelect orderId={o.id} current={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
