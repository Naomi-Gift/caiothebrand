/** Plain-text order summary shared by the WhatsApp button and the WhatsApp alert. */
import { formatNaira } from "@/lib/format";

export interface OrderSummaryInput {
  id: string;
  branchName: string;
  fulfillment: "delivery" | "pickup";
  lines: { quantity: number; name: string; sizeLabel: string; addOns?: string[] }[];
  total: number;
  deliveryAddress?: string | null;
  customerName?: string | null;
}

export function orderSummaryLines(o: OrderSummaryInput): string[] {
  return [
    ...o.lines.map(
      (l) => `• ${l.quantity}× ${l.name} (${l.sizeLabel})${l.addOns?.length ? ` + ${l.addOns.join(", ")}` : ""}`
    ),
    `Total paid: ${formatNaira(o.total)}`,
    o.fulfillment === "delivery" ? `Delivery to: ${o.deliveryAddress || "address not given"}` : "Pickup at the branch",
  ];
}

export function orderMessage(o: OrderSummaryInput): string {
  return [
    `Hi Caio ${o.branchName}! I just placed an order online.`,
    `Order ref: ${o.id}`,
    ...(o.customerName ? [`Name: ${o.customerName}`] : []),
    "",
    ...orderSummaryLines(o),
  ].join("\n");
}
