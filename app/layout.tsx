import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Airport Matrix | Showers, Luggage Storage & Sleeping Pods at 500+ Airports",
  description: "Find showers, luggage storage, sleeping pods, and transport at 500+ airports worldwide. Real-time facility locations for stress-free travel. Verified airport infrastructure data curated by frequent flyers and aviation professionals since 2024.",
  keywords: ["airport showers", "luggage storage", "sleeping pods", "airport facilities", "transit hotels", "airport transport"],
  authors: [{ name: "Airport Matrix Team", url: "https://airportmatrix.com/about" }],
  creator: "Airport Matrix",
  publisher: "Airport Matrix",
  openGraph: {
    title: "Airport Matrix | Airport Facility Finder",
    description: "Showers, storage & sleeping pods at 500+ airports. Real-time data for travelers.",
    type: "website",
    locale: "en_US",
    siteName: "Airport Matrix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Airport Matrix | Airport Facility Finder",
    description: "Find showers, luggage storage & sleeping pods at 500+ airports",
    creator: "@airportmatrix",
  },
  verification: {
    google: "google-site-verification-code",
  },
  alternates: {
    canonical: "https://airportmatrix.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* 防止浏览器扩展（如翻译插件）修改 HTML 导致 hydration 错误 */}
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
