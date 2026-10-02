import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL = process.env.NEXTAUTH_URL || "https://bhopal-car-deal.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bhopal Car Deal | Certified Pre-Owned Cars Showroom Since 2004",
    template: "%s | Bhopal Car Deal",
  },
  description:
    "Bhopal Car Deal - Bhopal's trusted certified pre-owned car dealership since 2004. Explore 150+ inspected cars, doorstep evaluation, paperless RC transfer, and instant finance options.",
  keywords: [
    "Bhopal Car Deal",
    "Used Cars in Bhopal",
    "Second Hand Cars Bhopal",
    "Pre Owned Cars Bhopal",
    "Certified Pre Owned Cars",
    "Sell Car Bhopal",
    "Buy Used Car Bhopal",
    "Motia Talab Bhopal Car Deal",
  ],
  authors: [{ name: "Bhopal Car Deal", url: SITE_URL }],
  creator: "Bhopal Car Deal",
  publisher: "Bhopal Car Deal",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Bhopal Car Deal",
    title: "Bhopal Car Deal | Certified Pre-Owned Cars Showroom Since 2004",
    description:
      "Bhopal's trusted showroom for certified pre-owned cars since 2004. 150+ point quality inspection, easy EMI finance, and immediate doorstep valuation.",
    images: [
      {
        url: "/images/hero-red-car.jpg",
        width: 1200,
        height: 630,
        alt: "Bhopal Car Deal Showroom",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bhopal Car Deal | Certified Pre-Owned Cars Showroom Since 2004",
    description:
      "Certified pre-owned cars in Bhopal with 150+ point checks and hassle-free financing.",
    images: ["/images/hero-red-car.jpg"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

