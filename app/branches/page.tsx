import { branchList } from "@/lib/data/branches";
import Reveal from "@/components/Reveal";
import PlaceholderImage from "@/components/PlaceholderImage";

export default function BranchesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="label-uppercase text-xs text-brown-light">Find us</p>
      <h1 className="mt-2 font-display text-5xl font-black italic text-brown">
        Owerri &amp; Lagos
      </h1>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {branchList.map((b, i) => (
          <Reveal key={b.id} delay={i * 0.1}>
            <div className="overflow-hidden rounded-2xl bg-crisp shadow-soft">
              <div className="relative">
                <PlaceholderImage
                  label={`${b.name} branch`}
                  src={`/images/branches/${b.id}.jpg`}
                  className="h-40 w-full"
                />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    b.mapsQuery
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-uppercase absolute bottom-3 right-3 rounded-full bg-crisp/90 px-3 py-1.5 text-[0.65rem] text-brown shadow-soft transition-colors hover:bg-crisp"
                >
                  View on map ↗
                </a>
              </div>
              <div className="p-6">
                <h2 className="font-display text-3xl font-black text-brown">
                  {b.name}
                </h2>
                <dl className="mt-4 flex flex-col gap-3 text-sm">
                  <div>
                    <dt className="label-uppercase text-[0.65rem] text-brown-light">
                      Address
                    </dt>
                    <dd className="mt-1 text-brown">{b.address}</dd>
                  </div>
                  <div>
                    <dt className="label-uppercase text-[0.65rem] text-brown-light">
                      Hours
                    </dt>
                    <dd className="mt-1 text-brown">{b.hours}</dd>
                  </div>
                  <div>
                    <dt className="label-uppercase text-[0.65rem] text-brown-light">
                      Phone
                    </dt>
                    <dd className="mt-1 text-brown">{b.phone}</dd>
                  </div>
                  <div>
                    <dt className="label-uppercase text-[0.65rem] text-brown-light">
                      WhatsApp
                    </dt>
                    <dd className="mt-1 text-brown">{b.whatsapp}</dd>
                  </div>
                  <div>
                    <dt className="label-uppercase text-[0.65rem] text-brown-light">
                      Delivery estimate
                    </dt>
                    <dd className="mt-1 text-brown">{b.deliveryEstimate}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
