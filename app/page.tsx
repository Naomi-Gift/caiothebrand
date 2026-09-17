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
];

export default function HomePage() {
  const featured = getFeaturedItems();

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <HeroSlider slides={HERO_SLIDES} />

      {/* ── Ombre divider ───────────────────────────────────────────────── */}
      <div className="ombre-divider" aria-hidden="true" />

      {/* ── Featured items ──────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #fdfaf6 0%, #f5ede0 100%)" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-[32rem] w-[32rem] opacity-50"
          style={{ background: "radial-gradient(circle at top right, #ebe2cf, transparent 65%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 opacity-30"
          style={{ background: "radial-gradient(circle at bottom left, #d4c4a8, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-uppercase text-xs text-brown-light">Fan favourites</p>
              <h2 className="mt-2 font-display text-4xl font-bold italic text-brown sm:text-5xl lg:text-6xl">
                Featured on the menu
              </h2>
            </div>
            <Button href="/menu" variant="outline" size="sm" className="self-start sm:self-auto">
              Full menu →
            </Button>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.1}>
                <MenuItemCard item={item} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* Bottom ombre border into next section */}
        <div className="ombre-divider-warm" aria-hidden="true" />
      </section>

      {/* ── Brand statement ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brown-deep">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-8rem] top-[-6rem] h-[36rem] w-[36rem] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,111,79,0.2) 0%, transparent 65%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-4rem] left-[-4rem] h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,111,79,0.12) 0%, transparent 70%)" }}
        />
        {/* Ambient horizontal glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 opacity-40"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(235,226,207,0.25) 30%, rgba(235,226,207,0.5) 50%, rgba(235,226,207,0.25) 70%, transparent 100%)" }}
        />

        <Reveal className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          {/* Ombre headline text */}
          <h2 className="font-display text-4xl font-bold italic text-shimmer sm:text-5xl lg:text-6xl">
            Bold, not loud.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-bone/60">
            Suya beef, yaji spice, scotch bonnet on a pizza — and it works.
            Every pie built from scratch, real ingredients, and the
            🌶️ on the menu means it is actually spicy.
          </p>
          {/* Ombre ornamental divider */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="h-px w-24" style={{ background: "linear-gradient(90deg, transparent, rgba(235,226,207,0.4))" }} />
            <span className="text-bone/20 text-base">✦</span>
            <div className="h-px w-24" style={{ background: "linear-gradient(270deg, transparent, rgba(235,226,207,0.4))" }} />
          </div>
        </Reveal>

        {/* Ombre border bottom */}
        <div className="ombre-divider-dark" aria-hidden="true" />
      </section>

      {/* ── Branches ────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #f0e6d6 0%, #e8d9c4 50%, #ddd0b8 100%)" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-6rem] bottom-[-4rem] h-96 w-96"
          style={{ background: "radial-gradient(circle, rgba(58,36,24,0.1) 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <p className="label-uppercase text-xs text-brown-light">Two branches, one menu</p>
            <h2 className="mt-2 font-display text-4xl font-bold italic text-brown sm:text-5xl lg:text-6xl">
              Owerri &amp; Lagos
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {branchList.map((b, i) => (
              <Reveal key={b.id} delay={i * 0.12}>
                <div
                  className="group relative overflow-hidden rounded-2xl p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-brown-lg ombre-card-border"
                  style={{ background: "rgba(255,252,248,0.88)", backdropFilter: "blur(8px)" }}
                >
                  <div
                    aria-hidden="true"
                    className="absolute right-0 top-0 h-40 w-40 rounded-bl-full opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.14]"
                    style={{ background: "radial-gradient(circle at top right, #3a2418, transparent)" }}
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-3xl font-black text-brown">{b.name}</h3>
                      {b.comingSoon && (
                        <span className="label-uppercase mt-1 shrink-0 rounded-full bg-brown px-3 py-1 text-[0.58rem] text-cream">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-brown-light">{b.address}</p>
                    {b.comingSoon ? (
                      <p className="mt-3 text-sm italic text-brown-light/80">
                        Not open yet — coming to {b.name} soon.
                      </p>
                    ) : (
                      <>
                        <p className="mt-1 text-sm text-brown-light">{b.hours}</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <span className="label-uppercase rounded-full bg-bone px-4 py-1.5 text-[0.65rem] text-brown shadow-sm">
                            Delivery in {b.deliveryEstimate}
                          </span>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(b.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="label-uppercase rounded-full border border-bone px-4 py-1.5 text-[0.65rem] text-brown-light transition-all duration-200 hover:border-brown hover:bg-brown hover:text-cream"
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
