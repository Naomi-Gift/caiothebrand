"use client";

import { useEffect, useRef } from "react";

export interface RailTab {
  id: string;
  label: string;
}

interface CategoryTabsProps {
  tabs: RailTab[];
  active: string;
  onSelect: (id: string) => void;
}

/** Sticky category rail. The parent owns scroll-spy; this just renders and keeps the active tab in view. */
export default function CategoryTabs({ tabs, active, onSelect }: CategoryTabsProps) {
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const el = rail?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!rail || !el) return;
    const left = el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2;
    rail.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <div
      ref={railRef}
      className="flex gap-2 overflow-x-auto py-3 sm:gap-1 sm:[scrollbar-width:none] sm:[&::-webkit-scrollbar]:hidden max-sm:pb-2.5 max-sm:[scrollbar-color:#d4c4a8_transparent] max-sm:[scrollbar-width:thin]"
      aria-label="Menu categories"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <a
            key={tab.id}
            href={`#${tab.id}`}
            data-tab={tab.id}
            aria-current={isActive ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              onSelect(tab.id);
            }}
            className={`label-uppercase whitespace-nowrap rounded-full px-5 py-2.5 text-xs transition-colors duration-200 ${
              isActive
                ? "bg-brown text-cream"
                : "text-brown-light hover:text-brown max-sm:border max-sm:border-bone-dark max-sm:bg-crisp"
            }`}
          >
            {tab.label}
          </a>
        );
      })}
    </div>
  );
}
