import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import AirportsContent from "./AirportsContent";

// Static generation with ISR - revalidate every hour
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All US Airport Parking Locations | Compare Major Airports",
  description: "Browse a complete directory of US airports. Compare official terminal parking rates vs affordable off-site lots with free 24/7 shuttles. Save up to 70% on every trip.",
  keywords: [
    "airport parking directory",
    "US airport parking",
    "compare airport parking rates",
    "cheap airport parking",
    "off-site airport parking",
    "airport parking lots near me",
  ],
  openGraph: {
    title: "All US Airport Parking Locations | AirportMatrix",
    description: "Compare official vs off-site parking at major US airports. Save up to 70% with free shuttles.",
    type: "website",
  },
  alternates: {
    canonical: "https://airportmatrix.com/airports",
  },
};

async function getAirports() {
  try {
    const airports = await prisma.airport.findMany({
      where: { isActive: true },
      orderBy: { city: "asc" },
      include: {
        parkings: {
          where: { isActive: true, type: "OFF_SITE" },
          orderBy: { dailyRate: "asc" },
          take: 1,
        },
      },
    });

    return airports.map(airport => ({
      iata: airport.iata,
      name: airport.name,
      city: `${airport.city}, ${airport.country}`,
      isPopular: airport.isPopular,
      minRate: airport.parkings.length > 0 
        ? parseFloat(airport.parkings[0].dailyRate.toString()) 
        : undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch airports:", error);
    return [];
  }
}

export default async function AirportsPage() {
  const airports = await getAirports();
  const airportCodes = airports.map(a => a.iata);

  // Calculate stats for dynamic FAQ
  const airportsWithRates = airports.filter(a => a.minRate);
  const cheapestAirports = airportsWithRates.length > 0 
    ? [...airportsWithRates].sort((a, b) => (a.minRate || 999) - (b.minRate || 999)).slice(0, 3)
    : [];
  const avgMinRate = airportsWithRates.length > 0
    ? (airportsWithRates.reduce((sum, a) => sum + (a.minRate || 0), 0) / airportsWithRates.length).toFixed(0)
    : "15";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        url: "https://airportmatrix.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Airports",
        url: "https://airportmatrix.com/airports",
      },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "US Airport Parking Directory",
    description: `Complete directory of ${airportCodes.length} major US airports with verified off-site parking options, rates, and free shuttle service.`,
    numberOfItems: airportCodes.length,
    itemListElement: airportCodes.map((code, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://airportmatrix.com/airport/${code.toLowerCase()}/parking`,
      name: `${code} Airport Parking`,
    })),
  };

  const airportSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "US Airports with Parking",
    itemListElement: airports.map((airport, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Airport",
        name: airport.name,
        iataCode: airport.iata,
        address: {
          "@type": "PostalAddress",
          addressLocality: airport.city.split(",")[0]?.trim(),
          addressCountry: "US",
        },
        url: `https://airportmatrix.com/airport/${airport.iata.toLowerCase()}/parking`,
      },
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which airports have the cheapest parking?",
        acceptedAnswer: {
          "@type": "Answer",
          text: cheapestAirports.length > 0
            ? `Based on current rates, the most affordable parking is at ${cheapestAirports.map(a => `${a.iata} ($${a.minRate?.toFixed(2)}/day)`).join(", ")}. These off-site lots offer significant savings compared to official terminal rates.`
            : `We list parking options at ${airports.length} airports across the US. Off-site lots typically save you 50-70% compared to official terminal rates.`,
        },
      },
      {
        "@type": "Question",
        name: "How much does airport parking cost on average?",
        acceptedAnswer: {
          "@type": "Answer",
          text: airportsWithRates.length > 0
            ? `Off-site parking across our listed airports averages $${avgMinRate}/day. Official terminal parking typically costs $35-50/day, so you can save $20-35 per day by choosing verified off-site options.`
            : `Off-site airport parking typically ranges from $10-25/day, while official terminal parking costs $35-50/day. You can save 50-70% by choosing off-site options.`,
        },
      },
      {
        "@type": "Question",
        name: "How many airports do you cover?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `We currently list parking options at ${airports.length} airports across the United States. Each listing includes verified off-site lots with real-time pricing, customer reviews, and amenity details.`,
        },
      },
      {
        "@type": "Question",
        name: "What information can I find for each airport?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `For each of the ${airports.length} airports in our directory, you'll find: lowest available off-site parking rates, shuttle service details, lot amenities (valet, indoor parking, 24/7 access), customer ratings, and direct booking links.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(airportSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="min-h-screen bg-slate-50 font-sans pb-24">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Home
            </Link>
            <div className="font-black text-xl tracking-tight text-slate-900">
              Airport<span className="text-blue-600">Matrix</span>
            </div>
          </div>
        </header>

        <AirportsContent 
          airports={airports} 
          cheapestAirports={cheapestAirports}
          avgMinRate={avgMinRate}
        />

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-black text-lg tracking-tight text-white">
              Airport<span className="text-blue-400">Matrix</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/airports" className="hover:text-white transition-colors">Airports</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} AirportMatrix
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
