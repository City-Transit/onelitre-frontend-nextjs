import type { Metadata } from "next";
import { Fraunces, Space_Mono, Manrope } from "next/font/google";
import "./globals.css";

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
    "Bulk, freezer-ready meals from vetted vendors near you — home-cooked quality without the time or skill it takes to make it yourself.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${spaceMono.variable} ${manrope.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-bg text-paper antialiased">{children}</body>
    </html>
  );
}
