"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MenuItem } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import QuantityStepper from "@/components/QuantityStepper";
import PlaceholderImage from "@/components/PlaceholderImage";
import Button from "@/components/Button";
import { menuItems } from "@/lib/data/menu";

// ─── Bundle suggestion card ───────────────────────────────────────────────────

function BundleCard({
  item,
  selected,
  onToggle,
}: {
  item: MenuItem;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group relative flex w-[160px] flex-none flex-col overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
        selected
          ? "border-brown shadow-soft"
          : "border-transparent hover:border-bone"
      }`}
    >
      <PlaceholderImage
        label={item.name}
        src={`/images/menu/${item.slug}.jpg`}
        category={item.category}
        fit={item.category === "drinks" ? "contain" : "cover"}
        className="h-28 w-full bg-bone"
      />
      {selected && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brown text-[0.6rem] text-cream">
          ✓
        </span>
      )}
      <div className="flex flex-1 flex-col gap-0.5 bg-crisp p-3 text-left">
        <p className="text-xs font-semibold leading-tight text-brown">{item.name}</p>
        <p className="label-uppercase text-[0.6rem] text-brown-light">
          +{formatNaira(item.basePrice)}
        </p>
      </div>
    </button>
  );
}

// ─── Bundle section with scrollable row ──────────────────────────────────────

function BundleSection({
  label,
  items,
  selectedIds,
  onToggle,
}: {
  label: string;
  items: MenuItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  return (
    <div>
      <p className="label-uppercase mb-3 text-xs text-brown-light">{label}</p>
      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <BundleCard
            key={item.id}
            item={item}
            selected={selectedIds.includes(item.id)}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main customizer ──────────────────────────────────────────────────────────

export default function ItemCustomizer({ item }: { item: MenuItem }) {
  const router = useRouter();
  const { addLine } = useCart();

  const [sizeId, setSizeId] = useState(item.sizes[0].id);
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Bundle selections (sides + drinks added as separate cart lines)
  const [bundleIds, setBundleIds] = useState<string[]>([]);

  const size = item.sizes.find((s) => s.id === sizeId) ?? item.sizes[0];
  const selectedAddOns = item.addOns.filter((a) => addOnIds.includes(a.id));

  const unitPrice = useMemo(
    () =>
      item.basePrice +
      size.priceDelta +
      selectedAddOns.reduce((sum, a) => sum + a.price, 0),
    [item.basePrice, size, selectedAddOns]
  );

  // Bundle items — sides and drinks (exclude current item)
  const bundleSides = useMemo(
    () => menuItems.filter((m) => m.category === "sides" && m.id !== item.id && !m.soldOut),
    [item.id]
  );
  const bundleDrinks = useMemo(
    () => menuItems.filter((m) => m.category === "drinks" && m.id !== item.id && !m.soldOut),
    [item.id]
  );
  const showBundle = item.category === "pizzas" && (bundleSides.length > 0 || bundleDrinks.length > 0);

  const bundleTotal = useMemo(() => {
    return menuItems
      .filter((m) => bundleIds.includes(m.id))
      .reduce((sum, m) => sum + m.basePrice, 0);
  }, [bundleIds]);

  const totalWithBundle = unitPrice * quantity + bundleTotal;

  const toggleAddOn = (id: string) =>
    setAddOnIds((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);

  const toggleBundle = (id: string) =>
    setBundleIds((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);

  const handleAddToCart = () => {
    // Add the main item
    addLine({
      itemId: item.id,
      name: item.name,
      descriptor: item.descriptor,
      size,
      addOns: selectedAddOns,
      quantity,
      unitPrice,
    });

    // Add each bundle item as its own cart line
    const bundledItems = menuItems.filter((m) => bundleIds.includes(m.id));
    for (const b of bundledItems) {
      addLine({
        itemId: b.id,
        name: b.name,
        descriptor: b.descriptor,
        size: b.sizes[0],
        addOns: [],
        quantity: 1,
        unitPrice: b.basePrice,
      });
    }

    setAdded(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Image */}
        <PlaceholderImage
          label={item.name}
          src={`/images/menu/${item.slug}.jpg`}
          category={item.category}
          fit={item.category === "drinks" ? "contain" : "cover"}
          className="h-72 w-full rounded-2xl shadow-soft sm:h-96"
        />

        {/* Details */}
        <div>
          <p className="label-uppercase text-xs text-brown-light">{item.category}</p>
          <h1 className="mt-2 font-display text-4xl font-black text-brown">{item.name}</h1>
          <p className="mt-1 font-display text-lg italic text-brown-light">{item.descriptor}</p>
          <p className="mt-4 text-sm leading-relaxed text-brown-darkest">{item.description}</p>

          {/* Size selector */}
          {item.sizes.length > 1 && (
            <div className="mt-8">
              <p className="label-uppercase text-xs text-brown-light">Size</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.sizes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSizeId(s.id)}
                    className={`label-uppercase rounded-full border-2 border-brown px-4 py-2 text-xs transition-all duration-200 ${
                      sizeId === s.id
                        ? "bg-brown text-cream shadow-soft"
                        : "text-brown hover:bg-bone"
                    }`}
                  >
                    {s.label}
                    {s.priceDelta > 0 && ` +${formatNaira(s.priceDelta)}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extra toppings */}
          {item.addOns.length > 0 && (
            <div className="mt-8">
              <p className="label-uppercase text-xs text-brown-light">Extra toppings</p>
              <div className="mt-3 flex flex-col gap-2">
                {item.addOns.map((a) => (
                  <label
                    key={a.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl bg-cream px-4 py-2.5 text-sm text-brown transition-colors hover:bg-bone"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addOnIds.includes(a.id)}
                        onChange={() => toggleAddOn(a.id)}
                        className="h-4 w-4 accent-[#3A2418]"
                      />
                      {a.label}
                    </span>
                    <span className="text-brown-light">+{formatNaira(a.price)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-8 flex items-center gap-4">
            <p className="label-uppercase text-xs text-brown-light">Qty</p>
            <QuantityStepper quantity={quantity} onChange={setQuantity} />
          </div>

          {/* Subtotal + add to cart */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-bone pt-6">
            <div>
              <p className="label-uppercase text-xs text-brown-light">
                {bundleIds.length > 0 ? "Order total" : "Total"}
              </p>
              <p className="font-display text-3xl font-black text-brown">
                {formatNaira(totalWithBundle)}
              </p>
              {bundleIds.length > 0 && (
                <p className="mt-0.5 text-xs text-brown-light">
                  Includes {bundleIds.length} extra{bundleIds.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
            <Button onClick={handleAddToCart} className="w-full sm:w-auto">
              Add to cart
            </Button>
          </div>

          {added && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-bone px-4 py-3 text-sm text-brown shadow-soft">
              <span>Added to cart.</span>
              <button
                type="button"
                onClick={() => router.push("/cart")}
                className="label-uppercase text-xs underline"
              >
                View cart →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Complete your order ── */}
      {showBundle && (
        <div className="mt-14 border-t border-bone pt-10">
          <h2 className="font-display text-2xl font-black text-brown">
            Complete your order
          </h2>
          <p className="mt-1 font-display text-sm italic text-brown-light">
            Add sides or drinks and they'll go straight into your cart.
          </p>

          <div className="mt-8 flex flex-col gap-8">
            <BundleSection
              label="Sides"
              items={bundleSides}
              selectedIds={bundleIds}
              onToggle={toggleBundle}
            />
            <BundleSection
              label="Drinks"
              items={bundleDrinks}
              selectedIds={bundleIds}
              onToggle={toggleBundle}
            />
          </div>
        </div>
      )}
    </div>
  );
}
