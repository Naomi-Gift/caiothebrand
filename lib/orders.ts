import type { OrderRecord } from "@/lib/types";

const ORDERS_KEY = "caio-orders";

export function getOrders(): OrderRecord[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(ORDERS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as OrderRecord[];
  } catch {
    return [];
  }
}

export function saveOrder(order: OrderRecord) {
  const orders = getOrders();
  orders.unshift(order);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}
