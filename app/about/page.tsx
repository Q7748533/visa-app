import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About AirportMatrix — Our Mission to Save You $20-60 on Airport Parking",
  description: "Learn how AirportMatrix helps travelers find cheap airport parking at 15 US airports. We compare off-site lots vs terminal rates so you always pay less.",
  keywords: [
    "airportmatrix about",
    "about airport parking comparison",
    "cheapest airport parking site",
    "off-site airport parking vs terminal",
  ],
  openGraph: {
    title: "About AirportMatrix — Save $20-60 on Airport Parking",
    description: "Independent travel site comparing off-site airport parking vs terminal garage rates at 15 US airports.",
    type: "website",
  },
  alternates: {
    canonical: "https://airportmatrix.com/about",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AirportMatrix",
  url: "https://airportmatrix.com",
  logo: "https://airportmatrix.com/logo.png",
  description: "Independent travel data aggregator helping US travelers find and compare verified off-site airport parking lots vs official terminal garage rates.",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    url: "https://airportmatrix.com/contact",
  },
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  mainEntity: {
    "@type": "Organization",
    name: "AirportMatrix",
    url: "https://airportmatrix.com",
    description: "Independent travel data aggregator helping US travelers find and compare verified off-site airport parking lots vs official terminal garage rates. Covers 15 major US airports with rates verified daily.",
  },
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />

      <div className="min-h-screen bg-slate-50 font-sans pb-24">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium min-h-[44px]">
              <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
              Home
            </Link>
            <div className="font-black text-xl tracking-tight text-slate-900">
              Airport<span className="text-blue-600">Matrix</span>
            </div>
          </div>
        </header>

        <AboutContent />
      </div>
    </>
  );
}