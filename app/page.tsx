import MenuItemCard from "@/components/MenuItemCard";
import Button from "@/components/Button";
import Reveal from "@/components/Reveal";
import HeroSlider, { type HeroSlide } from "@/components/HeroSlider";
import { getFeaturedItems } from "@/lib/data/menu";
import { branchList } from "@/lib/data/branches";

const HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "Owerri & Lagos",
    headline: "Made to delight your taste buds.",
    sub: "Italian technique, Nigerian flavour. Chef driven, from Lagos, now in Owerri too.",
  },
  {
    eyebrow: "Fan favourite",
    headline: "Suya. Off the skewer.",
    sub: "Grilled suya beef, yaji spice, and a thread of chili oil. A Caio original.",
  },
  {
    eyebrow: "The classic",
    headline: "Simple done right.",
    sub: "San Marzano tomato, fior di latte, torn basil. The one you order to know if a place is actually good.",
  },
];

export default function HomePage() {
  const featured = getFeaturedItems();

  return (
    <div>
      <HeroSlider slides={HERO_SLIDES} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-uppercase text-xs text-brown-light">
              Fan favourites
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold italic text-brown sm:text-5xl lg:text-6xl">
              Featured on the menu
            </h2>
          </div>
          <Button
            href="/menu"
            variant="outline"
            size="sm"
            className="self-start sm:self-auto"
          >
            Full menu →
          </Button>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.08}>
              <MenuItemCard item={item} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-bone">
        <Reveal className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-display text-4xl font-bold italic text-brown sm:text-5xl lg:text-6xl">
            Bold, not loud.
          </h2>
          <p className="mt-4 text-base text-brown-light">
            Suya beef, yaji spice, scotch bonnet on a pizza and it works.
            Every pie built from scratch, real ingredients, and the
            🌶️ on the menu means it is actually spicy.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <p className="label-uppercase text-xs text-brown-light">
            Two branches, one menu
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold italic text-brown sm:text-5xl lg:text-6xl">
            Owerri &amp; Lagos
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {branchList.map((b, i) => (
            <Reveal key={b.id} delay={i * 0.1}>
              <div className="rounded-2xl bg-crisp p-6 shadow-soft">
                <h3 className="font-display text-3xl font-black text-brown">
                  {b.name}
                </h3>
                <p className="mt-2 text-sm text-brown-light">{b.address}</p>
                <p className="mt-1 text-sm text-brown-light">{b.hours}</p>
                <p className="mt-4 label-uppercase text-xs text-brown">
                  Delivery in {b.deliveryEstimate}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
