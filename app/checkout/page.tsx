"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useBranch } from "@/context/BranchContext";
import { useAccount } from "@/context/AccountContext";
import { useOrderMethod } from "@/context/OrderMethodContext";
import { formatNaira } from "@/lib/format";
import { paystackFee } from "@/lib/paystackFee";
import { saveOrder } from "@/lib/orders";
import Button from "@/components/Button";
import type { FulfillmentMode, OrderRecord, SavedAddress } from "@/lib/types";

const LAST_ORDER_KEY = "caio-last-order-id";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, discount, total, promoCode, clearCart } = useCart();
  // Paystack's fee is paid by the customer, on top of the food total.
  const fee = paystackFee(total);
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

  const [priceConfirmed, setPriceConfirmed] = useState<number | null>(null);
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
  // The branch (and ERPNext) needs a number to reach the customer.
  const [phone, setPhone] = useState("");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("caio-phone");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a saved value from localStorage
      if (saved) setPhone(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);
  const phoneReady = phone.replace(/\D/g, "").length >= 7;
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

  const canPay = lines.length > 0 && addressReady && phoneReady && branch;
  // Say why Pay is greyed out instead of leaving a dead button.
  const payBlocker = !branch
    ? "Choose a branch first."
    : !phoneReady
      ? "Add your phone number above to continue."
      : !addressReady
        ? "Add your delivery address above to continue."
        : null;

  const deliveryAddressText = () =>
    fulfillment === "delivery"
      ? savedAddress
        ? `${savedAddress.line1}, ${savedAddress.city}`
        : addressLine.trim()
          ? `${addressLine.trim()}${addressCity.trim() ? `, ${addressCity.trim()}` : ""}`
          : null
      : null;

  const handlePay = async () => {
    if (!canPay || !branch || !account) return;
    try {
      window.localStorage.setItem("caio-phone", phone.trim());
    } catch {
      /* storage unavailable */
    }
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

    // The server prices the cart, picks the branch's Paystack subaccount and
    // starts the payment; the browser only gets an access code, so the
    // amount and destination account can't be changed here.
    let accessCode: string;
    try {
      const r = await fetch("/api/checkout/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: branch.id,
          fulfillment: fulfillment.toUpperCase(),
          lines,
          promoCode: promoCode ?? null,
          phone: phone.trim(),
          deliveryAddress: deliveryAddressText(),
          expectedTotal: total,
          confirmTotal: priceConfirmed,
        }),
      });
      const started = (await r.json().catch(() => ({}))) as {
        accessCode?: string;
        total?: number;
        priceChanged?: boolean;
        error?: string;
      };
      if (started.priceChanged && typeof started.total === "number") {
        // Menu prices changed since these items were added: show the real
        // total first, and charge it when they tap pay again.
        setPayError(
          `Prices have changed since you added these items — your total is now ${formatNaira(started.total + paystackFee(started.total))}. Tap pay again to continue.`
        );
        setPriceConfirmed(started.total);
        setPaying(false);
        return;
      }
      if (!r.ok || !started.accessCode) {
        setPayError(started.error ?? "Payment couldn't start. Please try again.");
        setPaying(false);
        return;
      }
      accessCode = started.accessCode;
    } catch {
      setPayError("Couldn't reach the server. Check your connection and try again.");
      setPaying(false);
      return;
    }

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
      popup.resumeTransaction(accessCode, {
      onSuccess: async (response: { reference: string }) => {
        // The server confirms the payment with Paystack, re-prices the cart
        // from the menu and only then saves the order.
        try {
          const orderPayload = {
            branchId: branch.id,
            fulfillment: fulfillment.toUpperCase(),
            lines,
            promoCode: promoCode ?? null,
            paystackRef: response.reference,
            deliveryAddress: deliveryAddressText(),
            phone: phone.trim(),
          };

          const orderRes = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload),
          });
          const saved = (await orderRes.json().catch(() => ({}))) as { id?: string; error?: string };
          if (!orderRes.ok || !saved.id) {
            setPayError(
              saved.error ??
                `Your payment reference is ${response.reference}. We couldn't confirm the order — please contact the branch with this reference.`
            );
            setPaying(false);
            return;
          }
          const orderId = saved.id;

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
            paymentFee: fee,
            promoCode: promoCode ?? undefined,
            deliveryAddress: orderPayload.deliveryAddress,
            status: "received",
          };
          saveOrder(order);
          window.localStorage.setItem(LAST_ORDER_KEY, orderId);
          clearCart();
          router.push("/checkout/confirmation");
        } catch {
          setPayError(
            `Your payment reference is ${response.reference}. Something went wrong confirming the order — please contact the branch with this reference.`
          );
          setPaying(false);
        }
      },

      onCancel: () => {
        // User closed the popup without paying
        setPaying(false);
      },

      onError: (err: { message?: string }) => {
        setPayError(err?.message ?? "Payment could not be started. Please try again.");
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
            <label htmlFor="checkout-phone" className="label-uppercase text-xs text-brown-light">
              Phone number *
            </label>
            <input
              id="checkout-phone"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0803 123 4567"
              className="mt-3 w-full rounded-full bg-crisp px-5 py-3 text-sm text-brown shadow-soft placeholder:text-brown-light/70 focus:outline-none focus:ring-2 focus:ring-brown/20"
            />
            <p className="mt-2 text-xs text-brown-light">So the branch can reach you about your order.</p>
          </div>

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
            <div className="flex justify-between text-brown-light">
              <span>Payment processing fee</span>
              <span>{formatNaira(fee)}</span>
            </div>
            <div className="flex justify-between font-display text-xl font-black text-brown">
              <span>Total</span>
              <span>{formatNaira(total + fee)}</span>
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
          {!paying && payBlocker && (
            <p className="mt-2 text-center text-xs text-brown-light">{payBlocker}</p>
          )}
        </div>
      </div>
    </div>
  );
}
