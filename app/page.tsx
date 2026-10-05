import { fetchMenuItems } from "@/lib/fetchMenu";
import HeroSlider, { type HeroSlide } from "@/components/HeroSlider";
import MenuPageClient from "./menu/MenuPageClient";

export const revalidate = 60;

const HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "Lagos · Owerri coming soon",
    headline: "Made to delight your taste buds.",
    sub: "Italian technique, Nigerian flavour. Chef driven, from Lagos, and coming soon to Owerri.",
  },
];

export default async function HomePage() {
  const items = await fetchMenuItems();

  return (
    <div>
      {/* ── Hero with order method selector ─────────────────────────────── */}
      <HeroSlider slides={HERO_SLIDES} items={items} />

      {/* ── Full menu — directly below the hero ─────────────────────────── */}
      <MenuPageClient items={items} />
    </div>
  );
}
