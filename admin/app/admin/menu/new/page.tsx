import { getCategories } from "@/lib/api";
import MenuItemForm from "../MenuItemForm";
export const dynamic = "force-dynamic";
export default async function NewMenuItemPage() {
  const categories = await getCategories().catch(() => []);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Add Menu Item</h1>
      <div className="mt-8"><MenuItemForm categories={categories} /></div>
    </div>
  );
}
