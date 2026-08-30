import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MenuActions from "./MenuActions";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const [items, categories] = await Promise.all([
    prisma.menuItem.findMany({
      include: { category: { select: { name: true, slug: true } } },
      orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
          <p className="mt-1 text-sm text-gray-500">{items.length} items across {categories.length} categories.</p>
        </div>
        <Link
          href="/admin/menu/new"
          className="rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-800"
        >
          + Add Item
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Item</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Base Price</th>
              <th className="px-4 py-3 text-left">Flags</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className={`hover:bg-gray-50 ${!item.available ? "opacity-50" : ""}`}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-400">{item.slug}</div>
                </td>
                <td className="px-4 py-3 capitalize text-gray-600">{item.category.name}</td>
                <td className="px-4 py-3 font-medium">₦{item.basePrice.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.featured    && <Tag color="amber">Featured</Tag>}
                    {item.spicy       && <Tag color="red">Spicy</Tag>}
                    {item.vegetarian  && <Tag color="green">Veggie</Tag>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {item.soldOut ? (
                    <Tag color="red">Sold out</Tag>
                  ) : item.available ? (
                    <Tag color="green">Available</Tag>
                  ) : (
                    <Tag color="gray">Hidden</Tag>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <MenuActions item={{ id: item.id, soldOut: item.soldOut, available: item.available }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    amber: "bg-amber-100 text-amber-700",
    red:   "bg-red-100 text-red-700",
    green: "bg-green-100 text-green-700",
    gray:  "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[color] ?? colors.gray}`}>
      {children}
    </span>
  );
}
