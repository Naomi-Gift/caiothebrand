import Link from "next/link";
import Logo from "@/components/Logo";
import { categoryLabels, categoryOrder } from "@/lib/data/menu";

const HEADING =
  "mb-4 font-heading text-[0.75rem] font-bold uppercase tracking-[0.2em] text-cream";
const LINK = "text-[0.95rem] text-bone/65 transition-colors duration-200 hover:text-cream";

const columns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/#menu", label: "Order online" },
      ...categoryOrder.map((id) => ({ href: `/#${id}`, label: categoryLabels[id] })),
      { href: "/about", label: "Our story" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/track", label: "Track an order" },
      { href: "/faqs", label: "FAQs" },
      { href: "/contact", label: "Contact us" },
      { href: "#feedback", label: "Share feedback" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of use" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-brown-darkest">
      <div className="mx-auto max-w-7xl px-4 pb-26 pt-14 sm:px-6 sm:pb-10 sm:pt-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="col-span-2 flex flex-col items-start gap-4 md:col-span-1">
            <Logo variant="reversed" className="[&_img]:h-[58px]" />
            <p className="max-w-xs text-[0.92rem] leading-relaxed text-bone/65">
              Chef-driven Nigerian–Italian fusion pizza. Italian technique, Nigerian
              flavour — made to delight your taste buds.
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className={HEADING}>{col.title}</p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.href.startsWith("#") ? (
                      // Plain anchor so the browser fires hashchange (opens the survey).
                      <a href={l.href} className={LINK}>{l.label}</a>
                    ) : (
                      <Link href={l.href} className={LINK}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.8rem] text-bone/50">
            © {new Date().getFullYear()} Caio Pizza. All rights reserved.
          </p>
          <p className="font-display text-lg text-bone/70">Caio for now.</p>
        </div>
      </div>
    </footer>
  );
}
