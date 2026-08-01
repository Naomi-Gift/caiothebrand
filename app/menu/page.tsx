"use client";

import { useMemo, useState } from "react";
import CategoryTabs, { type MenuTab } from "@/components/CategoryTabs";
import MenuItemCard from "@/components/MenuItemCard";
import { getFeaturedItems, menuItems } from "@/lib/data/menu";
import { useBranch } from "@/context/BranchContext";
import { useOrderMethod } from "@/context/OrderMethodContext";

export default function MenuPage() {
  const [category, setCategory] = useState<MenuTab>("deals");
  const [query, setQuery] = useState("");
  const { branch } = useBranch();
  const { fulfillment } = useOrderMethod();

  const items = useMemo(() => {
    const pool =
      category === "deals"
        ? getFeaturedItems()
        : menuItems.filter((item) => item.category === category);

    if (!query.trim()) return pool;
    const q = query.trim().toLowerCase();
    return pool.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.descriptor.toLowerCase().includes(q)
    );
  }, [category, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {branch && (
        <p className="label-uppercase mb-4 inline-flex rounded-full bg-bone px-4 py-2 text-xs text-brown">
          You&apos;re{" "}
          {fulfillment === "pickup" ? "picking up from" : "getting delivery from"}{" "}
          {branch.name}
        </p>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-uppercase text-xs text-brown-light">
            {branch ? `${branch.name} branch` : "Menu"}
          </p>
          <h1 className="mt-2 font-display text-5xl font-black italic text-brown">
            Menu
          </h1>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the menu"
          className="w-full max-w-xs rounded-full bg-cream px-4 py-2.5 text-sm text-brown shadow-soft placeholder:text-brown-light focus:outline-none"
        />
      </div>

      <div className="mt-8">
        <CategoryTabs active={category} onChange={setCategory} />
      </div>

      {items.length === 0 ? (
        <p className="mt-10 font-display text-lg italic text-brown-light">
          {category === "deals"
            ? "No deals on right now — check back soon."
            : "Nothing matches that search. Try a different word?"}
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
