import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { branches } from "@/lib/data/branches";
import { formatNaira } from "@/lib/format";
import { InfoCard, InfoHero, InfoShell } from "@/components/InfoPage";
import type { BranchId } from "@/lib/types";

export const metadata: Metadata = { title: "Order status — Caio Pizza", robots: { index: false } };
export const dynamic = "force-dynamic";

const STAGES = ["RECEIVED", "KITCHEN", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

function stageLabel(stage: string, pickup: boolean) {
  switch (stage) {
    case "RECEIVED": return "Received";
    case "KITCHEN": return "In the kitchen";
    case "OUT_FOR_DELIVERY": return pickup ? "Ready for pickup" : "Out for delivery";
    case "DELIVERED": return pickup ? "Picked up" : "Delivered";
    default: return "Cancelled";
  }
}

async function findOrder(ref: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: ref }, { paystackRef: ref }] },
      // Public page: status and items only — no customer details.
      select: {
        id: true, status: true, fulfillment: true, branchId: true, total: true, createdAt: true,
        lines: { select: { id: true, name: true, sizeLabel: true, quantity: true } },
      },
    });
    return { order, error: false };
  } catch (err) {
    console.error("[track] lookup failed", err);
    return { order: null, error: true };
  }
}

export default async function TrackOrderPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const decoded = decodeURIComponent(ref).slice(0, 60);
  const { order, error } = await findOrder(decoded);

  if (!order) {
    return (
      <InfoShell>
        <InfoHero
          kicker="Order tracking"
          title={error ? "We can't check" : "Order not"}
          titleEm={error ? "right now." : "found."}
          intro={
            error
              ? "Order tracking is having a moment. Please try again shortly, or contact your branch."
              : `We couldn't find an order with the reference "${decoded}". Check it against your confirmation and try again.`
          }
          actions={[{ href: "/track", label: "Try again" }, { href: "/contact", label: "Contact us" }]}
        />
      </InfoShell>
    );
  }

  const pickup = order.fulfillment === "PICKUP";
  const branch = branches[order.branchId as BranchId];
  const cancelled = order.status === "CANCELLED";
  const current = STAGES.indexOf(order.status as (typeof STAGES)[number]);

  return (
    <InfoShell>
      <InfoHero
        kicker={`Order ${order.id}`}
        title={cancelled ? "This order was" : "Order"}
        titleEm={cancelled ? "cancelled." : `${stageLabel(order.status, pickup).toLowerCase()}.`}
        intro={`${pickup ? "Pickup" : "Delivery"}${branch ? ` · ${branch.name}` : ""} · placed ${order.createdAt.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}`}
        actions={[{ href: "/#menu", label: "Order again" }, { href: "/contact", label: "Contact the branch" }]}
      />

      {!cancelled && (
        <InfoCard title="Progress">
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STAGES.map((s, i) => (
              <li
                key={s}
                className={`rounded-2xl border px-4 py-3 text-[0.9rem] ${
                  i <= current ? "border-brown bg-brown text-cream" : "border-bone-dark bg-cream text-brown-light"
                }`}
              >
                <span className="block font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] opacity-70">
                  Step {i + 1}
                </span>
                {stageLabel(s, pickup)}
              </li>
            ))}
          </ol>
        </InfoCard>
      )}

      <InfoCard title="Your order">
        <ul className="flex flex-col gap-2">
          {order.lines.map((l) => (
            <li key={l.id} className="flex justify-between gap-4">
              <span>{l.quantity}× {l.name} <span className="text-brown-light">({l.sizeLabel})</span></span>
            </li>
          ))}
        </ul>
        <p className="border-t border-bone pt-4 font-display text-xl font-bold text-brown-darkest">
          Total {formatNaira(order.total)}
        </p>
        <p className="text-[0.9rem]">
          Questions about this order? <Link href="/contact" className="underline">Contact {branch?.name ?? "us"}</Link>.
        </p>
      </InfoCard>
    </InfoShell>
  );
}
