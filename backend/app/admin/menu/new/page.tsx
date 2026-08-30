import { prisma } from "@/lib/prisma";
import MenuItemForm from "../MenuItemForm";

export const dynamic = "force-dynamic";

export default async function NewMenuItemPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Add Menu Item</h1>
      <p className="mt-1 text-sm text-gray-500">Fill in the details below. Sizes can be added after saving.</p>
      <div className="mt-8">
        <MenuItemForm categories={categories} />
      </div>
    </div>
  );
}
