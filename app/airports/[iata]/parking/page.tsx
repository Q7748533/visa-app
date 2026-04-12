import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import {
  MapPin,
  Star,
  ArrowLeft,
  ArrowRight,
  Shield,
  Car,
  Bus,
} from "lucide-react";

// Static generation with ISR - revalidate every hour
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

interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
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

async function getAirportWithParking(iataCode: string): Promise<{ airport: Airport; parkings: ParkingLot[] } | null> {
  const airport = await prisma.airport.findUnique({
    where: { iataCode: iataCode.toLowerCase() },
  });

  if (!airport) {
    return null;
  }

  const parkings = await prisma.parkingLot.findMany({
    where: {
      airportIataCode: iataCode.toLowerCase(),
      isActive: true,
    },
    orderBy: [{ featured: "desc" }, { dailyRate: "asc" }],
  });

  return {
    airport: {
      iata: airport.iata,
      name: airport.name,
      city: airport.city,
      country: airport.country,
    },
    parkings: parkings.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      type: p.type,
      dailyRate: parseFloat(p.dailyRate.toString()),
      distanceMiles: p.distanceMiles,
      shuttleMins: p.shuttleMins,
      isIndoor: p.isIndoor,
      hasValet: p.hasValet,
      is24Hours: p.is24Hours,
      rating: p.rating,
      reviewCount: p.reviewCount,
      featured: p.featured,
      affiliateUrl: p.affiliateUrl,
    })),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ iata: string }> }): Promise<Metadata> {
  const { iata } = await params;
  const data = await getAirportWithParking(iata);

  if (!data) {
    return {
      title: "Airport Not Found | AirportMatrix",
    };
  }

  const { airport, parkings } = data;
  const lowestRate = parkings.length > 0 ? Math.min(...parkings.map(p => p.dailyRate)) : null;

  const title = `${airport.iata} Airport Parking | ${parkings.length} Off-Site Lots from $${lowestRate?.toFixed(2) || '15'}/day`;
  const description = `Compare ${parkings.length} off-site parking options near ${airport.name} (${airport.iata}). ${lowestRate ? `Rates from $${lowestRate.toFixed(2)}/day. ` : ''}Free 24/7 shuttles to terminal. Real reviews, instant booking.`;

  return {
    title,
    description,
    keywords: [
      `${airport.iata.toLowerCase()} airport parking`,
      `${airport.city.toLowerCase()} airport parking`,
      `${airport.iata.toLowerCase()} parking`,
      "off-site airport parking",
      "cheap airport parking",
      "airport parking with shuttle",
      "long term airport parking",
    ],
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `https://airportmatrix.com/airports/${iata.toLowerCase()}/parking`,
    },
  };
}

export default async function AirportParkingPage({ params }: { params: Promise<{ iata: string }> }) {
  const { iata } = await params;
  const data = await getAirportWithParking(iata);

  if (!data) {
    notFound();
  }

  const { airport, parkings } = data;
  const lowestRate = parkings.length > 0 ? Math.min(...parkings.map(p => p.dailyRate)) : null;
  const featuredLots = parkings.filter(p => p.featured);
  const regularLots = parkings.filter(p => !p.featured);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${airport.iata} Airport Parking Options`,
    description: `Compare ${parkings.length} parking options at ${airport.name}`,
    numberOfItems: parkings.length,
    itemListElement: parkings.map((parking, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "ParkingFacility",
        name: parking.name,
        url: `https://airportmatrix.com/airports/${iata.toLowerCase()}/parking/${parking.slug}`,
        priceRange: `$${parking.dailyRate.toFixed(2)}`,
        aggregateRating: parking.rating ? {
          "@type": "AggregateRating",
          ratingValue: parking.rating,
          reviewCount: parking.reviewCount || 0,
        } : undefined,
      },
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
        url: "https://airportmatrix.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Airports",
        url: "https://airportmatrix.com/airports",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${airport.iata} Parking`,
        url: `https://airportmatrix.com/airports/${iata.toLowerCase()}/parking`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="min-h-screen bg-slate-50 font-sans pb-24">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/airports" className="flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium">
              <ArrowLeft className="w-5 h-5 mr-2" />
              All Airports
            </Link>
            <div className="font-black text-xl tracking-tight text-slate-900">
              Airport<span className="text-blue-600">Matrix</span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="bg-slate-900 text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <nav aria-label="Breadcrumb" className="text-sm text-slate-400 mb-4">
              <ol className="flex items-center flex-wrap">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">Home</Link>
                </li>
                <li className="mx-2" aria-hidden="true">/</li>
                <li>
                  <Link href="/airports" className="hover:text-white transition-colors">Airports</Link>
                </li>
                <li className="mx-2" aria-hidden="true">/</li>
                <li className="text-white font-medium" aria-current="page">
                  {airport.iata} Parking
                </li>
              </ol>
            </nav>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
              {airport.iata} Airport Parking
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl">
              {parkings.length} off-site parking options at {airport.name}
              {lowestRate && ` — from $${lowestRate.toFixed(2)}/day`}
            </p>
          </div>
        </div>

        {/* Parking Lots */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          {parkings.length === 0 ? (
            <div className="text-center py-16">
              <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">No parking options available</h2>
              <p className="text-slate-500">We&apos;re currently adding parking options for this airport.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 表格形式 */}
              <section aria-labelledby="parking-lots-heading">
                <h2 id="parking-lots-heading" className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6 border-b border-slate-200 pb-4">
                  Available Parking Lots at {airport.iata}
                  <span className="text-xs md:text-sm font-normal text-slate-500 ml-2">({parkings.length} options)</span>
                </h2>
                
                {/* 表格 */}
                <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden shadow-sm">
                  {/* 表头 */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-600 uppercase tracking-wider">
                    <div className="col-span-4">Parking Lot</div>
                    <div className="col-span-2">Distance</div>
                    <div className="col-span-2">Shuttle</div>
                    <div className="col-span-2 text-right">Daily Rate</div>
                    <div className="col-span-2"></div>
                  </div>

                  {/* 表格内容 */}
                  <div className="divide-y divide-slate-100">
                    {parkings.map((parking) => (
                      <Link
                        key={parking.id}
                        href={`/airports/${iata.toLowerCase()}/parking/${parking.slug}`}
                        className="group block md:grid md:grid-cols-12 gap-4 px-4 md:px-6 py-4 md:py-5 hover:bg-slate-50 transition-colors items-center"
                      >
                        {/* 停车场名称 */}
                        <div className="md:col-span-4 mb-2 md:mb-0">
                          <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Lot:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {parking.name}
                            </span>
                            {parking.featured && (
                              <span className="inline-flex items-center text-xs font-medium text-amber-600">
                                <Star className="w-3 h-3 mr-0.5" />
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1 md:mt-2">
                            {parking.isIndoor && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">Indoor</span>
                            )}
                            {parking.hasValet && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">Valet</span>
                            )}
                            {parking.is24Hours && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">24/7</span>
                            )}
                          </div>
                        </div>

                        {/* 距离 */}
                        <div className="md:col-span-2 mb-2 md:mb-0">
                          <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Distance:</span>
                          <div className="flex items-center text-slate-600">
                            <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                            <span>{parking.distanceMiles ? `${parking.distanceMiles} mi` : '—'}</span>
                          </div>
                        </div>

                        {/* Shuttle */}
                        <div className="md:col-span-2 mb-2 md:mb-0">
                          <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Shuttle:</span>
                          <div className="flex items-center text-slate-600">
                            <Bus className="w-4 h-4 mr-1.5 text-slate-400" />
                            <span>{parking.shuttleMins ? `${parking.shuttleMins} min` : '—'}</span>
                          </div>
                        </div>

                        {/* 价格 */}
                        <div className="md:col-span-2 text-right mb-2 md:mb-0">
                          <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Rate:</span>
                          <span className="font-bold text-emerald-600 text-lg">
                            ${parking.dailyRate.toFixed(2)}
                          </span>
                          <span className="text-slate-400 text-sm">/day</span>
                        </div>

                        {/* 操作按钮 */}
                        <div className="md:col-span-2 text-right">
                          <span className="inline-flex items-center gap-1 text-blue-600 font-bold text-sm group-hover:text-blue-700">
                            <span className="md:hidden">View Details</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>

        {/* FAQ Section */}
        {parkings.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-lg md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
              Frequently Asked Questions about {airport.iata} Parking
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
              <details className="p-4 md:p-6 group">
                <summary className="flex justify-between items-center cursor-pointer font-bold text-sm md:text-base text-slate-900 list-none gap-2">
                  <span className="flex-1">How much does it cost to park at {airport.iata} Airport?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">↓</span>
                </summary>
                <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 leading-relaxed">
                  Off-site parking near {airport.iata} Airport typically ranges from ${lowestRate?.toFixed(2) || '15.00'} to ${parkings.length > 0 ? Math.max(...parkings.map(p => p.dailyRate)).toFixed(2) : '35.00'} per day.
                  {parkings.length > 1 ? ` The cheapest option is ${parkings.sort((a, b) => a.dailyRate - b.dailyRate)[0].name} at $${parkings.sort((a, b) => a.dailyRate - b.dailyRate)[0].dailyRate.toFixed(2)}/day.` : ''}
                  All facilities include complimentary shuttle service to the terminal.
                </p>
              </details>
              {parkings.some(p => p.shuttleMins) && (
                <details className="p-4 md:p-6 group">
                  <summary className="flex justify-between items-center cursor-pointer font-bold text-sm md:text-base text-slate-900 list-none gap-2">
                    <span className="flex-1">Is there free shuttle service from {airport.iata} parking lots?</span>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">↓</span>
                  </summary>
                  <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 leading-relaxed">
                    Yes, several parking facilities near {airport.iata} provide complimentary shuttle service to the terminal.
                    Shuttle times vary by location, typically ranging from {parkings.filter(l => l.shuttleMins).length > 0 ? Math.min(...parkings.filter(l => l.shuttleMins).map(l => l.shuttleMins || 999)) : 3}-{parkings.filter(l => l.shuttleMins).length > 0 ? Math.max(...parkings.filter(l => l.shuttleMins).map(l => l.shuttleMins || 0)) : 15} minutes.
                    Check individual listings for specific shuttle details.
                  </p>
                </details>
              )}
              <details className="p-4 md:p-6 group">
                <summary className="flex justify-between items-center cursor-pointer font-bold text-sm md:text-base text-slate-900 list-none gap-2">
                  <span className="flex-1">What types of parking are available at {airport.iata}?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">↓</span>
                </summary>
                <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 leading-relaxed">
                  {airport.iata} offers {parkings.length} parking option{parkings.length > 1 ? "s" : ""} including {parkings.some(p => p.isIndoor) ? "indoor parking, " : ""}{parkings.some(p => p.hasValet) ? "valet service, " : ""}{parkings.some(p => p.is24Hours) ? "24/7 access, " : ""}and self-park facilities.
                  Each lot has different amenities and pricing - compare options to find the best fit for your needs.
                </p>
              </details>
              <details className="p-4 md:p-6 group">
                <summary className="flex justify-between items-center cursor-pointer font-bold text-sm md:text-base text-slate-900 list-none gap-2">
                  <span className="flex-1">How do I choose the best parking at {airport.iata}?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">↓</span>
                </summary>
                <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 leading-relaxed">
                  Consider these factors when choosing parking at {airport.iata}: {parkings.some(p => p.shuttleMins) ? "Shuttle frequency and travel time to terminal, " : ""}price per day, customer ratings (average {parkings.filter(p => p.rating).length > 0 ? (parkings.filter(p => p.rating).reduce((sum, p) => sum + (p.rating || 0), 0) / parkings.filter(p => p.rating).length).toFixed(1) : '4.5'} stars), {parkings.some(p => p.hasValet) ? "valet vs self-park options, " : ""}{parkings.some(p => p.isIndoor) ? "indoor vs outdoor parking, " : ""}and proximity to the airport.
                  Click on any listing to see detailed information and reviews.
                </p>
              </details>
            </div>
          </section>
        )}

        {/* Related Airports */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-lg md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
            Other Popular Airport Parking Options
          </h2>
          <div className="flex flex-wrap gap-3">
            {["JFK", "LAX", "ORD", "ATL", "MIA", "DEN", "SEA", "SFO"].filter(code => code !== airport.iata).slice(0, 6).map(code => (
              <Link
                key={code}
                href={`/airports/${code.toLowerCase()}/parking`}
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <div className="font-black text-lg tracking-tight text-white">
                Airport<span className="text-blue-400">Matrix</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <Link href="/airports" className="hover:text-white transition-colors">Airports</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-slate-500">
              <p>Data last updated: {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
              <p>© {new Date().getFullYear()} AirportMatrix. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
