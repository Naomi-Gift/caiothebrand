import Link from "next/link";
import { branchList } from "@/lib/data/branches";
import type { BranchId } from "@/lib/types";

/**
 * All / Lagos / Owerri pills for admin pages. Branch managers don't get a
 * choice — they see a label for their own branch instead.
 */
export default function BranchFilter({
  basePath,
  current,
  locked,
  extraParams = {},
}: {
  basePath: string;
  current: BranchId | null;
  locked: boolean;
  extraParams?: Record<string, string | undefined>;
}) {
  const name = (id: BranchId) => branchList.find((b) => b.id === id)?.name ?? id;
  if (locked && current) {
    return (
      <span className="inline-flex rounded-full bg-bone px-3 py-1 text-xs font-semibold text-brown">
        {name(current)} branch only
      </span>
    );
  }
  const href = (branch: string | null) => {
    const q = new URLSearchParams(Object.entries(extraParams).filter(([, v]) => v) as [string, string][]);
    if (branch) q.set("branch", branch);
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const opts: { id: BranchId | null; label: string }[] = [{ id: null, label: "All branches" }, ...branchList.map((b) => ({ id: b.id, label: b.name }))];
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => (
        <Link
          key={o.label}
          href={href(o.id)}
          className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
            current === o.id ? "border-brown bg-brown text-cream" : "border-bone-dark/70 bg-crisp text-brown-muted hover:bg-cream"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
