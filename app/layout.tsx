import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Lora } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderMethodModal from "@/components/OrderMethodModal";
import { BranchProvider } from "@/context/BranchContext";
import { CartProvider } from "@/context/CartContext";
import { OrderMethodProvider } from "@/context/OrderMethodContext";
import AccountCartBridge from "@/components/AccountCartBridge";

// Display / headlines — editorial Italian elegance
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

// Labels, nav, buttons — clean geometric sans
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

// Body copy — warm readable serif
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Caio Pizza — Made to delight your taste buds",
  description:
    "Chef driven Nigerian Italian fusion pizza. Owerri and Lagos. Order online for delivery or pickup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-crisp text-brown-darkest">
        <SessionProvider>
          <BranchProvider>
            <CartProvider>
              <AccountCartBridge>
                <OrderMethodProvider>
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <OrderMethodModal />
                </OrderMethodProvider>
              </AccountCartBridge>
            </CartProvider>
          </BranchProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
