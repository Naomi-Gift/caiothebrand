/**
 * Fetch menu items from the backend API.
 * Falls back to the static data if the API is unavailable (e.g. local dev without backend).
 */
import type { MenuItem } from "@/lib/types";
import { menuItems as staticItems } from "@/lib/data/menu";

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
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return staticItems;

  try {
    const res = await fetch(`${apiUrl}/api/menu`, {
      next: { revalidate: 60 }, // revalidate every 60 s — menu changes are not instant
    });
    if (!res.ok) return staticItems;
    const data = (await res.json()) as ApiMenuItem[];
    return data.map(toMenuItem);
  } catch {
    return staticItems;
  }
}
