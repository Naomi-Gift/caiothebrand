import Link from "next/link";
import { getOrders, getMenuItems, getUsers } from "@/lib/api";
import { auth } from "@/auth";
import { requireAdminPage } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, { cls: string; label: string }> = {
  RECEIVED:         { cls: "bg-blue-50 text-blue-700",    label: "Received" },
  KITCHEN:          { cls: "bg-amber-50 text-amber-800",  label: "In kitchen" },
  OUT_FOR_DELIVERY: { cls: "bg-orange-50 text-orange-700", label: "On the way" },
  DELIVERED:        { cls: "bg-green-50 text-green-700",  label: "Delivered" },
  CANCELLED:        { cls: "bg-red-50 text-red-700",      label: "Cancelled" },
};

export default async function AdminDashboard() {
  const session = await auth();
  const admin = await requireAdminPage();
  const manager = !!admin.branchId;
  const roleLabel = admin.branchId ? `${admin.branchId[0].toUpperCase()}${admin.branchId.slice(1)} manager` : "Admin";
  const [orders, items, users] = await Promise.all([
    getOrders(undefined, admin.branchId).catch(() => []),
    manager ? Promise.resolve([]) : getMenuItems().catch(() => []),
    manager ? Promise.resolve([]) : getUsers().catch(() => []),
  ]);

  const pending = orders.filter(o => ["RECEIVED", "KITCHEN"].includes(o.status)).length;
  const revenue = orders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const today   = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;
  const recent  = orders.slice(0, 8);

  const stats = [
    { label: "Total revenue",   value: `₦${revenue.toLocaleString("en-NG")}`, href: "/admin/analytics",  sub: "All time" },
    { label: "Active orders",   value: pending,                                href: "/admin/orders",      sub: "Awaiting action" },
    { label: "Orders today",    value: today,                                  href: "/admin/orders",      sub: "Since midnight" },
    ...(manager ? [] : [
    { label: "Menu items",      value: items.length,                           href: "/admin/menu",        sub: "Published" },
    { label: "Registered users",value: users.length,                           href: "/admin/users",       sub: "All time" },
    ]),
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.3em] text-brown-light">
          {manager ? `${roleLabel}` : "Super dashboard"}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-brown-darkest sm:text-5xl">
          Welcome back, <em className="not-italic text-brown-light">{session?.user?.name?.split(" ")[0] ?? "Admin"}.</em>
        </h1>
        <p className="mt-2 text-[0.98rem] text-brown-muted">
          Here&apos;s what&apos;s happening at Caio Pizza{manager ? ` ${roleLabel.replace(" manager", "")}` : ""} right now.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, href, sub }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-bone-dark/60 bg-crisp p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-brown"
          >
            <p className="label-uppercase text-[0.6rem] text-brown-light">{label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-brown-darkest">{value}</p>
            <p className="mt-1 text-xs text-brown-light">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-brown-darkest">Recent orders</h2>
          <Link href="/admin/orders" className="label-uppercase text-[0.65rem] text-brown underline underline-offset-4 hover:text-brown-light">
            View all →
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-bone-dark/60 bg-crisp shadow-soft">
          {recent.length === 0 ? (
            <p className="px-6 py-12 text-center font-display text-lg text-brown-light">
              No orders yet — the menu is live though.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-bone bg-cream">
                  <tr>
                    {["Order", "Customer", "Branch", "Total", "Status", "Date"].map((h) => (
                      <th key={h} className="label-uppercase px-4 py-3 text-left text-[0.6rem] text-brown-light">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bone">
                  {recent.map((o) => {
                    const st = STATUS_COLORS[o.status] ?? STATUS_COLORS.RECEIVED;
                    return (
                      <tr key={o.id} className="transition-colors hover:bg-cream">
                        <td className="px-4 py-3 font-mono text-xs text-brown-light">{o.id.slice(0, 8)}…</td>
                        <td className="px-4 py-3 text-brown-darkest">{o.user?.name ?? o.customerName ?? "Guest"}</td>
                        <td className="px-4 py-3 capitalize text-brown-muted">{o.branchId}</td>
                        <td className="px-4 py-3 font-semibold text-brown-darkest">₦{o.total.toLocaleString("en-NG")}</td>
                        <td className="px-4 py-3">
                          <span className={`label-uppercase rounded-full px-2.5 py-1 text-[0.58rem] ${st.cls}`}>
                            {o.erpStatus ?? st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-brown-light">
                          {new Date(o.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="mb-4 font-display text-2xl font-bold text-brown-darkest">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(manager
            ? [
                { href: "/admin/orders",   label: "Manage orders",  desc: "Your branch's orders" },
                { href: "/admin/feedback", label: "Feedback",       desc: "What your customers said" },
                { href: "/admin/analytics", label: "Analytics",     desc: "Your branch's sales" },
              ]
            : [
                { href: "/admin/menu/new",   label: "Add menu item",  desc: "With a photo" },
                { href: "/admin/orders",     label: "Manage orders",  desc: "Kitchen status & tickets" },
                { href: "/admin/users",      label: "Manage users",   desc: "Admins and branch managers" },
                { href: "/admin/settings",   label: "Settings",       desc: "Branches, hours, promo codes" },
              ]
          ).map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-bone-dark/60 bg-crisp p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-brown"
            >
              <p className="font-display text-lg font-bold text-brown-darkest">{label}</p>
              <p className="mt-1 text-xs text-brown-light">{desc}</p>
              <span className="label-uppercase mt-3 inline-block text-[0.6rem] text-brown group-hover:underline">Open →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
