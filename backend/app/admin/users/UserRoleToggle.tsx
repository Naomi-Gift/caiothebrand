"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserRoleToggle({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string;
  currentRole: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (isSelf) {
    return <span className="text-xs text-gray-400 italic">You</span>;
  }

  const isAdmin = currentRole === "ADMIN";

  const toggle = async () => {
    const next = isAdmin ? "USER" : "ADMIN";
    if (!confirm(`${isAdmin ? "Remove admin role from" : "Make"} this user ${isAdmin ? "" : "an admin"}?`)) return;
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
        isAdmin
          ? "border-red-100 text-red-600 hover:bg-red-50"
          : "border-amber-200 text-amber-700 hover:bg-amber-50"
      }`}
    >
      {loading ? "…" : isAdmin ? "Remove admin" : "Make admin"}
    </button>
  );
}
