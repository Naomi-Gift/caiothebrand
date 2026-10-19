"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** ERPNext ticket/status for an order, with a retry when it didn't get through. */
export default function ErpCell({
  orderId,
  ticketNo,
  status,
  error,
}: {
  orderId: string;
  ticketNo: number | null;
  status: string | null;
  error: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (ticketNo || status) {
    return (
      <div className="text-xs">
        {ticketNo && <div className="font-semibold text-gray-800">Ticket #{ticketNo}</div>}
        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800">{status ?? "Paid"}</span>
      </div>
    );
  }

  const retry = async () => {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/erp/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; skipped?: string };
    setBusy(false);
    if (res.ok) router.refresh();
    else setMsg(data.error ?? data.skipped ?? "Failed");
  };

  if (!error) return <span className="text-xs text-gray-400">Not sent</span>;
  return (
    <div className="max-w-[180px] text-xs">
      <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700" title={error}>
        Not in ERPNext
      </span>
      <button type="button" onClick={retry} disabled={busy} className="ml-2 underline disabled:opacity-50">
        {busy ? "Retrying…" : "Retry"}
      </button>
      <p className="mt-1 line-clamp-2 text-gray-500" title={msg ?? error}>{msg ?? error}</p>
    </div>
  );
}
