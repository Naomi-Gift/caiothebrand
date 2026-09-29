import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, InfoHero, InfoShell } from "@/components/InfoPage";
import { branchList } from "@/lib/data/branches";

export const metadata: Metadata = {
  title: "Our story — Caio Pizza",
  description: "Chef-driven Nigerian–Italian fusion pizza from Lagos.",
};

const STEPS = [
  { name: "Pick a pizza", text: "Start from one of our signature pies — suya, pepper chicken, BBQ and more." },
  { name: "Make it yours", text: "Choose a size, then pile on extra toppings from cheese to red chilli." },
  { name: "Round it out", text: "Add sides and drinks, then choose delivery or branch pickup." },
];

export default function AboutPage() {
  return (
    <InfoShell>
      <InfoHero
        kicker="Our story"
        title="Freshly made,"
        titleEm="your way."
        intro="Caio is chef-driven fusion pizza from Lagos, Nigeria — Italian technique, Nigerian flavour, made to delight your taste buds."
        actions={[
          { href: "/#menu", label: "Start ordering" },
          { href: "/branches", label: "View locations" },
        ]}
      />

      <InfoCard title="Where we come from">
        <p>
          Caio comes from Lagos. The idea is simple: Italian pizza technique, topped
          with Nigerian flavour — suya spice and yaji, pepper chicken, smoked sausage,
          caramelised onions — on a hot crust.
        </p>
        <p>
          Our name is a warm hello, and we&apos;re now bringing it to Owerri too.
          Caio for now.
        </p>
      </InfoCard>

      <InfoCard title="Made the way you like it">
        <p>
          Every pizza comes in several sizes, and you can add extra toppings to any of
          them. Tell us how you like it and we&apos;ll make it that way.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.name} className="rounded-2xl border border-bone-dark/60 bg-cream p-5">
              <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.3em] text-brown-light">
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 font-display text-xl font-bold text-brown-darkest">{s.name}</p>
              <p className="mt-1 text-[0.9rem] text-brown-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </InfoCard>

      <InfoCard title="Find us">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {branchList.map((b) => (
            <Link
              key={b.id}
              href="/branches"
              className="group rounded-2xl border border-bone-dark/60 bg-cream p-5 transition-colors hover:border-brown"
            >
              <p className="flex items-center gap-2 font-display text-2xl font-bold text-brown-darkest">
                {b.name}
                {b.comingSoon && (
                  <span className="label-uppercase rounded-full bg-brown px-2.5 py-0.5 text-[0.55rem] text-cream">
                    Coming soon
                  </span>
                )}
              </p>
              <p className="mt-1 text-[0.9rem] text-brown-muted">{b.address}</p>
              <p className="mt-1 text-[0.9rem] text-brown-muted">{b.hours}</p>
            </Link>
          ))}
        </div>
      </InfoCard>
    </InfoShell>
  );
}
