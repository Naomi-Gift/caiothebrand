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

interface OrderMethodContextValue {
  fulfillment: FulfillmentMode | null;
  isPromptOpen: boolean;
  openPrompt: () => void;
  closePrompt: () => void;
  chooseFulfillment: (mode: FulfillmentMode) => void;
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
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  useEffect(() => {
    // Hydrating client state from localStorage on mount — server has no
    // access to it, so this can't be a lazy useState initializer.
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "delivery" || stored === "pickup") {
      setFulfillment(stored);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const openPrompt = useCallback(() => setIsPromptOpen(true), []);
  const closePrompt = useCallback(() => setIsPromptOpen(false), []);

  const chooseFulfillment = useCallback(
    (mode: FulfillmentMode) => {
      window.localStorage.setItem(STORAGE_KEY, mode);
      setFulfillment(mode);
      setIsPromptOpen(false);
      router.push("/menu");
    },
    [router]
  );

  return (
    <OrderMethodContext.Provider
      value={{ fulfillment, isPromptOpen, openPrompt, closePrompt, chooseFulfillment }}
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
