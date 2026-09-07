import { getCategories } from "@/lib/api";
import CategoryActions from "./CategoryActions";
import NewCategoryForm from "./NewCategoryForm";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories().catch(() => []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">{categories.length} categories. Drag to reorder or rename below.</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Slug</th>
              <th className="px-5 py-3 text-left">Order</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-400">{c.slug}</td>
                <td className="px-5 py-3 text-gray-600">{c.order}</td>
                <td className="px-5 py-3 text-right">
                  <CategoryActions id={c.id} name={c.name} order={c.order} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 max-w-md">
        <h2 className="text-lg font-semibold text-gray-900">Add Category</h2>
        <div className="mt-4">
          <NewCategoryForm />
        </div>
      </div>
    </div>
  );
}
