"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { AccountProvider } from "@/context/AccountContext";
import { useCart } from "@/context/CartContext";

/**
 * Wraps AccountProvider and clears the cart whenever the user signs out
 * (session transitions from authenticated → unauthenticated).
 */
function CartClearer() {
  const { status } = useSession();
  const { clearCart } = useCart();
  const prevStatus = useRef(status);

  useEffect(() => {
    if (
      prevStatus.current === "authenticated" &&
      status === "unauthenticated"
    ) {
      clearCart();
    }
    prevStatus.current = status;
  }, [status, clearCart]);

  return null;
}

export default function AccountCartBridge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccountProvider>
      <CartClearer />
      {children}
    </AccountProvider>
  );
}
