"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["RECEIVED", "KITCHEN", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number];

const COLORS: Record<Status, string> = {
  RECEIVED:         "bg-blue-100 text-blue-700",
  KITCHEN:          "bg-amber-100 text-amber-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED:        "bg-green-100 text-green-700",
  CANCELLED:        "bg-red-100 text-red-700",
};

export default function OrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState<Status>(current as Status);
  const [saving, setSaving] = useState(false);

  const handleChange = async (next: Status) => {
    if (next === value) return;
    setSaving(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      setValue(next);
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value as Status)}
      disabled={saving}
      className={`rounded-full border-0 px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60 ${COLORS[value]}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
        </option>
      ))}
    </select>
  );
}
