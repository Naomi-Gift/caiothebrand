import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, InfoHero, InfoShell } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Accessibility — Caio Pizza" };

export default function AccessibilityPage() {
  return (
    <InfoShell>
      <InfoHero
        kicker="Legal · Last updated September 2026"
        title="Accessibility"
        titleEm="statement."
        intro="We want everyone to be able to order from Caio Pizza."
      />
      <InfoCard title="What we support">
        <ul className="list-disc space-y-2 pl-5">
          <li>The site works on phones, tablets and desktops, and text can be zoomed.</li>
          <li>You can move through the menu, cart and checkout with a keyboard, with a visible focus outline.</li>
          <li>Dialogs close with the Esc key, and buttons and images carry labels for screen readers.</li>
          <li>Text and controls are designed with strong contrast against the background.</li>
        </ul>
      </InfoCard>
      <InfoCard title="Report a problem">
        <p>
          If something is hard to use, please tell us what page you were on and what happened through the{" "}
          <Link href="/contact" className="underline">contact page</Link>. You can also call or WhatsApp your
          branch to place an order.
        </p>
      </InfoCard>
    </InfoShell>
  );
}
