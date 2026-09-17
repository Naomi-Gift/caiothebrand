"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { useBranch } from "@/context/BranchContext";
import { branchList } from "@/lib/data/branches";

/**
 * Glint effect — a shimmer sweep that runs on hover/active.
 * Applied via inline style + a CSS class defined in the <style> tag below.
 */
const GLINT =
  "footer-glint text-bone/55 transition-all duration-200 cursor-pointer select-none";

export default function Footer() {
  const { branch } = useBranch();
  const activeBranch = branch ?? branchList[0];

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1a0e08 0%, #281710 60%, #3a2418 100%)" }}
    >
      {/* Top glow line */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(139,111,79,0.7) 30%, rgba(235,226,207,0.5) 50%, rgba(139,111,79,0.7) 70%, transparent)",
        }}
      />
      {/* Warm glow blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-4rem] top-[-4rem] h-64 w-64 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #8b6f4f 0%, transparent 70%)" }}
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">

        <div className="flex flex-wrap items-start justify-between gap-6">

          {/* Brand */}
          <div className="flex flex-col gap-1.5">
            <Logo variant="reversed" />
            <p className={`font-display text-sm italic ${GLINT}`}>
              Bold, not loud.
            </p>
          </div>

          {/* Nav */}
          <nav className="hidden sm:flex flex-col gap-1.5" aria-label="Footer navigation">
            <p className="label-uppercase text-[0.55rem] tracking-widest text-bone/30 mb-1">
              Navigate
            </p>
            {[
              { href: "/menu",     label: "Menu" },
              { href: "/branches", label: "Branches" },
              { href: "/account",  label: "Account" },
              { href: "/contact",  label: "Contact" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-xs ${GLINT}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Branch */}
          <div className="flex flex-col gap-1.5">
            <p className="label-uppercase text-[0.55rem] tracking-widest text-bone/30 mb-1">
              {activeBranch.name}
            </p>
            <p className={`text-xs ${GLINT}`}>{activeBranch.hours}</p>
            <a
              href={`tel:${activeBranch.phone}`}
              className={`text-xs ${GLINT}`}
            >
              {activeBranch.phone}
            </a>
            <a
              href={`https://wa.me/${activeBranch.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs ${GLINT}`}
            >
              WhatsApp ↗
            </a>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-start sm:items-end">
            <Link
              href="/menu"
              className="footer-glint rounded-full border border-bone/20 px-4 py-2 label-uppercase text-[0.65rem] text-bone/60 transition-all hover:border-bone/40"
            >
              Order now →
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-6 flex flex-col items-center gap-1 border-t pt-4 sm:flex-row sm:justify-between"
          style={{ borderColor: "rgba(235,226,207,0.08)" }}
        >
          <p className={`text-[0.65rem] text-bone/25 ${GLINT}`}>
            © {new Date().getFullYear()} Caio Pizza. All rights reserved.
          </p>
          <p className={`font-display text-[0.65rem] italic text-bone/20 ${GLINT}`}>
            Caio for now.
          </p>
        </div>
      </div>

      {/* ── Glint keyframe + class ─────────────────────────────────────────
          On hover/active a bright shimmer sweeps left→right across the text.
          Uses background-clip so only the text catches the light.
      ──────────────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes glintSweep {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .footer-glint {
          background: linear-gradient(
            90deg,
            rgba(235,226,207,0.55) 0%,
            rgba(235,226,207,0.55) 40%,
            rgba(255,245,220,1)    50%,
            rgba(235,226,207,0.55) 60%,
            rgba(235,226,207,0.55) 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-position: 0% center;
          transition: background-position 0s;
        }

        .footer-glint:hover,
        .footer-glint:active {
          animation: glintSweep 0.6s ease forwards;
        }
      `}</style>
    </footer>
  );
}
