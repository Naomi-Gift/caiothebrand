/**
 * Server-side pricing: recompute every line from the menu in the database,
 * never from prices the browser sent.
 */
import { prisma } from "@/lib/prisma";
import type { AddOnOption, SizeOption } from "@/lib/types";

export interface IncomingLine {
  itemId?: string;
  size?: { id?: string; label?: string };
  addOns?: { id?: string; label?: string }[];
  quantity?: number;
}

export interface PricedLine {
  menuItemId: string;
  name: string;
  descriptor: string | null;
  sizeLabel: string;
  addOns: { label: string; price: number }[];
  quantity: number;
  unitPrice: number;
}

export class PricingError extends Error {}

export async function priceLines(lines: IncomingLine[]): Promise<{ lines: PricedLine[]; subtotal: number }> {
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 50) {
    throw new PricingError("Your cart is empty.");
  }
  const keys = [...new Set(lines.map((l) => String(l.itemId ?? "")).filter(Boolean))];
  // Cart lines carry the DB id, or the slug for items added from the static menu.
  const items = await prisma.menuItem.findMany({
    where: { OR: [{ id: { in: keys } }, { slug: { in: keys } }] },
  });
  const byKey = new Map<string, (typeof items)[number]>();
  for (const it of items) {
    byKey.set(it.id, it);
    byKey.set(it.slug, it);
  }

  const priced: PricedLine[] = lines.map((l) => {
    const item = byKey.get(String(l.itemId ?? ""));
    if (!item) throw new PricingError("Something in your cart is no longer on the menu.");
    if (!item.available || item.soldOut) throw new PricingError(`${item.name} is sold out right now.`);

    const quantity = Number(l.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      throw new PricingError("Please check the quantities in your cart.");
    }

    const sizes = (Array.isArray(item.sizes) ? item.sizes : []) as unknown as SizeOption[];
    const size =
      sizes.find((s) => s.id === l.size?.id) ??
      sizes.find((s) => s.label === l.size?.label) ??
      (sizes.length <= 1 ? sizes[0] : undefined);
    if (sizes.length > 1 && !size) throw new PricingError(`Please pick a size for ${item.name}.`);

    const menuAddOns = (Array.isArray(item.addOns) ? item.addOns : []) as unknown as AddOnOption[];
    const addOns = (l.addOns ?? []).map((a) => {
      const match = menuAddOns.find((m) => m.id === a.id) ?? menuAddOns.find((m) => m.label === a.label);
      if (!match) throw new PricingError(`A topping on ${item.name} is no longer available.`);
      return { label: match.label, price: match.price };
    });

    const unitPrice = item.basePrice + (size?.priceDelta ?? 0) + addOns.reduce((s, a) => s + a.price, 0);
    return {
      menuItemId: item.id,
      name: item.name,
      descriptor: item.descriptor,
      sizeLabel: size?.label ?? "Regular",
      addOns,
      quantity,
      unitPrice,
    };
  });

  const subtotal = priced.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  return { lines: priced, subtotal };
}
