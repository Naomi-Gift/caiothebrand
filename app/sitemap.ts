import type { MetadataRoute } from "next";
import { menuItems } from "@/lib/data/menu";

const BASE = "https://www.caiopizza.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/menu", "/branches", "/about", "/contact", "/faqs", "/track", "/privacy", "/terms", "/accessibility"];
  return [
    ...pages.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...menuItems.map((i) => ({ url: `${BASE}/menu/${i.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
