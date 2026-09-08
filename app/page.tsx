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
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <HeroSlider slides={HERO_SLIDES} />

      {/* ── Featured items ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
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

      {/* ── Brand statement ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brown">
        {/* Subtle grid pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(235,226,207,1) 1px, transparent 1px), linear-gradient(90deg, rgba(235,226,207,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow blob */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-6rem] top-[-4rem] h-80 w-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #8b6f4f 0%, transparent 70%)" }}
        />

        <Reveal className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-4xl font-bold italic text-cream sm:text-5xl lg:text-6xl">
            Bold, not loud.
          </h2>
          <p className="mt-5 text-base text-bone/70 leading-relaxed">
            Suya beef, yaji spice, scotch bonnet on a pizza and it works.
            Every pie built from scratch, real ingredients, and the
            🌶️ on the menu means it is actually spicy.
          </p>
          {/* Ornamental divider */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-bone/30" />
            <span className="text-bone/20 text-xl">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-bone/30" />
          </div>
        </Reveal>
      </section>

      {/* ── Branches ────────────────────────────────────────────────────── */}
      <section className="bg-warm-gradient">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
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
                <div className="group relative overflow-hidden rounded-2xl bg-crisp p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
                  {/* Corner accent */}
                  <div
                    aria-hidden="true"
                    className="absolute right-0 top-0 h-32 w-32 rounded-bl-full opacity-5 transition-opacity duration-300 group-hover:opacity-10"
                    style={{ background: "linear-gradient(225deg, #3a2418, transparent)" }}
                  />
                  <div className="relative">
                    <h3 className="font-display text-3xl font-black text-brown">
                      {b.name}
                    </h3>
                    {b.comingSoon && (
                      <span className="label-uppercase ml-2 inline-block rounded-full bg-brown px-3 py-0.5 text-[0.58rem] text-cream align-middle">
                        Coming soon
                      </span>
                    )}
                    <p className="mt-2 text-sm text-brown-light">{b.address}</p>
                    {b.comingSoon ? (
                      <p className="mt-2 text-sm italic text-brown-light">
                        Not open yet — coming to {b.name} soon.
                      </p>
                    ) : (
                      <>
                        <p className="mt-1 text-sm text-brown-light">{b.hours}</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <span className="label-uppercase rounded-full bg-bone px-4 py-1.5 text-[0.65rem] text-brown">
                            Delivery in {b.deliveryEstimate}
                          </span>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(b.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="label-uppercase rounded-full border border-bone px-4 py-1.5 text-[0.65rem] text-brown-light transition-colors hover:bg-bone hover:text-brown"
                          >
                            Directions →
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
