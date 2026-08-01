"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MenuItem } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import QuantityStepper from "@/components/QuantityStepper";
import PlaceholderImage from "@/components/PlaceholderImage";
import Button from "@/components/Button";

export default function ItemCustomizer({ item }: { item: MenuItem }) {
  const router = useRouter();
  const { addLine } = useCart();
  const [sizeId, setSizeId] = useState(item.sizes[0].id);
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const size = item.sizes.find((s) => s.id === sizeId) ?? item.sizes[0];
  const selectedAddOns = item.addOns.filter((a) => addOnIds.includes(a.id));

  const unitPrice = useMemo(
    () =>
      item.basePrice +
      size.priceDelta +
      selectedAddOns.reduce((sum, a) => sum + a.price, 0),
    [item.basePrice, size, selectedAddOns]
  );

  const toggleAddOn = (id: string) => {
    setAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleAddToCart = () => {
    addLine({
      itemId: item.id,
      name: item.name,
      descriptor: item.descriptor,
      size,
      addOns: selectedAddOns,
      quantity,
      unitPrice,
    });
    setAdded(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PlaceholderImage
          label={item.name}
          src={`/images/menu/${item.slug}.jpg`}
          category={item.category}
          fit={item.category === "drinks" ? "contain" : "cover"}
          className="h-72 w-full rounded-2xl shadow-soft sm:h-96"
        />

        <div>
          <p className="label-uppercase text-xs text-brown-light">
            {item.category}
          </p>
          <h1 className="mt-2 font-display text-4xl font-black text-brown">
            {item.name}
          </h1>
          <p className="mt-1 font-display text-lg italic text-brown-light">
            {item.descriptor}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-brown-darkest">
            {item.description}
          </p>

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

          {item.addOns.length > 0 && (
            <div className="mt-8">
              <p className="label-uppercase text-xs text-brown-light">
                Add-ons
              </p>
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
                    <span className="text-brown-light">
                      +{formatNaira(a.price)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <p className="label-uppercase text-xs text-brown-light">Qty</p>
            <QuantityStepper quantity={quantity} onChange={setQuantity} />
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-bone pt-6">
            <div>
              <p className="label-uppercase text-xs text-brown-light">
                Total
              </p>
              <p className="font-display text-3xl font-black text-brown">
                {formatNaira(unitPrice * quantity)}
              </p>
            </div>
            <Button onClick={handleAddToCart}>Add to cart</Button>
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
    </div>
  );
}
