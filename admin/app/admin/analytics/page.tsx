import { getAnalytics } from "@/lib/api";

export const dynamic = "force-dynamic";

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 truncate text-right text-xs text-gray-600">{label}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
        <div className="h-3 rounded-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs text-gray-500">{value}</span>
    </div>
  );
}

function RevenueChart({ daily }: { daily: Array<{ date: string; revenue: number }> }) {
  const max = Math.max(...daily.map(d => d.revenue), 1);
  const last14 = daily.slice(-14);
  return (
    <div className="flex h-32 items-end gap-1">
      {last14.map(d => {
        const h = Math.max(4, Math.round((d.revenue / max) * 128));
        return (
          <div key={d.date} className="group relative flex flex-1 flex-col items-center gap-1">
            <div
              title={`${d.date}: ₦${d.revenue.toLocaleString()}`}
              className="w-full rounded-t bg-amber-400 transition-all group-hover:bg-amber-600"
              style={{ height: `${h}px` }}
            />
            <span className="hidden text-[9px] text-gray-400 group-hover:block absolute -bottom-4">
              {d.date.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default async function AnalyticsPage() {
  const data = await getAnalytics().catch(() => null);

  if (!data) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-4 text-sm text-gray-500">Could not load analytics. Make sure the backend is running.</p>
      </div>
    );
  }

  const maxBest = data.bestsellers[0]?.qty ?? 1;
  const avgOrder = data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0;

  const statusLabels: Record<string, string> = {
    RECEIVED: "Received", KITCHEN: "In Kitchen",
    OUT_FOR_DELIVERY: "Out for Delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <p className="mt-1 text-sm text-gray-500">All-time performance overview.</p>

      {/* KPI row */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Revenue",    value: `₦${data.totalRevenue.toLocaleString()}`, color: "text-amber-700" },
          { label: "Total Orders",     value: data.totalOrders,                          color: "text-blue-700"  },
          { label: "Avg Order Value",  value: `₦${Math.round(avgOrder).toLocaleString()}`, color: "text-green-700" },
          { label: "Total Discounts",  value: `₦${data.totalDiscount.toLocaleString()}`, color: "text-gray-600" },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{k.label}</p>
            <p className={`mt-1 text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Revenue — last 14 days</h2>
          <RevenueChart daily={data.daily} />
          <p className="mt-5 text-xs text-gray-400">Hover bars to see exact date and amount.</p>
        </div>

        {/* Order status breakdown */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Orders by status</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(data.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{statusLabels[status] ?? status}</span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bestsellers */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-5 text-base font-semibold text-gray-900">Bestsellers (by quantity)</h2>
          <div className="flex flex-col gap-3">
            {data.bestsellers.map(item => (
              <Bar key={item.name} label={item.name} value={item.qty} max={maxBest} />
            ))}
            {data.bestsellers.length === 0 && (
              <p className="text-sm text-gray-400">No order data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
