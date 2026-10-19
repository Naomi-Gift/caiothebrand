import { getOrders } from "@/lib/api";
import { requireAdminPage, scopedBranch } from "@/lib/adminAuth";
import BranchFilter from "@/components/admin/BranchFilter";
import OrderStatusSelect from "./OrderStatusSelect";
import ErpCell from "./ErpCell";

export const dynamic = "force-dynamic";
const FILTERS = ["ALL","RECEIVED","KITCHEN","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"] as const;
type Filter = typeof FILTERS[number];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; branch?: string }> }) {
  const admin = await requireAdminPage();
  const { status, branch: requested } = await searchParams;
  const filter = (FILTERS.includes(status as Filter) ? status : "ALL") as Filter;
  const branch = scopedBranch(admin, requested);
  const orders = await getOrders(filter, branch).catch(() => []);
  const withBranch = (href: string) => (branch && !admin.branchId ? `${href}${href.includes("?") ? "&" : "?"}branch=${branch}` : href);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-brown-darkest">Orders</h1>
          <p className="mt-1 text-sm text-brown-light">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <BranchFilter basePath="/admin/orders" current={branch} locked={!!admin.branchId} extraParams={{ status: filter === "ALL" ? undefined : filter }} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <a key={f} href={withBranch(f === "ALL" ? "/admin/orders" : `/admin/orders?status=${f}`)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${filter === f ? "border-brown bg-brown text-cream" : "border-bone-dark/70 bg-crisp text-brown-muted hover:bg-cream"}`}>
            {f === "ALL" ? "All" : f.replace(/_/g," ").toLowerCase().replace(/^\w/,c=>c.toUpperCase())}
          </a>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-bone-dark/70 bg-crisp shadow-soft">
        {orders.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-brown-light/80">No orders found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-bone bg-cream text-xs uppercase tracking-wider text-brown-light">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Branch</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Kitchen (ERPNext)</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-cream">
                  <td className="px-4 py-3 font-mono text-xs text-brown-light/80">{o.id.slice(0,8)}…</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-brown-darkest">{o.user?.name ?? o.customerName ?? "Guest"}</div>
                    <div className="text-xs text-brown-light/80">{o.user?.email ?? o.customerEmail ?? ""}</div>
                    {o.customerPhone && <a href={`tel:${o.customerPhone}`} className="text-xs text-brown-light underline">{o.customerPhone}</a>}
                  </td>
                  <td className="px-4 py-3 capitalize">{o.branchId}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${o.fulfillment === "DELIVERY" ? "bg-blue-100 text-blue-700" : "bg-bone/70 text-brown-muted"}`}>
                      {o.fulfillment.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brown">
                    {o.lines.map(l => (
                      <div key={l.id} className="truncate max-w-[140px] text-xs">{l.quantity}× {l.name}</div>
                    ))}
                  </td>
                  <td className="px-4 py-3 font-semibold">₦{o.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-brown-light/80">
                    {new Date(o.createdAt).toLocaleDateString("en-NG",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                  </td>
                  <td className="px-4 py-3">
                    <ErpCell orderId={o.id} ticketNo={o.erpTicketNo} status={o.erpStatus} error={o.erpError} />
                  </td>
                  <td className="px-4 py-3">
                    {/* Once the kitchen has it, ERPNext owns the status. */}
                    {o.erpOrderName ? (
                      <span className="text-xs text-brown-light">Managed in ERPNext</span>
                    ) : (
                      <OrderStatusSelect orderId={o.id} current={o.status} />
                    )}
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
