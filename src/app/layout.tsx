import type { Metadata } from "next";
import { Fraunces, Space_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { serverApiFetch } from "@/lib/server-api";
import { CartProvider } from "./menu/cart-context";
import { CartDrawer } from "@/components/cart-drawer";
import { MobileBasketBar } from "@/components/mobile-basket-bar";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Onelitre.ng — Cook once. Eat all month.",
  description:
    "Bulk, freezer-ready meals from vetted kitchens near you — home-cooked quality without the time or skill it takes to make it yourself.",
};

async function getCurrentUserId(): Promise<string | null> {
  const res = await serverApiFetch('/auth/me');
  if (!res.ok) return null;
  const user: { id: string } = await res.json();
  return user.id;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getCurrentUserId();

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${spaceMono.variable} ${manrope.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-bg text-paper antialiased">
        <CartProvider userId={userId}>
          {children}
          <CartDrawer />
          <MobileBasketBar />
        </CartProvider>
      </body>
    </html>
  );
}
