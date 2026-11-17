/**
 * Sizes and add-ons as the admin form sends them: cleaned up before they're
 * saved, so every product ends up shaped like the synced ones.
 */
import type { AddOnOption, SizeOption } from "@/lib/types";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** The standard pizza sizes (same ids the ERPNext sync uses). */
export const PIZZA_SIZES = [
  { id: "medium", label: 'Medium (10")' },
  { id: "large", label: 'Large (12")' },
  { id: "extra-large", label: 'Extra Large (16")' },
];

const uniqueId = (wanted: string, taken: Set<string>) => {
  let id = wanted || "option";
  for (let n = 2; taken.has(id); n++) id = `${wanted}-${n}`;
  taken.add(id);
  return id;
};

const code = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 140) : undefined);

/** Clean sizes; returns null if they're not a list at all. Prices must be ≥ 0. */
export function cleanSizes(v: unknown): SizeOption[] | null {
  if (!Array.isArray(v)) return null;
  const taken = new Set<string>();
  return v
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object" && typeof s.label === "string" && !!s.label.trim())
    .slice(0, 10)
    .map((s) => ({
      id: uniqueId(typeof s.id === "string" && s.id ? slugify(s.id) : slugify(String(s.label)), taken),
      label: String(s.label).trim().slice(0, 60),
      priceDelta: Math.max(0, Math.round(Number(s.priceDelta) || 0)),
      ...(code(s.itemCode) ? { itemCode: code(s.itemCode) } : {}),
    }));
}

export function cleanAddOns(v: unknown): AddOnOption[] | null {
  if (!Array.isArray(v)) return null;
  const taken = new Set<string>();
  return v
    .filter((a): a is Record<string, unknown> => !!a && typeof a === "object" && typeof a.label === "string" && !!a.label.trim())
    .slice(0, 40)
    .map((a) => ({
      id: uniqueId(typeof a.id === "string" && a.id ? slugify(a.id) : slugify(String(a.label)), taken),
      label: String(a.label).trim().slice(0, 60),
      price: Math.max(0, Math.round(Number(a.price) || 0)),
      ...(code(a.itemCode) ? { itemCode: code(a.itemCode) } : {}),
    }));
}
