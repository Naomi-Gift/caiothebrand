import { requireAdminPage } from "@/lib/adminAuth";
import Link from "next/link";
import { getMenuItems } from "@/lib/api";
import MenuActions from "./MenuActions";
import PlaceholderImage from "@/components/PlaceholderImage";
import { menuImageSrc } from "@/lib/menuImage";
import ErpSyncPanel from "./ErpSyncPanel";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  await requireAdminPage({ fullAdmin: true });
  const items = await getMenuItems().catch(() => []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-brown-darkest">Menu</h1>
          <p className="mt-1 text-sm text-brown-light">{items.length} items</p>
        </div>
        <Link href="/admin/menu/new" className="rounded-full bg-brown px-4 py-2.5 text-sm font-semibold text-cream hover:bg-brown-deep">
          + Add Item
        </Link>
      </div>

      <ErpSyncPanel />

      <div className="mt-6 overflow-hidden rounded-2xl border border-bone-dark/70 bg-crisp shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-bone bg-cream text-xs uppercase tracking-wider text-brown-light">
            <tr>
              <th className="px-4 py-3 text-left">Item</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Flags</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bone">
            {items.map(item => (
              <tr key={item.id} className={`hover:bg-cream ${!item.available ? "opacity-50" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <PlaceholderImage
                      label={item.name}
                      src={menuImageSrc(item)}
                      category={item.category.slug}
                      className="h-12 w-12 shrink-0 rounded-lg [&_span.label-uppercase]:hidden [&_span.text-3xl]:text-base"
                    />
                    <div>
                      <div className="font-medium text-brown-darkest">{item.name}</div>
                      <div className="text-xs text-brown-light/80">{item.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-brown-muted">{item.category.name}</td>
                <td className="px-4 py-3 font-medium">₦{item.basePrice.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.featured   && <Tag color="amber">Featured</Tag>}
                    {item.spicy      && <Tag color="red">Spicy</Tag>}
                    {item.vegetarian && <Tag color="green">Veggie</Tag>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {item.soldOut ? <Tag color="red">Sold out</Tag>
                    : item.available ? <Tag color="green">Available</Tag>
                    : <Tag color="gray">Hidden</Tag>}
                </td>
                <td className="px-4 py-3 text-right">
                  <MenuActions id={item.id} soldOut={item.soldOut} available={item.available} />
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
  const c: Record<string,string> = { amber:"bg-bone text-brown", red:"bg-red-100 text-red-700", green:"bg-green-100 text-green-700", gray:"bg-bone/70 text-brown-light" };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${c[color]??c.gray}`}>{children}</span>;
}
