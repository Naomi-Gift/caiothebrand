import type { MenuItem } from "@/lib/types";

/** Uploaded photo if there is one, else the bundled /images/menu/<slug>.jpg. */
export function menuImageSrc(item: Pick<MenuItem, "slug"> & { image?: string | null }): string {
  return item.image || `/images/menu/${item.slug}.jpg`;
}
