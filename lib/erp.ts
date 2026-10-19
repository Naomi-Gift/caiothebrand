/**
 * Cudrock Group ERPNext client (server-only).
 *
 * Configured entirely by environment variables — never put the token in code:
 *   ERP_BASE_URL        e.g. https://crg.byoosi.com
 *   ERP_API_KEY         API key
 *   ERP_API_SECRET      API secret
 *   ERP_POS_PROFILE     outlet, default "POS-CAIO"
 *   CRG_WEBHOOK_SECRET  HMAC secret for ERPNext → website status webhooks
 *
 * Everything here is a no-op ({ configured: false }) until those are set.
 */
import crypto from "node:crypto";

const METHOD = "/api/method/crg_app.crg_app.website_api";

export function erpConfig() {
  const base = process.env.ERP_BASE_URL?.replace(/\/+$/, "");
  const key = process.env.ERP_API_KEY;
  const secret = process.env.ERP_API_SECRET;
  if (!base || !key || !secret) return null;
  return { base, auth: `token ${key}:${secret}`, posProfile: process.env.ERP_POS_PROFILE || "POS-CAIO" };
}

export class ErpError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cfg = erpConfig();
  if (!cfg) throw new ErpError("ERPNext is not configured.");
  let res: Response;
  try {
    res = await fetch(`${cfg.base}${METHOD}.${path}`, {
      ...init,
      headers: { Authorization: cfg.auth, Accept: "application/json", "Content-Type": "application/json", ...init.headers },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err) {
    throw new ErpError(`Couldn't reach ERPNext: ${(err as Error).message}`);
  }
  const body = (await res.json().catch(() => null)) as { message?: T; exception?: string; exc_type?: string; _server_messages?: string } | null;
  if (!res.ok || !body || body.message === undefined) {
    const detail = body?.exception || body?.exc_type || body?._server_messages || `HTTP ${res.status}`;
    throw new ErpError(`ERPNext error: ${String(detail).slice(0, 300)}`, res.status);
  }
  return body.message;
}

// ── Catalog ────────────────────────────────────────────────────────────────────

export interface ErpPizzaSize {
  item_code: string;
  size_inches: number;
  size_label: string;
  rate: number;
}

export interface ErpItem {
  item_code: string;
  item_name: string;
  item_group: string;
  rate: number;
  image: string | null;
  prep_minutes?: number;
  pizza_family?: string | null;
  pizza_family_name?: string | null;
  size_inches?: number | null;
  size_label?: string | null;
}

export interface ErpOutlet {
  pos_profile: string;
  brand: string;
  branch: string;
  location: string;
  currency: string;
  item_groups: string[];
  pizza_families: { pizza_family: string; pizza_family_name: string; sizes: ErpPizzaSize[] }[];
  items: ErpItem[];
}

export async function getCatalog(): Promise<ErpOutlet | null> {
  const cfg = erpConfig();
  if (!cfg) throw new ErpError("ERPNext is not configured.");
  const data = await call<{ outlets: ErpOutlet[] }>(`get_catalog?pos_profile=${encodeURIComponent(cfg.posProfile)}`);
  return data.outlets.find((o) => o.pos_profile === cfg.posProfile) ?? data.outlets[0] ?? null;
}

// ── Orders ─────────────────────────────────────────────────────────────────────

export interface ErpOrderInput {
  external_order_id: string;
  branch: string;
  fulfillment_type: "Delivery" | "Pickup";
  delivery_fee: number;
  notes?: string;
  customer: { name: string; phone: string; email?: string; address?: string };
  payment: { mode_of_payment: "Paystack"; reference_no: string };
  items: { item_code: string; qty: number; rate: number; notes?: string }[];
}

export interface ErpOrderResult {
  order_name: string;
  ticket_no: number;
  status: string;
  grand_total: number;
  est_ready_at?: string | null;
}

export async function createOnlineOrder(input: ErpOrderInput) {
  const cfg = erpConfig();
  if (!cfg) throw new ErpError("ERPNext is not configured.");
  // Idempotent on external_order_id: a retry returns status "already_exists".
  return call<{ status: "created" | "already_exists"; orders: ErpOrderResult[] }>("create_online_order", {
    method: "POST",
    body: JSON.stringify({ ...input, pos_profile: cfg.posProfile }),
  });
}

export async function getOrderStatus(externalOrderId: string) {
  return call<{ orders: (ErpOrderResult & { accepted_at?: string | null; ready_at?: string | null; served_at?: string | null })[] }>(
    `get_order_status?external_order_id=${encodeURIComponent(externalOrderId)}`
  );
}

// ── Webhooks (ERPNext → website) ───────────────────────────────────────────────

export function verifyErpSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.CRG_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(signature.trim(), "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** ERPNext kitchen stages, in order. */
export const ERP_STAGES = ["Paid", "Accepted", "Preparing", "Ready", "Served"] as const;
