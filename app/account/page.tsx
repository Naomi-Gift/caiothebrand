"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/context/AccountContext";
import { getOrders } from "@/lib/orders";
import { deriveOrderStatus } from "@/lib/orderStatus";
import { formatNaira } from "@/lib/format";
import { branches } from "@/lib/data/branches";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import type { OrderRecord } from "@/lib/types";

type Tab = "profile" | "addresses" | "orders";

export default function AccountPage() {
  const router = useRouter();
  const { account, hydrated, logout, addAddress, removeAddress } =
    useAccount();
  const [tab, setTab] = useState<Tab>("profile");
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    // Hydrating from localStorage on mount — server has no access to it,
    // so this can't be a lazy useState initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(getOrders());
  }, []);

  const [newLabel, setNewLabel] = useState("");
  const [newLine1, setNewLine1] = useState("");
  const [newCity, setNewCity] = useState("");

  useEffect(() => {
    if (hydrated && !account) router.replace("/login");
  }, [hydrated, account, router]);

  if (!hydrated || !account) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label-uppercase text-xs text-brown-light">Account</p>
          <h1 className="mt-2 font-display text-4xl font-black italic text-brown">
            {account.name}
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-bone pb-px">
        {(
          [
            ["profile", "Profile"],
            ["addresses", "Addresses"],
            ["orders", "Orders"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`label-uppercase shrink-0 rounded-t-xl px-4 py-2.5 text-xs transition-colors ${
              tab === key
                ? "bg-brown text-cream"
                : "text-brown-light hover:text-brown"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="py-8">
        {tab === "profile" && (
          <div className="rounded-2xl bg-crisp p-6 shadow-soft">
            <p className="text-sm text-brown-light">Name</p>
            <p className="text-brown">{account.name}</p>
            <p className="mt-4 text-sm text-brown-light">Email</p>
            <p className="text-brown">{account.email}</p>
          </div>
        )}

        {tab === "addresses" && (
          <div className="flex flex-col gap-4">
            {account.addresses.length === 0 && (
              <p className="text-sm text-brown-light">
                No saved addresses yet.
              </p>
            )}
            {account.addresses.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-2xl bg-crisp p-4 shadow-soft"
              >
                <div>
                  <p className="font-body font-semibold text-brown">
                    {a.label}
                  </p>
                  <p className="text-sm text-brown-light">
                    {a.line1}, {a.city}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAddress(a.id)}
                  className="label-uppercase text-[0.65rem] text-brown-light underline"
                >
                  Remove
                </button>
              </div>
            ))}

            <form
              className="mt-2 flex flex-col gap-3 rounded-2xl bg-crisp p-4 shadow-soft"
              onSubmit={(e) => {
                e.preventDefault();
                if (newLine1.trim() && newCity.trim()) {
                  addAddress({
                    label: newLabel.trim() || "Address",
                    line1: newLine1.trim(),
                    city: newCity.trim(),
                  });
                  setNewLabel("");
                  setNewLine1("");
                  setNewCity("");
                }
              }}
            >
              <p className="label-uppercase text-xs text-brown-light">
                Add address
              </p>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Label (e.g. Home)"
                className="rounded-full bg-cream px-4 py-2 text-sm text-brown placeholder:text-brown-light focus:outline-none"
              />
              <input
                type="text"
                value={newLine1}
                onChange={(e) => setNewLine1(e.target.value)}
                placeholder="Street address"
                className="rounded-full bg-cream px-4 py-2 text-sm text-brown placeholder:text-brown-light focus:outline-none"
              />
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="City"
                className="rounded-full bg-cream px-4 py-2 text-sm text-brown placeholder:text-brown-light focus:outline-none"
              />
              <Button type="submit" variant="outline" size="sm" className="self-start">
                Save address
              </Button>
            </form>
          </div>
        )}

        {tab === "orders" && (
          <div className="flex flex-col gap-4">
            {orders.length === 0 && (
              <p className="text-sm text-brown-light">
                No orders yet. When you check out, they&apos;ll show up here.
              </p>
            )}
            {orders.map((order) => {
              const { label } = deriveOrderStatus(order);
              return (
                <div
                  key={order.id}
                  className="rounded-2xl bg-crisp p-5 shadow-soft"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="truncate font-body font-semibold text-brown">
                        {order.id}
                      </p>
                      <p className="text-xs text-brown-light">
                        {branches[order.branchId].name} ·{" "}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge tone="brown">{label}</Badge>
                  </div>
                  <ul className="mt-3 flex flex-col gap-1 text-sm text-brown-light">
                    {order.lines.map((line) => (
                      <li key={line.lineId} className="flex justify-between">
                        <span>
                          {line.quantity}× {line.name}
                        </span>
                        <span>
                          {formatNaira(line.unitPrice * line.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex justify-between border-t border-bone pt-3 font-body font-semibold text-brown">
                    <span>Total</span>
                    <span>{formatNaira(order.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
