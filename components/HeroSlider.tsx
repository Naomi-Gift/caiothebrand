"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useOrderMethod } from "@/context/OrderMethodContext";
import { categoryLabels } from "@/lib/data/menu";
import { formatNaira } from "@/lib/format";
import type { FulfillmentMode, MenuItem } from "@/lib/types";

export interface HeroSlide {
  eyebrow: string;
  headline: string;
  sub: string;
}

function PickupIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 9.5V19a1 1 0 001 1H10v-4.5a2 2 0 014 0V20h3.5a1 1 0 001-1V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 7h11v9H3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M14 10h4l3 3v3h-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <circle cx="7" cy="18.5" r="1.6" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="17" cy="18.5" r="1.6" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

const OPTIONS: { mode: FulfillmentMode; label: string; desc: string; icon: React.ReactNode }[] = [
  { mode: "pickup",   label: "Pick-up",  desc: "Collect at the restaurant", icon: <PickupIcon /> },
  { mode: "delivery", label: "Delivery", desc: "Delivered to your door",     icon: <DeliveryIcon /> },
];

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={dir === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const AUTOPLAY_MS = 5500;

// Card colours cycle through the brand browns.
const CARD_COLORS = ["#8B5A25", "#3a2418", "#6b4f38", "#281710"];

/** Chef's picks (items marked "featured" in the menu), else the first few pizzas. */
function pickProducts(items: MenuItem[]) {
  const available = items.filter((i) => !i.soldOut && i.available !== false);
  const featured = available.filter((i) => i.featured);
  return (featured.length >= 2 ? featured : available.filter((i) => i.category === "pizzas")).slice(0, 6);
}

export default function HeroSlider({ items }: { slides?: HeroSlide[]; items: MenuItem[] }) {
  const { startOrder } = useOrderMethod();
  const products = pickProducts(items);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const cardStep = () => {
    const track = trackRef.current;
    const card = track?.children[0] as HTMLElement | undefined;
    if (!track || !card) return 0;
    return card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
  };

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const step = cardStep();
    const max = track.scrollWidth - track.clientWidth;
    track.scrollTo({ left: Math.min(i * step, max), behavior: "smooth" });
  }, []);

  // Active dot follows the native swipe/scroll position.
  const onScroll = () => {
    const track = trackRef.current;
    const step = cardStep();
    if (!track || !step) return;
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    setActive(atEnd ? products.length - 1 : Math.round(track.scrollLeft / step));
  };

  // Gentle autoplay; stops on hover/touch and for reduced-motion users.
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => goTo(active >= products.length - 1 ? 0 : active + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, goTo, products.length]);

  return (
    <section
      aria-label="Chef's picks"
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1a0e08 0%, #281710 55%, #3a2418 100%)" }}
    >
      {products.length > 0 && (<>
      {/* Soft warm glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #8b6f4f 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-5 pt-6 sm:px-6 sm:pb-7 sm:pt-9">
        {/* Heading row */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-heading text-[0.65rem] font-bold uppercase tracking-[0.3em] text-bone/55">
              Chef&apos;s picks
            </p>
            <h2 className="mt-1 font-display text-[1.9rem] font-bold leading-none text-cream sm:text-[2.6rem]">
              Made to delight, <em className="not-italic text-bone-dark">fresh from the oven.</em>
            </h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            {(["left", "right"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => goTo(dir === "left" ? Math.max(active - 1, 0) : Math.min(active + 1, products.length - 1))}
                disabled={dir === "left" ? active === 0 : active === products.length - 1}
                aria-label={dir === "left" ? "Previous" : "Next"}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-bone/20 text-cream transition-colors hover:bg-cream hover:text-brown disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowIcon dir={dir} />
              </button>
            ))}
          </div>
        </div>

        {/* Cards — native swipe with scroll-snap */}
        <div
          ref={trackRef}
          onScroll={onScroll}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          className="-mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:gap-4 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
        >
          {products.map((item, i) => (
            <article
              key={item.id}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${products.length}: ${item.name}`}
              className="relative flex w-[86%] shrink-0 snap-start items-center gap-4 overflow-hidden rounded-3xl border border-bone/10 p-5 sm:w-[calc(50%-0.5rem)] sm:gap-6 sm:p-7"
              style={{ background: `linear-gradient(135deg, ${CARD_COLORS[i % CARD_COLORS.length]} 0%, rgba(26,14,8,0.9) 100%)` }}
            >
              <div className="relative z-10 flex min-w-0 flex-1 flex-col items-start">
                <span className="rounded-full bg-cream/10 px-2.5 py-1 font-heading text-[0.58rem] font-bold uppercase tracking-[0.2em] text-bone">
                  {item.isNew ? "New" : item.featured ? "Chef's pick" : categoryLabels[item.category]}
                </span>
                <p className="mt-3 font-display text-[1.7rem] font-bold leading-none text-cream sm:text-[2.2rem]">
                  {item.name}
                </p>
                <p className="mt-1.5 line-clamp-2 text-[0.85rem] leading-snug text-bone/70 sm:text-[0.95rem]">{item.descriptor}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="font-heading text-lg font-extrabold text-cream sm:text-xl">
                    <span className="mr-1 text-[0.7em] font-bold text-bone/60">From</span>
                    {formatNaira(item.basePrice)}
                  </span>
                  <Link
                    href={`/menu/${item.slug}`}
                    className="label-uppercase rounded-full bg-cream px-4 py-2 text-[0.62rem] text-brown transition-colors hover:bg-crisp sm:text-[0.68rem]"
                  >
                    Order now
                  </Link>
                </div>
              </div>

              {/* Pizza photo, cropped to a circle */}
              <div className="relative h-28 w-28 shrink-0 sm:h-40 sm:w-40">
                <div aria-hidden="true" className="absolute inset-0 scale-110 rounded-full bg-bone/10" />
                {/* eslint-disable-next-line @next/next/no-img-element -- small fixed asset */}
                <img
                  src={`/images/menu/${item.slug}.jpg`}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="relative h-full w-full rounded-full object-cover shadow-brown-lg ring-2 ring-bone/20"
                  style={{ objectPosition: "50% 45%" }}
                />
              </div>
            </article>
          ))}
        </div>

        {/* Dots */}
        <div className="mt-4 flex justify-center gap-1.5">
          {products.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${c.name}`}
              aria-current={active === i ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 ${active === i ? "w-6 bg-bone" : "w-1.5 bg-bone/30"}`}
            />
          ))}
        </div>
      </div>

      </>)}

      {/* ── Order method selector ─────────────────────────────────────────── */}
      <div className="relative border-t border-bone/10 bg-black/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-center sm:gap-5 sm:px-6">
          <p className="font-display text-[0.95rem] italic text-cream/65">How would you like to order?</p>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:gap-3">
            {OPTIONS.map((opt) => (
              <button
                key={opt.mode}
                type="button"
                onClick={() => startOrder(opt.mode)}
                className="group flex min-w-0 items-center gap-2.5 rounded-full border border-bone/15 bg-bone/[0.08] px-4 py-2.5 text-left transition-colors duration-200 hover:border-bone/40 hover:bg-bone/15 sm:px-5"
              >
                <span className="shrink-0 text-cream/60 transition-colors group-hover:text-cream">{opt.icon}</span>
                <span className="min-w-0">
                  <span className="block font-display text-[0.95rem] font-bold italic text-cream">{opt.label}</span>
                  <span className="label-uppercase hidden truncate text-[0.52rem] text-bone/45 sm:block">{opt.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
