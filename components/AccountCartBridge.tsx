"use client";

import { AccountProvider } from "@/context/AccountContext";
import { useCart } from "@/context/CartContext";

export default function AccountCartBridge({
  children,
}: {
  children: React.ReactNode;
}) {
  const { clearCart } = useCart();
  return <AccountProvider onLogout={clearCart}>{children}</AccountProvider>;
}
