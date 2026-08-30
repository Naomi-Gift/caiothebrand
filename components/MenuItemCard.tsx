"use client";

import Link from "next/link";
import { useState } from "react";
import type { MenuItem } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import PlaceholderImage from "@/components/PlaceholderImage";
import Badge from "@/components/Badge";

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const [showSoldOutNote, setShowSoldOutNote] = useState(false);
  const content = (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-crisp transition-all duration-300 ${
        item.soldOut
          ? "opacity-60"
          : "shadow-soft hover:-translate-y-1 hover:shadow-soft-lg"
      }`}
    >
      <div className="relative">
        <PlaceholderImage
          label={item.name}
          src={`/images/menu/${item.slug}.jpg`}
          category={item.category}
          fit={item.category === "drinks" ? "contain" : "cover"}
          className="h-20 w-full"
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {item.isNew && <Badge tone="brown">New</Badge>}
          {item.soldOut && <Badge tone="brown">Sold out</Badge>}
          {item.featured && !item.soldOut && (
            <Badge tone="cream">Chef&apos;s pick</Badge>
          )}
        </div>
        {item.spicy && !item.soldOut && (
          <span
            className="absolute right-3 top-3 text-lg"
            title="Spicy"
            aria-label="Spicy"
          >
            🌶️
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className="font-display text-xl font-black text-brown">
          {item.name}
        </h3>
        <p className="font-display text-sm italic text-brown-light">
          {item.descriptor}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="label-uppercase rounded-full bg-bone px-3 py-1 text-[0.7rem] text-brown">
            {formatNaira(item.basePrice)}
          </span>
          {item.soldOut ? (
            <button
              type="button"
              onClick={() => setShowSoldOutNote((v) => !v)}
              className="label-uppercase text-[0.65rem] text-brown-light underline"
            >
              Notify me
            </button>
          ) : (
            <span className="label-uppercase text-[0.65rem] text-brown-light transition-colors group-hover:text-brown">
              Customize →
            </span>
          )}
        </div>
        {item.soldOut && showSoldOutNote && (
          <p className="font-display text-sm italic text-brown-light">
            Sold out of the {item.name.toLowerCase()}. Tomorrow, I promise.
          </p>
        )}
      </div>
    </div>
  );

  if (item.soldOut) {
    return <div>{content}</div>;
  }

  return (
    <Link href={`/menu/${item.slug}`} className="block h-full">
      {content}
    </Link>
  );
}
