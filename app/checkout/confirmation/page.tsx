"use client";

import { useEffect, useState } from "react";
import { getOrders } from "@/lib/orders";
import { formatNaira } from "@/lib/format";
import Button from "@/components/Button";
import Reveal from "@/components/Reveal";
import type { OrderRecord } from "@/lib/types";

const LAST_ORDER_KEY = "caio-last-order-id";

export default function ConfirmationPage() {
  const [order, setOrder] = useState<OrderRecord | null | undefined>(
    undefined
  );

  useEffect(() => {
    const id = window.localStorage.getItem(LAST_ORDER_KEY);
    const orders = getOrders();
    // Hydrating from localStorage on mount — server has no access to it,
    // so this can't be a lazy useState initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(orders.find((o) => o.id === id) ?? null);
  }, []);

  if (order === undefined) return null;

  if (order === null) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-black italic text-brown">
          No recent order found
        </h1>
        <Button href="/menu" className="mt-8">
          Browse the menu
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <Reveal>
        <p className="label-uppercase inline-block rounded-full bg-bone px-3 py-1 text-xs text-brown-light">
          Order {order.id}
        </p>
        <h1 className="mt-4 font-display text-5xl font-black italic leading-[0.95] text-brown sm:text-6xl">
          Thanks for coming. Caio for now.
        </h1>
        <p className="mt-4 text-sm text-brown-light">
          {order.fulfillment === "delivery"
            ? "We're firing up your order for delivery."
            : "We're firing up your order — see you at pickup."}
        </p>
      </Reveal>

      <div className="mt-10 rounded-2xl bg-crisp p-6 text-left shadow-soft">
        <ul className="flex flex-col gap-2 text-sm text-brown-light">
          {order.lines.map((line) => (
            <li key={line.lineId} className="flex justify-between">
              <span>
                {line.quantity}× {line.name} ({line.size.label})
              </span>
              <span>{formatNaira(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-bone pt-4 font-display text-xl font-black text-brown">
          <span>Total paid</span>
          <span>{formatNaira(order.total)}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/account">Track order</Button>
        <Button href="/menu" variant="outline">
          Order again
        </Button>
      </div>
    </div>
  );
}
