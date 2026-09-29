import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, InfoHero, InfoShell } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Terms of use — Caio Pizza" };

export default function TermsPage() {
  return (
    <InfoShell>
      <InfoHero
        kicker="Legal · Last updated September 2026"
        title="Terms of"
        titleEm="use."
        intro="The basics of ordering from Caio Pizza online."
      />
      <InfoCard title="Prices and fees">
        <p>
          Prices are shown in Naira on the menu. The full amount, including any discount and fees, is shown
          at checkout before you pay. Menu items, prices and availability can change.
        </p>
      </InfoCard>
      <InfoCard title="Payment">
        <p>Orders are paid online at checkout through Paystack. An order is placed once payment is confirmed.</p>
      </InfoCard>
      <InfoCard title="Changes and problems">
        <p>
          If you need to change an order or something isn&apos;t right, contact the branch that made it as soon
          as you can — call or WhatsApp them from the <Link href="/contact" className="underline">contact page</Link>{" "}
          with your order reference.
        </p>
      </InfoCard>
      <InfoCard title="Allergies">
        <p>
          If you have an allergy or dietary need, please contact the branch before ordering so they can
          advise you on ingredients.
        </p>
      </InfoCard>
      <InfoCard title="Your account">
        <p>
          You&apos;re responsible for keeping your sign-in details safe and for orders placed from your account.
          Let us know if you think someone else has used it.
        </p>
      </InfoCard>
      <InfoCard title="Updates">
        <p>We may update these terms from time to time. The date at the top shows when they last changed.</p>
      </InfoCard>
    </InfoShell>
  );
}
