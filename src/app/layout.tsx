import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://lp-grid-concept.vercel.app";
const TITLE = "LP Grid — Independent Private-Markets Intelligence Concept";
const DESCRIPTION =
  "An independent product concept by Aditya Singh exploring institutional-investor discovery, allocation intelligence and relationship mapping for private markets.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "LP Grid Concept",
  authors: [{ name: "Aditya Singh", url: "https://dev-aditya-com.vercel.app/" }],
  creator: "Aditya Singh",
  publisher: "Aditya Singh",
  keywords: [
    "LP Grid",
    "private markets",
    "institutional investors",
    "sovereign wealth funds",
    "pension funds",
    "private equity",
    "relationship mapping",
    "intelligence concept",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "LP Grid — Independent Concept",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-lp-grid-concept.png",
        width: 1200,
        height: 630,
        alt: "LP Grid — Private-market relationship intelligence. Independent concept by Aditya Singh.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@aditya_singh",
    images: ["/og-lp-grid-concept.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "design",
};

export const viewport: Viewport = {
  themeColor: "#0A0E14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0E14] text-slate-200`}
      >
        {children}
      </body>
    </html>
  );
}
