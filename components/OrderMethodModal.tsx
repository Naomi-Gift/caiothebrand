"use client";

import { useOrderMethod } from "@/context/OrderMethodContext";
import type { FulfillmentMode } from "@/lib/types";

function PickupIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 9.5V19a1 1 0 0 0 1 1H10v-4.5a2 2 0 0 1 4 0V20h3.5a1 1 0 0 0 1-1V9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7h11v9H3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 10h4l3 3v3h-7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="18.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

const OPTIONS: {
  mode: FulfillmentMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    mode: "pickup",
    label: "Pickup",
    description: "Grab it fresh from the branch.",
    icon: <PickupIcon />,
  },
  {
    mode: "delivery",
    label: "Delivery",
    description: "We bring it straight to your door.",
    icon: <DeliveryIcon />,
  },
];

export default function OrderMethodModal() {
  const { isPromptOpen, closePrompt, chooseFulfillment } = useOrderMethod();

  if (!isPromptOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-brown-darkest/60 p-0 sm:items-center sm:p-6"
      onClick={closePrompt}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-crisp p-6 shadow-soft-lg sm:rounded-3xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="label-uppercase text-xs text-brown-light">Order Now</p>
        <h2 className="mt-2 font-display text-3xl font-black italic text-brown">
          How would you like your order?
        </h2>
        <p className="mt-3 text-sm text-brown-light">
          Please select your preferred order method.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {OPTIONS.map((option) => (
            <button
              key={option.mode}
              type="button"
              onClick={() => chooseFulfillment(option.mode)}
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

        <button
          type="button"
          onClick={closePrompt}
          className="mt-4 text-xs text-brown-light underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
