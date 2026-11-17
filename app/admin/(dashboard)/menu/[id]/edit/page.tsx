import { requireAdminPage } from "@/lib/adminAuth";
import { getMenuItem, getCategories, getPizzaToppings } from "@/lib/api";
import type { AddOnOption, SizeOption } from "@/lib/types";
import { notFound } from "next/navigation";
import MenuItemForm from "../../MenuItemForm";
export const dynamic = "force-dynamic";
export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage({ fullAdmin: true });
  const { id } = await params;
  const [item, categories, pizzaToppings] = await Promise.all([
    getMenuItem(id).catch(() => null),
    getCategories().catch(() => []),
    getPizzaToppings().catch(() => []),
  ]);
  if (!item) notFound();
  const sizes = Array.isArray(item.sizes) ? (item.sizes as SizeOption[]) : [];
  const addOns = Array.isArray(item.addOns) ? (item.addOns as AddOnOption[]) : [];
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-4xl font-bold text-brown-darkest">Edit — {item.name}</h1>
      <div className="mt-8">
        <MenuItemForm categories={categories} pizzaToppings={pizzaToppings} initial={{
          id: item.id, name: item.name, slug: item.slug,
          descriptor: item.descriptor ?? "", description: item.description ?? "",
          basePrice: item.basePrice, categoryId: (item as { categoryId?: string }).categoryId ?? categories[0]?.id ?? "",
          spicy: item.spicy, vegetarian: item.vegetarian, featured: item.featured, image: item.image ?? "",
          // Shown as each size's full price.
          sizes: sizes.length
            ? sizes.map((s) => ({ id: s.id, label: s.label, price: item.basePrice + (s.priceDelta ?? 0), itemCode: s.itemCode ?? "" }))
            : [{ id: "regular", label: "Regular", price: item.basePrice, itemCode: "" }],
          addOns: addOns.map((a) => ({ id: a.id, label: a.label, price: a.price, itemCode: a.itemCode ?? "" })),
        }} />
      </div>
    </div>
  );
}
