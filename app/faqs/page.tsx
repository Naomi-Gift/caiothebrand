import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, InfoHero, InfoShell } from "@/components/InfoPage";
import { branchList } from "@/lib/data/branches";

export const metadata: Metadata = {
  title: "FAQs — Caio Pizza",
  description: "Answers about ordering, delivery, payment and your account.",
};

type QA = { q: string; a: React.ReactNode };

const SECTIONS: { id: string; title: string; items: QA[] }[] = [
  {
    id: "ordering",
    title: "Ordering",
    items: [
      {
        q: "How do I order?",
        a: (
          <>
            Pick your branch and whether you want delivery or pickup, choose from the{" "}
            <Link href="/#menu" className="underline">menu</Link>, then check out. You&apos;ll need
            to sign in or create an account to place an order.
          </>
        ),
      },
      {
        q: "Can I customise my pizza?",
        a: "Yes. Choose your size, add extra toppings, and add sides or drinks from the same screen before it goes in your cart.",
      },
      {
        q: "Do you have promo codes?",
        a: "From time to time. If you have one, enter it in your cart and the discount is shown before you pay.",
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery & pickup",
    items: [
      {
        q: "Where do you deliver?",
        a: (
          <>
            We deliver from our branches: {branchList.map((b) => `${b.name}${b.comingSoon ? " (coming soon)" : ""}`).join(" and ")}.
            Choose your branch when you start an order.
          </>
        ),
      },
      {
        q: "How long does delivery take?",
        a: `Typical estimates: ${branchList.map((b) => `${b.name} ${b.deliveryEstimate}`).join(", ")}. Busy times can take longer.`,
      },
      {
        q: "Can I pick up instead?",
        a: "Yes — choose Branch pickup at checkout and collect your order from the branch you picked.",
      },
      {
        q: "How do I check on my order?",
        a: (
          <>
            Use <Link href="/track" className="underline">Track an order</Link> with the order reference
            from your confirmation, or open your account.
          </>
        ),
      },
    ],
  },
  {
    id: "payment",
    title: "Payment",
    items: [
      {
        q: "How can I pay?",
        a: "Online at checkout through Paystack. We never see or store your card details.",
      },
      {
        q: "Are there extra fees?",
        a: "Prices and any fees are shown at checkout before you pay.",
      },
    ],
  },
  {
    id: "account",
    title: "Your account",
    items: [
      {
        q: "Do I need an account?",
        a: "Yes, to check out. You can sign up with email and password or continue with Google.",
      },
      {
        q: "Something went wrong with my order.",
        a: (
          <>
            Get in touch with the branch that made it — call or WhatsApp them from the{" "}
            <Link href="/contact" className="underline">contact page</Link>, and have your order reference handy.
          </>
        ),
      },
      {
        q: "I have an allergy. Can you help?",
        a: "Please contact the branch before you order so they can tell you what goes into each item.",
      },
    ],
  },
];

export default function FaqsPage() {
  return (
    <InfoShell>
      <InfoHero
        kicker="Help"
        title="Frequently asked"
        titleEm="questions."
        intro="Quick answers about ordering, delivery, payment and your account."
      >
        <div className="mt-2 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="label-uppercase rounded-full border border-bone-dark bg-crisp px-4 py-2 text-[0.65rem] text-brown transition-colors hover:border-brown hover:bg-brown hover:text-cream"
            >
              {s.title}
            </a>
          ))}
        </div>
      </InfoHero>

      {SECTIONS.map((s) => (
        <InfoCard key={s.id} id={s.id} title={s.title}>
          <div className="-my-2 divide-y divide-bone-dark/60">
            {s.items.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-[1rem] font-bold text-brown-darkest [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-bone-dark text-brown transition-transform duration-200 group-open:rotate-45"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <div className="pt-3">{item.a}</div>
              </details>
            ))}
          </div>
        </InfoCard>
      ))}
    </InfoShell>
  );
}
