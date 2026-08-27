"use client";

import { useState } from "react";

const CATEGORY_ICON: Record<string, string> = {
  pizzas: "◐",
  sides: "◇",
  drinks: "◈",
  desserts: "◆",
};

interface PlaceholderImageProps {
  label: string;
  src?: string;
  category?: string;
  className?: string;
  fit?: "cover" | "contain";
  imagePosition?: string;
}

export default function PlaceholderImage({
  label,
  src,
  category = "pizzas",
  className = "",
  fit = "cover",
  imagePosition = "center",
}: PlaceholderImageProps) {
  const [failed, setFailed] = useState(false);
  const icon = CATEGORY_ICON[category] ?? "◐";

  if (src && !failed) {
    if (fit === "contain") {
      return (
        <div className={`bg-bone ${className}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- fallback needs a plain <img> onError; src comes from a fixed, non-user-controlled manifest path */}
          <img
            src={src}
            alt={label}
            className="h-full w-full object-contain p-3"
            onError={() => setFailed(true)}
          />
        </div>
      );
    }

    return (
      <div className={`overflow-hidden bg-bone ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- fallback needs a plain <img> onError; src comes from a fixed, non-user-controlled manifest path */}
        <img
          src={src}
          alt={label}
          style={{ objectPosition: imagePosition }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-bone ${className}`}
      role="img"
      aria-label={`${label} — photography coming soon`}
    >
      <div className="flex flex-col items-center gap-2 text-brown-light">
        <span className="text-3xl" aria-hidden="true">
          {icon}
        </span>
        <span className="label-uppercase text-[0.6rem]">Photo soon</span>
      </div>
    </div>
  );
}
