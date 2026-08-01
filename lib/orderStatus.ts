import type { FulfillmentMode, OrderRecord } from "@/lib/types";

const STAGES: { key: OrderRecord["status"]; label: string; afterMinutes: number }[] = [
  { key: "received", label: "Received", afterMinutes: 0 },
  { key: "kitchen", label: "In the kitchen", afterMinutes: 1 },
  { key: "out-for-delivery", label: "Out for delivery", afterMinutes: 5 },
  { key: "delivered", label: "Delivered", afterMinutes: 15 },
];

const PICKUP_LABELS: Record<OrderRecord["status"], string> = {
  received: "Received",
  kitchen: "In the kitchen",
  "out-for-delivery": "Ready for pickup",
  delivered: "Picked up",
};

export function deriveOrderStatus(order: OrderRecord) {
  const elapsedMinutes =
    (Date.now() - new Date(order.createdAt).getTime()) / 60000;

  let current = STAGES[0];
  for (const stage of STAGES) {
    if (elapsedMinutes >= stage.afterMinutes) current = stage;
  }

  const label: (mode: FulfillmentMode) => string = (mode) =>
    mode === "pickup" ? PICKUP_LABELS[current.key] : current.label;

  return {
    status: current.key,
    label: label(order.fulfillment),
    stages: STAGES,
  };
}
