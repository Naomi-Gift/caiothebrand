"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/Logo";
import { useCart } from "@/context/CartContext";
import { useAccount } from "@/context/AccountContext";
import { useOrderMethod } from "@/context/OrderMethodContext";

function CartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 6h2l1.6 10.2A2 2 0 0 0 8.57 18H17a2 2 0 0 0 1.94-1.51L20.5 10H6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="21" r="1.4" fill="currentColor" />
      <circle cx="17" cy="21" r="1.4" fill="currentColor" />
    </svg>
  );
}

export default function Header() {
  const { itemCount } = useCart();
  const { account, hydrated } = useAccount();
  const { openPrompt } = useOrderMethod();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-bone bg-crisp/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-brown transition-colors hover:bg-bone md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="sr-only">Menu</span>
            <div className="flex flex-col gap-[3px]">
              <span className="block h-[2px] w-4 bg-brown" />
              <span className="block h-[2px] w-4 bg-brown" />
              <span className="block h-[2px] w-4 bg-brown" />
            </div>
          </button>
          <Logo variant="primary" />
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <button
            type="button"
            onClick={openPrompt}
            className="label-uppercase text-xs text-brown transition-opacity hover:opacity-60"
          >
            Order Now
          </button>
          <Link
            href="/branches"
            className="label-uppercase text-xs text-brown transition-opacity hover:opacity-60"
          >
            Locations
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-brown transition-colors hover:bg-bone"
          >
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brown px-1 text-[0.6rem] text-cream">
                {itemCount}
              </span>
            )}
          </Link>

          {hydrated && (
            <div className="hidden items-center gap-4 sm:flex">
              {account ? (
                <Link
                  href="/account"
                  className="label-uppercase text-xs text-brown transition-opacity hover:opacity-60"
                >
                  Account
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="label-uppercase text-xs text-brown transition-opacity hover:opacity-60"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="label-uppercase text-xs text-brown transition-opacity hover:opacity-60"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col border-t border-bone bg-cream md:hidden">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              openPrompt();
            }}
            className="label-uppercase border-b border-bone px-4 py-3 text-left text-xs text-brown"
          >
            Order Now
          </button>
          <Link
            href="/branches"
            onClick={() => setMenuOpen(false)}
            className="label-uppercase border-b border-bone px-4 py-3 text-xs text-brown"
          >
            Locations
          </Link>
          {account ? (
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="label-uppercase border-b border-bone px-4 py-3 text-xs text-brown"
            >
              Account
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="label-uppercase border-b border-bone px-4 py-3 text-xs text-brown"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="label-uppercase border-b border-bone px-4 py-3 text-xs text-brown"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
