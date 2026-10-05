import type { Metadata } from "next";
import { InfoCard, InfoHero, InfoShell, PillLink } from "@/components/InfoPage";
import { branchList, mapsUrl, whatsappUrl } from "@/lib/data/branches";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact us — Caio Pizza",
  description: "Call, WhatsApp or message Caio Pizza in Lagos. Owerri coming soon.",
};

export default function ContactPage() {
  return (
    <InfoShell>
      <InfoHero
        kicker="Get in touch"
        title="Contact"
        titleEm="us."
        intro="Questions about an order, catering, or just want to say hi — we're around. The quickest way to reach us is to call or WhatsApp your branch."
        actions={[{ href: "#message", label: "Send a message" }]}
      />

      <InfoCard title="How to reach us">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {branchList.map((b) => (
            <div key={b.id} className="rounded-2xl border border-bone-dark/60 bg-cream p-5">
              <p className="flex items-center gap-2 font-display text-2xl font-bold text-brown-darkest">
                {b.name}
                {b.comingSoon && (
                  <span className="label-uppercase rounded-full bg-brown px-2.5 py-0.5 text-[0.55rem] text-cream">
                    Coming soon
                  </span>
                )}
              </p>
              <p className="mt-1 text-[0.9rem]">{b.address}</p>
              <p className="text-[0.9rem]">{b.hours}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <PillLink href={`tel:${b.phone}`} label={`Call ${b.phone}`} primary />
                <PillLink href={whatsappUrl(b.whatsapp)} label="WhatsApp" external />
                <PillLink href={mapsUrl(b)} label="Directions" external />
              </div>
            </div>
          ))}
        </div>
      </InfoCard>

      <InfoCard title="Helpful details to include">
        <ul className="list-disc space-y-2 pl-5">
          <li>Your order reference, if it&apos;s about an order — it&apos;s on your confirmation screen.</li>
          <li>Which branch you ordered from, and whether it was delivery or pickup.</li>
          <li>The best way to reach you — email or phone.</li>
        </ul>
      </InfoCard>

      <InfoCard title="Send a message" id="message">
        <ContactForm />
      </InfoCard>
    </InfoShell>
  );
}
