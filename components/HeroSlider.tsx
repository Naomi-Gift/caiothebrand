"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import Button from "@/components/Button";
import { useOrderMethod } from "@/context/OrderMethodContext";

export interface HeroSlide {
  eyebrow: string;
  headline: string;
  sub: string;
}

const AUTOPLAY_MS = 5500;

function PizzaWheel({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 sm:block ${className}`}
    >
      <div className="relative h-56 w-56 rounded-full border-4 border-cream/30 p-2 shadow-soft-lg md:h-72 md:w-72">
        <div className="h-full w-full animate-[spin_14s_linear_infinite] overflow-hidden rounded-full">
          <Image
            src="/images/hero-pizza.jpg"
            alt=""
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

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { openPrompt } = useOrderMethod();

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const slide = slides[index];

  const goTo = (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length);

  return (
    <section
      className="relative overflow-hidden bg-brown text-cream"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <PizzaWheel className="left-0 -translate-x-1/2" />
      <PizzaWheel className="right-0 translate-x-1/2" />

      <div className="relative mx-auto flex min-h-[560px] max-w-3xl flex-col items-center justify-center gap-10 px-4 py-16 text-center sm:px-6 sm:py-20 md:min-h-[640px]">
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <p className="label-uppercase inline-block rounded-full border border-cream/50 px-3 py-1 text-xs text-cream/90">
                {slide.eyebrow}
              </p>
              <h1 className="mx-auto mt-5 max-w-2xl font-display text-5xl font-black italic leading-[1.02] sm:text-7xl">
                {slide.headline}
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base text-cream/90">
                {slide.sub}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button type="button" onClick={openPrompt} variant="solid-cream">
              Order Now
            </Button>
            <Button href="/branches" variant="outline-cream">
              Find a branch
            </Button>
          </div>

          {slides.length > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.headline}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-cream" : "w-2 bg-cream/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
