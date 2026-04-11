import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import {
  MapPin,
  Clock,
  Star,
  ArrowLeft,
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
            <nav className="text-sm text-slate-400 mb-4">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/airports" className="hover:text-white">Airports</Link>
              <span className="mx-2">/</span>
              <span className="text-white">{airport.iata}</span>
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
            <div className="space-y-6">
              {/* Featured Lots */}
              {featuredLots.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Star className="w-5 h-5 text-amber-500 mr-2" />
                    Featured Options
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredLots.map(parking => (
                      <ParkingCard key={parking.id} parking={parking} iata={iata} />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Lots */}
              {regularLots.length > 0 && (
                <div>
                  {featuredLots.length > 0 && (
                    <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">All Parking Options</h2>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {regularLots.map(parking => (
                      <ParkingCard key={parking.id} parking={parking} iata={iata} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

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

function ParkingCard({ parking, iata }: { parking: ParkingLot; iata: string }) {
  return (
    <Link
      href={`/airports/${iata.toLowerCase()}/parking/${parking.slug}`}
      className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {parking.name}
          </h3>
          {parking.featured && (
            <span className="inline-flex items-center text-xs font-medium text-amber-600 mt-1">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">
            ${parking.dailyRate.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">per day</div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        {parking.distanceMiles && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-slate-400" />
            {parking.distanceMiles} miles from terminal
          </div>
        )}
        {parking.shuttleMins && (
          <div className="flex items-center">
            <Bus className="w-4 h-4 mr-2 text-slate-400" />
            {parking.shuttleMins}-min shuttle
          </div>
        )}
        {parking.is24Hours && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-slate-400" />
            24/7 service
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {parking.isIndoor && (
          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">Indoor</span>
        )}
        {parking.hasValet && (
          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">Valet</span>
        )}
        {parking.rating && (
          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md flex items-center">
            <Star className="w-3 h-3 mr-1" />
            {parking.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <span className="text-blue-600 font-medium text-sm group-hover:underline">
          View Details →
        </span>
      </div>
    </Link>
  );
}
