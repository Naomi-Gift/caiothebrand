"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
const inp = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";

export default function NewCategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [order, setOrder] = useState(99);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleName = (v: string) => {
    setName(v);
    setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    const res = await fetch(`${BACKEND}/api/categories`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, order }), credentials: "include",
    });
    if (!res.ok) { const d = await res.json() as { error?: string }; setError(d.error ?? "Error"); setSaving(false); return; }
    setName(""); setSlug(""); setOrder(99);
    router.refresh(); setSaving(false);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name *</label>
        <input value={name} onChange={e => handleName(e.target.value)} required className={inp} placeholder="e.g. Desserts" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Slug *</label>
        <input value={slug} onChange={e => setSlug(e.target.value)} required pattern="[a-z0-9\-]+" className={inp} placeholder="e.g. desserts" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Display order</label>
        <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className={inp} />
      </div>
      <button type="submit" disabled={saving} className="rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50">
        {saving ? "Adding…" : "Add category"}
      </button>
    </form>
  );
}
