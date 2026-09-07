"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/api";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
const inp = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";

interface InitialValues {
  id?: string; name: string; slug: string; descriptor: string;
  description: string; basePrice: number; categoryId: string;
  spicy: boolean; vegetarian: boolean; featured: boolean; image: string;
}

export default function MenuItemForm({ categories, initial }: { categories: Category[]; initial?: InitialValues }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<InitialValues>(initial ?? {
    name:"", slug:"", descriptor:"", description:"", basePrice:0,
    categoryId: categories[0]?.id ?? "", spicy:false, vegetarian:false, featured:false, image:"",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof InitialValues, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleName = (v: string) => {
    set("name", v);
    if (!isEdit) set("slug", v.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    const url = isEdit ? `${BACKEND}/api/menu/${initial!.id}` : `${BACKEND}/api/menu`;
    const res = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...form, basePrice: Number(form.basePrice)}), credentials:"include" });
    if (!res.ok) { const d = await res.json() as {error?:string}; setError(d.error ?? "Error"); setSaving(false); return; }
    router.push("/admin/menu"); router.refresh();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Field label="Name" required><input value={form.name} onChange={e => handleName(e.target.value)} required className={inp} /></Field>
      <Field label="Slug" required><input value={form.slug} onChange={e => set("slug", e.target.value)} required pattern="[a-z0-9\-]+" className={inp} /></Field>
      <Field label="Short descriptor"><input value={form.descriptor} onChange={e => set("descriptor", e.target.value)} className={inp} /></Field>
      <Field label="Description"><textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} className={`${inp} resize-none`} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Base price (₦)" required><input type="number" min={0} value={form.basePrice} onChange={e => set("basePrice", e.target.value)} required className={inp} /></Field>
        <Field label="Category" required>
          <select value={form.categoryId} onChange={e => set("categoryId", e.target.value)} className={inp}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Image path" hint="e.g. /images/menu/bbq-chicken.jpg"><input value={form.image} onChange={e => set("image", e.target.value)} className={inp} /></Field>
      <fieldset className="rounded-xl border border-gray-200 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Flags</legend>
        <div className="flex flex-wrap gap-6">
          {(["spicy","vegetarian","featured"] as const).map(f => (
            <label key={f} className="flex cursor-pointer items-center gap-2 text-sm capitalize text-gray-700">
              <input type="checkbox" checked={form[f] as boolean} onChange={e => set(f, e.target.checked)} className="h-4 w-4 accent-amber-700" />{f}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="rounded-xl bg-amber-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create item"}
        </button>
        <button type="button" onClick={() => router.push("/admin/menu")} className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
      </div>
    </form>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
