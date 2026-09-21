import { fetchMenuItems } from "@/lib/fetchMenu";
import HeroSlider, { type HeroSlide } from "@/components/HeroSlider";
import MenuPageClient from "./menu/MenuPageClient";

export const revalidate = 60;

const HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "Owerri & Lagos",
    headline: "Made to delight your taste buds.",
    sub: "Italian technique, Nigerian flavour. Chef driven, from Lagos, now in Owerri too.",
  },
];

export default async function HomePage() {
  const items = await fetchMenuItems();

  return (
    <div>
      {/* ── Hero with order method selector ─────────────────────────────── */}
      <HeroSlider slides={HERO_SLIDES} />

      {/* ── Full menu — directly below the hero ─────────────────────────── */}
      <MenuPageClient items={items} />
    </div>
  );
}
