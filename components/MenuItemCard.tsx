"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import type { MenuItem } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import PlaceholderImage from "@/components/PlaceholderImage";
import Badge from "@/components/Badge";

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const [showSoldOutNote, setShowSoldOutNote] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse position for shine effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const shineX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const shineY = useTransform(mouseY, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const content = (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card-gradient ${
        item.soldOut ? "opacity-60" : "shadow-soft"
      }`}
      animate={
        item.soldOut
          ? {}
          : {
              y: hovered ? -6 : 0,
              boxShadow: hovered
                ? "0 20px 60px -15px rgba(58,36,24,0.35), 0 4px 12px rgba(58,36,24,0.1)"
                : "0 2px 4px rgba(58,36,24,0.06), 0 8px 24px -8px rgba(58,36,24,0.2)",
            }
      }
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Shine sweep overlay */}
      {!item.soldOut && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useTransform(
              [shineX, shineY],
              ([x, y]) =>
                `radial-gradient(180px circle at ${x} ${y}, rgba(255,255,255,0.12), transparent 70%)`
            ),
          }}
        />
      )}

      {/* Image */}
      <div className="relative overflow-hidden">
        <div className="overflow-hidden">
          <motion.div
            animate={{ scale: hovered && !item.soldOut ? 1.07 : 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <PlaceholderImage
              label={item.name}
              src={`/images/menu/${item.slug}.jpg`}
              category={item.category}
              fit={item.category === "drinks" ? "contain" : "cover"}
              className="h-48 w-full"
            />
          </motion.div>
        </div>

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
          <motion.span
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-crisp/90 text-sm shadow-sm backdrop-blur-sm"
            title="Spicy"
            aria-label="Spicy"
            animate={{ rotate: hovered ? [0, -10, 10, -5, 0] : 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            🌶️
          </motion.span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className="font-display text-xl font-black leading-tight text-brown">
          {item.name}
        </h3>
        <p className="font-display text-sm italic text-brown-light">
          {item.descriptor}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <motion.span
            className="label-uppercase rounded-full px-3 py-1 text-[0.7rem] text-brown shadow-sm"
            style={{ background: "linear-gradient(135deg, #ebe2cf, #d4c4a8)" }}
            animate={{ scale: hovered && !item.soldOut ? 1.04 : 1 }}
            transition={{ duration: 0.25 }}
          >
            {formatNaira(item.basePrice)}
          </motion.span>

          {item.soldOut ? (
            <button
              type="button"
              onClick={() => setShowSoldOutNote((v) => !v)}
              className="label-uppercase text-[0.65rem] text-brown-light underline underline-offset-2"
            >
              Notify me
            </button>
          ) : (
            <span className="label-uppercase flex items-center gap-0.5 text-[0.65rem] text-brown-light transition-colors duration-200 group-hover:text-brown">
              Customize
              <motion.span
                aria-hidden="true"
                animate={{ x: hovered ? 4 : 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                →
              </motion.span>
            </span>
          )}
        </div>

        {item.soldOut && showSoldOutNote && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 font-display text-sm italic text-brown-light"
          >
            Sold out of the {item.name.toLowerCase()}. Tomorrow, I promise.
          </motion.p>
        )}
      </div>
    </motion.div>
  );

  if (item.soldOut) return <div>{content}</div>;

  return (
    <Link href={`/menu/${item.slug}`} className="block h-full">
      {content}
    </Link>
  );
}
