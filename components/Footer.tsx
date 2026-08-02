"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { useBranch } from "@/context/BranchContext";
import { branchList } from "@/lib/data/branches";

export default function Footer() {
  const { branch } = useBranch();
  const activeBranch = branch ?? branchList[0];

  return (
    <footer className="border-t border-bone bg-brown text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Logo variant="reversed" />
          <p className="mt-4 max-w-xs text-sm italic text-bone">
            Made to delight your taste buds.
          </p>
        </div>

        <div>
          <p className="label-uppercase text-xs text-bone">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/menu" className="hover:underline">
                Menu
              </Link>
            </li>
            <li>
              <Link href="/branches" className="hover:underline">
                Branches
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:underline">
                Account
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label-uppercase text-xs text-bone">
            {activeBranch.name} branch
          </p>
          <ul className="mt-3 space-y-2 text-sm text-cream">
            <li>{activeBranch.address}</li>
            <li>{activeBranch.hours}</li>
            <li>{activeBranch.phone}</li>
            <li>WhatsApp: {activeBranch.whatsapp}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brown-deep px-4 py-4 text-center text-xs text-bone sm:px-6">
        © {new Date().getFullYear()} Caio Pizza · Owerri &amp; Lagos. Caio for
        now.
      </div>
    </footer>
  );
}
