import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InfoCard, InfoHero, InfoShell } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Track an order — Caio Pizza" };

async function track(formData: FormData) {
  "use server";
  const ref = String(formData.get("ref") ?? "").trim().replace(/^#/, "");
  if (!ref) redirect("/track");
  redirect(`/track/${encodeURIComponent(ref.slice(0, 60))}`);
}

export default function TrackPage() {
  return (
    <InfoShell>
      <InfoHero
        kicker="Order tracking"
        title="Where's my"
        titleEm="order?"
        intro="Enter the order reference from your confirmation screen to see where it's at."
      />
      <InfoCard title="Track an order">
        <form action={track} className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="ref" className="sr-only">Order reference</label>
          <input
            id="ref"
            name="ref"
            required
            maxLength={60}
            placeholder="Order reference"
            className="flex-1 rounded-full border border-bone-dark bg-cream px-5 py-3 text-brown placeholder:text-brown-light focus:border-brown focus:outline-none"
          />
          <button
            type="submit"
            className="label-uppercase rounded-full bg-brown px-7 py-3 text-xs text-cream transition-colors hover:bg-brown-deep"
          >
            Track
          </button>
        </form>
      </InfoCard>
    </InfoShell>
  );
}
