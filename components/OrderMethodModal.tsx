"use client";

import { useState, useEffect } from "react";
import { useOrderMethod } from "@/context/OrderMethodContext";
import { useBranch } from "@/context/BranchContext";
import { branchList } from "@/lib/data/branches";
import type { FulfillmentMode } from "@/lib/types";
import type { BranchId } from "@/lib/types";

// ─── Icons ───────────────────────────────────────────────────────────────────

function PickupIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.5V19a1 1 0 0 0 1 1H10v-4.5a2 2 0 0 1 4 0V20h3.5a1 1 0 0 0 1-1V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 7h11v9H3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 10h4l3 3v3h-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="7" cy="18.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="18.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function LocationPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Step 1: Method selection ─────────────────────────────────────────────────

const METHOD_OPTIONS: {
  mode: FulfillmentMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    mode: "pickup",
    label: "Pick-up",
    description: "Take your meal at the restaurant.",
    icon: <PickupIcon />,
  },
  {
    mode: "delivery",
    label: "Delivery",
    description: "Receive your food at your doorstep.",
    icon: <DeliveryIcon />,
  },
];

// ─── Step 2 — Delivery: location input ───────────────────────────────────────

function DeliveryLocationStep({ onBack }: { onBack: () => void }) {
  const { confirmLocation } = useOrderMethod();
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationNote("Location isn't available on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setLocationNote("Location detected — you can refine it below.");
        setLocating(false);
      },
      () => {
        setLocationNote("Couldn't get your location. Enter it manually.");
        setLocating(false);
      }
    );
  };

  const canContinue = address.trim().length > 0;

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-xs text-brown-light hover:text-brown"
      >
        <BackArrow />
        Go Back
      </button>

      <p className="label-uppercase text-xs text-brown-light">Delivery</p>
      <h2 className="mt-2 font-display text-3xl font-black italic text-brown">
        Select your location
      </h2>
      <p className="mt-1 text-sm text-brown-light">
        Share your location so we can deliver right to you.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="flex items-center justify-center gap-2 rounded-full bg-brown px-5 py-3 text-sm font-semibold text-cream shadow-soft transition-all duration-200 hover:scale-[1.01] hover:shadow-soft-lg disabled:opacity-60"
        >
          <LocationPinIcon />
          {locating ? "Detecting…" : "Use my location"}
        </button>

        {locationNote && (
          <p className="text-center text-xs text-brown-light">{locationNote}</p>
        )}

        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-bone" />
          <span className="text-xs text-brown-light">or enter address below</span>
          <div className="h-px flex-1 bg-bone" />
        </div>

        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street address"
          className="rounded-full bg-bone px-4 py-3 text-sm text-brown placeholder:text-brown-light focus:outline-none focus:ring-2 focus:ring-brown/30"
        />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City (e.g. Owerri, Lagos)"
          className="rounded-full bg-bone px-4 py-3 text-sm text-brown placeholder:text-brown-light focus:outline-none focus:ring-2 focus:ring-brown/30"
        />

        <button
          type="button"
          onClick={() =>
            confirmLocation({ line1: address.trim(), city: city.trim() || undefined })
          }
          disabled={!canContinue}
          className="mt-1 rounded-full bg-brown px-5 py-3 text-sm font-semibold text-cream shadow-soft transition-all duration-200 hover:scale-[1.01] hover:shadow-soft-lg disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue to menu →
        </button>
      </div>
    </>
  );
}

// ─── Step 2 — Pickup: branch selection ───────────────────────────────────────

function PickupBranchStep({ onBack }: { onBack: () => void }) {
  const { confirmLocation } = useOrderMethod();
  const { setBranch } = useBranch();

  const choose = (branchId: BranchId) => {
    setBranch(branchId);
    confirmLocation(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-xs text-brown-light hover:text-brown"
      >
        <BackArrow />
        Go Back
      </button>

      <p className="label-uppercase text-xs text-brown-light">Pick-up</p>
      <h2 className="mt-2 font-display text-3xl font-black italic text-brown">
        Choose your branch
      </h2>
      <p className="mt-1 text-sm text-brown-light">
        Select the location you&apos;ll collect your order from.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {branchList.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => choose(b.id)}
            className="flex flex-col rounded-2xl bg-bone px-5 py-4 text-left shadow-soft transition-all duration-200 hover:scale-[1.01] hover:bg-brown hover:text-cream hover:shadow-soft-lg"
          >
            <span className="font-display text-xl font-black">{b.name}</span>
            <span className="mt-0.5 text-xs opacity-75">{b.address}</span>
            <span className="mt-1 text-xs opacity-60">{b.hours}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Root modal ───────────────────────────────────────────────────────────────

export default function OrderMethodModal() {
  const { isPromptOpen, fulfillment, closePrompt, chooseFulfillment, clearFulfillment } =
    useOrderMethod();

  // null  → show step 1 (method choice)
  // set   → jump straight to the location/branch step
  // We track an *explicit* user selection separately so hitting "Go Back"
  // returns to step 1 even when fulfillment is already set.
  const [explicitStep, setExplicitStep] = useState<FulfillmentMode | null>(null);
  const [wasOpen, setWasOpen] = useState(false);

  // Reset local step whenever the modal transitions from closed → open
  useEffect(() => {
    if (isPromptOpen && !wasOpen) {
      setExplicitStep(null); // let derived logic below decide the starting step
    }
    setWasOpen(isPromptOpen);
  }, [isPromptOpen, wasOpen]);

  if (!isPromptOpen) return null;

  // If the hero pre-selected a mode (via startOrder) and the user hasn't
  // explicitly gone back, jump straight to step 2.
  const step: FulfillmentMode | null = explicitStep ?? fulfillment ?? null;
  const atStep1 = explicitStep === null && !fulfillment;

  const handleChoose = (mode: FulfillmentMode) => {
    chooseFulfillment(mode);
    setExplicitStep(mode);
  };

  const handleBack = () => {
    setExplicitStep(null);
    clearFulfillment();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-brown-darkest/60 p-0 sm:items-center sm:p-6"
      onClick={() => {
        if (atStep1 && fulfillment) closePrompt();
      }}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-crisp p-6 shadow-soft-lg sm:rounded-3xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step 1 — method choice */}
        {atStep1 && (
          <>
            <p className="label-uppercase text-xs text-brown-light">Order Now</p>
            <h2 className="mt-2 font-display text-3xl font-black italic text-brown">
              How would you like to order?
            </h2>

            <div className="mt-6 flex flex-col gap-3">
              {METHOD_OPTIONS.map((option) => (
                <button
                  key={option.mode}
                  type="button"
                  onClick={() => handleChoose(option.mode)}
                  className="flex items-center gap-4 rounded-2xl bg-bone px-4 py-4 text-left shadow-soft transition-all duration-200 hover:scale-[1.01] hover:bg-brown hover:text-cream hover:shadow-soft-lg"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-crisp text-brown">
                    {option.icon}
                  </span>
                  <span>
                    <span className="label-uppercase block text-sm">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs opacity-80">
                      {option.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {fulfillment && (
              <button
                type="button"
                onClick={closePrompt}
                className="mt-4 text-xs text-brown-light underline"
              >
                Cancel
              </button>
            )}
          </>
        )}

        {/* Step 2 — location / branch */}
        {step === "delivery" && <DeliveryLocationStep onBack={handleBack} />}
        {step === "pickup" && <PickupBranchStep onBack={handleBack} />}
      </div>
    </div>
  );
}
