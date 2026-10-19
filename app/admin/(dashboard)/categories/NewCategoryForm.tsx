"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inp = "w-full rounded-xl border border-bone-dark/70 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brown/25";

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
    const res = await fetch("/api/categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, order }),
    });
    if (!res.ok) { const d = await res.json() as { error?: string }; setError(d.error ?? "Error"); setSaving(false); return; }
    setName(""); setSlug(""); setOrder(99);
    router.refresh(); setSaving(false);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-bone-dark/70 bg-crisp p-5 shadow-soft">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-brown-light">Name *</label>
        <input value={name} onChange={e => handleName(e.target.value)} required className={inp} placeholder="e.g. Desserts" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-brown-light">Slug *</label>
        <input value={slug} onChange={e => setSlug(e.target.value)} required pattern="[a-z0-9\-]+" className={inp} placeholder="e.g. desserts" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-brown-light">Display order</label>
        <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className={inp} />
      </div>
      <button type="submit" disabled={saving} className="rounded-full bg-brown px-4 py-2.5 text-sm font-semibold text-cream hover:bg-brown-deep disabled:opacity-50">
        {saving ? "Adding…" : "Add category"}
      </button>
    </form>
  );
}
