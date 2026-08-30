"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category { id: string; name: string; slug: string; }

interface InitialValues {
  id?: string;
  name: string;
  slug: string;
  descriptor: string;
  description: string;
  basePrice: number;
  categoryId: string;
  spicy: boolean;
  vegetarian: boolean;
  featured: boolean;
  image: string;
}

interface Props {
  categories: Category[];
  initial?: InitialValues;
}

export default function MenuItemForm({ categories, initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState<InitialValues>(
    initial ?? {
      name: "", slug: "", descriptor: "", description: "",
      basePrice: 0, categoryId: categories[0]?.id ?? "",
      spicy: false, vegetarian: false, featured: false, image: "",
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof InitialValues, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    set("name", value);
    if (!isEdit) {
      set("slug", value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url  = isEdit ? `/api/menu/${initial!.id}` : "/api/menu";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, basePrice: Number(form.basePrice) }),
    });

    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Something went wrong.");
      setSaving(false);
      return;
    }

    router.push("/admin/menu");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Field label="Name" required>
        <input
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className={input}
          placeholder="e.g. BBQ Chicken"
        />
      </Field>

      <Field label="Slug" required hint="Auto-generated. Only lowercase letters, numbers, hyphens.">
        <input
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          required
          pattern="[a-z0-9\-]+"
          className={input}
          placeholder="e.g. bbq-chicken"
        />
      </Field>

      <Field label="Short descriptor">
        <input
          value={form.descriptor}
          onChange={(e) => set("descriptor", e.target.value)}
          className={input}
          placeholder="e.g. Grilled chicken, BBQ sauce, mozzarella"
        />
      </Field>

      <Field label="Full description">
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className={`${input} resize-none`}
          placeholder="Full item description shown on the detail page."
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Base price (₦)" required>
          <input
            type="number"
            min={0}
            value={form.basePrice}
            onChange={(e) => set("basePrice", e.target.value)}
            required
            className={input}
          />
        </Field>

        <Field label="Category" required>
          <select
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className={input}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Image path or URL" hint="e.g. /images/menu/bbq-chicken.jpg">
        <input
          value={form.image}
          onChange={(e) => set("image", e.target.value)}
          className={input}
          placeholder="/images/menu/item-slug.jpg"
        />
      </Field>

      <fieldset className="rounded-xl border border-gray-200 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Flags</legend>
        <div className="flex flex-wrap gap-6">
          {(["spicy", "vegetarian", "featured"] as const).map((flag) => (
            <label key={flag} className="flex cursor-pointer items-center gap-2 text-sm capitalize text-gray-700">
              <input
                type="checkbox"
                checked={form[flag] as boolean}
                onChange={(e) => set(flag, e.target.checked)}
                className="h-4 w-4 accent-amber-700"
              />
              {flag}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-amber-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create item"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/menu")}
          className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const input = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-600";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
