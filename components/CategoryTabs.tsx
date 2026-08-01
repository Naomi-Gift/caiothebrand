"use client";

import { categoryLabels, categoryOrder } from "@/lib/data/menu";
import type { MenuCategory } from "@/lib/types";

export type MenuTab = "deals" | MenuCategory;

const tabOrder: MenuTab[] = ["deals", ...categoryOrder];

const tabLabels: Record<MenuTab, string> = {
  deals: "Deals",
  ...categoryLabels,
};

interface CategoryTabsProps {
  active: MenuTab;
  onChange: (category: MenuTab) => void;
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div
      className="flex gap-3 overflow-x-auto pb-1"
      role="tablist"
      aria-label="Menu categories"
    >
      {tabOrder.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={`label-uppercase whitespace-nowrap rounded-full border-2 border-brown px-5 py-2.5 text-xs transition-all duration-200 ${
            active === tab
              ? "bg-brown text-cream shadow-soft"
              : "bg-crisp text-brown-light hover:bg-bone hover:text-brown"
          }`}
        >
          {tabLabels[tab]}
        </button>
      ))}
    </div>
  );
}
