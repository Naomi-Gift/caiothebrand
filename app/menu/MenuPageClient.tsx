"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CategoryTabs from "@/components/CategoryTabs";
import { MenuGridCard, MenuListRow, type MenuView } from "@/components/MenuTile";
import ProductModal from "@/components/ProductModal";
import { categoryOrder, categoryLabels } from "@/lib/data/menu";
import type { MenuItem } from "@/lib/types";

// Storefront header height (py-2 + 64px logo + 1px border); the rail sticks just under it.
const HEADER_H = 81;

const GRID = "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-12";
const LIST = "grid grid-cols-1 gap-9 md:grid-cols-2 md:gap-x-10 md:gap-y-8";
// Drinks are small products — denser grid, smaller tiles.
const GRID_COMPACT = "grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-x-5 lg:grid-cols-6 lg:gap-x-8 lg:gap-y-10";
const LIST_COMPACT = "grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-10 md:gap-y-6";

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="2" width="4" height="4" rx="1" />
      <rect x="7" y="3" width="8" height="2" rx="1" />
      <rect x="1" y="10" width="4" height="4" rx="1" />
      <rect x="7" y="11" width="8" height="2" rx="1" />
    </svg>
  );
}

export default function MenuPageClient({ items }: { items: MenuItem[] }) {
  const [view, setView] = useState<MenuView>("grid");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>(categoryOrder[0]);
  const [openItem, setOpenItem] = useState<MenuItem | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const spyLockUntil = useRef(0);

  // Phones default to the list view.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depends on the viewport, unknown on the server
    if (window.matchMedia("(max-width: 639px)").matches) setView("list");
  }, []);

  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;

  const sections = useMemo(
    () =>
      categoryOrder
        .map((cat) => ({ id: cat, label: categoryLabels[cat], items: items.filter((i) => i.category === cat) }))
        .filter((s) => s.items.length > 0),
    [items]
  );

  const results = useMemo(
    () =>
      isSearching
        ? items.filter((i) => i.name.toLowerCase().includes(q) || i.descriptor.toLowerCase().includes(q))
        : [],
    [items, q, isSearching]
  );

  // Scroll-spy: the section whose top has passed under the header + rail is active;
  // at the very bottom of the page the last tab wins.
  useEffect(() => {
    if (isSearching) return;
    const onScroll = () => {
      if (Date.now() < spyLockUntil.current) return;
      const offset = HEADER_H + (railRef.current?.offsetHeight ?? 0) + 16;
      let current = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = s.id;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const menuEl = document.getElementById("menu");
      if (atBottom && menuEl && menuEl.getBoundingClientRect().top < window.innerHeight) {
        current = sections[sections.length - 1]?.id;
      }
      if (current) setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections, isSearching]);

  const selectTab = useCallback((id: string) => {
    setActive(id);
    spyLockUntil.current = Date.now() + 900;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(history.state, "", `#${id}`);
  }, []);

  const closeItem = useCallback(() => setOpenItem(null), []);

  const renderItems = (list: MenuItem[], compact = false) =>
    view === "grid" ? (
      <div className={compact ? GRID_COMPACT : GRID}>
        {list.map((item) => (
          <MenuGridCard key={item.id} item={item} onOpen={setOpenItem} compact={compact} />
        ))}
      </div>
    ) : (
      <div className={compact ? LIST_COMPACT : LIST}>
        {list.map((item) => (
          <MenuListRow key={item.id} item={item} onOpen={setOpenItem} compact={compact} />
        ))}
      </div>
    );

  return (
    <div id="menu" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-5xl font-bold text-brown-darkest">
          Our <em className="not-italic text-brown-light">menu.</em>
        </h1>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the menu"
          aria-label="Search the menu"
          className="w-full max-w-xs rounded-full border border-bone-dark bg-crisp px-4 py-2.5 text-sm text-brown placeholder:text-brown-light focus:border-brown focus:outline-none"
        />
      </div>

      {!isSearching && (
        <div ref={railRef} className="sticky z-20 -mx-4 mt-6 bg-cream px-4 sm:-mx-6 sm:px-6" style={{ top: HEADER_H }}>
          <CategoryTabs tabs={sections} active={active} onSelect={selectTab} />
        </div>
      )}

      <div className="mt-3 flex justify-end gap-2">
        {(["grid", "list"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            aria-pressed={view === v}
            aria-label={v === "grid" ? "Grid view" : "List view"}
            className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
              view === v
                ? "border-brown bg-brown text-cream"
                : "border-bone-dark bg-crisp text-brown hover:border-brown"
            }`}
          >
            {v === "grid" ? <GridIcon /> : <ListIcon />}
          </button>
        ))}
      </div>

      {isSearching ? (
        <div className="mt-6">
          {results.length === 0 ? (
            <p className="font-display text-lg italic text-brown-light">
              Nothing matches that search. Try a different word?
            </p>
          ) : (
            renderItems(results)
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-14 sm:gap-16">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-32 sm:scroll-mt-40" aria-labelledby={`${s.id}-title`}>
              <h2 id={`${s.id}-title`} className="mb-6 font-display text-3xl font-bold text-brown-darkest sm:text-4xl">
                {s.label}
              </h2>
              {renderItems(s.items, s.id === "drinks")}
            </section>
          ))}
        </div>
      )}

      {openItem && <ProductModal item={openItem} onClose={closeItem} />}
    </div>
  );
}
