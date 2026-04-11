import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { MapPin, Car, Star, ArrowRight, Search } from "lucide-react";

// Static generation with ISR
export const revalidate = 3600;

// Pre-generate popular search queries
export async function generateStaticParams() {
  const airports = await prisma.airport.findMany({
    where: { isActive: true },
    select: { iataCode: true },
  });

  const queries: string[] = [];

  // Airport-based queries
  airports.forEach((airport) => {
    const iata = (airport.iataCode || '').toLowerCase();
    queries.push(`${iata}-parking`);
    queries.push(`${iata}-airport-parking`);
    queries.push(`cheap-${iata}-parking`);
  });

  // Feature-based queries
  queries.push("valet-parking");
  queries.push("indoor-parking");
  queries.push("24-hour-parking");
  queries.push("cheap-airport-parking");
  queries.push("off-site-parking");

  return queries.map((query) => ({ query }));
}

interface SearchResult {
  airports: any[];
  parkings: any[];
  relatedSearches: string[];
  isGenericSearch: boolean;
}

async function getSearchResults(query: string): Promise<SearchResult> {
  const normalizedQuery = query.toLowerCase().replace(/-/g, " ");
  const iataMatch = normalizedQuery.match(/\b([a-z]{3})\b/);
  const searchIata = iataMatch ? iataMatch[1] : null;

  // For SQLite, fetch all data and filter in JavaScript
  // Search airports
  const allAirports = await prisma.airport.findMany({
    where: { isActive: true },
    include: {
      parkings: {
        where: { isActive: true },
        orderBy: { dailyRate: "asc" },
      },
    },
  });

  const airports = allAirports.filter(a => {
    const iataMatch = searchIata && (a.iata.toLowerCase() === searchIata || a.iataCode?.toLowerCase() === searchIata);
    const nameMatch = a.name.toLowerCase().includes(normalizedQuery);
    const cityMatch = a.city.toLowerCase().includes(normalizedQuery);
    return iataMatch || nameMatch || cityMatch;
  }).slice(0, 5);

  // Search parking lots
  const matchingAirportIatas = airports.map(a => a.iata);

  const allParkings = await prisma.parkingLot.findMany({
    where: { isActive: true },
    include: {
      airport: {
        select: {
          iata: true,
          iataCode: true,
          name: true,
          city: true,
        },
      },
    },
    orderBy: { dailyRate: "asc" },
  });

  const parkings = allParkings.filter(p => {
    const airportMatch = matchingAirportIatas.includes(p.airport.iata);
    const nameMatch = p.name.toLowerCase().includes(normalizedQuery);
    const descMatch = (p as any).description?.toLowerCase().includes(normalizedQuery);
    const valetMatch = normalizedQuery.includes("valet") && p.hasValet;
    const indoorMatch = normalizedQuery.includes("indoor") && p.isIndoor;
    const hoursMatch = (normalizedQuery.includes("24") || normalizedQuery.includes("hour")) && p.is24Hours;
    return airportMatch || nameMatch || descMatch || valetMatch || indoorMatch || hoursMatch;
  }).slice(0, 20);

  // Generate related searches
  const relatedSearches: string[] = [];
  if (searchIata) {
    relatedSearches.push(`${searchIata}-valet-parking`);
    relatedSearches.push(`cheap-${searchIata}-parking`);
    relatedSearches.push(`${searchIata}-indoor-parking`);
  }
  if (normalizedQuery.includes("cheap")) {
    relatedSearches.push("valet-parking");
    relatedSearches.push("24-hour-parking");
  }
  if (normalizedQuery.includes("valet")) {
    relatedSearches.push("indoor-parking");
    relatedSearches.push("cheap-airport-parking");
  }

  // If no direct results, return some generic content
  const isGenericSearch = airports.length === 0 && parkings.length === 0;
  
  if (isGenericSearch) {
    // Return popular airports as fallback
    const popularAirports = allAirports
      .filter(a => a.isPopular)
      .slice(0, 3);
    
    return {
      airports: popularAirports,
      parkings: [],
      relatedSearches: [...new Set(relatedSearches)].slice(0, 6),
      isGenericSearch: true,
    };
  }

  return {
    airports,
    parkings,
    relatedSearches: [...new Set(relatedSearches)].slice(0, 6),
    isGenericSearch: false,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ query: string }>;
}): Promise<Metadata> {
  const { query } = await params;
  const normalizedQuery = query.replace(/-/g, " ").toUpperCase();

  const iataMatch = normalizedQuery.match(/\b([A-Z]{3})\b/);
  const hasIata = iataMatch !== null;

  return {
    title: hasIata
      ? `${normalizedQuery} - Find Cheap Airport Parking & Save 70%`
      : `${normalizedQuery} - Airport Parking Search Results`,
    description: `Find the best ${normalizedQuery.toLowerCase()}. Compare rates, read reviews, and book affordable airport parking with free shuttle service.`,
    alternates: {
      canonical: `https://airportmatrix.com/search/${query}`,
    },
  };
}

export default async function SearchResultsPage({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const { query } = await params;
  const { airports, parkings, relatedSearches, isGenericSearch } = await getSearchResults(query);

  const normalizedQuery = query.replace(/-/g, " ").toUpperCase();
  const iataMatch = normalizedQuery.match(/\b([A-Z]{3})\b/);
  const hasIata = iataMatch !== null;
  const totalResults = airports.length + parkings.length;

  // Schema.org structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: `Search: ${normalizedQuery}`,
    description: `Found ${totalResults} results for ${normalizedQuery}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [
        ...airports.map((airport, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://airportmatrix.com/airport/${(airport.iataCode || airport.iata).toLowerCase()}/parking`,
          name: `${(airport.iataCode || airport.iata).toUpperCase()} Airport Parking`,
        })),
        ...parkings.map((parking, index) => ({
          "@type": "ListItem",
          position: airports.length + index + 1,
          url: `https://airportmatrix.com/parking/${parking.slug}`,
          name: parking.name,
        })),
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="font-black text-xl tracking-tight text-slate-900"
            >
              Airport<span className="text-blue-600">Matrix</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/airports"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                All Airports
              </Link>
            </div>
          </div>
        </header>

        {/* Search Header */}
        <div className="bg-white border-b border-slate-200 pt-12 pb-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
              <span>/</span>
              <span>Search</span>
              <span>/</span>
              <span className="text-slate-900">{normalizedQuery}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              {hasIata 
                ? `${iataMatch?.[0]} Airport Parking - Compare & Book Cheap Rates`
                : `${normalizedQuery} - Airport Parking Directory`
              }
            </h1>
            <p className="text-lg text-slate-600 mb-4">
              {hasIata
                ? `Find the best parking options at ${iataMatch?.[0]} airport. Compare ${parkings.length}+ lots, read reviews, and save up to 70% on long-term parking.`
                : `Search results for ${normalizedQuery.toLowerCase()}. Discover affordable airport parking with free shuttle service.`
              }
            </p>
            {isGenericSearch && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p className="text-amber-800">
                  No exact matches for &quot;{normalizedQuery}&quot;. Browse popular airports below.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Airports Section */}
              {airports.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Airports ({airports.length})
                  </h2>
                  <div className="space-y-4">
                    {airports.map((airport) => (
                      <Link
                        key={airport.iata}
                        href={`/airport/${(airport.iataCode || airport.iata).toLowerCase()}/parking`}
                        className="block bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl font-black text-blue-600">
                                {(airport.iataCode || airport.iata).toUpperCase()}
                              </span>
                              {airport.isPopular && (
                                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                  Popular
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">
                              {airport.name}
                            </h3>
                            <p className="text-slate-500">
                              {airport.city}, {airport.country}
                            </p>
                            <p className="text-sm text-slate-400 mt-2">
                              {airport.parkings.length} parking option
                              {airport.parkings.length > 1 ? "s" : ""} available
                            </p>
                          </div>
                          <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-blue-600" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Parking Lots Section */}
              {parkings.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-emerald-600" />
                    Parking Lots ({parkings.length})
                  </h2>
                  <div className="space-y-4">
                    {parkings.map((parking) => (
                      <Link
                        key={parking.id}
                        href={`/parking/${parking.slug}`}
                        className="block bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-emerald-300 transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                                {(parking.airport.iataCode || parking.airport.iata).toUpperCase()}
                              </span>
                              <span className="text-sm text-slate-500">
                                {parking.airport.city}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">
                              {parking.name}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {parking.isIndoor && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                  Indoor
                                </span>
                              )}
                              {parking.hasValet && (
                                <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                                  Valet
                                </span>
                              )}
                              {parking.is24Hours && (
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded">
                                  24/7
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-2xl font-black text-slate-900">
                                ${parseFloat(parking.dailyRate).toFixed(2)}
                              </div>
                              <div className="text-sm text-slate-500">per day</div>
                            </div>
                            {parking.rating && (
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star className="w-4 h-4 fill-amber-500" />
                                <span className="font-bold">{parking.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Related Searches */}
              {relatedSearches.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">
                    Related Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedSearches.map((search) => (
                      <Link
                        key={search}
                        href={`/search/${search}`}
                        className="px-3 py-2 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      >
                        {search.replace(/-/g, " ")}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Popular Airports</h3>
                <div className="space-y-2">
                  {["JFK", "LAX", "ORD", "DFW", "ATL"].map((code) => (
                    <Link
                      key={code}
                      href={`/airport/${code.toLowerCase()}/parking`}
                      className="flex items-center justify-between py-2 text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      <span>{code} Airport</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* FAQ Section for SEO */}
              {hasIata && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Common Questions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm mb-1">
                        How much does {iataMatch?.[0]} parking cost?
                      </h4>
                      <p className="text-sm text-slate-600">
                        {iataMatch?.[0]} parking rates start from ${parkings[0]?.dailyRate ? parseFloat(parkings[0].dailyRate).toFixed(2) : 'XX'}/day for off-site lots. Official airport parking is typically 2-3x more expensive.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm mb-1">
                        Is there free shuttle service?
                      </h4>
                      <p className="text-sm text-slate-600">
                        Yes, all off-site parking lots near {iataMatch?.[0]} include complimentary shuttle service to and from the terminal.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm mb-1">
                        Can I book parking in advance?
                      </h4>
                      <p className="text-sm text-slate-600">
                        Absolutely. Booking ahead guarantees your spot and often provides better rates than drive-up prices.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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
