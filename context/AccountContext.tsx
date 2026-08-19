"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import type { SavedAddress } from "@/lib/types";

// Saved addresses are still persisted in localStorage per-user,
// keyed by email, so they survive across sessions on the same device.
const ADDRESSES_KEY = (email: string) => `caio-addresses-${email.toLowerCase()}`;

interface Account {
  name: string;
  email: string;
  image?: string | null;
  addresses: SavedAddress[];
}

interface AccountContextValue {
  account: Account | null;
  hydrated: boolean;
  logout: () => void;
  addAddress: (address: Omit<SavedAddress, "id">) => void;
  removeAddress: (id: string) => void;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

function readAddresses(email: string): SavedAddress[] {
  try {
    const raw = window.localStorage.getItem(ADDRESSES_KEY(email));
    return raw ? (JSON.parse(raw) as SavedAddress[]) : [];
  } catch {
    return [];
  }
}

function writeAddresses(email: string, addresses: SavedAddress[]) {
  window.localStorage.setItem(ADDRESSES_KEY(email), JSON.stringify(addresses));
}

export function AccountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [account, setAccount] = useState<Account | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (status === "loading") return;

    if (status === "authenticated" && session?.user?.email) {
      const email = session.user.email;
      const addresses = readAddresses(email);
      setAccount({
        name:      session.user.name  ?? "",
        email,
        image:     session.user.image ?? null,
        addresses,
      });
    } else {
      setAccount(null);
    }

    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [status, session]);

  const logout = useCallback(() => {
    void nextAuthSignOut({ callbackUrl: "/" });
  }, []);

  const addAddress = useCallback((address: Omit<SavedAddress, "id">) => {
    setAccount((prev) => {
      if (!prev) return prev;
      const next: SavedAddress[] = [
        ...prev.addresses,
        { ...address, id: `addr-${Date.now()}` },
      ];
      writeAddresses(prev.email, next);
      return { ...prev, addresses: next };
    });
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAccount((prev) => {
      if (!prev) return prev;
      const next = prev.addresses.filter((a) => a.id !== id);
      writeAddresses(prev.email, next);
      return { ...prev, addresses: next };
    });
  }, []);

  return (
    <AccountContext.Provider
      value={{ account, hydrated, logout, addAddress, removeAddress }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}
