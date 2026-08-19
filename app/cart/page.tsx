"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/format";
import QuantityStepper from "@/components/QuantityStepper";
import Button from "@/components/Button";

export default function CartPage() {
  const {
    lines,
    updateQuantity,
    removeLine,
    clearCart,
    promoCode,
    promoError,
    applyPromoCode,
    clearPromoCode,
    subtotal,
    discount,
    total,
  } = useCart();
  const [codeInput, setCodeInput] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-4xl font-black italic text-brown">
          Ciao. What&apos;ll it be?
        </h1>
        <p className="mt-3 text-sm text-brown-light">
          Your cart is empty. Let&apos;s fix that.
        </p>
        <Button href="/menu" className="mt-8">
          Browse the menu
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-display text-4xl font-black italic text-brown">
          Your cart
        </h1>
        {confirmClear ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-brown-light">Clear everything?</span>
            <button
              type="button"
              onClick={() => { clearCart(); setConfirmClear(false); }}
              className="font-semibold text-brown underline"
            >
              Yes, clear
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="text-brown-light underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="label-uppercase text-[0.65rem] text-brown-light underline"
          >
            Clear cart
          </button>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {lines.map((line) => (
          <div
            key={line.lineId}
            className="flex flex-col gap-4 rounded-2xl bg-crisp p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="font-display text-xl font-black text-brown">
                {line.name}
              </h2>
              <p className="text-sm text-brown-light">{line.size.label}</p>
              {line.addOns.length > 0 && (
                <p className="text-sm text-brown-light">
                  {line.addOns.map((a) => a.label).join(", ")}
                </p>
              )}
              <button
                type="button"
                onClick={() => removeLine(line.lineId)}
                className="label-uppercase mt-2 text-[0.65rem] text-brown-light underline"
              >
                Remove
              </button>
            </div>
            <div className="flex items-center gap-6">
              <QuantityStepper
                quantity={line.quantity}
                onChange={(q) => updateQuantity(line.lineId, q)}
              />
              <span className="w-24 text-right font-body font-semibold text-brown">
                {formatNaira(line.unitPrice * line.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-crisp p-6 shadow-soft">
        <p className="label-uppercase text-xs text-brown-light">
          Promo code
        </p>
        {promoCode ? (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-brown">
              {promoCode} applied
            </span>
            <button
              type="button"
              onClick={clearPromoCode}
              className="label-uppercase text-[0.65rem] text-brown-light underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              applyPromoCode(codeInput);
            }}
          >
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="e.g. CAIO10"
              className="flex-1 rounded-full bg-cream px-4 py-2 text-sm text-brown placeholder:text-brown-light focus:outline-none"
            />
            <Button type="submit" variant="outline" size="sm">
              Apply
            </Button>
          </form>
        )}
        {promoError && (
          <p className="mt-2 text-sm text-brown-light">{promoError}</p>
        )}

        <div className="mt-6 flex flex-col gap-2 border-t border-bone pt-4 text-sm">
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

        <Button href="/checkout" className="mt-6 w-full">
          Checkout
        </Button>
      </div>
    </div>
  );
}
