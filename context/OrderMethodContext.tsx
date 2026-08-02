"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { FulfillmentMode } from "@/lib/types";

const STORAGE_KEY = "caio-fulfillment";
const ADDRESS_KEY = "caio-order-address";

export interface OrderAddress {
  line1: string;
  city?: string;
}

interface OrderMethodContextValue {
  fulfillment: FulfillmentMode | null;
  orderAddress: OrderAddress | null;
  isPromptOpen: boolean;
  openPrompt: () => void;
  closePrompt: () => void;
  /** Step 1: pick delivery or pickup — advances to location step inside modal */
  chooseFulfillment: (mode: FulfillmentMode) => void;
  /** Clears the pre-selected fulfillment (used when going Back to step 1) */
  clearFulfillment: () => void;
  /** Shortcut used by hero cards: pre-select a mode and open the modal at the location step */
  startOrder: (mode: FulfillmentMode) => void;
  /** Step 2: confirm location/address and navigate to menu */
  confirmLocation: (address: OrderAddress | null) => void;
}

const OrderMethodContext = createContext<OrderMethodContextValue | undefined>(
  undefined
);

export function OrderMethodProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [fulfillment, setFulfillment] = useState<FulfillmentMode | null>(null);
  const [orderAddress, setOrderAddress] = useState<OrderAddress | null>(null);
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  useEffect(() => {
    // Hydrating client state from localStorage on mount — server has no
    // access to it, so this can't be a lazy useState initializer.
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "delivery" || stored === "pickup") {
      setFulfillment(stored);
    }
    try {
      const storedAddr = window.localStorage.getItem(ADDRESS_KEY);
      if (storedAddr) setOrderAddress(JSON.parse(storedAddr) as OrderAddress);
    } catch {
      // ignore corrupt data
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const openPrompt = useCallback(() => setIsPromptOpen(true), []);
  const closePrompt = useCallback(() => setIsPromptOpen(false), []);

  // Step 1: user chose delivery/pickup — modal advances to location step
  const chooseFulfillment = useCallback((mode: FulfillmentMode) => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    setFulfillment(mode);
    // intentionally do NOT close the prompt yet — location step follows
  }, []);

  const clearFulfillment = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setFulfillment(null);
  }, []);

  // Hero card shortcut: pre-select mode AND open the modal (skips step 1)
  const startOrder = useCallback((mode: FulfillmentMode) => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    setFulfillment(mode);
    setIsPromptOpen(true);
  }, []);

  // Step 2: user confirmed their location/address — close modal and go to menu
  const confirmLocation = useCallback(
    (address: OrderAddress | null) => {
      if (address) {
        window.localStorage.setItem(ADDRESS_KEY, JSON.stringify(address));
        setOrderAddress(address);
      }
      setIsPromptOpen(false);
      router.push("/menu");
    },
    [router]
  );

  return (
    <OrderMethodContext.Provider
      value={{
        fulfillment,
        orderAddress,
        isPromptOpen,
        openPrompt,
        closePrompt,
        chooseFulfillment,
        clearFulfillment,
        startOrder,
        confirmLocation,
      }}
    >
      {children}
    </OrderMethodContext.Provider>
  );
}

export function useOrderMethod() {
  const ctx = useContext(OrderMethodContext);
  if (!ctx)
    throw new Error("useOrderMethod must be used within OrderMethodProvider");
  return ctx;
}
