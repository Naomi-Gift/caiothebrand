import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, InfoHero, InfoShell } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Privacy policy — Caio Pizza" };

export default function PrivacyPage() {
  return (
    <InfoShell>
      <InfoHero
        kicker="Legal · Last updated September 2026"
        title="Privacy"
        titleEm="policy."
        intro="What we collect when you use this site, why, and what you can ask us to do with it."
      />

      <InfoCard title="What we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-brown-darkest">Account details</strong> — your name, email address and,
            if you add it, your phone number. Your password is never stored as written; we keep only a secure
            hash of it.
          </li>
          <li>
            <strong className="text-brown-darkest">Google sign-in</strong> — if you continue with Google, we
            receive your name, email address and profile picture from Google.
          </li>
          <li>
            <strong className="text-brown-darkest">Order details</strong> — what you ordered, the branch,
            delivery or pickup, your delivery address, your name and email, and the payment reference.
          </li>
          <li>
            <strong className="text-brown-darkest">Feedback and messages</strong> — what you tell us in the
            feedback survey or contact form, plus any name, email, phone number or order reference you choose
            to include.
          </li>
        </ul>
      </InfoCard>

      <InfoCard title="Payments">
        <p>
          Payments are handled by Paystack. Your card details go straight to Paystack and are never sent to
          or stored by us. We keep only the payment reference so we can match it to your order.
        </p>
      </InfoCard>

      <InfoCard title="Cookies and storage on your device">
        <p>
          We use cookies to keep you signed in. We also use your browser&apos;s local storage to remember your
          branch, your cart, whether you chose delivery or pickup, saved addresses and your recent orders, so
          they&apos;re still there when you come back.
        </p>
        <p>We don&apos;t use advertising or third-party analytics trackers.</p>
      </InfoCard>

      <InfoCard title="How we use it">
        <p>
          We use your information to run your account, make and deliver your orders, answer your messages
          and improve what we do. We don&apos;t sell your information.
        </p>
      </InfoCard>

      <InfoCard title="Your choices">
        <p>
          You can ask to see, correct or delete the information we hold about you. Send us a request through
          the <Link href="/contact" className="underline">contact page</Link> and we&apos;ll get back to you.
        </p>
      </InfoCard>
    </InfoShell>
  );
}
