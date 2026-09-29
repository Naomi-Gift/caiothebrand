"use client";

import { useEffect, useRef } from "react";
import type { MenuItem } from "@/lib/types";
import ItemCustomizer from "@/components/ItemCustomizer";

/** The product page's customiser, opened in place over the menu. */
export default function ProductModal({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-brown-darkest/50 sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        tabIndex={-1}
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-crisp shadow-soft-lg focus:outline-none sm:max-w-5xl sm:rounded-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="sticky right-3 top-3 z-10 float-right mr-3 mt-3 flex h-9 w-9 items-center justify-center rounded-full bg-crisp/90 text-xl text-brown shadow-soft transition-colors hover:bg-bone"
        >
          ×
        </button>
        {item.soldOut ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-3xl font-bold text-brown-darkest">{item.name}</p>
            <p className="mt-3 font-display text-lg italic text-brown-light">
              Sold out of the {item.name.toLowerCase()}. Tomorrow, I promise.
            </p>
          </div>
        ) : (
          <ItemCustomizer item={item} />
        )}
      </div>
    </div>
  );
}
