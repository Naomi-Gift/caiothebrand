import { requireAdminPage } from "@/lib/adminAuth";
import { getCategories, getPizzaToppings } from "@/lib/api";
import MenuItemForm from "../MenuItemForm";
export const dynamic = "force-dynamic";
export default async function NewMenuItemPage() {
  await requireAdminPage({ fullAdmin: true });
  const [categories, pizzaToppings] = await Promise.all([getCategories().catch(() => []), getPizzaToppings().catch(() => [])]);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-4xl font-bold text-brown-darkest">Add Menu Item</h1>
      <div className="mt-8"><MenuItemForm categories={categories} pizzaToppings={pizzaToppings} /></div>
    </div>
  );
}
