import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { ParkingLot, RelatedParkingLot } from "./types";
import { parseTags, parseArrivalDirections, parseThingsToKnow, generateGeneralFAQs } from "./utils";
import {
  ParkingHero,
  ParkingDescription,
  ParkingRatings,
  ParkingShuttle,
  ParkingDirections,
  ParkingThingsToKnow,
  ParkingFAQ,
  ParkingAmenities,
  ParkingRelated,
  ParkingBookingCard,
  ParkingJsonLd,
} from "./components";

// Static generation with ISR - revalidate every hour
export const revalidate = 3600;

interface Props {
  params: Promise<{ iata: string; slug: string }>;
}

async function getParkingLot(iata: string, slug: string): Promise<ParkingLot | null> {
  const parking = await prisma.parkingLot.findFirst({
    where: {
      slug,
      airportIataCode: iata.toLowerCase(),
      isActive: true,
    },
    include: {
      airport: true,
    },
  });
  return parking as unknown as ParkingLot | null;
}

async function getRelatedParkingLots(
  airportId: string,
  currentSlug: string,
  limit: number = 3
): Promise<RelatedParkingLot[]> {
  const lots = await prisma.parkingLot.findMany({
    where: {
      airportIataCode: airportId,
      isActive: true,
      slug: { not: currentSlug },
    },
    orderBy: [{ featured: "desc" }, { dailyRate: "asc" }],
    take: limit,
  });
  return lots as unknown as RelatedParkingLot[];
}

export async function generateStaticParams() {
  const parkings = await prisma.parkingLot.findMany({
    where: { isActive: true },
    select: { airportIataCode: true, slug: true }
  });

  return parkings.map(p => ({
    iata: p.airportIataCode.toLowerCase(),
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { iata, slug } = await params;
  const parking = await getParkingLot(iata, slug);

  if (!parking) {
    return {
      title: "Parking Lot Not Found | AirportMatrix",
    };
  }

  const rawTitle = `${parking.name} Parking ${parking.airport.iata} — $${Number(parking.dailyRate).toFixed(2)}/day | AirportMatrix`;
  const title = rawTitle.length > 60 ? `${parking.name} Parking ${parking.airport.iata} | AirportMatrix` : rawTitle;
  const description = `Book ${parking.name} parking at ${parking.airport.name} (${parking.airport.iata}). $${Number(parking.dailyRate).toFixed(2)}/day. ${parking.distanceMiles ? `${parking.distanceMiles} mi from terminal` : `${parking.shuttleMins || 5}-min shuttle`} with free ${parking.is24Hours ? '24/7 ' : ''}shuttle. ${parking.rating ? `${parking.rating}/5★ (${parking.reviewCount || 0}+ reviews). ` : ''}Save up to 60% vs on-airport rates.`;

  return {
    title,
    description,
    keywords: [
      `${parking.airport.iata.toLowerCase()} parking`,
      `${parking.name.toLowerCase()} parking`,
      `${parking.airport.city.toLowerCase()} airport parking`,
      `${parking.airport.city.toLowerCase()} ${parking.airport.iata.toLowerCase()} parking`,
      "off-site airport parking",
      "cheap airport parking",
      "airport parking shuttle",
      "long term airport parking",
      "airport parking reservations",
      "airport parking deals",
      parking.type === "OFFICIAL" ? "official airport parking" : "off airport parking",
      parking.hasValet ? "airport valet parking" : "",
      parking.isIndoor ? "covered airport parking" : "",
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: "website",
      images: [{
        url: `https://airportmatrix.com/og/parking/${slug}.png`,
        width: 1200,
        height: 630,
        alt: `${parking.name} Parking at ${parking.airport.iata} Airport`,
      }],
    },
    alternates: {
      canonical: `https://airportmatrix.com/airports/${iata.toLowerCase()}/parking/${slug}`,
    },
  };
}

export default async function ParkingDetailPage({ params }: Props) {
  const { iata, slug } = await params;
  const parking = await getParkingLot(iata, slug);

  if (!parking) {
    notFound();
  }

  // 获取同机场的其他停车场
  const relatedLots = await getRelatedParkingLots(parking.airportIataCode, slug, 3);

  // 解析数据
  const tags = parseTags(parking.tags);
  const { directions: arrivalDirections, text: arrivalDirectionsText } = parseArrivalDirections(parking.arrivalDirections);
  const thingsToKnow = parseThingsToKnow(parking.thingsToKnow);

  // 生成 FAQ
  const generalFAQs = generateGeneralFAQs(
    parking.airport.iata,
    parking.dailyRate,
    parking.shuttleFrequency,
    parking.shuttleHours,
    parking.isIndoor,
    parking.cancellationPolicy,
    thingsToKnow
  );

  const iataLower = iata.toLowerCase();

  // BreadcrumbList JSON-LD
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
        name: `${parking.airport.iata} Parking`,
        item: `https://airportmatrix.com/airports/${iataLower}/parking`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: parking.name,
        item: `https://airportmatrix.com/airports/${iataLower}/parking/${slug}`,
      },
    ],
  };

  return (
    <>
      <ParkingJsonLd
        parking={parking}
        slug={slug}
        iata={iataLower}
        generalFAQs={generalFAQs}
        thingsToKnow={thingsToKnow}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-slate-50 font-sans pb-32 text-slate-800">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link
              href={`/airports/${iataLower}/parking`}
              className="flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to {parking.airport.iata} Lots
            </Link>
            <div className="font-black text-xl tracking-tight text-slate-900">
              Airport<span className="text-blue-600">Matrix</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 lg:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
            <ol className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-slate-500 font-medium flex-wrap">
              <li><Link href="/" className="hover:text-slate-900 transition-colors">Home</Link></li>
              <li className="shrink-0" aria-hidden="true">/</li>
              <li><Link href={`/airports/${iataLower}/parking`} className="hover:text-slate-900 transition-colors">{parking.airport.iata} Parking</Link></li>
              <li className="shrink-0" aria-hidden="true">/</li>
              <li className="text-slate-900 font-bold truncate max-w-[180px] md:max-w-none" aria-current="page">{parking.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8 items-start">
            {/* Left Column - Info */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <ParkingHero parking={parking} />
              <ParkingDescription description={parking.description} />
              <ParkingRatings
                locationRating={parking.locationRating}
                staffRating={parking.staffRating}
                facilityRating={parking.facilityRating}
                safetyRating={parking.safetyRating}
                recommendationPct={parking.recommendationPct}
              />
              <ParkingShuttle
                shuttleFrequency={parking.shuttleFrequency}
                shuttleHours={parking.shuttleHours}
                shuttleDesc={parking.shuttleDesc}
              />
              <ParkingDirections
                directions={arrivalDirections}
                textDirections={arrivalDirectionsText}
                parkingAccess={parking.parkingAccess}
              />
              <ParkingThingsToKnow items={thingsToKnow} />
              <ParkingFAQ
                airportIata={parking.airport.iata}
                dailyRate={parking.dailyRate}
                shuttleFrequency={parking.shuttleFrequency}
                shuttleHours={parking.shuttleHours}
                isIndoor={parking.isIndoor}
                cancellationPolicy={parking.cancellationPolicy}
                thingsToKnow={thingsToKnow}
              />
              <ParkingAmenities
                is24Hours={parking.is24Hours}
                isIndoor={parking.isIndoor}
                hasValet={parking.hasValet}
              />
              <ParkingRelated lots={relatedLots} airport={parking.airport} iata={iataLower} />

              {/* Airport Information */}
              <div className="bg-blue-50 rounded-2xl md:rounded-3xl border border-blue-100 p-5 md:p-6 lg:p-8 shadow-sm">
                <h2 className="text-base md:text-lg font-black text-blue-900 mb-3 md:mb-4">About {parking.airport.name} ({parking.airport.iata}) Airport</h2>
                <p className="text-sm text-blue-800/80 leading-relaxed mb-4">
                  {parking.airport.name} ({parking.airport.iata}) serves the {parking.airport.city} area.
                  This off-site parking facility offers significant savings compared to on-airport parking rates.
                </p>
                <div className="space-y-2 text-sm">
                  <Link
                    href={`/airports/${iataLower}/parking`}
                    className="block text-blue-700 font-semibold hover:text-blue-800"
                  >
                    → All {parking.airport.iata} parking options
                  </Link>
                  <Link
                    href="/airports"
                    className="block text-blue-700 font-semibold hover:text-blue-800"
                  >
                    → Browse all airports
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="hidden lg:block lg:col-span-1">
              <ParkingBookingCard
                dailyRate={parking.dailyRate}
                affiliateUrl={parking.affiliateUrl}
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-6 md:py-8 mt-10 md:mt-16">
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

        {/* Mobile Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 px-6 z-50 flex items-center justify-between lg:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.08)] pb-8">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Base Rate</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tighter">${Number(parking.dailyRate).toFixed(2)}</span>
              <span className="text-xs font-medium text-slate-500">/day</span>
            </div>
          </div>
          {parking.affiliateUrl ? (
            <a
              href={parking.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 hover:bg-black text-white font-bold text-base py-3.5 px-8 rounded-xl transition-all active:scale-[0.98]"
            >
              Reserve
            </a>
          ) : (
            <button
              disabled
              className="bg-slate-300 text-slate-500 font-bold text-base py-3.5 px-8 rounded-xl cursor-not-allowed"
            >
              Soon
            </button>
          )}
        </div>
      </div>
    </>
  );
}
