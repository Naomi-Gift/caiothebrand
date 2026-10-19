/**
 * POST /api/erp/webhook — ERPNext "order.status_updated" events, signed with
 * HMAC-SHA256 (X-CRG-Signature) using CRG_WEBHOOK_SECRET.
 * Give Cudrock Group this URL: https://www.caiopizza.com/api/erp/webhook
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyErpSignature } from "@/lib/erp";

const TO_SITE_STATUS = {
  Paid: "RECEIVED",
  Accepted: "KITCHEN",
  Preparing: "KITCHEN",
  Ready: "OUT_FOR_DELIVERY",
  Served: "DELIVERED",
  Cancelled: "CANCELLED",
} as const;

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyErpSignature(raw, req.headers.get("x-crg-signature"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const body = JSON.parse(raw) as {
    event?: string;
    external_order_id?: string;
    order_name?: string;
    ticket_no?: number;
    status?: keyof typeof TO_SITE_STATUS;
    est_ready_at?: string | null;
  };
  if (body.event !== "order.status_updated" || !body.external_order_id || !body.status) {
    return NextResponse.json({ ok: true });
  }

  const updated = await prisma.order.updateMany({
    where: { id: body.external_order_id },
    data: {
      erpStatus: body.status,
      ...(body.order_name ? { erpOrderName: body.order_name } : {}),
      ...(typeof body.ticket_no === "number" ? { erpTicketNo: body.ticket_no } : {}),
      ...(body.est_ready_at ? { erpEstReadyAt: body.est_ready_at } : {}),
      ...(TO_SITE_STATUS[body.status] ? { status: TO_SITE_STATUS[body.status] } : {}),
    },
  });
  return NextResponse.json({ ok: true, matched: updated.count });
}
