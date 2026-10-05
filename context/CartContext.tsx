"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine, CartLineAddOn, SizeOption } from "@/lib/types";

const STORAGE_KEY = "caio-cart";

interface AddLineInput {
  itemId: string;
  name: string;
  descriptor: string;
  size: SizeOption;
  addOns: CartLineAddOn[];
  quantity: number;
  unitPrice: number;
}

interface CartContextValue {
  lines: CartLine[];
  promoCode: string | null;
  promoError: string | null;
  addLine: (input: AddLineInput) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  applyPromoCode: (code: string) => void;
  clearPromoCode: () => void;
  clearCart: () => void;
  subtotal: number;
  discountRate: number;
  discount: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  // Checked by /api/promo; the server re-checks it when the order is placed.
  const [promoRate, setPromoRate] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrating client state from localStorage on mount — server has no
    // access to it, so this can't be a lazy useState initializer.
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          lines: CartLine[];
          promoCode: string | null;
          promoRate?: number;
        };
        setLines(parsed.lines ?? []);
        setPromoCode(parsed.promoCode ?? null);
        setPromoRate(parsed.promoCode ? parsed.promoRate ?? 0 : 0);
      } catch {
        // ignore corrupt cart data
      }
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lines, promoCode, promoRate })
    );
  }, [lines, promoCode, promoRate, hydrated]);

  const addLine = (input: AddLineInput) => {
    setLines((prev) => [
      ...prev,
      {
        lineId: `${input.itemId}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        itemId: input.itemId,
        name: input.name,
        descriptor: input.descriptor,
        size: input.size,
        addOns: input.addOns,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
      },
    ]);
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((line) => line.lineId !== lineId)
        : prev.map((line) =>
            line.lineId === lineId ? { ...line, quantity } : line
          )
    );
  };

  const removeLine = (lineId: string) => {
    setLines((prev) => prev.filter((line) => line.lineId !== lineId));
  };

  const applyPromoCode = (code: string) => {
    void (async () => {
      try {
        const res = await fetch("/api/promo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = (await res.json()) as { code?: string; rate?: number; error?: string };
        if (!res.ok || !data.code) {
          setPromoError(data.error ?? "That code doesn't ring a bell. Try again?");
          return;
        }
        setPromoCode(data.code);
        setPromoRate(data.rate ?? 0);
        setPromoError(null);
      } catch {
        setPromoError("Couldn't check that code just now. Try again?");
      }
    })();
  };

  const clearPromoCode = () => {
    setPromoCode(null);
    setPromoRate(0);
    setPromoError(null);
  };

  const clearCart = () => {
    setLines([]);
    setPromoCode(null);
    setPromoRate(0);
    setPromoError(null);
  };

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [lines]
  );
  const discountRate = promoCode ? promoRate : 0;
  const discount = Math.round(subtotal * discountRate);
  const total = subtotal - discount;
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  const value: CartContextValue = {
    lines,
    promoCode,
    promoError,
    addLine,
    updateQuantity,
    removeLine,
    applyPromoCode,
    clearPromoCode,
    clearCart,
    subtotal,
    discountRate,
    discount,
    total,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
