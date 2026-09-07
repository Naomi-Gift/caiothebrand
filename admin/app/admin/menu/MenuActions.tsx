"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export default function MenuActions({ id, soldOut, available }: { id: string; soldOut: boolean; available: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const patch = async (data: object) => {
    setLoading(true);
    await fetch(`${BACKEND}/api/menu/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
    router.refresh();
    setLoading(false);
  };

  const del = async () => {
    if (!confirm("Delete this item permanently?")) return;
    setLoading(true);
    await fetch(`${BACKEND}/api/menu/${id}`, { method: "DELETE", credentials: "include" });
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button onClick={() => patch({ soldOut: !soldOut })} disabled={loading} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40">
        {soldOut ? "Mark available" : "Sold out"}
      </button>
      <button onClick={() => patch({ available: !available })} disabled={loading} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40">
        {available ? "Hide" : "Show"}
      </button>
      <Link href={`/admin/menu/${id}/edit`} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50">Edit</Link>
      <button onClick={del} disabled={loading} className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40">Delete</button>
    </div>
  );
}
