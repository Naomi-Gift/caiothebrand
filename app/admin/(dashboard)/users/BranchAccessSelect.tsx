"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { branchList } from "@/lib/data/branches";

/** Full admin (all branches) or manager of one branch. */
export default function BranchAccessSelect({ userId, branchId, isSelf }: { userId: string; branchId: string | null; isSelf: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(branchId ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isSelf) return <span className="text-xs text-brown-light">{branchId ? `${branchId} manager` : "All branches"}</span>;

  const change = async (next: string) => {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId: next || null }),
    });
    setBusy(false);
    if (!res.ok) {
      setError(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Couldn't save.");
      return;
    }
    setValue(next);
    router.refresh();
  };

  return (
    <div>
      <select
        value={value}
        disabled={busy}
        onChange={(e) => change(e.target.value)}
        className="rounded-lg border border-bone-dark/70 bg-crisp px-2 py-1.5 text-xs disabled:opacity-50"
        aria-label="Branch access"
      >
        <option value="">All branches (full admin)</option>
        {branchList.map((b) => (
          <option key={b.id} value={b.id}>{b.name} manager only</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
