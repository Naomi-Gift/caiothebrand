"use client";

import { useEffect, useState } from "react";
import { useBranch } from "@/context/BranchContext";
import { branchList } from "@/lib/data/branches";
import { distanceKm } from "@/lib/geo";
import Badge from "@/components/Badge";
import type { BranchId } from "@/lib/types";

export default function BranchFirstVisitModal() {
  const { isPromptOpen, hasChosenBranch, setBranch, closePrompt } =
    useBranch();
  const [nearestId, setNearestId] = useState<BranchId | null>(null);

  useEffect(() => {
    if (!isPromptOpen || !("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const here = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const nearest = branchList.reduce((closest, b) =>
          distanceKm(here, b) < distanceKm(here, closest) ? b : closest
        );
        setNearestId(nearest.id);
      },
      () => {
        // Permission denied or unavailable — fall back to the plain list.
      },
      { timeout: 8000 }
    );
  }, [isPromptOpen]);

  if (!isPromptOpen) return null;

  const choose = (id: BranchId) => setBranch(id);

  const orderedBranches = nearestId
    ? [...branchList].sort((a, b) =>
        a.id === nearestId ? -1 : b.id === nearestId ? 1 : 0
      )
    : branchList;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-brown-darkest/60 p-0 sm:items-center sm:p-6">
      <div className="w-full max-w-md rounded-t-3xl bg-crisp p-6 shadow-soft-lg sm:rounded-3xl sm:p-8">
        <p className="label-uppercase text-xs text-brown-light">
          Before we begin
        </p>
        <h2 className="mt-2 font-display text-4xl font-black italic text-brown">
          Ciao. Where are you eating?
        </h2>
        <p className="mt-3 text-sm text-brown-light">
          Pick your branch so we can show the right menu, prices, and
          delivery time.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {orderedBranches.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => choose(b.id)}
              className="label-uppercase flex items-center justify-between gap-3 rounded-full bg-bone px-4 py-3 text-sm text-brown shadow-soft transition-all duration-200 hover:scale-[1.02] hover:bg-brown hover:text-cream hover:shadow-soft-lg"
            >
              {b.name}
              {b.id === nearestId && <Badge tone="cream">Nearest to you</Badge>}
            </button>
          ))}
        </div>
        {hasChosenBranch && (
          <button
            type="button"
            onClick={closePrompt}
            className="mt-4 text-xs text-brown-light underline"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
