"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useBranch } from "@/context/BranchContext";
import { useAccount } from "@/context/AccountContext";
import { useOrderMethod } from "@/context/OrderMethodContext";
import { formatNaira } from "@/lib/format";
import { saveOrder } from "@/lib/orders";
import Button from "@/components/Button";
import type { FulfillmentMode, OrderRecord, SavedAddress } from "@/lib/types";

const LAST_ORDER_KEY = "caio-last-order-id";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, discount, total, promoCode, clearCart } = useCart();
  const { branch, openPrompt } = useBranch();
  const { account, hydrated, addAddress } = useAccount();
  const { fulfillment: chosenFulfillment } = useOrderMethod();

  useEffect(() => {
    if (hydrated && !account) {
      router.replace("/login?redirect=/checkout");
    }
  }, [hydrated, account, router]);

  useEffect(() => {
    if (hydrated && account && !branch) {
      openPrompt();
    }
  }, [hydrated, account, branch, openPrompt]);

  const [fulfillment, setFulfillment] = useState<FulfillmentMode>(
    chosenFulfillment ?? "delivery"
  );
  const seededFulfillment = useRef(false);

  useEffect(() => {
    // OrderMethodContext hydrates from localStorage asynchronously, so the
    // Order Now selection may not be there yet on the very first render —
    // seed it in as soon as it arrives, but only once, so the toggle below
    // owns the value after that.
    if (!seededFulfillment.current && chosenFulfillment) {
      setFulfillment(chosenFulfillment);
      seededFulfillment.current = true;
    }
  }, [chosenFulfillment]);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const { orderAddress } = useOrderMethod();
  const [addressLine, setAddressLine] = useState(orderAddress?.line1 ?? "");
  const [addressCity, setAddressCity] = useState(orderAddress?.city ?? "");
  const [addressNotes, setAddressNotes] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [saveThisAddress, setSaveThisAddress] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const savedAddress: SavedAddress | undefined = account?.addresses.find(
    (a) => a.id === selectedAddressId
  );

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationNote("Location isn't available on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationNote(
          `Location detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        );
        setLocating(false);
      },
      () => {
        setLocationNote("Couldn't get your location. Enter it manually.");
        setLocating(false);
      }
    );
  };

  const addressReady =
    fulfillment === "pickup" ||
    Boolean(savedAddress) ||
    addressLine.trim().length > 0;

  const canPay = lines.length > 0 && addressReady && branch;

  const handlePay = async () => {
    if (!canPay || !branch || !account) return;
    setPayError(null);
    setPaying(true);

    // Save new address to account if requested
    if (fulfillment === "delivery" && saveThisAddress && addressLine.trim()) {
      addAddress({
        label: "New address",
        line1: addressLine.trim(),
        city: addressCity.trim() || branch.name,
        notes: addressNotes.trim() || undefined,
      });
    }

    // Build a unique reference so the order can be traced back after verification
    const reference = `CAIO-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    // Paystack amount is in kobo (smallest currency unit) — multiply by 100
    const amountKobo = Math.round(total * 100);

    // Lazily import the Paystack popup (client-only)
    let PaystackPop: Awaited<typeof import("@paystack/inline-js")>["default"];
    try {
      PaystackPop = (await import("@paystack/inline-js")).default;
    } catch {
      setPayError("Could not load payment module. Please refresh and try again.");
      setPaying(false);
      return;
    }

    try {
      const popup = new PaystackPop();
      popup.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
      email: account.email,
      amount: amountKobo,
      currency: "NGN",
      reference,
      metadata: {
        branchId: branch.id,
        fulfillment,
        promoCode: promoCode ?? undefined,
      },

      onSuccess: async (response: { reference: string }) => {
        // Verify the payment server-side before saving the order
        try {
          const res = await fetch("/api/paystack/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: response.reference }),
          });

          if (!res.ok) {
            const err = (await res.json()) as { error?: string };
            setPayError(
              err.error ?? "Payment verification failed. Contact support."
            );
            setPaying(false);
            return;
          }

          // Payment confirmed — persist order to DB then clear the cart
          const orderPayload = {
            branchId: branch.id,
            fulfillment: fulfillment.toUpperCase(),
            lines,
            subtotal,
            discount,
            total,
            promoCode: promoCode ?? null,
            paystackRef: response.reference,
            deliveryAddress:
              fulfillment === "delivery"
                ? savedAddress
                  ? `${savedAddress.line1}, ${savedAddress.city}`
                  : addressLine.trim()
                    ? `${addressLine.trim()}${addressCity.trim() ? `, ${addressCity.trim()}` : ""}`
                    : null
                : null,
            customerEmail: account.email,
            customerName: account.name ?? null,
          };

          let orderId = response.reference;
          try {
            const orderRes = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(orderPayload),
            });
            if (orderRes.ok) {
              const saved = await orderRes.json() as { id: string };
              orderId = saved.id;
            }
          } catch {
            // Non-fatal — order is verified, just couldn't persist to DB
            console.error("Failed to save order to DB");
          }

          // Also keep local record for confirmation page fallback
          const order: OrderRecord = {
            id: orderId,
            createdAt: new Date().toISOString(),
            branchId: branch.id,
            fulfillment,
            lines,
            subtotal,
            discount,
            total,
            promoCode: promoCode ?? undefined,
            status: "received",
          };
          saveOrder(order);
          window.localStorage.setItem(LAST_ORDER_KEY, orderId);
          clearCart();
          router.push("/checkout/confirmation");
        } catch {
          setPayError("Something went wrong verifying your payment. Contact support.");
          setPaying(false);
        }
      },

      onCancel: () => {
        // User closed the popup without paying
        setPaying(false);
      },
    });
    } catch {
      setPayError("Payment could not be started. Please try again.");
      setPaying(false);
    }
  };

  if (!hydrated || !account) return null;

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-black italic text-brown">
          Ciao. What&apos;ll it be?
        </h1>
        <p className="mt-3 text-sm text-brown-light">
          Add something to your cart before checking out.
        </p>
        <Button href="/menu" className="mt-8">
          Browse the menu
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-black italic text-brown">
        Checkout
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-8">
          <div>
            <p className="label-uppercase text-xs text-brown-light">
              Delivery or pickup
            </p>
            <div className="mt-3 flex gap-2">
              {(["delivery", "pickup"] as FulfillmentMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFulfillment(mode)}
                  className={`label-uppercase flex-1 rounded-full border-2 border-brown px-4 py-3 text-xs transition-all duration-200 ${
                    fulfillment === mode
                      ? "bg-brown text-cream shadow-soft"
                      : "bg-crisp text-brown hover:bg-bone"
                  }`}
                >
                  {mode === "delivery" ? "Delivery" : "Branch pickup"}
                </button>
              ))}
            </div>
          </div>

          {fulfillment === "pickup" ? (
            <div className="rounded-2xl bg-crisp p-5 shadow-soft">
              <p className="label-uppercase text-xs text-brown-light">
                Pickup from
              </p>
              <h2 className="mt-2 font-display text-2xl font-black text-brown">
                {branch?.name}
              </h2>
              <p className="mt-1 text-sm text-brown-light">
                {branch?.address}
              </p>
              <p className="mt-1 text-sm text-brown-light">{branch?.hours}</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-crisp p-5 shadow-soft">
              <p className="label-uppercase text-xs text-brown-light">
                Delivery address
              </p>

              {account && account.addresses.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {account.addresses.map((a) => (
                    <label
                      key={a.id}
                      className="flex cursor-pointer items-center gap-2 rounded-xl bg-cream px-3 py-2 text-sm text-brown"
                    >
                      <input
                        type="radio"
                        name="saved-address"
                        checked={selectedAddressId === a.id}
                        onChange={() => setSelectedAddressId(a.id)}
                        className="h-4 w-4 accent-[#3A2418]"
                      />
                      {a.line1}, {a.city}
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedAddressId(null)}
                    className="label-uppercase self-start text-[0.65rem] text-brown-light underline"
                  >
                    Use a new address instead
                  </button>
                </div>
              )}

              {!savedAddress && (
                <div className="mt-3 flex flex-col gap-3">
                  <Button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locating}
                    variant="outline"
                    size="sm"
                    className="self-start"
                  >
                    {locating ? "Locating…" : "Use my location"}
                  </Button>
                  {locationNote && (
                    <p className="text-xs text-brown-light">{locationNote}</p>
                  )}
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Street address"
                    className="rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light focus:outline-none"
                  />
                  <input
                    type="text"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    placeholder={`City (${branch?.name ?? ""})`}
                    className="rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light focus:outline-none"
                  />
                  <input
                    type="text"
                    value={addressNotes}
                    onChange={(e) => setAddressNotes(e.target.value)}
                    placeholder="Delivery notes (optional)"
                    className="rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light focus:outline-none"
                  />
                  {account && (
                    <label className="flex items-center gap-2 text-xs text-brown-light">
                      <input
                        type="checkbox"
                        checked={saveThisAddress}
                        onChange={(e) => setSaveThisAddress(e.target.checked)}
                        className="h-4 w-4 accent-[#3A2418]"
                      />
                      Save this address to my account
                    </label>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-fit rounded-2xl bg-crisp p-6 shadow-soft">
          <p className="label-uppercase text-xs text-brown-light">
            Order summary
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-brown-light">
            {lines.map((line) => (
              <li key={line.lineId} className="flex justify-between">
                <span>
                  {line.quantity}× {line.name}
                </span>
                <span>{formatNaira(line.unitPrice * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-1 border-t border-bone pt-4 text-sm">
            <div className="flex justify-between text-brown-light">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-brown-light">
                <span>Discount</span>
                <span>−{formatNaira(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-display text-xl font-black text-brown">
              <span>Total</span>
              <span>{formatNaira(total)}</span>
            </div>
          </div>

          {payError && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-xs text-red-600">
              {payError}
            </p>
          )}

          <Button
            onClick={handlePay}
            disabled={!canPay || paying}
            className="mt-6 w-full"
          >
            {paying ? "Processing…" : "Pay with Paystack"}
          </Button>
        </div>
      </div>
    </div>
  );
}
