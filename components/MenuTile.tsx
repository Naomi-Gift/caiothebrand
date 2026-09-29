"use client";

import Link from "next/link";
import type { MenuItem } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import PlaceholderImage from "@/components/PlaceholderImage";
import Badge from "@/components/Badge";

export type MenuView = "grid" | "list";

interface TileProps {
  item: MenuItem;
  /** Called on a plain left-click; modified clicks fall through to the real link. */
  onOpen: (item: MenuItem) => void;
  /** Smaller tile and text (used for drinks). */
  compact?: boolean;
}

function interceptClick(e: React.MouseEvent<HTMLAnchorElement>, open: () => void) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  open();
}

function ImageTile({ item, className = "" }: { item: MenuItem; className?: string }) {
  // Drink photos are product shots on white: show the whole bottle on a white tile.
  const isDrink = item.category === "drinks";
  return (
    <div className={`relative aspect-square overflow-hidden rounded-md ${isDrink ? "bg-crisp" : "bg-bone"} ${className}`}>
      <PlaceholderImage
        label={item.name}
        src={`/images/menu/${item.slug}.jpg`}
        category={item.category}
        fit={isDrink ? "contain" : "cover"}
        className={`h-full w-full ${isDrink ? "bg-crisp!" : ""}`}
      />
      {(item.isNew || (item.vegetarian && item.category !== "drinks") || item.soldOut) && (
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {item.soldOut && <Badge tone="brown">Sold out</Badge>}
          {item.isNew && <Badge tone="brown">New</Badge>}
          {item.vegetarian && item.category !== "drinks" && <Badge tone="cream">Veg</Badge>}
        </div>
      )}
    </div>
  );
}

export function MenuGridCard({ item, onOpen, compact }: TileProps) {
  const open = () => onOpen(item);
  const href = `/menu/${item.slug}`;
  return (
    <div className={`group ${item.soldOut ? "opacity-60" : ""}`}>
      <div className="relative">
        {/* Image duplicates the text link below, so it's hidden from keyboard/AT. */}
        <Link href={href} onClick={(e) => interceptClick(e, open)} tabIndex={-1} aria-hidden="true" className="block">
          <ImageTile item={item} />
        </Link>
        {!item.soldOut && (
          <button
            type="button"
            onClick={open}
            aria-label={`Add ${item.name} to cart`}
            className={`absolute rounded-[6px] bg-brown font-heading font-bold uppercase tracking-wide text-cream shadow-soft transition-colors hover:bg-brown-deep ${
              compact
                ? "-bottom-2.5 right-1.5 px-2 py-1 text-[0.6rem] sm:right-2 sm:text-[0.66rem]"
                : "-bottom-3 right-2 px-2.5 py-1.5 text-[0.66rem] sm:-bottom-4 sm:right-3 sm:px-3 sm:py-2 sm:text-[0.78rem]"
            }`}
          >
            {compact ? "+ Add" : "+ Add to cart"}
          </button>
        )}
      </div>
      <Link href={href} onClick={(e) => interceptClick(e, open)} className={`block ${compact ? "pt-4 sm:pt-5" : "pt-6 sm:pt-7"}`}>
        <h3 className={`font-display font-bold leading-tight text-brown-darkest transition-colors group-hover:text-brown-light ${compact ? "text-[0.92rem] sm:text-[1.05rem]" : "text-[1.05rem] sm:text-[1.3rem]"}`}>
          {item.name}
        </h3>
        <p className={`mt-1 leading-snug text-brown-light ${compact ? "line-clamp-2 text-[0.75rem] sm:text-[0.82rem]" : "line-clamp-3 text-[0.8rem] sm:text-[0.92rem]"}`}>
          {item.descriptor}
        </p>
        <p className="mt-2 font-heading text-[0.85rem] font-bold text-brown-darkest">
          From {formatNaira(item.basePrice)}
        </p>
      </Link>
    </div>
  );
}

export function MenuListRow({ item, onOpen, compact }: TileProps) {
  const open = () => onOpen(item);
  return (
    <Link
      href={`/menu/${item.slug}`}
      onClick={(e) => interceptClick(e, open)}
      className={`group flex items-start gap-4 sm:gap-6 ${item.soldOut ? "opacity-60" : ""}`}
    >
      <ImageTile item={item} className={`shrink-0 ${compact ? "w-[26%] max-w-[7.5rem]" : "w-[42%] max-w-[13rem]"}`} />
      <div className="min-w-0 flex-1 pt-1">
        <h3 className={`font-display font-bold leading-tight text-brown-darkest transition-colors group-hover:text-brown-light ${compact ? "text-[1.1rem] sm:text-[1.2rem]" : "text-[1.3rem] sm:text-[1.45rem]"}`}>
          {item.name}
        </h3>
        <p className={`mt-1 line-clamp-2 leading-snug text-brown-light ${compact ? "text-[0.88rem]" : "text-[1rem]"}`}>{item.descriptor}</p>
        <p className="mt-2 font-heading text-[0.85rem] font-bold text-brown-darkest">
          From {formatNaira(item.basePrice)}
        </p>
      </div>
    </Link>
  );
}
