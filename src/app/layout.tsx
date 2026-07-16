import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LP Grid — Mapping the Relationships Behind Private Markets",
  description:
    "A visual intelligence interface that helps private-market professionals move from a fragmented institutional ecosystem to the investors, strategies and relationships most relevant to them.",
  keywords: [
    "LP Grid",
    "private markets",
    "institutional investors",
    "sovereign wealth funds",
    "pension funds",
    "private equity",
    "intelligence",
  ],
  authors: [{ name: "LP Grid" }],
  openGraph: {
    title: "LP Grid — Mapping the Relationships Behind Private Markets",
    description:
      "A visual intelligence interface that helps private-market professionals move from a fragmented institutional ecosystem to the investors, strategies and relationships most relevant to them.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0E14] text-slate-200`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
