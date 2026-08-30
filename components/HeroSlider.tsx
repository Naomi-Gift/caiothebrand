"use client";

import Image from "next/image";
import { useOrderMethod } from "@/context/OrderMethodContext";
import type { FulfillmentMode } from "@/lib/types";

export interface HeroSlide {
  eyebrow: string;
  headline: string;
  sub: string;
}

function PickupIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 9.5V19a1 1 0 0 0 1 1H10v-4.5a2 2 0 0 1 4 0V20h3.5a1 1 0 0 0 1-1V9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7h11v9H3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 10h4l3 3v3h-7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="18.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

const OPTIONS: {
  mode: FulfillmentMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    mode: "pickup",
    label: "Pick-up",
    description: "Take your meal at the restaurant.",
    icon: <PickupIcon />,
  },
  {
    mode: "delivery",
    label: "Delivery",
    description: "Receive your food at your doorstep.",
    icon: <DeliveryIcon />,
  },
];

function PizzaWheel({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 sm:block ${className}`}
    >
      <div className="relative h-64 w-64 rounded-full border-4 border-cream/20 p-1.5 shadow-soft-lg md:h-80 md:w-80">
        <div className="h-full w-full animate-[spin_18s_linear_infinite] overflow-hidden rounded-full">
          <Image
            src="/images/spinwheel.jpeg"
            alt="Caio pizza"
            width={640}
            height={640}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}

export default function HeroSlider({ slides: _ }: { slides: HeroSlide[] }) {
  const { startOrder } = useOrderMethod();

  return (
    <section className="relative overflow-hidden bg-brown text-cream">
      <PizzaWheel className="left-0 -translate-x-1/2" />
      <PizzaWheel className="right-0 translate-x-1/2" />

      <div className="relative mx-auto flex min-h-[560px] max-w-5xl flex-col items-center justify-center gap-5 px-8 py-16 text-center sm:px-12 sm:py-20 md:min-h-[700px]">

        {/* Centered heading block */}
        <div className="px-2">
          <h1 className="font-display text-3xl font-bold italic leading-tight text-cream sm:text-5xl md:text-6xl">
            Made to delight your taste buds.
          </h1>
          <p className="mt-3 font-display text-lg font-semibold italic text-cream/80 sm:text-2xl">
            How would you like to receive your order?
          </p>
        </div>

        <div className="mt-6 grid w-full max-w-4xl grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2">
          {OPTIONS.map((option) => (
            <button
              key={option.mode}
              type="button"
              onClick={() => startOrder(option.mode)}
              className="group relative flex flex-row items-center gap-4 rounded-2xl border border-cream/20 bg-cream/10 px-5 py-5 text-left backdrop-blur-sm transition-all duration-200 hover:border-cream/50 hover:bg-cream/20 hover:scale-[1.02] sm:gap-6 sm:px-10 sm:py-10"
            >
              {/* Radio indicator */}
              <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 border-cream/40 transition-colors group-hover:border-cream">
                <span className="h-2.5 w-2.5 scale-0 rounded-full bg-cream transition-transform group-hover:scale-100" />
              </span>

              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream/15 text-cream sm:h-16 sm:w-16">
                {option.icon}
              </span>

              <span>
                <span className="font-display block text-xl font-bold italic text-cream sm:text-2xl">
                  {option.label}
                </span>
                <span className="label-uppercase mt-1 block text-[0.65rem] text-cream/60">
                  {option.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
