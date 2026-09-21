import Link from "next/link";
import { getOrders, getMenuItems, getUsers } from "@/lib/api";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  RECEIVED:        { bg: "rgba(59,130,246,0.15)",  text: "#93c5fd", label: "Received" },
  KITCHEN:         { bg: "rgba(245,158,11,0.15)",  text: "#fcd34d", label: "In kitchen" },
  OUT_FOR_DELIVERY:{ bg: "rgba(249,115,22,0.15)",  text: "#fdba74", label: "On the way" },
  DELIVERED:       { bg: "rgba(34,197,94,0.15)",   text: "#86efac", label: "Delivered" },
  CANCELLED:       { bg: "rgba(239,68,68,0.12)",   text: "#fca5a5", label: "Cancelled" },
};

export default async function AdminDashboard() {
  const session = await auth();
  const [orders, items, users] = await Promise.all([
    getOrders().catch(() => []),
    getMenuItems().catch(() => []),
    getUsers().catch(() => []),
  ]);

  const pending = orders.filter(o => ["RECEIVED", "KITCHEN"].includes(o.status)).length;
  const revenue = orders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const today   = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;
  const recent  = orders.slice(0, 8);

  const stats = [
    { label: "Total revenue",   value: `₦${revenue.toLocaleString("en-NG")}`, href: "/admin/analytics",  color: "#fcd34d", sub: "All time" },
    { label: "Active orders",   value: pending,                                href: "/admin/orders",      color: "#93c5fd", sub: "Awaiting action" },
    { label: "Orders today",    value: today,                                  href: "/admin/orders",      color: "#86efac", sub: "Since midnight" },
    { label: "Menu items",      value: items.length,                           href: "/admin/menu",        color: "#c4b5fd", sub: "Published" },
    { label: "Registered users",value: users.length,                           href: "/admin/users",       color: "#f9a8d4", sub: "All time" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="label-uppercase text-[0.6rem] tracking-widest text-bone/30">
          Super dashboard
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold italic text-cream sm:text-4xl">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "Admin"}.
        </h1>
        <p className="mt-1 text-sm text-bone/40">
          Here&apos;s what&apos;s happening with Caio Pizza right now.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, href, color, sub }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "rgba(255,252,248,0.04)", border: "1px solid rgba(235,226,207,0.08)" }}
          >
            <p className="label-uppercase text-[0.58rem] tracking-wider text-bone/35">{label}</p>
            <p className="mt-2 font-display text-2xl font-black italic" style={{ color }}>{value}</p>
            <p className="mt-1 text-[0.65rem] text-bone/25">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold italic text-cream">Recent orders</h2>
          <Link href="/admin/orders"
            className="label-uppercase text-[0.62rem] text-bone/35 underline underline-offset-2 hover:text-bone/60">
            View all →
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl"
          style={{ background: "rgba(255,252,248,0.03)", border: "1px solid rgba(235,226,207,0.08)" }}
        >
          {recent.length === 0 ? (
            <p className="px-6 py-12 text-center font-display italic text-bone/30">
              No orders yet — the menu is live though.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(235,226,207,0.08)" }}>
                    {["Order ID", "Customer", "Branch", "Total", "Status", "Date"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left label-uppercase text-[0.58rem] tracking-wider text-bone/30">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o, i) => {
                    const s = STATUS_COLORS[o.status] ?? STATUS_COLORS.RECEIVED;
                    return (
                      <tr key={o.id}
                        className="transition-colors hover:bg-white/5"
                        style={i < recent.length - 1 ? { borderBottom: "1px solid rgba(235,226,207,0.05)" } : {}}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-bone/30">{o.id.slice(0, 8)}…</td>
                        <td className="px-4 py-3 text-bone/60">{o.user?.name ?? o.customerName ?? "Guest"}</td>
                        <td className="px-4 py-3 capitalize text-bone/50">{o.branchId}</td>
                        <td className="px-4 py-3 font-semibold text-cream">₦{o.total.toLocaleString("en-NG")}</td>
                        <td className="px-4 py-3">
                          <span className="label-uppercase rounded-full px-2.5 py-1 text-[0.58rem]"
                            style={{ background: s.bg, color: s.text }}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-bone/30">
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
        <h2 className="mb-4 font-display text-xl font-bold italic text-cream">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: "/admin/menu/new",   label: "Add menu item",  desc: "Publish a new pizza" },
            { href: "/admin/orders",     label: "Manage orders",  desc: "Update order status" },
            { href: "/admin/users",      label: "Manage users",   desc: "Promote or revoke admins" },
            { href: "/admin/settings",   label: "Settings",       desc: "Store config & hours" },
          ].map(({ href, label, desc }) => (
            <Link key={href} href={href}
              className="group rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/5"
              style={{ background: "rgba(255,252,248,0.03)", border: "1px solid rgba(235,226,207,0.08)" }}
            >
              <p className="font-semibold text-cream/80 group-hover:text-cream">{label}</p>
              <p className="mt-1 text-xs text-bone/30">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
