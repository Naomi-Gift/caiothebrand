"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { useBranch } from "@/context/BranchContext";
import { branchList } from "@/lib/data/branches";

// 4 hero pizzas for the footer strip — enough variety, not overwhelming
const PIZZA_SLUGS = [
  "chicken-suya-experience", "margherita", "bbq-chicken", "beef-suya-experience",
];
const STRIP = [...PIZZA_SLUGS, ...PIZZA_SLUGS, ...PIZZA_SLUGS, ...PIZZA_SLUGS];

export default function Footer() {
  const { branch } = useBranch();
  const activeBranch = branch ?? branchList[0];

  return (
    <footer className="relative overflow-hidden">

      {/* ── Scrolling pizza photo background ─────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex gap-2"
        style={{
          width: `${STRIP.length * 220}px`,
          animation: "footerScroll 55s linear infinite",
        }}
      >
        {STRIP.map((slug, i) => (
          <div
            key={`${slug}-${i}`}
            className="h-full shrink-0 overflow-hidden"
            style={{ width: "210px" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/menu/${slug}.jpg`}
              alt=""
              className="h-full w-full object-cover"
              style={{ transform: "scale(1.08)" }}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* ── Brown transparent overlay — covers everything ─────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, rgba(26,14,8,0.90) 0%, rgba(40,23,16,0.87) 100%)",
        }}
      />

      {/* Edge fades */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-24"
        style={{ background: "linear-gradient(to right, rgba(26,14,8,0.96), transparent)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-24"
        style={{ background: "linear-gradient(to left, rgba(26,14,8,0.96), transparent)" }}
      />

      {/* ── Footer content ───────────────────────────────────────────────── */}
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3">

        {/* Brand */}
        <div>
          <Logo variant="reversed" />
          <p className="mt-4 max-w-xs font-display text-sm italic text-bone/70">
            Made to delight your taste buds.
          </p>
          <p className="mt-2 text-xs text-bone/40">
            Owerri &amp; Lagos · Est. 2022
          </p>
        </div>

        {/* Links */}
        <div>
          <p className="label-uppercase text-[0.6rem] text-bone/40">Explore</p>
          <ul className="mt-3 flex flex-col gap-2.5 text-sm">
            {[
              { href: "/menu",     label: "Menu" },
              { href: "/branches", label: "Branches" },
              { href: "/account",  label: "Account" },
              { href: "/contact",  label: "Contact" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-bone/60 transition-colors duration-200 hover:text-cream"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Branch */}
        <div>
          <p className="label-uppercase text-[0.6rem] text-bone/40">
            {activeBranch.name} branch
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-bone/60">
            <li>{activeBranch.address}</li>
            <li>{activeBranch.hours}</li>
            <li>
              <a
                href={`tel:${activeBranch.phone}`}
                className="transition-colors hover:text-cream"
              >
                {activeBranch.phone}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${activeBranch.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-cream"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="relative border-t px-4 py-5 text-center text-xs text-bone/30 sm:px-6"
        style={{ borderColor: "rgba(235,226,207,0.12)" }}
      >
        <p>© {new Date().getFullYear()} Caio Pizza · Owerri &amp; Lagos. Caio for now.</p>
      </div>

      <style>{`
        @keyframes footerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </footer>
  );
}
