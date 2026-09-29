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
}

function interceptClick(e: React.MouseEvent<HTMLAnchorElement>, open: () => void) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  open();
}

function ImageTile({ item, className = "" }: { item: MenuItem; className?: string }) {
  return (
    <div className={`relative aspect-square overflow-hidden rounded-md bg-bone ${className}`}>
      <PlaceholderImage
        label={item.name}
        src={`/images/menu/${item.slug}.jpg`}
        category={item.category}
        className="h-full w-full"
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

export function MenuGridCard({ item, onOpen }: TileProps) {
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
            className="absolute -bottom-3 right-2 rounded-[6px] bg-brown px-2.5 py-1.5 font-heading text-[0.66rem] font-bold uppercase tracking-wide text-cream shadow-soft transition-colors hover:bg-brown-deep sm:-bottom-4 sm:right-3 sm:px-3 sm:py-2 sm:text-[0.78rem]"
          >
            + Add to cart
          </button>
        )}
      </div>
      <Link href={href} onClick={(e) => interceptClick(e, open)} className="block pt-6 sm:pt-7">
        <h3 className="font-display text-[1.05rem] font-bold leading-tight text-brown-darkest transition-colors group-hover:text-brown-light sm:text-[1.3rem]">
          {item.name}
        </h3>
        <p className="mt-1 line-clamp-3 text-[0.8rem] leading-snug text-brown-light sm:text-[0.92rem]">
          {item.descriptor}
        </p>
        <p className="mt-2 font-heading text-[0.85rem] font-bold text-brown-darkest">
          From {formatNaira(item.basePrice)}
        </p>
      </Link>
    </div>
  );
}

export function MenuListRow({ item, onOpen }: TileProps) {
  const open = () => onOpen(item);
  return (
    <Link
      href={`/menu/${item.slug}`}
      onClick={(e) => interceptClick(e, open)}
      className={`group flex items-start gap-4 sm:gap-6 ${item.soldOut ? "opacity-60" : ""}`}
    >
      <ImageTile item={item} className="w-[42%] max-w-[13rem] shrink-0" />
      <div className="min-w-0 flex-1 pt-1">
        <h3 className="font-display text-[1.3rem] font-bold leading-tight text-brown-darkest transition-colors group-hover:text-brown-light sm:text-[1.45rem]">
          {item.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-[1rem] leading-snug text-brown-light">{item.descriptor}</p>
        <p className="mt-2 font-heading text-[0.85rem] font-bold text-brown-darkest">
          From {formatNaira(item.basePrice)}
        </p>
      </div>
    </Link>
  );
}
