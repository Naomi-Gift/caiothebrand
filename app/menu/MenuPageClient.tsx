"use client";

import { useMemo, useState } from "react";
import CategoryTabs, { type MenuTab } from "@/components/CategoryTabs";
import MenuItemCard from "@/components/MenuItemCard";
import MenuCarousel from "@/components/MenuCarousel";
import { categoryOrder, categoryLabels } from "@/lib/data/menu";
import { useBranch } from "@/context/BranchContext";
import { useOrderMethod } from "@/context/OrderMethodContext";
import type { MenuItem } from "@/lib/types";

export default function MenuPageClient({ items }: { items: MenuItem[] }) {
  const [category, setCategory] = useState<MenuTab>("deals");
  const [query, setQuery] = useState("");
  const { branch } = useBranch();
  const { fulfillment } = useOrderMethod();

  const isSearching = query.trim().length > 0;

  const featuredItems = useMemo(() => items.filter((i) => i.featured && !i.soldOut), [items]);

  const filteredItems = useMemo(() => {
    const pool =
      category === "deals"
        ? featuredItems
        : items.filter((item) => item.category === category);

    if (!isSearching) return pool;
    const q = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.descriptor.toLowerCase().includes(q)
    );
  }, [category, query, isSearching, items, featuredItems]);

  const showStacked = !isSearching && category === "deals";

  const groupedByCategory = useMemo(() => {
    if (!showStacked) return null;
    return categoryOrder
      .map((cat) => ({
        cat,
        label: categoryLabels[cat],
        items: featuredItems.filter((i) => i.category === cat),
      }))
      .filter((g) => g.items.length > 0);
  }, [showStacked, featuredItems]);

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

      {/* Search results — flat grid */}
      {isSearching && (
        <div className="mt-10">
          {filteredItems.length === 0 ? (
            <p className="font-display text-lg italic text-brown-light">
              Nothing matches that search. Try a different word?
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deals tab — stacked carousels per category */}
      {!isSearching && showStacked && (
        <div className="mt-10 flex flex-col gap-12">
          {groupedByCategory?.length === 0 ? (
            <p className="font-display text-lg italic text-brown-light">
              No deals on right now — check back soon.
            </p>
          ) : (
            groupedByCategory?.map(({ cat, label, items: catItems }) => (
              <section key={cat}>
                <h2 className="mb-5 font-display text-2xl font-black text-brown">
                  {label}
                </h2>
                <MenuCarousel items={catItems} />
              </section>
            ))
          )}
        </div>
      )}

      {/* Single-category tab — single carousel */}
      {!isSearching && !showStacked && (
        <div className="mt-10">
          {filteredItems.length === 0 ? (
            <p className="font-display text-lg italic text-brown-light">
              Nothing here yet — check back soon.
            </p>
          ) : (
            <MenuCarousel items={filteredItems} />
          )}
        </div>
      )}
    </div>
  );
}
