"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Report {
  dryRun: boolean;
  outlet: string;
  changes: { item: string; what: string }[];
  added: string[];
  unmatchedErp: string[];
  unmatchedSite: string[];
  toppings: number;
  error?: string;
}

/** Pull prices, sizes and item codes from ERPNext: preview first, then apply. */
export default function ErpSyncPanel() {
  const router = useRouter();
  const [busy, setBusy] = useState<"preview" | "apply" | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (dryRun: boolean) => {
    setBusy(dryRun ? "preview" : "apply");
    setError(null);
    const res = await fetch("/api/admin/erp/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dryRun }),
    });
    const data = (await res.json().catch(() => ({}))) as Report;
    setBusy(null);
    if (!res.ok) return setError(data.error ?? "Sync failed.");
    setReport(data);
    if (!dryRun) router.refresh();
  };

  return (
    <div className="mt-6 rounded-2xl border border-bone-dark/70 bg-crisp p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-brown-darkest">Prices from ERPNext</h2>
          <p className="text-sm text-brown-light">
            Prices, sizes and toppings come from ERPNext. Photos, descriptions and featured picks stay here.
            Runs automatically every 15 minutes. New ERPNext products are added <b>hidden</b> — add a photo, then press Show.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => run(true)} disabled={!!busy}
            className="rounded-full border border-bone-dark/70 px-4 py-2 text-sm font-medium text-brown hover:bg-cream disabled:opacity-50">
            {busy === "preview" ? "Checking…" : "Preview changes"}
          </button>
          <button type="button" onClick={() => run(false)} disabled={!!busy || !report?.dryRun}
            className="rounded-full bg-brown px-4 py-2 text-sm font-semibold text-cream hover:bg-brown-deep disabled:opacity-40"
            title={report?.dryRun ? "" : "Preview first"}>
            {busy === "apply" ? "Syncing…" : "Apply sync"}
          </button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {report && (
        <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
          <div>
            <p className="font-semibold text-brown-darkest">
              {report.dryRun ? "Would update" : "Updated"} ({report.changes.length})
            </p>
            <p className="text-xs text-brown-light/80">{report.outlet} · {report.toppings} toppings</p>
            <ul className="mt-2 max-h-56 space-y-1 overflow-auto text-brown-muted">
              {report.changes.length === 0 && <li>Everything already matches.</li>}
              {report.changes.map((c) => (
                <li key={c.item}><span className="font-medium text-brown-darkest">{c.item}</span> — {c.what}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-brown-darkest">
              New from ERPNext ({report.added.length + report.unmatchedErp.length})
            </p>
            <p className="text-xs text-brown-light/80">
              {report.dryRun ? "Will be added" : "Added"} hidden. If one is really an existing product with a slightly different name, rename that product to match ERPNext and delete the new copy.
            </p>
            <ul className="mt-2 max-h-56 space-y-1 overflow-auto text-brown-muted">
              {report.added.map((n) => <li key={n}>{n}</li>)}
              {report.unmatchedErp.map((n) => <li key={n} className="text-red-700">{n} — couldn&apos;t add</li>)}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-brown-darkest">On the website, not in ERPNext ({report.unmatchedSite.length})</p>
            <p className="text-xs text-brown-light/80">These can&apos;t be sent to the kitchen — rename to match ERPNext or hide them.</p>
            <ul className="mt-2 max-h-56 space-y-1 overflow-auto text-brown-muted">
              {report.unmatchedSite.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
