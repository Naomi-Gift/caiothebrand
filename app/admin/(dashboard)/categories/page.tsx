import { requireAdminPage } from "@/lib/adminAuth";
import { getCategories } from "@/lib/api";
import CategoryActions from "./CategoryActions";
import NewCategoryForm from "./NewCategoryForm";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireAdminPage({ fullAdmin: true });
  const categories = await getCategories().catch(() => []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-brown-darkest">Categories</h1>
          <p className="mt-1 text-sm text-brown-light">{categories.length} categories. Drag to reorder or rename below.</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-bone-dark/70 bg-crisp shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-bone bg-cream text-xs uppercase tracking-wider text-brown-light">
            <tr>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Slug</th>
              <th className="px-5 py-3 text-left">Order</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bone">
            {categories.map(c => (
              <tr key={c.id} className="hover:bg-cream">
                <td className="px-5 py-3 font-medium text-brown-darkest">{c.name}</td>
                <td className="px-5 py-3 font-mono text-xs text-brown-light/80">{c.slug}</td>
                <td className="px-5 py-3 text-brown-muted">{c.order}</td>
                <td className="px-5 py-3 text-right">
                  <CategoryActions id={c.id} name={c.name} order={c.order} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 max-w-md">
        <h2 className="font-display text-xl font-bold text-brown-darkest">Add Category</h2>
        <div className="mt-4">
          <NewCategoryForm />
        </div>
      </div>
    </div>
  );
}
