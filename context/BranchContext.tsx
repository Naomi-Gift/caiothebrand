"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Branch, BranchId } from "@/lib/types";
import { branches } from "@/lib/data/branches";

const STORAGE_KEY = "caio-branch";

interface BranchContextValue {
  branchId: BranchId | null;
  branch: Branch | null;
  hasChosenBranch: boolean;
  isPromptOpen: boolean;
  setBranch: (id: BranchId) => void;
  openPrompt: () => void;
  closePrompt: () => void;
}

const BranchContext = createContext<BranchContextValue | undefined>(
  undefined
);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branchId, setBranchId] = useState<BranchId | null>(null);
  const [hasChosenBranch, setHasChosenBranch] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrating client state from localStorage on mount — server has no
    // access to it, so this can't be a lazy useState initializer.
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "owerri" || stored === "lagos") {
      setBranchId(stored);
      setHasChosenBranch(true);
    } else {
      setIsPromptOpen(true);
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const setBranch = useCallback((id: BranchId) => {
    window.localStorage.setItem(STORAGE_KEY, id);
    setBranchId(id);
    setHasChosenBranch(true);
    setIsPromptOpen(false);
  }, []);

  const openPrompt = useCallback(() => setIsPromptOpen(true), []);
  const closePrompt = useCallback(() => {
    if (hasChosenBranch) setIsPromptOpen(false);
  }, [hasChosenBranch]);

  const value = useMemo<BranchContextValue>(
    () => ({
      branchId,
      branch: branchId ? branches[branchId] : null,
      hasChosenBranch,
      isPromptOpen: hydrated && isPromptOpen,
      setBranch,
      openPrompt,
      closePrompt,
    }),
    [branchId, hasChosenBranch, hydrated, isPromptOpen, setBranch, openPrompt, closePrompt]
  );

  return (
    <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useBranch must be used within BranchProvider");
  return ctx;
}
