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
  title: "Airport Matrix | Save Up to 70% on Airport Parking at 50+ US Airports",
  description: "Compare official terminal parking rates with verified off-site lots. Book secure parking with free 24/7 shuttles at 50+ major US airports. Save up to 70% vs airport garage prices.",
  keywords: ["airport parking", "airport parking rates", "off-site parking", "airport parking coupons", "parking near airport", "cheap airport parking", "airport parking shuttle"],
  authors: [{ name: "Airport Matrix Team", url: "https://airportmatrix.com/about" }],
  creator: "Airport Matrix",
  publisher: "Airport Matrix",
  openGraph: {
    title: "Airport Matrix | Save Up to 70% on Airport Parking",
    description: "Compare airport parking rates. Book verified off-site lots with free shuttles at 50+ US airports.",
    type: "website",
    locale: "en_US",
    siteName: "Airport Matrix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Airport Matrix | Save Up to 70% on Airport Parking",
    description: "Compare airport parking rates. Verified lots with free 24/7 shuttles.",
    creator: "@airportmatrix",
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
