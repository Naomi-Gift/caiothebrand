import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MenuItemForm from "../../MenuItemForm";

export const dynamic = "force-dynamic";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, categories] = await Promise.all([
    prisma.menuItem.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Edit — {item.name}</h1>
      <div className="mt-8">
        <MenuItemForm
          categories={categories}
          initial={{
            id: item.id,
            name: item.name,
            slug: item.slug,
            descriptor: item.descriptor ?? "",
            description: item.description ?? "",
            basePrice: item.basePrice,
            categoryId: item.categoryId,
            spicy: item.spicy,
            vegetarian: item.vegetarian,
            featured: item.featured,
            image: item.image ?? "",
          }}
        />
      </div>
    </div>
  );
}
