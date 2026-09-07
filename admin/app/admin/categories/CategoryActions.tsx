"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export default function CategoryActions({ id, name, order }: { id: string; name: string; order: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [newOrder, setNewOrder] = useState(order);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    await fetch(`${BACKEND}/api/categories/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, order: newOrder }), credentials: "include",
    });
    setEditing(false); router.refresh(); setLoading(false);
  };

  const del = async () => {
    if (!confirm(`Delete "${name}"? This will fail if any menu items use it.`)) return;
    setLoading(true);
    const res = await fetch(`${BACKEND}/api/categories/${id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) { const d = await res.json() as { error?: string }; alert(d.error ?? "Error"); }
    router.refresh(); setLoading(false);
  };

  if (editing) {
    return (
      <div className="flex items-center justify-end gap-2">
        <input value={newName} onChange={e => setNewName(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1 text-sm w-28" />
        <input type="number" value={newOrder} onChange={e => setNewOrder(Number(e.target.value))} className="rounded-lg border border-gray-200 px-2 py-1 text-sm w-16" />
        <button onClick={save} disabled={loading} className="rounded-lg bg-amber-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-amber-800 disabled:opacity-40">Save</button>
        <button onClick={() => setEditing(false)} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button onClick={() => setEditing(true)} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50">Rename</button>
      <button onClick={del} disabled={loading} className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40">Delete</button>
    </div>
  );
}
