"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/api";
import ImageUpload from "@/components/admin/ImageUpload";
import { PIZZA_SIZES } from "@/lib/menuOptions";
import type { AddOnOption } from "@/lib/types";

const inp = "w-full rounded-xl border border-bone-dark/70 bg-crisp px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brown/25";

/** A size as the admin edits it: the full price, not the difference from the smallest. */
export interface SizeRow { id: string; label: string; price: number | string; itemCode: string }
export interface AddOnRow { id: string; label: string; price: number | string; itemCode: string }

interface InitialValues {
  id?: string; name: string; slug: string; descriptor: string;
  description: string; basePrice: number; categoryId: string;
  spicy: boolean; vegetarian: boolean; featured: boolean; image: string;
  sizes: SizeRow[]; addOns: AddOnRow[];
}

const pizzaSizeRows = (): SizeRow[] => PIZZA_SIZES.map((s) => ({ ...s, price: "", itemCode: "" }));
const regularRow = (price: number | string = ""): SizeRow => ({ id: "regular", label: "Regular", price, itemCode: "" });
const toppingRows = (t: AddOnOption[]): AddOnRow[] => t.map((a) => ({ id: a.id, label: a.label, price: a.price, itemCode: a.itemCode ?? "" }));

export default function MenuItemForm({ categories, initial, pizzaToppings = [] }: {
  categories: Category[];
  initial?: InitialValues;
  /** Toppings already offered on pizzas, to copy onto a new one. */
  pizzaToppings?: AddOnOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const pizzaCat = categories.find((c) => c.slug === "pizzas");
  const startCat = categories[0]?.id ?? "";
  const [form, setForm] = useState<InitialValues>(initial ?? {
    name:"", slug:"", descriptor:"", description:"", basePrice:0,
    categoryId: startCat, spicy:false, vegetarian:false, featured:false, image:"",
    // New pizzas start with the usual three sizes and toppings, like the rest.
    sizes: startCat && startCat === pizzaCat?.id ? pizzaSizeRows() : [regularRow()],
    addOns: startCat && startCat === pizzaCat?.id ? toppingRows(pizzaToppings) : [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof InitialValues, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const setRow = (k: "sizes" | "addOns", i: number, patch: Partial<SizeRow>) =>
    setForm(p => ({ ...p, [k]: p[k].map((r, j) => (j === i ? { ...r, ...patch } : r)) }));
  const addRow = (k: "sizes" | "addOns") =>
    setForm(p => ({ ...p, [k]: [...p[k], { id: "", label: "", price: "", itemCode: "" }] }));
  const removeRow = (k: "sizes" | "addOns", i: number) =>
    setForm(p => ({ ...p, [k]: p[k].filter((_, j) => j !== i) }));

  const changeCategory = (id: string) => {
    setForm(p => {
      const toPizza = id === pizzaCat?.id && p.categoryId !== id;
      const untouched = p.sizes.length === 1 && p.sizes[0].price === "" && (p.sizes[0].id === "regular" || !p.sizes[0].label.trim());
      return {
        ...p,
        categoryId: id,
        // Switching a fresh item to Pizzas fills in the usual sizes and toppings.
        sizes: toPizza && untouched ? pizzaSizeRows() : p.sizes,
        addOns: toPizza && p.addOns.length === 0 ? toppingRows(pizzaToppings) : p.addOns,
      };
    });
  };

  const handleName = (v: string) => {
    set("name", v);
    if (!isEdit) set("slug", v.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sizes = form.sizes.filter(r => r.label.trim());
    if (sizes.length === 0) return setError("Add at least one size with a price.");
    if (sizes.some(r => r.price === "" || Number(r.price) < 0)) return setError("Every size needs a price.");
    const addOns = form.addOns.filter(r => r.label.trim());
    if (addOns.some(r => r.price === "" || Number(r.price) < 0)) return setError("Every topping/extra needs a price (0 if free).");
    // The website stores the smallest price as the base and each size as the extra on top.
    const ordered = [...sizes].sort((a, b) => Number(a.price) - Number(b.price));
    const basePrice = Number(ordered[0].price);
    setSaving(true); setError("");
    const payload = {
      ...form,
      basePrice,
      sizes: ordered.map(r => ({ id: r.id, label: r.label, priceDelta: Number(r.price) - basePrice, itemCode: r.itemCode })),
      addOns: addOns.map(r => ({ id: r.id, label: r.label, price: Number(r.price), itemCode: r.itemCode })),
    };
    const url = isEdit ? `/api/menu/${initial!.id}` : `/api/menu`;
    const res = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) });
    if (!res.ok) { const d = await res.json() as {error?:string}; setError(d.error ?? "Error"); setSaving(false); return; }
    router.push("/admin/menu"); router.refresh();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-2xl border border-bone-dark/60 bg-crisp p-6 shadow-soft sm:p-8">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Field label="Name" required><input value={form.name} onChange={e => handleName(e.target.value)} required className={inp} /></Field>
      <Field label="Slug" required><input value={form.slug} onChange={e => set("slug", e.target.value)} required pattern="[a-z0-9\-]+" className={inp} /></Field>
      <Field label="Short descriptor"><input value={form.descriptor} onChange={e => set("descriptor", e.target.value)} className={inp} /></Field>
      <Field label="Description"><textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} className={`${inp} resize-none`} /></Field>
      <Field label="Category" required>
        <select value={form.categoryId} onChange={e => changeCategory(e.target.value)} className={inp}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>

      <fieldset className="rounded-xl border border-bone-dark/70 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-brown-light">Sizes &amp; prices<span className="ml-0.5 text-red-500">*</span></legend>
        <p className="mb-3 text-xs text-brown-light/80">
          Full price of each size. One size only? Leave a single row (e.g. &ldquo;Regular&rdquo;). ERPNext code is optional — the ERPNext sync fills it in.
        </p>
        <div className="flex flex-col gap-2">
          {form.sizes.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_7rem_auto] gap-2 sm:grid-cols-[1fr_7rem_9rem_auto]">
              <input aria-label="Size name" placeholder={'e.g. Large (12")'} value={r.label} onChange={e => setRow("sizes", i, { label: e.target.value })} className={inp} />
              <input aria-label="Price (₦)" type="number" min={0} placeholder="₦ price" value={r.price} onChange={e => setRow("sizes", i, { price: e.target.value })} className={inp} />
              <input aria-label="ERPNext item code" placeholder="ERPNext code" value={r.itemCode} onChange={e => setRow("sizes", i, { itemCode: e.target.value })} className={`${inp} hidden font-mono text-xs sm:block`} />
              <button type="button" onClick={() => removeRow("sizes", i)} disabled={form.sizes.length === 1} aria-label="Remove size"
                className="rounded-xl px-2 text-brown-light hover:bg-bone disabled:opacity-30">✕</button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => addRow("sizes")} className="rounded-full border border-bone-dark/70 px-3 py-1.5 text-xs font-medium text-brown hover:bg-cream">+ Add size</button>
          <button type="button" onClick={() => set("sizes", pizzaSizeRows())} className="rounded-full border border-bone-dark/70 px-3 py-1.5 text-xs font-medium text-brown hover:bg-cream">Use pizza sizes (10&quot; / 12&quot; / 16&quot;)</button>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-bone-dark/70 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-brown-light">Toppings &amp; extras</legend>
        <p className="mb-3 text-xs text-brown-light/80">Optional extras customers can add. Leave empty for none.</p>
        <div className="flex flex-col gap-2">
          {form.addOns.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_7rem_auto] gap-2">
              <input aria-label="Extra name" placeholder="e.g. Extra cheese" value={r.label} onChange={e => setRow("addOns", i, { label: e.target.value })} className={inp} />
              <input aria-label="Price (₦)" type="number" min={0} placeholder="₦ price" value={r.price} onChange={e => setRow("addOns", i, { price: e.target.value })} className={inp} />
              <button type="button" onClick={() => removeRow("addOns", i)} aria-label="Remove extra" className="rounded-xl px-2 text-brown-light hover:bg-bone">✕</button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => addRow("addOns")} className="rounded-full border border-bone-dark/70 px-3 py-1.5 text-xs font-medium text-brown hover:bg-cream">+ Add extra</button>
          {pizzaToppings.length > 0 && (
            <button type="button" onClick={() => set("addOns", toppingRows(pizzaToppings))} className="rounded-full border border-bone-dark/70 px-3 py-1.5 text-xs font-medium text-brown hover:bg-cream">
              Use the usual pizza toppings ({pizzaToppings.length})
            </button>
          )}
          {form.addOns.length > 0 && (
            <button type="button" onClick={() => set("addOns", [])} className="rounded-full px-3 py-1.5 text-xs font-medium text-brown-light hover:bg-bone">Remove all</button>
          )}
        </div>
      </fieldset>
      <Field label="Photo" hint="Shown on the menu, product page and banner.">
        <ImageUpload
          value={form.image}
          fallback={form.slug ? `/images/menu/${form.slug}.jpg` : undefined}
          onChange={(url) => set("image", url)}
        />
      </Field>
      <fieldset className="rounded-xl border border-bone-dark/70 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-brown-light">Flags</legend>
        <div className="flex flex-wrap gap-6">
          {([["spicy","Spicy"],["vegetarian","Vegetarian"],["featured","Chef's pick (home banner)"]] as const).map(([f, label]) => (
            <label key={f} className="flex cursor-pointer items-center gap-2 text-sm text-brown">
              <input type="checkbox" checked={form[f] as boolean} onChange={e => set(f, e.target.checked)} className="h-4 w-4 accent-[#3a2418]" />{label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="rounded-full bg-brown px-6 py-2.5 text-sm font-semibold text-cream hover:bg-brown-deep disabled:opacity-50">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create item"}
        </button>
        <button type="button" onClick={() => router.push("/admin/menu")} className="rounded-full border border-bone-dark/70 px-6 py-2.5 text-sm font-medium text-brown-muted hover:bg-bone">Cancel</button>
      </div>
    </form>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-brown-light">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>
      {children}
      {hint && <p className="text-xs text-brown-light/80">{hint}</p>}
    </div>
  );
}
