import type { Metadata } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderMethodModal from "@/components/OrderMethodModal";
import { BranchProvider } from "@/context/BranchContext";
import { getBranches } from "@/lib/branchSettings";
import { CartProvider } from "@/context/CartContext";
import { OrderMethodProvider } from "@/context/OrderMethodContext";
import AccountCartBridge from "@/components/AccountCartBridge";
import HideOnAdmin from "@/components/HideOnAdmin";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";

// Fonts are bundled in app/fonts (variable WOFF2, latin) instead of fetched
// from Google at build time — that download kept failing Vercel builds.

// Display / headlines — editorial Italian elegance
const cormorant = localFont({
  variable: "--font-cormorant",
  weight: "300 700",
  display: "swap",
  src: [
    { path: "./fonts/cormorant-garamond-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-wght-italic.woff2", style: "italic" },
  ],
});

// Labels, nav, buttons — clean geometric sans
const dmSans = localFont({
  variable: "--font-dm-sans",
  weight: "100 1000",
  display: "swap",
  src: [
    { path: "./fonts/dm-sans-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/dm-sans-latin-wght-italic.woff2", style: "italic" },
  ],
});

// Body copy — warm readable serif
const lora = localFont({
  variable: "--font-lora",
  weight: "400 700",
  display: "swap",
  src: [
    { path: "./fonts/lora-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/lora-latin-wght-italic.woff2", style: "italic" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.caiopizza.com"),
  title: "Caio Pizza — Made to delight your taste buds",
  description:
    "Chef driven Nigerian Italian fusion pizza in Lagos, with Owerri coming soon. Order online for delivery or pickup.",
  openGraph: {
    title: "Caio Pizza",
    description: "Chef driven Nigerian Italian fusion pizza in Lagos. Owerri coming soon.",
    url: "https://www.caiopizza.com",
    siteName: "Caio Pizza",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Caio Pizza",
    description: "Chef driven Nigerian Italian fusion pizza in Lagos. Owerri coming soon.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branches = await getBranches();
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-brown-darkest">
        <SessionProvider>
          <BranchProvider branches={branches}>
            <CartProvider>
              <AccountCartBridge>
                <OrderMethodProvider>
                  <HideOnAdmin>
                    <Header />
                  </HideOnAdmin>
                  <main className="flex-1">{children}</main>
                  <HideOnAdmin>
                    <Footer />
                  </HideOnAdmin>
                  <FeedbackWidget />
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
