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
      className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-card-gradient transition-all duration-300 ${
        item.soldOut
          ? "opacity-60"
          : "shadow-soft hover:-translate-y-2 hover:shadow-soft-lg hover:shadow-[0_20px_50px_-15px_rgba(58,36,24,0.3)]"
      }`}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <PlaceholderImage
          label={item.name}
          src={`/images/menu/${item.slug}.jpg`}
          category={item.category}
          fit={item.category === "drinks" ? "contain" : "cover"}
          className="h-48 w-full transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-brown/25 via-transparent to-transparent"
        />
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {item.isNew && <Badge tone="brown">New</Badge>}
          {item.soldOut && <Badge tone="brown">Sold out</Badge>}
          {item.featured && !item.soldOut && (
            <Badge tone="cream">Chef&apos;s pick</Badge>
          )}
        </div>
        {/* Spicy indicator */}
        {item.spicy && !item.soldOut && (
          <span
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-crisp/90 text-sm shadow-sm backdrop-blur-sm"
            title="Spicy"
            aria-label="Spicy"
          >
            🌶️
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className="font-display text-xl font-black text-brown leading-tight">
          {item.name}
        </h3>
        <p className="font-display text-sm italic text-brown-light">
          {item.descriptor}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span
            className="label-uppercase rounded-full px-3 py-1 text-[0.7rem] text-brown shadow-sm"
            style={{ background: "linear-gradient(135deg, #ebe2cf, #d4c4a8)" }}
          >
            {formatNaira(item.basePrice)}
          </span>
          {item.soldOut ? (
            <button
              type="button"
              onClick={() => setShowSoldOutNote((v) => !v)}
              className="label-uppercase text-[0.65rem] text-brown-light underline underline-offset-2"
            >
              Notify me
            </button>
          ) : (
            <span className="flex items-center gap-0.5 label-uppercase text-[0.65rem] text-brown-light transition-all duration-200 group-hover:gap-1.5 group-hover:text-brown">
              Customize
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
          )}
        </div>
        {item.soldOut && showSoldOutNote && (
          <p className="mt-1 font-display text-sm italic text-brown-light">
            Sold out of the {item.name.toLowerCase()}. Tomorrow, I promise.
          </p>
        )}
      </div>
    </div>
  );

  if (item.soldOut) return <div>{content}</div>;

  return (
    <Link href={`/menu/${item.slug}`} className="block h-full">
      {content}
    </Link>
  );
}
