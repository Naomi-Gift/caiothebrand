"use client";

import { useState, useRef } from "react";
import { useOrderMethod } from "@/context/OrderMethodContext";
import type { FulfillmentMode } from "@/lib/types";

export interface HeroSlide {
  eyebrow: string;
  headline: string;
  sub: string;
}

// ── Combo deals data ──────────────────────────────────────────────────────────
const COMBOS = [
  {
    id: 1,
    tag:   "Combo Deal",
    name:  "Suya Box",
    desc:  "Chicken Suya pizza + any drink",
    price: "₦7,500",
    color: "#8B5A25",
    img:   "/images/menu/chicken-suya-experience.jpg",
  },
  {
    id: 2,
    tag:   "Family Deal",
    name:  "The Works",
    desc:  "Large pizza + 2 sides + 2 drinks",
    price: "₦14,000",
    color: "#3a2418",
    img:   "/images/menu/bbq-beef.jpg",
  },
  {
    id: 3,
    tag:   "Lunch Special",
    name:  "Midday Pick",
    desc:  "Any medium pizza + a drink",
    price: "₦5,500",
    color: "#6b4f38",
    img:   "/images/menu/margherita.jpg",
  },
  {
    id: 4,
    tag:   "Date Night",
    name:  "Two & Two",
    desc:  "2 medium pizzas + 2 drinks",
    price: "₦11,000",
    color: "#281710",
    img:   "/images/menu/bbq-chicken.jpg",
  },
];

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

export default function HeroSlider({ slides: _ }: { slides: HeroSlide[] }) {
  const { startOrder } = useOrderMethod();
  const [active, setActive] = useState(0);
  const startX  = useRef<number>(0);
  const dragging = useRef(false);

  // Touch / mouse swipe handlers
  const onStart = (x: number) => { startX.current = x; dragging.current = true; };
  const onEnd   = (x: number) => {
    if (!dragging.current) return;
    dragging.current = false;
    const diff = startX.current - x;
    if (diff > 40)  setActive((a) => Math.min(a + 1, COMBOS.length - 1));
    if (diff < -40) setActive((a) => Math.max(a - 1, 0));
  };

  return (
    <div>
      {/* ── Swipeable combo deals banner ─────────────────────────────────── */}
      <div
        className="relative overflow-hidden select-none"
        style={{ height: "120px", background: "#1a0e08" }}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchEnd={(e)   => onEnd(e.changedTouches[0].clientX)}
        onMouseDown={(e)  => onStart(e.clientX)}
        onMouseUp={(e)    => onEnd(e.clientX)}
      >
        {/* Slides */}
        <div
          className="flex h-full transition-transform duration-350 ease-out"
          style={{ width: `${COMBOS.length * 100}%`, transform: `translateX(-${(active / COMBOS.length) * 100}%)` }}
        >
          {COMBOS.map((combo) => (
            <div
              key={combo.id}
              className="relative flex h-full shrink-0 items-center gap-4 px-5"
              style={{ width: `${100 / COMBOS.length}%` }}
            >
              {/* Background photo — no overlay */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={combo.img}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ transform: "scale(1.06)" }}
                draggable={false}
              />
              {/* Dark gradient only on left so text is legible */}
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(90deg, rgba(20,10,4,0.88) 0%, rgba(20,10,4,0.55) 55%, transparent 100%)" }}
              />

              {/* Content */}
              <div className="relative flex flex-col gap-0.5">
                <span className="label-uppercase text-[0.55rem] tracking-widest text-bone/50">
                  {combo.tag}
                </span>
                <p className="font-display text-xl font-black italic leading-tight text-cream">
                  {combo.name}
                </p>
                <p className="text-[0.7rem] text-bone/60">{combo.desc}</p>
              </div>

              {/* Price pill — right side */}
              <div className="relative ml-auto shrink-0">
                <span
                  className="label-uppercase rounded-full px-4 py-2 text-sm font-black text-cream shadow-soft"
                  style={{ background: combo.color }}
                >
                  {combo.price}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
          {COMBOS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Combo ${i + 1}`}
              className="h-1 rounded-full transition-all duration-200"
              style={{
                width: active === i ? "20px" : "6px",
                background: active === i ? "#ebe2cf" : "rgba(235,226,207,0.3)",
              }}
            />
          ))}
        </div>

        {/* Arrow buttons — desktop only */}
        <button
          onClick={() => setActive((a) => Math.max(a - 1, 0))}
          disabled={active === 0}
          className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:flex h-7 w-7 items-center justify-center rounded-full text-cream/50 transition-colors hover:text-cream disabled:opacity-20"
          style={{ background: "rgba(235,226,207,0.1)" }}
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          onClick={() => setActive((a) => Math.min(a + 1, COMBOS.length - 1))}
          disabled={active === COMBOS.length - 1}
          className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex h-7 w-7 items-center justify-center rounded-full text-cream/50 transition-colors hover:text-cream disabled:opacity-20"
          style={{ background: "rgba(235,226,207,0.1)" }}
          aria-label="Next"
        >
          ›
        </button>
      </div>

      {/* ── Order method selector — compact bar ──────────────────────────── */}
      <div
        className="border-b"
        style={{ background: "linear-gradient(180deg, #281710 0%, #3a2418 100%)", borderColor: "rgba(235,226,207,0.08)" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 px-4 py-4 sm:gap-5">
          <p className="font-display text-sm italic text-cream/60 hidden sm:block">
            How would you like to order?
          </p>
          <div className="flex gap-3">
            {OPTIONS.map((opt) => (
              <button
                key={opt.mode}
                type="button"
                onClick={() => startOrder(opt.mode)}
                className="group flex items-center gap-2.5 rounded-full px-5 py-2.5 transition-all duration-200 hover:scale-[1.02]"
                style={{ background: "rgba(235,226,207,0.08)", border: "1px solid rgba(235,226,207,0.15)" }}
              >
                <span className="text-cream/60 group-hover:text-cream transition-colors">
                  {opt.icon}
                </span>
                <span>
                  <span className="font-display block text-sm font-bold italic text-cream">
                    {opt.label}
                  </span>
                  <span className="label-uppercase block text-[0.55rem] text-bone/40">
                    {opt.desc}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
