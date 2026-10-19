/**
 * Push a paid website order into ERPNext (kitchen ticket, invoice, payment,
 * stock). Safe to call repeatedly: ERPNext is idempotent on external_order_id
 * and we skip orders that already have an ERP order name.
 */
import { prisma } from "@/lib/prisma";
import { createOnlineOrder, erpConfig, type ErpOrderInput } from "@/lib/erp";
import { getBranches } from "@/lib/branchSettings";
import type { BranchId } from "@/lib/types";

type LineAddOn = { label: string; price: number; itemCode?: string };

export async function pushOrderToErp(orderId: string): Promise<{ ok: boolean; skipped?: string; error?: string }> {
  if (!erpConfig()) return { ok: false, skipped: "ERPNext not configured" };

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { lines: true } });
  if (!order) return { ok: false, error: "Order not found" };
  if (order.erpOrderName) return { ok: true, skipped: "Already in ERPNext" };

  const record = (data: { erpError?: string | null; erpOrderName?: string; erpTicketNo?: number; erpStatus?: string; erpEstReadyAt?: string | null; erpSyncedAt?: Date }) =>
    prisma.order.update({ where: { id: order.id }, data: { ...data, erpAttempts: { increment: 1 } } });

  const branch = (await getBranches())[order.branchId as BranchId];
  if (!branch?.erpPosProfile) {
    const error = `No ERPNext outlet set for ${branch?.name ?? order.branchId}. Add it in Admin → Settings, then retry.`;
    await record({ erpError: error });
    return { ok: false, error };
  }

  // ERPNext has no discount field: spread any promo discount across the
  // line rates so its grand total equals what the customer actually paid.
  const scale = order.subtotal > 0 ? order.total / order.subtotal : 1;
  const rate = (n: number) => Math.round(n * scale * 100) / 100;

  const items: ErpOrderInput["items"] = [];
  const missing: string[] = [];
  for (const line of order.lines) {
    const addOns = (Array.isArray(line.addOns) ? line.addOns : []) as unknown as LineAddOn[];
    const addOnTotal = addOns.reduce((s, a) => s + a.price, 0);
    if (!line.erpItemCode) missing.push(`${line.name} (${line.sizeLabel})`);
    else items.push({ item_code: line.erpItemCode, qty: line.quantity, rate: rate(line.unitPrice - addOnTotal) });
    for (const a of addOns) {
      if (!a.itemCode) missing.push(`${a.label} topping`);
      else items.push({ item_code: a.itemCode, qty: line.quantity, rate: rate(a.price), notes: `Topping for ${line.name}` });
    }
  }
  if (missing.length) {
    const error = `No ERPNext item code for: ${missing.join(", ")}. Run "Sync menu from ERPNext", then retry.`;
    await record({ erpError: error });
    return { ok: false, error };
  }

  try {
    const res = await createOnlineOrder({
      external_order_id: order.id,
      branch: order.branchId,
      fulfillment_type: order.fulfillment === "DELIVERY" ? "Delivery" : "Pickup",
      delivery_fee: 0,
      notes: ["Website order", order.promoCode ? `promo ${order.promoCode} applied` : ""].filter(Boolean).join(" · "),
      customer: {
        name: order.customerName || order.customerEmail || "Website customer",
        phone: order.customerPhone || "",
        email: order.customerEmail || undefined,
        address: order.deliveryAddress || undefined,
      },
      payment: { mode_of_payment: "Paystack", reference_no: order.paystackRef || order.id },
      items,
    }, branch.erpPosProfile);
    const erp = res.orders[0];
    await record({
      erpError: null,
      erpOrderName: erp?.order_name,
      erpTicketNo: erp?.ticket_no,
      erpStatus: erp?.status ?? "Paid",
      erpEstReadyAt: erp?.est_ready_at ?? null,
      erpSyncedAt: new Date(),
    });
    return { ok: true };
  } catch (err) {
    const error = (err as Error).message.slice(0, 500);
    console.error("[erp] push failed", order.id, error);
    await record({ erpError: error });
    return { ok: false, error };
  }
}

/** Retry orders that were paid but haven't reached ERPNext yet. */
export async function retryPendingErpOrders(limit = 20) {
  if (!erpConfig()) return { tried: 0, ok: 0 };
  const pending = await prisma.order.findMany({
    where: { erpOrderName: null, status: { not: "CANCELLED" }, erpAttempts: { lt: 10 } },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true },
  });
  let ok = 0;
  for (const p of pending) if ((await pushOrderToErp(p.id)).ok) ok++;
  return { tried: pending.length, ok };
}
