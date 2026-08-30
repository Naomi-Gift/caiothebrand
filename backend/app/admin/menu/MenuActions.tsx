"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface Props {
  item: { id: string; soldOut: boolean; available: boolean };
}

export default function MenuActions({ item }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const patch = async (data: Record<string, unknown>) => {
    setLoading(true);
    await fetch(`/api/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/menu/${item.id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => patch({ soldOut: !item.soldOut })}
        disabled={loading}
        className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
      >
        {item.soldOut ? "Mark available" : "Sold out"}
      </button>
      <button
        onClick={() => patch({ available: !item.available })}
        disabled={loading}
        className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
      >
        {item.available ? "Hide" : "Show"}
      </button>
      <Link
        href={`/admin/menu/${item.id}/edit`}
        className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
      >
        Edit
      </Link>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
      >
        Delete
      </button>
    </div>
  );
}
