import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

// Static generation config - revalidate every hour
export const revalidate = 3600;

interface ParkingLot {
  id: string;
  name: string;
  slug: string;
  type: string;
  dailyRate: number;
  distanceMiles: number | null;
  shuttleMins: number | null;
  isIndoor: boolean;
  hasValet: boolean;
  is24Hours: boolean;
  rating: number | null;
  reviewCount: number | null;
  featured: boolean;
  affiliateUrl: string | null;
}

// Generate static pages for all airports with parking
export async function generateStaticParams() {
  const airports = await prisma.airport.findMany({
    where: {
      parkings: {
        some: { isActive: true }
      }
    },
    select: { iataCode: true }
  });

  return airports.map(airport => ({
    iata: (airport.iataCode || '').toLowerCase()
  }));
}

async function getAirportWithParking(iataCode: string) {
  const airport = await prisma.airport.findUnique({
    where: { iataCode: iataCode.toLowerCase() },
    include: {
      parkings: {
        where: { isActive: true },
        orderBy: [{ featured: "desc" }, { dailyRate: "asc" }],
      },
    },
  });

  return airport;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ iata: string }>;
}): Promise<Metadata> {
  const { iata } = await params;
  const airportCode = iata.toUpperCase();

  return {
    title: `${airportCode} Airport Parking | Compare Cheap Off-Site Lots & Save`,
    description: `Find the cheapest parking at ${airportCode} airport. Compare off-site lots with free shuttles vs official terminal rates. Save up to 70% on daily parking fees.`,
    keywords: [
      `${airportCode.toLowerCase()} airport parking`,
      `cheap ${airportCode.toLowerCase()} parking`,
      `${airportCode.toLowerCase()} off-site parking`,
      `best ${airportCode.toLowerCase()} parking rates`,
    ],
    alternates: {
      canonical: `https://airportmatrix.com/airport/${iata.toLowerCase()}/parking`,
    },
    openGraph: {
      title: `${airportCode} Airport Parking - Compare & Save`,
      description: `Find cheap off-site parking at ${airportCode} with free shuttle service.`,
      type: "website",
    },
  };
}

export default async function AirportParkingPage({
  params,
}: {
  params: Promise<{ iata: string }>;
}) {
  const { iata } = await params;
  const airport = await getAirportWithParking(iata);

  if (!airport) {
    notFound();
  }

  const airportCode = airport.iata.toUpperCase();
  const parkingLots = airport.parkings;

  // Analyze parking data for dynamic FAQ
  const hasShuttle = parkingLots.some(l => l.shuttleMins && l.shuttleMins > 0);
  const hasValet = parkingLots.some(l => l.hasValet);
  const hasIndoor = parkingLots.some(l => l.isIndoor);
  const has24Hour = parkingLots.some(l => l.is24Hours);
  const avgRating = parkingLots.length > 0 
    ? (parkingLots.reduce((sum, l) => sum + (l.rating || 0), 0) / parkingLots.length).toFixed(1)
    : "4.0";
  const minRate = parkingLots.length > 0 
    ? Math.min(...parkingLots.map(l => Number(l.dailyRate)))
    : 15;
  const maxRate = parkingLots.length > 0 
    ? Math.max(...parkingLots.map(l => Number(l.dailyRate)))
    : 35;

  // Schema.org structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${airportCode} Airport Parking Options`,
    description: `Compare ${parkingLots.length} parking options at ${airportCode} airport`,
    numberOfItems: parkingLots.length,
    itemListElement: parkingLots.map((lot, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://airportmatrix.com/parking/${lot.slug}`,
      name: lot.name,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://airportmatrix.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Airports",
        item: "https://airportmatrix.com/airports",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${airportCode} Parking`,
        item: `https://airportmatrix.com/airport/${iata.toLowerCase()}/parking`,
      },
    ],
  };

  const getPriceAnswer = () => {
    if (parkingLots.length === 0) return `Parking rates at ${airportCode} vary by facility and amenities.`;
    const rateText = `Parking at ${airportCode} ranges from $${minRate.toFixed(2)} to $${maxRate.toFixed(2)} per day.`;
    if (minRate < 20) {
      return `${rateText} The cheapest option starts at just $${minRate.toFixed(2)}/day, saving you significantly compared to official terminal rates of $35-50/day.`;
    }
    const amenities = [];
    if (hasValet) amenities.push("valet service");
    if (hasIndoor) amenities.push("indoor parking");
    if (hasShuttle) amenities.push("shuttle service");
    const amenityText = amenities.length > 0 ? amenities.join(", ") : "proximity to terminal";
    return `${rateText} Rates vary based on amenities like ${amenityText}.`;
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How much does parking cost at ${airportCode} airport?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: getPriceAnswer(),
        },
      },
      ...(hasShuttle ? [{
        "@type": "Question",
        name: `Do ${airportCode} parking lots offer shuttle service?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes, several parking facilities near ${airportCode} provide complimentary shuttle service to the terminal. Shuttle times vary by location, typically ranging from ${parkingLots.filter(l => l.shuttleMins).length > 0 ? Math.min(...parkingLots.filter(l => l.shuttleMins).map(l => l.shuttleMins || 999)) : 3}-${parkingLots.filter(l => l.shuttleMins).length > 0 ? Math.max(...parkingLots.filter(l => l.shuttleMins).map(l => l.shuttleMins || 0)) : 15} minutes. Check individual listings for specific shuttle details.`,
        },
      }] : []),
      {
        "@type": "Question",
        name: `What types of parking are available at ${airportCode}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${airportCode} offers ${parkingLots.length} parking option${parkingLots.length > 1 ? "s" : ""} including ${hasIndoor ? "indoor parking, " : ""}${hasValet ? "valet service, " : ""}${has24Hour ? "24/7 access, " : ""}and self-park facilities. Each lot has different amenities and pricing - compare options to find the best fit for your needs.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I choose the best parking at ${airportCode}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Consider these factors when choosing parking at ${airportCode}: ${hasShuttle ? "Shuttle frequency and travel time to terminal, " : ""}price per day, customer ratings (average ${avgRating} stars), ${hasValet ? "valet vs self-park options, " : ""}${hasIndoor ? "indoor vs outdoor parking, " : ""}and proximity to the airport. Click on any listing to see detailed information and reviews.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link
              href="/airports"
              className="flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              All Airports
            </Link>
            <div className="font-black text-xl tracking-tight text-slate-900">
              Airport<span className="text-blue-600">Matrix</span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="bg-white border-b border-slate-200 pt-8 md:pt-12 pb-6 md:pb-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <nav className="text-xs md:text-sm text-slate-500 mb-3 md:mb-4">
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/airports" className="hover:text-blue-600">
                Airports
              </Link>
              <span className="mx-2">/</span>
              <span className="text-slate-900 font-medium">
                {airportCode} Parking
              </span>
            </nav>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-2 md:mb-4">
              {airportCode} Airport Parking
            </h1>
            <p className="text-sm sm:text-lg text-slate-600 max-w-2xl">
              Compare {parkingLots.length} off-site parking options at{" "}
              {airport.name}. Save up to 70% vs official terminal rates with free
              shuttle service.
            </p>
          </div>
        </div>

        {/* Why Off-Site Parking */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
            Why Choose Off-Site Parking at {airportCode}?
          </h2>
          <div className="grid md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200">
              <div className="text-2xl md:text-3xl font-black text-emerald-600 mb-1 md:mb-2">70%</div>
              <h3 className="font-bold text-slate-900 mb-0.5 md:mb-1 text-sm md:text-base">Average Savings</h3>
              <p className="text-xs md:text-sm text-slate-600">
                Compared to official terminal parking rates
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200">
              <div className="text-2xl md:text-3xl font-black text-blue-600 mb-1 md:mb-2">24/7</div>
              <h3 className="font-bold text-slate-900 mb-0.5 md:mb-1 text-sm md:text-base">Free Shuttle</h3>
              <p className="text-xs md:text-sm text-slate-600">
                Complimentary transportation to terminal
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200">
              <div className="text-2xl md:text-3xl font-black text-purple-600 mb-1 md:mb-2">
                {parkingLots.length > 0 ? Math.max(...parkingLots.map(l => l.rating || 0)).toFixed(1) : "4.5"}+
              </div>
              <h3 className="font-bold text-slate-900 mb-0.5 md:mb-1 text-sm md:text-base">Top Rating</h3>
              <p className="text-xs md:text-sm text-slate-600">
                Verified customer reviews
              </p>
            </div>
          </div>
        </section>

        {/* Parking List */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
            Available Parking Options ({parkingLots.length})
          </h2>
          {parkingLots.length === 0 ? (
            <div className="text-center py-12 md:py-16 bg-white rounded-xl md:rounded-2xl border border-slate-200">
              <p className="text-slate-600 text-base md:text-lg">
                No parking options available for {airportCode} yet.
              </p>
              <p className="text-slate-400 mt-2 text-xs md:text-sm">
                Check back soon for updated listings.
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {parkingLots.map((lot) => (
                <div
                  key={lot.id}
                  className="bg-white rounded-xl md:rounded-2xl border border-slate-200 p-4 md:p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 truncate">
                          {lot.name}
                        </h2>
                        {lot.featured && (
                          <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex-shrink-0">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-500">
                        {lot.distanceMiles && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                            {lot.distanceMiles} mi
                          </span>
                        )}
                        {lot.shuttleMins && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            {lot.shuttleMins} min
                          </span>
                        )}
                        {lot.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 md:w-4 md:h-4 text-amber-500 fill-amber-500" />
                            {lot.rating}
                            {lot.reviewCount && (
                              <span className="text-slate-400">
                                ({lot.reviewCount})
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2 md:mt-3">
                        {lot.is24Hours && (
                          <span className="px-1.5 md:px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
                            24/7
                          </span>
                        )}
                        {lot.isIndoor && (
                          <span className="px-1.5 md:px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                            Indoor
                          </span>
                        )}
                        {lot.hasValet && (
                          <span className="px-1.5 md:px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-medium rounded">
                            Valet
                          </span>
                        )}
                        <span className="px-1.5 md:px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                          {lot.type === "OFF_SITE" ? "Off-Site" : "On-Site"}
                        </span>
                      </div>
                    </div>

                    {/* Right: Price & CTA */}
                    <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6">
                      <div className="text-right">
                        <div className="text-2xl md:text-3xl font-black text-slate-900">
                          ${lot.dailyRate.toFixed(2)}
                        </div>
                        <div className="text-xs md:text-sm text-slate-500">per day</div>
                      </div>

                      <div className="flex flex-row md:flex-col gap-2">
                        <Link
                          href={`/parking/${lot.slug}`}
                          className="px-4 md:px-6 py-2 md:py-2.5 bg-slate-900 text-white font-bold rounded-lg md:rounded-xl hover:bg-slate-800 transition-colors text-center text-sm"
                        >
                          Details
                        </Link>
                        {lot.affiliateUrl && (
                          <a
                            href={lot.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 md:px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg md:rounded-xl hover:bg-emerald-500 transition-colors text-center text-xs md:text-sm"
                          >
                            Book Now
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
            Frequently Asked Questions
          </h2>
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 divide-y divide-slate-100">
            <details className="p-4 md:p-6 group">
              <summary className="flex justify-between items-center cursor-pointer font-bold text-sm md:text-base text-slate-900 list-none gap-2">
                <span className="flex-1">How much does parking cost at {airportCode} airport?</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
              </summary>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 leading-relaxed">
                {parkingLots.length > 0
                  ? `Parking at ${airportCode} ranges from $${minRate.toFixed(2)} to $${maxRate.toFixed(2)} per day. ${minRate < 20 ? `The cheapest option starts at just $${minRate.toFixed(2)}/day, saving you significantly compared to official terminal rates of $35-50/day.` : `Rates vary based on amenities like ${hasValet ? "valet service, " : ""}${hasIndoor ? "indoor parking, " : ""}${hasShuttle ? "shuttle service" : "proximity to terminal"}.`}`
                  : `Parking rates at ${airportCode} vary by facility and amenities. Check back soon for updated pricing information.`}
              </p>
            </details>
            {hasShuttle && (
              <details className="p-4 md:p-6 group">
                <summary className="flex justify-between items-center cursor-pointer font-bold text-sm md:text-base text-slate-900 list-none gap-2">
                  <span className="flex-1">Do {airportCode} parking lots offer shuttle service?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
                </summary>
                <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 leading-relaxed">
                  Yes, several parking facilities near {airportCode} provide complimentary shuttle service to the terminal. 
                  Shuttle times vary by location, typically ranging from {parkingLots.filter(l => l.shuttleMins).length > 0 ? Math.min(...parkingLots.filter(l => l.shuttleMins).map(l => l.shuttleMins || 999)) : 3}-{parkingLots.filter(l => l.shuttleMins).length > 0 ? Math.max(...parkingLots.filter(l => l.shuttleMins).map(l => l.shuttleMins || 0)) : 15} minutes. 
                  Check individual listings for specific shuttle details.
                </p>
              </details>
            )}
            <details className="p-4 md:p-6 group">
              <summary className="flex justify-between items-center cursor-pointer font-bold text-sm md:text-base text-slate-900 list-none gap-2">
                <span className="flex-1">What types of parking are available at {airportCode}?</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
              </summary>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 leading-relaxed">
                {airportCode} offers {parkingLots.length} parking option{parkingLots.length > 1 ? "s" : ""} including {hasIndoor ? "indoor parking, " : ""}{hasValet ? "valet service, " : ""}{has24Hour ? "24/7 access, " : ""}and self-park facilities. 
                Each lot has different amenities and pricing - compare options to find the best fit for your needs.
              </p>
            </details>
            <details className="p-4 md:p-6 group">
              <summary className="flex justify-between items-center cursor-pointer font-bold text-sm md:text-base text-slate-900 list-none gap-2">
                <span className="flex-1">How do I choose the best parking at {airportCode}?</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
              </summary>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 leading-relaxed">
                Consider these factors when choosing parking at {airportCode}: {hasShuttle ? "Shuttle frequency and travel time to terminal, " : ""}price per day, customer ratings (average {avgRating} stars), {hasValet ? "valet vs self-park options, " : ""}{hasIndoor ? "indoor vs outdoor parking, " : ""}and proximity to the airport. 
                Click on any listing to see detailed information and reviews.
              </p>
            </details>
          </div>
        </section>

        {/* Related Airports */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
            Popular Airport Parking
          </h2>
          <div className="flex flex-wrap gap-3">
            {["JFK", "LAX", "ORD", "ATL", "MIA", "DEN", "SEA", "SFO"].filter(code => code !== airportCode).slice(0, 6).map(code => (
              <Link
                key={code}
                href={`/airport/${code.toLowerCase()}/parking`}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {code} Parking
              </Link>
            ))}
            <Link
              href="/airports"
              className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-medium hover:bg-blue-100 transition-colors"
            >
              View All Airports →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-8 mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-black text-lg tracking-tight text-white">
              Airport<span className="text-blue-400">Matrix</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/airports" className="hover:text-white transition-colors">
                Airports
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} AirportMatrix
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
