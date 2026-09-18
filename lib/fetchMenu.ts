/**
 * Fetch menu items from Prisma database.
 * Falls back to static data if database is unavailable.
 */
import type { MenuItem } from "@/lib/types";
import { menuItems as staticItems } from "@/lib/data/menu";
import { prisma } from "@/lib/prisma";

interface ApiMenuItem {
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

function toMenuItem(raw: ApiMenuItem): MenuItem {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    descriptor: raw.descriptor ?? "",
    description: raw.description ?? "",
    basePrice: raw.basePrice,
    sizes: Array.isArray(raw.sizes) ? raw.sizes as MenuItem["sizes"] : [],
    addOns: Array.isArray(raw.addOns) ? raw.addOns as MenuItem["addOns"] : [],
    category: raw.category.slug as MenuItem["category"],
    spicy: raw.spicy,
    vegetarian: raw.vegetarian,
    featured: raw.featured,
    soldOut: raw.soldOut,
    available: !raw.available ? false : undefined,
  };
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    const raw = await prisma.menuItem.findMany({
      where: { available: true },
      include: { category: { select: { slug: true, name: true } } },
      orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
    });
    if (!raw || raw.length === 0) return staticItems;
    return (raw as unknown as ApiMenuItem[]).map(toMenuItem);
  } catch {
    return staticItems;
  }
}
