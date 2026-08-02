import type { Metadata } from "next";
import { Playfair_Display, Archivo, Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BranchFirstVisitModal from "@/components/BranchFirstVisitModal";
import OrderMethodModal from "@/components/OrderMethodModal";
import { BranchProvider } from "@/context/BranchContext";
import { CartProvider } from "@/context/CartContext";
import { OrderMethodProvider } from "@/context/OrderMethodContext";
import AccountCartBridge from "@/components/AccountCartBridge";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "900"],
  style: ["normal", "italic"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
      className={`${playfair.variable} ${archivo.variable} ${inter.variable} h-full antialiased`}
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
                  <BranchFirstVisitModal />
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
