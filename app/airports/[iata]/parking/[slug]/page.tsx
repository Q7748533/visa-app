import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Star, Clock, Car, Bus, Shield, Navigation, AlertTriangle, HelpCircle, Check, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";

// Static generation with ISR - revalidate every hour
export const revalidate = 3600;

interface Props {
  params: Promise<{ iata: string; slug: string }>;
}

async function getParkingLot(iata: string, slug: string) {
  const parking = await prisma.parkingLot.findFirst({
    where: { 
      slug, 
      airportIataCode: iata.toLowerCase(),
      isActive: true 
    },
    include: {
      airport: true,
    },
  });
  return parking;
}

async function getRelatedParkingLots(airportId: string, currentSlug: string, limit: number = 3) {
  const lots = await prisma.parkingLot.findMany({
    where: {
      airportIataCode: airportId,
      isActive: true,
      slug: { not: currentSlug },
    },
    orderBy: [{ featured: "desc" }, { dailyRate: "asc" }],
    take: limit,
  });
  return lots;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { iata, slug } = await params;
  const parking = await getParkingLot(iata, slug);

  if (!parking) {
    return { title: "Parking Lot Not Found | AirportMatrix" };
  }

  const title = `${parking.name} Parking ${parking.airport.iata} — $${Number(parking.dailyRate).toFixed(2)}/day | AirportMatrix`;
  const description = `Book ${parking.name} parking at ${parking.airport.name} (${parking.airport.iata}). $${Number(parking.dailyRate).toFixed(2)}/day with free shuttle.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://airportmatrix.com/airports/${iata.toLowerCase()}/parking/${slug}`,
    },
  };
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

export default async function ParkingDetailPage({ params }: Props) {
  const { iata, slug } = await params;
  const parking = await getParkingLot(iata, slug);

  if (!parking) notFound();

  const relatedLots = await getRelatedParkingLots(parking.airportIataCode, slug, 3);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={`/airports/${iata.toLowerCase()}/parking`} className="flex items-center text-slate-500 hover:text-slate-900 font-medium text-sm">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to {parking.airport.iata} Lots
          </Link>
          <div className="font-black text-xl text-slate-900">Airport<span className="text-blue-600">Matrix</span></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">Home</Link> /{' '}
          <Link href="/airports" className="hover:text-slate-900">Airports</Link> /{' '}
          <Link href={`/airports/${iata.toLowerCase()}/parking`} className="hover:text-slate-900">{parking.airport.iata} Parking</Link> /{' '}
          <span className="text-slate-900 font-bold">{parking.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs uppercase rounded-lg">{parking.airport.iata} Airport</span>
                {parking.featured && <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs uppercase rounded-lg">Featured</span>}
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2">{parking.name}</h1>
              <p className="text-slate-500 mb-4">{parking.airport.name}</p>
              
              <div className="flex items-center gap-4 mb-4">
                {parking.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-900">{parking.rating.toFixed(1)}</span>
                    <span className="text-slate-500 text-sm">({parking.reviewCount || 0} reviews)</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {parking.is24Hours && <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-1"><Clock className="w-4 h-4" /> 24/7</span>}
                {parking.isIndoor && <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg flex items-center gap-1"><Car className="w-4 h-4" /> Indoor</span>}
                {parking.hasValet && <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-lg flex items-center gap-1"><Shield className="w-4 h-4" /> Valet</span>}
              </div>
            </div>

            {/* Description */}
            {parking.description && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Car className="w-5 h-5 text-blue-600" /> About This Facility</h2>
                <p className="text-slate-600 leading-relaxed">{parking.description}</p>
              </div>
            )}

            {/* Shuttle Info */}
            {(parking.shuttleFrequency || parking.shuttleHours) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Bus className="w-5 h-5 text-blue-600" /> Shuttle Service</h2>
                <div className="space-y-2 text-slate-600">
                  {parking.shuttleFrequency && <p><strong>Frequency:</strong> {parking.shuttleFrequency}</p>}
                  {parking.shuttleHours && <p><strong>Hours:</strong> {parking.shuttleHours}</p>}
                  {parking.shuttleDesc && <p>{parking.shuttleDesc}</p>}
                </div>
              </div>
            )}

            {/* Related Lots */}
            {relatedLots.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">More Options at {parking.airport.iata}</h2>
                <div className="space-y-3">
                  {relatedLots.map(lot => (
                    <Link key={lot.id} href={`/airports/${iata.toLowerCase()}/parking/${lot.slug}`} className="block p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900">{lot.name}</h3>
                        <span className="text-emerald-600 font-black">${Number(lot.dailyRate).toFixed(2)}</span>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-slate-500">
                        {lot.distanceMiles && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {lot.distanceMiles} mi</span>}
                        {lot.shuttleMins && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {lot.shuttleMins} min</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-500 mb-1">Starting from</p>
                <div className="text-4xl font-black text-slate-900">${Number(parking.dailyRate).toFixed(2)}</div>
                <p className="text-sm text-slate-500">per day</p>
              </div>

              {parking.affiliateUrl ? (
                <a href={parking.affiliateUrl} target="_blank" rel="noopener noreferrer" className="block w-full bg-slate-900 hover:bg-black text-white text-center font-bold py-4 rounded-xl transition-colors">
                  Reserve Now <ExternalLink className="w-4 h-4 inline ml-2" />
                </a>
              ) : (
                <button disabled className="block w-full bg-slate-300 text-slate-500 text-center font-bold py-4 rounded-xl cursor-not-allowed">
                  Coming Soon
                </button>
              )}

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600"><Check className="w-4 h-4 text-green-500" /> Free cancellation</div>
                <div className="flex items-center gap-2 text-slate-600"><Check className="w-4 h-4 text-green-500" /> Instant confirmation</div>
                <div className="flex items-center gap-2 text-slate-600"><Check className="w-4 h-4 text-green-500" /> Secure parking</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50 flex items-center justify-between lg:hidden">
        <div>
          <p className="text-xs text-slate-500">Base Rate</p>
          <div className="text-2xl font-black">${Number(parking.dailyRate).toFixed(2)}<span className="text-sm font-normal text-slate-500">/day</span></div>
        </div>
        {parking.affiliateUrl ? (
          <a href={parking.affiliateUrl} target="_blank" rel="noopener noreferrer" className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl">Reserve</a>
        ) : (
          <button disabled className="bg-slate-300 text-slate-500 font-bold py-3 px-6 rounded-xl">Soon</button>
        )}
      </div>
    </div>
  );
}
