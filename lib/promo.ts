/**
 * Promo codes live in Admin → Settings ("promo_codes", JSON), e.g.
 *   [{"code":"CAIO10","discount":10,"type":"percent"}]
 * Server-only so the codes aren't shipped to every browser.
 */
import { prisma } from "@/lib/prisma";

export interface Promo {
  code: string;
  /** Fraction of the subtotal, e.g. 0.1 for 10% off. */
  rate: number;
}

const FALLBACK: Promo[] = [{ code: "CAIO10", rate: 0.1 }];

async function loadPromos(): Promise<Promo[]> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "promo_codes" } });
    if (!row?.value?.trim()) return FALLBACK;
    const parsed = JSON.parse(row.value) as { code?: unknown; discount?: unknown; type?: unknown }[];
    if (!Array.isArray(parsed)) return FALLBACK;
    return parsed
      .filter((p) => typeof p.code === "string" && typeof p.discount === "number" && (p.type ?? "percent") === "percent")
      .map((p) => ({ code: String(p.code).trim().toUpperCase(), rate: Math.min(Math.max(Number(p.discount), 0), 100) / 100 }));
  } catch (err) {
    console.error("[promo] couldn't read promo_codes setting", err);
    return FALLBACK;
  }
}

export async function findPromo(code: string | null | undefined): Promise<Promo | null> {
  if (!code?.trim()) return null;
  const wanted = code.trim().toUpperCase();
  return (await loadPromos()).find((p) => p.code === wanted) ?? null;
}
