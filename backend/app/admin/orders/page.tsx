import { prisma } from "@/lib/prisma";
import { StatusBadge } from "../page";
import OrderStatusSelect from "./OrderStatusSelect";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = ["ALL", "RECEIVED", "KITCHEN", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;
type Filter = (typeof STATUS_FILTERS)[number];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = (STATUS_FILTERS.includes(status as Filter) ? status : "ALL") as Filter;

  const orders = await prisma.order.findMany({
    where: filter === "ALL" ? {} : { status: filter },
    orderBy: { createdAt: "desc" },
    include: {
      lines: true,
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <a
            key={s}
            href={s === "ALL" ? "/admin/orders" : `/admin/orders?status=${s}`}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === s
                ? "border-amber-700 bg-amber-700 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "ALL" ? "All" : s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
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
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-400">{order.id.slice(0, 8)}…</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {order.user?.name ?? order.customerName ?? "Guest"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.user?.email ?? order.customerEmail ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{order.branchId}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      order.fulfillment === "DELIVERY"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {order.fulfillment.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700">
                      {order.lines.map((l) => (
                        <div key={l.id} className="truncate max-w-[160px]">
                          {l.quantity}× {l.name} ({l.sizeLabel})
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    ₦{order.total.toLocaleString()}
                    {order.discount > 0 && (
                      <div className="text-xs font-normal text-green-600">
                        −₦{order.discount.toLocaleString()} discount
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect orderId={order.id} current={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
