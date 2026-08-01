"use client";

import { useEffect, useRef, useState } from "react";
import { useBranch } from "@/context/BranchContext";
import { branchList } from "@/lib/data/branches";
import type { BranchId } from "@/lib/types";

export default function BranchSelector() {
  const { branch, setBranch } = useBranch();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const choose = (id: BranchId) => {
    setBranch(id);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="label-uppercase flex items-center gap-1.5 rounded-full bg-bone px-4 py-2 text-xs text-brown shadow-soft transition-all duration-200 hover:scale-[1.02] hover:bg-cream hover:shadow-soft-lg"
      >
        {branch ? branch.name : "Select branch"}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-brown-darkest/40 sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="listbox"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-crisp p-4 shadow-soft-lg sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:w-56 sm:rounded-2xl sm:p-2"
          >
            <p className="label-uppercase mb-2 px-2 text-[0.65rem] text-brown-light sm:hidden">
              Choose your branch
            </p>
            {branchList.map((b) => (
              <button
                key={b.id}
                type="button"
                role="option"
                aria-selected={branch?.id === b.id}
                onClick={() => choose(b.id)}
                className={`label-uppercase flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition-colors sm:py-2 ${
                  branch?.id === b.id
                    ? "bg-brown text-cream"
                    : "text-brown hover:bg-bone"
                }`}
              >
                {b.name}
                {branch?.id === b.id && <span aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
