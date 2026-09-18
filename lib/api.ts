import { prisma } from "@/lib/prisma";

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface AdminMenuItem {
  id: string;
  slug: string;
  name: string;
  descriptor: string | null;
  description: string | null;
  basePrice: number;
  image: string | null;
  available: boolean;
  soldOut: boolean;
  featured: boolean;
  spicy: boolean;
  vegetarian: boolean;
  sizes: unknown;
  addOns: unknown;
  category: { slug: string; name: string };
}

export interface AdminOrder {
  id: string;
  branchId: string;
  fulfillment: string;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string | null;
  paystackRef: string | null;
  deliveryAddress: string | null;
  customerEmail: string | null;
  customerName: string | null;
  createdAt: string;
  lines: Array<{ id: string; name: string; sizeLabel: string; quantity: number; unitPrice: number }>;
  user: { name: string | null; email: string | null } | null;
}

export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  _count: { orders: number };
}

export interface AnalyticsData {
  totalRevenue: number;
  totalDiscount: number;
  totalOrders: number;
  byStatus: Record<string, number>;
  daily: Array<{ date: string; revenue: number }>;
  bestsellers: Array<{ name: string; qty: number; revenue: number }>;
}

// ── Menu ──────────────────────────────────────────────────────────────────

export async function getMenuItems(): Promise<AdminMenuItem[]> {
  const items = await prisma.menuItem.findMany({
    include: { category: { select: { slug: true, name: true } } },
    orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
  });
  return items as unknown as AdminMenuItem[];
}

export async function getMenuItem(id: string): Promise<AdminMenuItem> {
  const item = await prisma.menuItem.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { category: { select: { slug: true, name: true } } },
  });
  if (!item) throw new Error("Not found");
  return item as unknown as AdminMenuItem;
}

export async function createMenuItem(data: unknown): Promise<AdminMenuItem> {
  const res = await fetch("/api/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create menu item");
  return res.json();
}

export async function updateMenuItem(id: string, data: unknown): Promise<AdminMenuItem> {
  const res = await fetch(`/api/menu/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update menu item");
  return res.json();
}

export async function deleteMenuItem(id: string): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete menu item");
  return res.json();
}

export async function getCategories(): Promise<Category[]> {
  const cats = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return cats;
}

// ── Orders ────────────────────────────────────────────────────────────────

export async function getOrders(status?: string): Promise<AdminOrder[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status && status !== "ALL") {
    where.status = status;
  }
  const orders = await prisma.order.findMany({
    where,
    include: {
      lines: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  })) as unknown as AdminOrder[];
}

export async function updateOrder(id: string, status: string): Promise<AdminOrder> {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update order");
  return res.json();
}

// ── Users ─────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<AdminUser[]> {
  const users = await prisma.user.findMany({
    orderBy: { role: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: { select: { orders: true } },
    },
  });
  return users as unknown as AdminUser[];
}

export async function updateUserRole(id: string, role: string): Promise<AdminUser> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("Failed to update user role");
  return res.json();
}

// ── Analytics ─────────────────────────────────────────────────────────────

export async function getAnalytics(): Promise<AnalyticsData> {
  const [orders, lines] = await Promise.all([
    prisma.order.findMany({
      select: { status: true, total: true, discount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.orderLine.findMany({
      select: { name: true, quantity: true, unitPrice: true },
    }),
  ]);

  const paid = orders.filter((o) => o.status !== "CANCELLED");
  const totalRevenue = paid.reduce((s, o) => s + o.total, 0);
  const totalDiscount = paid.reduce((s, o) => s + o.discount, 0);
  const totalOrders = orders.length;

  const byStatus: Record<string, number> = {};
  for (const o of orders) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;

  const now = new Date();
  const since = new Date(now);
  since.setDate(since.getDate() - 29);

  const dailyMap: Record<string, number> = {};
  for (let d = new Date(since); d <= now; d.setDate(d.getDate() + 1)) {
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const o of paid) {
    const day = new Date(o.createdAt).toISOString().slice(0, 10);
    if (day in dailyMap) dailyMap[day] += o.total;
  }
  const daily = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue }));

  const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const l of lines) {
    if (!itemMap[l.name]) itemMap[l.name] = { name: l.name, qty: 0, revenue: 0 };
    itemMap[l.name].qty += l.quantity;
    itemMap[l.name].revenue += l.quantity * l.unitPrice;
  }
  const bestsellers = Object.values(itemMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  return { totalRevenue, totalDiscount, totalOrders, byStatus, daily, bestsellers };
}

// ── Settings ──────────────────────────────────────────────────────────────

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export async function saveSettings(pairs: Array<{ key: string; value: string }>): Promise<{ ok: boolean }> {
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pairs),
  });
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
}
