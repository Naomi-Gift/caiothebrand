"use client";

import { useRef } from "react";
import type { MenuItem } from "@/lib/types";
import MenuItemCard from "@/components/MenuItemCard";

interface MenuCarouselProps {
  items: MenuItem[];
  label?: string;
}

export default function MenuCarousel({ items, label }: MenuCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.75;
    track.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <div className="relative">
      {label && (
        <p className="label-uppercase mb-4 text-xs text-brown-light">{label}</p>
      )}

      {/* Prev button */}
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-crisp shadow-soft transition-all hover:bg-bone sm:flex h-10 w-10 border border-bone"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div key={item.id} className="w-[260px] flex-none sm:w-[280px]">
            <MenuItemCard item={item} />
          </div>
        ))}
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-crisp shadow-soft transition-all hover:bg-bone sm:flex h-10 w-10 border border-bone"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Fade edges hint */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-crisp to-transparent" />
    </div>
  );
}
