"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export default function UserRoleToggle({ userId, currentRole, isSelf }: { userId: string; currentRole: string; isSelf: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  if (isSelf) return <span className="text-xs italic text-gray-400">You</span>;

  const toggle = async () => {
    const next = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`${currentRole === "ADMIN" ? "Remove admin from" : "Make"} this user${currentRole === "ADMIN" ? "" : " an admin"}?`)) return;
    setLoading(true);
    await fetch(`${BACKEND}/api/admin/users/${userId}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ role: next }), credentials:"include" });
    router.refresh();
    setLoading(false);
  };

  return (
    <button onClick={toggle} disabled={loading}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${currentRole === "ADMIN" ? "border-red-100 text-red-600 hover:bg-red-50" : "border-amber-200 text-amber-700 hover:bg-amber-50"}`}>
      {loading ? "…" : currentRole === "ADMIN" ? "Remove admin" : "Make admin"}
    </button>
  );
}
