/**
 * Typed API client — all calls go to BACKEND_URL.
 * Use server-side only (in Server Components / Route Handlers).
 */

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Category { id: string; name: string; slug: string; order: number; }

export interface AdminMenuItem {
  id: string; slug: string; name: string; descriptor: string | null;
  description: string | null; basePrice: number; image: string | null;
  available: boolean; soldOut: boolean; featured: boolean;
  spicy: boolean; vegetarian: boolean;
  sizes: unknown; addOns: unknown;
  category: { slug: string; name: string };
}

export interface AdminOrder {
  id: string; branchId: string; fulfillment: string; status: string;
  subtotal: number; discount: number; total: number;
  promoCode: string | null; paystackRef: string | null;
  deliveryAddress: string | null; customerEmail: string | null; customerName: string | null;
  createdAt: string;
  lines: Array<{ id: string; name: string; sizeLabel: string; quantity: number; unitPrice: number }>;
  user: { name: string | null; email: string | null } | null;
}

export interface AdminUser {
  id: string; name: string | null; email: string | null;
  role: string; _count: { orders: number };
}

// ── Menu ──────────────────────────────────────────────────────────────────

export const getMenuItems    = ()       => req<AdminMenuItem[]>("/api/menu");
export const getMenuItem     = (id: string) => req<AdminMenuItem>(`/api/menu/${id}`);
export const createMenuItem  = (data: unknown) => req<AdminMenuItem>("/api/menu", { method: "POST", body: JSON.stringify(data) });
export const updateMenuItem  = (id: string, data: unknown) => req<AdminMenuItem>(`/api/menu/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteMenuItem  = (id: string) => req<{ ok: boolean }>(`/api/menu/${id}`, { method: "DELETE" });
export const getCategories   = ()       => req<Category[]>("/api/categories");

// ── Orders ────────────────────────────────────────────────────────────────

export const getOrders       = (status?: string) => req<AdminOrder[]>(`/api/orders${status && status !== "ALL" ? `?status=${status}` : ""}`);
export const updateOrder     = (id: string, status: string) => req<AdminOrder>(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });

// ── Users ─────────────────────────────────────────────────────────────────

export const getUsers        = ()       => req<AdminUser[]>("/api/admin/users");
export const updateUserRole  = (id: string, role: string) => req<AdminUser>(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ role }) });

// ── Analytics ─────────────────────────────────────────────────────────────

export interface AnalyticsData {
  totalRevenue: number;
  totalDiscount: number;
  totalOrders: number;
  byStatus: Record<string, number>;
  daily: Array<{ date: string; revenue: number }>;
  bestsellers: Array<{ name: string; qty: number; revenue: number }>;
}

export const getAnalytics = () => req<AnalyticsData>("/api/analytics");

// ── Settings ──────────────────────────────────────────────────────────────

export const getSettings    = ()                                    => req<Record<string,string>>("/api/settings");
export const saveSettings   = (pairs: Array<{key:string;value:string}>) => req<{ok:boolean}>("/api/settings", { method: "POST", body: JSON.stringify(pairs) });
