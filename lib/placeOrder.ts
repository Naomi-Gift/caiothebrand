/**
 * Create a paid order. Used by checkout (/api/orders) and by the Paystack
 * webhook (so an order still lands if the customer closes the page after
 * paying). Everything is checked server-side:
 *   prices from the menu DB · promo looked up here · Paystack confirms the
 *   payment (NGN, ≥ total) · one order per payment reference.
 * After saving: WhatsApp alert + push to ERPNext, in the background.
 */
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { branches } from "@/lib/data/branches";
import type { BranchId } from "@/lib/types";
import { priceLines, PricingError, type IncomingLine } from "@/lib/orderPricing";
import { findPromo } from "@/lib/promo";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { sendOrderAlert } from "@/lib/whatsappAlert";
import { pushOrderToErp } from "@/lib/erpPush";

export interface PlaceOrderInput {
  customerEmail: string;
  branchId: unknown;
  fulfillment: unknown;
  lines: IncomingLine[] | undefined;
  promoCode: unknown;
  paystackRef: unknown;
  deliveryAddress: unknown;
  phone: unknown;
}

type Result =
  | { ok: true; order: { id: string; createdAt: Date; total: number } }
  | { ok: false; status: number; error: string };

const fail = (error: string, status: number): Result => ({ ok: false, status, error });

export function cleanPhone(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const digits = v.replace(/[^\d+]/g, "");
  return digits.replace(/\D/g, "").length >= 7 && digits.length <= 16 ? digits : null;
}

export async function placePaidOrder(input: PlaceOrderInput): Promise<Result> {
  const branchId = typeof input.branchId === "string" && input.branchId in branches ? (input.branchId as BranchId) : null;
  const fulfillment = input.fulfillment === "DELIVERY" || input.fulfillment === "PICKUP" ? input.fulfillment : null;
  const paystackRef = typeof input.paystackRef === "string" ? input.paystackRef.trim().slice(0, 100) : "";
  if (!branchId || !fulfillment || !paystackRef) return fail("Missing required fields.", 400);
  if (branches[branchId].comingSoon) {
    return fail(`Caio ${branches[branchId].name} isn't open yet, so we can't take orders there.`, 400);
  }
  const phone = cleanPhone(input.phone);
  if (!phone) return fail("Please add a phone number so the branch can reach you.", 400);

  const deliveryAddress =
    fulfillment === "DELIVERY" && typeof input.deliveryAddress === "string"
      ? input.deliveryAddress.trim().slice(0, 300) || null
      : null;

  // A payment reference only ever creates one order (safe to retry).
  const existing = await prisma.order.findUnique({ where: { paystackRef }, select: { id: true, createdAt: true, total: true } });
  if (existing) return { ok: true, order: existing };

  let priced: Awaited<ReturnType<typeof priceLines>>;
  try {
    priced = await priceLines(input.lines ?? []);
  } catch (err) {
    if (err instanceof PricingError) return fail(err.message, 400);
    throw err;
  }

  const promo = await findPromo(typeof input.promoCode === "string" ? input.promoCode : null);
  const discount = promo ? Math.round(priced.subtotal * promo.rate) : 0;
  const total = priced.subtotal - discount;

  const payment = await verifyPaystackTransaction(paystackRef);
  if (!payment.ok) return fail(payment.error, payment.status);
  if (payment.currency !== "NGN" || payment.amountKobo < Math.round(total * 100)) {
    console.error("[orders] amount mismatch", { paystackRef, paid: payment.amountKobo, expected: Math.round(total * 100) });
    return fail(
      `We received your payment (reference ${paystackRef}) but the amount doesn't match your order. Please contact the branch.`,
      409
    );
  }

  const email = input.customerEmail.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, phone: true } });

  let order: { id: string; createdAt: Date; total: number; customerName: string | null };
  try {
    order = await prisma.order.create({
      data: {
        branchId,
        fulfillment,
        subtotal: priced.subtotal,
        discount,
        total,
        promoCode: promo?.code ?? null,
        paystackRef,
        deliveryAddress,
        customerEmail: email,
        customerName: user?.name ?? null,
        customerPhone: phone,
        userId: user?.id ?? null,
        lines: {
          create: priced.lines.map((l) => ({
            name: l.name,
            descriptor: l.descriptor,
            sizeLabel: l.sizeLabel,
            erpItemCode: l.erpItemCode,
            addOns: l.addOns,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            menuItem: { connect: { id: l.menuItemId } },
          })),
        },
      },
      select: { id: true, createdAt: true, total: true, customerName: true },
    });
  } catch (err) {
    // Two requests for the same payment at once (checkout + webhook): return the one that won.
    const again = await prisma.order.findUnique({ where: { paystackRef }, select: { id: true, createdAt: true, total: true } });
    if (again) return { ok: true, order: again };
    console.error("[orders] create error", err);
    return fail(`Your payment went through (reference ${paystackRef}) but we couldn't save the order. Please contact the branch.`, 500);
  }

  if (user && !user.phone) {
    await prisma.user.update({ where: { id: user.id }, data: { phone } }).catch(() => {});
  }

  // After the response: kitchen (ERPNext) first, then the WhatsApp alert.
  after(async () => {
    await pushOrderToErp(order.id);
    await sendOrderAlert(branchId, {
      id: order.id,
      branchName: branches[branchId].name,
      fulfillment: fulfillment === "DELIVERY" ? "delivery" : "pickup",
      lines: priced.lines.map((l) => ({ quantity: l.quantity, name: l.name, sizeLabel: l.sizeLabel, addOns: l.addOns.map((a) => a.label) })),
      total,
      deliveryAddress,
      customerName: order.customerName,
    });
  });

  return { ok: true, order: { id: order.id, createdAt: order.createdAt, total: order.total } };
}
