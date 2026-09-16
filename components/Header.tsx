"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "@/components/Logo";
import { useCart } from "@/context/CartContext";
import { useAccount } from "@/context/AccountContext";
import { useOrderMethod } from "@/context/OrderMethodContext";

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function NavLink({ href, children, onClick }: { href?: string; children: React.ReactNode; onClick?: () => void }) {
  const cls = "label-uppercase relative text-xs text-brown transition-colors duration-200 hover:text-brown-muted group";
  const inner = (
    <>
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-brown transition-all duration-300 group-hover:w-full" />
    </>
  );
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

export default function Header() {
  const { itemCount } = useCart();
  const { account, hydrated } = useAccount();
  const { openPrompt } = useOrderMethod();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-bone/60 glass-crisp shadow-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Animated hamburger */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-brown transition-colors hover:bg-bone md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="sr-only">Menu</span>
            <div className="flex flex-col gap-[4px]">
              <motion.span
                className="block h-[2px] w-4 origin-center bg-brown"
                animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
              />
              <motion.span
                className="block h-[2px] w-4 bg-brown"
                animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block h-[2px] w-4 origin-center bg-brown"
                animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
              />
            </div>
          </button>
          <Logo variant="primary" />
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink onClick={openPrompt}>Order Now</NavLink>
          <NavLink href="/branches">Locations</NavLink>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-brown transition-colors hover:bg-bone"
            >
              <CartIcon />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brown px-1 text-[0.6rem] text-cream"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>

          {hydrated && (
            <div className="hidden items-center gap-4 sm:flex">
              {account ? (
                <NavLink href="/account">Account</NavLink>
              ) : (
                <>
                  <NavLink href="/login">Sign In</NavLink>
                  <NavLink href="/signup">Sign Up</NavLink>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Animated mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            key="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-bone bg-cream md:hidden"
          >
            {[
              { label: "Order Now", onClick: () => { setMenuOpen(false); openPrompt(); } },
            ].map(({ label, onClick }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.1 }}
              >
                <button
                  type="button"
                  onClick={onClick}
                  className="label-uppercase w-full border-b border-bone px-4 py-3 text-left text-xs text-brown transition-colors hover:bg-bone"
                >
                  {label}
                </button>
              </motion.div>
            ))}

            {[
              { href: "/branches", label: "Locations" },
              ...(account
                ? [{ href: "/account", label: "Account" }]
                : [
                    { href: "/login",  label: "Sign In" },
                    { href: "/signup", label: "Sign Up" },
                  ]),
            ].map(({ href, label }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (i + 1) * 0.05 + 0.1 }}
              >
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="label-uppercase block border-b border-bone px-4 py-3 text-xs text-brown transition-colors hover:bg-bone"
                >
                  {label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
