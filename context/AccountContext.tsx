"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import type { SavedAddress } from "@/lib/types";

const DIRECTORY_KEY = "caio-accounts";
const SESSION_KEY = "caio-session";

interface Account {
  name: string;
  email: string;
  addresses: SavedAddress[];
}

type AuthResult = { ok: true } | { ok: false; error: string };

interface AccountContextValue {
  account: Account | null;
  hydrated: boolean;
  isGoogleSession: boolean;
  accountExists: (email: string) => boolean;
  signup: (name: string, email: string) => AuthResult;
  login: (email: string) => AuthResult;
  logout: () => void;
  addAddress: (address: Omit<SavedAddress, "id">) => void;
  removeAddress: (id: string) => void;
}

const AccountContext = createContext<AccountContextValue | undefined>(
  undefined
);

function readDirectory(): Record<string, Account> {
  try {
    return JSON.parse(
      window.localStorage.getItem(DIRECTORY_KEY) ?? "{}"
    ) as Record<string, Account>;
  } catch {
    return {};
  }
}

function writeDirectory(directory: Record<string, Account>) {
  window.localStorage.setItem(DIRECTORY_KEY, JSON.stringify(directory));
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [account, setAccount] = useState<Account | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const googleEmail = session?.user?.email ?? null;
  const googleName = session?.user?.name ?? null;

  useEffect(() => {
    // Hydrating client state on mount/session-change — server has no access
    // to localStorage or the client session, so this can't be a lazy
    // useState initializer.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (status === "loading") return;

    if (status === "authenticated" && googleEmail) {
      const key = googleEmail.trim().toLowerCase();
      const directory = readDirectory();
      const existing = directory[key];
      const merged: Account = {
        name: googleName ?? existing?.name ?? "",
        email: googleEmail,
        addresses: existing?.addresses ?? [],
      };
      directory[key] = merged;
      writeDirectory(directory);
      setAccount(merged);
      setHydrated(true);
      return;
    }

    const activeEmail = window.localStorage.getItem(SESSION_KEY);
    if (activeEmail) {
      const existing = readDirectory()[activeEmail];
      setAccount(existing ?? null);
    } else {
      setAccount(null);
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [status, googleEmail, googleName]);

  const accountExists = (email: string) =>
    email.trim().toLowerCase() in readDirectory();

  const signup = (name: string, email: string): AuthResult => {
    const key = email.trim().toLowerCase();
    const directory = readDirectory();
    if (directory[key]) {
      return {
        ok: false,
        error: "An account with this email already exists — log in instead.",
      };
    }
    const created: Account = { name: name.trim(), email: email.trim(), addresses: [] };
    directory[key] = created;
    writeDirectory(directory);
    window.localStorage.setItem(SESSION_KEY, key);
    setAccount(created);
    return { ok: true };
  };

  const login = (email: string): AuthResult => {
    const key = email.trim().toLowerCase();
    const existing = readDirectory()[key];
    if (!existing) {
      return {
        ok: false,
        error: "No account found for that email — sign up first.",
      };
    }
    window.localStorage.setItem(SESSION_KEY, key);
    setAccount(existing);
    return { ok: true };
  };

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setAccount(null);
    if (status === "authenticated") {
      void nextAuthSignOut({ callbackUrl: "/" });
    }
  };

  const persist = (next: Account) => {
    const directory = readDirectory();
    directory[next.email.trim().toLowerCase()] = next;
    writeDirectory(directory);
    setAccount(next);
  };

  const addAddress = (address: Omit<SavedAddress, "id">) => {
    if (!account) return;
    persist({
      ...account,
      addresses: [
        ...account.addresses,
        { ...address, id: `addr-${Date.now()}` },
      ],
    });
  };

  const removeAddress = (id: string) => {
    if (!account) return;
    persist({
      ...account,
      addresses: account.addresses.filter((a) => a.id !== id),
    });
  };

  return (
    <AccountContext.Provider
      value={{
        account,
        hydrated,
        isGoogleSession: status === "authenticated",
        accountExists,
        signup,
        login,
        logout,
        addAddress,
        removeAddress,
      }}
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
