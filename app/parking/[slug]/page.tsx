import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  Car,
  Bus,
  ExternalLink,
  DollarSign,
  Navigation,
  AlertTriangle,
  Check,
} from "lucide-react";

// Static generation with ISR - revalidate every hour
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getParkingLot(slug: string) {
  const parking = await prisma.parkingLot.findUnique({
    where: { slug, isActive: true },
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
      slug: { not: currentSlug }
    },
    orderBy: [
      { featured: 'desc' },
      { dailyRate: 'asc' }
    ],
    take: limit,
  });
  return lots;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const parking = await getParkingLot(slug);

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
      canonical: `https://airportmatrix.com/parking/${slug}`,
    },
  };
}

export default async function ParkingDetailPage({ params }: Props) {
  const { slug } = await params;
  const parking = await getParkingLot(slug);

  if (!parking) {
    notFound();
  }

  // 获取同机场的其他停车场
  const relatedLots = await getRelatedParkingLots(parking.airportIataCode, slug, 3);

  // 安全解析 JSON 字段
  let tags: string[] = [];
  try {
    if (parking.tags && parking.tags.trim() !== '' && parking.tags !== '[]') {
      tags = JSON.parse(parking.tags);
    }
  } catch (e) {
    console.error('Failed to parse tags:', e);
  }
  
  // 处理 arrivalDirections - 支持 JSON 格式或普通文本
  let arrivalDirections: any = null;
  let arrivalDirectionsText: string | null = null;
  try {
    if (parking.arrivalDirections && parking.arrivalDirections.trim() !== '' && parking.arrivalDirections !== '{}') {
      const trimmed = parking.arrivalDirections.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        // JSON 格式
        arrivalDirections = JSON.parse(parking.arrivalDirections);
      } else {
        // 普通文本格式
        arrivalDirectionsText = parking.arrivalDirections;
      }
    }
  } catch (e) {
    console.error('Failed to parse arrivalDirections:', e);
    arrivalDirectionsText = parking.arrivalDirections;
  }
  
  let thingsToKnow: Array<{title?: string; content: string}> = [];
  try {
    if (parking.thingsToKnow && parking.thingsToKnow.trim() !== '' && parking.thingsToKnow !== '[]') {
      const trimmed = parking.thingsToKnow.trim();
      if (trimmed.startsWith('[')) {
        // 标准格式：数组
        thingsToKnow = JSON.parse(parking.thingsToKnow);
      } else if (trimmed.startsWith('{')) {
        // 错误格式：对象（可能是 arrivalDirections 的数据）
        // 尝试转换或忽略
        console.warn('thingsToKnow is an object, not an array. Data may be incorrect.');
        thingsToKnow = [];
      }
    }
  } catch (e) {
    console.error('Failed to parse thingsToKnow:', e);
    thingsToKnow = [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ParkingFacility",
    name: parking.name,
    description: `${parking.name} at ${parking.airport.name} (${parking.airport.iata}). $${parking.dailyRate}/day with free shuttle.`,
    url: `https://airportmatrix.com/parking/${slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: parking.airport.city,
      addressRegion: "USA",
      streetAddress: parking.address || `${parking.airport.city}, ${parking.airport.country}`,
    },
    priceRange: `$${parking.dailyRate}`,
    aggregateRating: parking.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: parking.rating,
          reviewCount: parking.reviewCount || 0,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Free Shuttle", value: true },
      { "@type": "LocationFeatureSpecification", name: "24/7 Service", value: parking.is24Hours },
      { "@type": "LocationFeatureSpecification", name: "Indoor Parking", value: parking.isIndoor },
      { "@type": "LocationFeatureSpecification", name: "Valet Service", value: parking.hasValet },
    ].filter((a) => a.value),
    openingHoursSpecification: parking.is24Hours
      ? {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "00:00",
          closes: "23:59",
        }
      : undefined,
    geo: parking.distanceMiles
      ? {
          "@type": "GeoCoordinates",
          latitude: 0,
          longitude: 0,
        }
      : undefined,
  };

  // FAQ Schema - 从 Things You Should Know 生成
  const faqJsonLd = thingsToKnow.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: thingsToKnow.map((item) => ({
      "@type": "Question",
      name: item.title || `What should I know about ${parking.name}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.content,
      },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <div className="min-h-screen bg-slate-50 font-sans pb-32 text-slate-800">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link
              href={`/airport/${parking.airport.iataCode}/parking`}
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
              <li className="shrink-0">/</li>
              <li><Link href={`/airport/${(parking.airport.iataCode || parking.airport.iata || '').toLowerCase()}/parking`} className="hover:text-slate-900 transition-colors">{parking.airport.iata} Parking</Link></li>
              <li className="shrink-0">/</li>
              <li className="text-slate-900 font-bold truncate max-w-[180px] md:max-w-none">{parking.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8 items-start">
            {/* Left Column - Info */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
              
              {/* Main Info Card */}
              <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-5 md:p-6 lg:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start gap-3 md:gap-4 mb-5 md:mb-6">
                  <div>
                    <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                      <span className="px-2 md:px-3 py-0.5 md:py-1 bg-slate-100 text-slate-700 font-black text-[9px] md:text-[10px] uppercase tracking-wider rounded-lg">
                        {parking.airport.iata} Airport
                      </span>
                      {parking.featured && (
                        <span className="px-2 md:px-3 py-0.5 md:py-1 bg-amber-100 text-amber-700 font-black text-[9px] md:text-[10px] uppercase tracking-wider rounded-lg">
                          Featured
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-1.5 md:mb-2">
                      {parking.name} Parking at {parking.airport.iata} Airport
                    </h1>
                    <p className="text-slate-500 font-medium flex items-start sm:items-center mt-3 text-sm sm:text-base">
                      <MapPin className="w-4 h-4 mr-1.5 mt-0.5 sm:mt-0 text-slate-400 shrink-0" />
                      {parking.address || `${parking.airport.city}, ${parking.airport.country}`}
                    </p>
                  </div>
                  {parking.rating && (
                    <div className="text-left md:text-right shrink-0">
                      <div className="flex items-center gap-1 text-amber-500 justify-start md:justify-end">
                        <Star className="w-6 h-6 fill-amber-500" />
                        <span className="font-black text-2xl text-slate-900">{parking.rating}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-400 mt-1">{parking.reviewCount || 0} reviews</p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6 md:mb-8">
                  {parking.hasValet ? (
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">Valet Parking</span>
                  ) : (
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">Self Park</span>
                  )}
                  {parking.isIndoor ? (
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">Indoor</span>
                  ) : (
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">Uncovered</span>
                  )}
                  <span className="px-2 md:px-3 py-0.5 md:py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">On-Site Staff</span>
                  <span className="px-2 md:px-3 py-0.5 md:py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">Free Shuttle</span>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 py-4 md:py-6 border-t border-slate-100">
                  <div className="text-center">
                    <div className="w-9 h-9 md:w-10 md:h-10 mx-auto bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-1.5 md:mb-2">
                      <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Base Rate</p>
                    <p className="font-black text-slate-900 text-sm md:text-base">${parking.dailyRate.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-9 h-9 md:w-10 md:h-10 mx-auto bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-1.5 md:mb-2">
                      <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Distance</p>
                    <p className="font-black text-slate-900 text-sm md:text-base">{parking.distanceMiles ? `${parking.distanceMiles} mi` : "N/A"}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-9 h-9 md:w-10 md:h-10 mx-auto bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-1.5 md:mb-2">
                      <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Travel Time</p>
                    <p className="font-black text-slate-900 text-sm md:text-base">{parking.shuttleMins ? `${parking.shuttleMins} min` : "N/A"}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-9 h-9 md:w-10 md:h-10 mx-auto bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-1.5 md:mb-2">
                      <Car className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Lot Type</p>
                    <p className="font-black text-slate-900 text-sm md:text-base">{parking.type === "OFFICIAL" ? "Official" : "Off-Site"}</p>
                  </div>
                </div>
              </div>

              {/* Shuttle Schedule */}
              {(parking.shuttleFrequency || parking.shuttleHours) && (
                <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-5 md:p-6 lg:p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-[0.03]">
                    <Bus className="w-36 h-36 md:w-48 md:h-48" />
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3 relative z-10">
                    <span className="p-1.5 md:p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    </span>
                    Shuttle Schedule & Details
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3 md:gap-4 relative z-10">
                    {parking.shuttleFrequency && (
                      <div className="bg-slate-50 p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-100">
                        <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Frequency</p>
                        <p className="text-base md:text-lg font-black text-slate-800">{parking.shuttleFrequency}</p>
                      </div>
                    )}
                    {parking.shuttleHours && (
                      <div className="bg-slate-50 p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-100">
                        <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Operating Hours</p>
                        <p className="text-base md:text-lg font-black text-slate-800">{parking.shuttleHours}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Arrival Directions */}
              {(arrivalDirections || arrivalDirectionsText) && (
                <div className="bg-indigo-50 rounded-2xl md:rounded-3xl border border-indigo-100 p-5 md:p-6 lg:p-8 shadow-sm">
                  <h2 className="text-lg md:text-xl font-black text-indigo-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                    <span className="p-1.5 md:p-2 bg-indigo-200 text-indigo-700 rounded-lg">
                      <Navigation className="w-4 h-4 md:w-5 md:h-5" />
                    </span>
                    Arrival & Directions
                  </h2>
                  <div className="space-y-4 md:space-y-6 text-sm font-medium text-indigo-900/80 leading-relaxed">
                    {/* 普通文本格式 */}
                    {arrivalDirectionsText && (
                      <p>{arrivalDirectionsText}</p>
                    )}
                    
                    {/* JSON 数组格式：步骤列表 */}
                    {arrivalDirections && Array.isArray(arrivalDirections) && (
                      <ol className="space-y-4 list-decimal list-inside">
                        {arrivalDirections.map((step: { text?: string; description?: string }, index: number) => (
                          <li key={index} className="pl-2">
                            {step.text || step.description || ''}
                          </li>
                        ))}
                      </ol>
                    )}
                    
                    {/* JSON 对象格式：fromWest/fromNorth */}
                    {arrivalDirections && !Array.isArray(arrivalDirections) && (
                      <>
                        {arrivalDirections.fromWest && (
                          <div>
                            <strong className="text-indigo-900 block mb-1 text-base">🚗 From West and South:</strong>
                            <p>{arrivalDirections.fromWest.description}</p>
                            {arrivalDirections.fromWest.warning && (
                              <div className="mt-2 md:mt-3 bg-rose-50 border border-rose-100 p-2.5 md:p-3.5 rounded-xl flex items-start gap-2 md:gap-3">
                                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-rose-700 font-bold text-sm">{arrivalDirections.fromWest.warning}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {arrivalDirections.fromNorth && (
                          <>
                            <div className="h-px w-full bg-indigo-200/60" />
                            <div>
                              <strong className="text-indigo-900 block mb-1 text-base">🚙 From North to East:</strong>
                              <p>{arrivalDirections.fromNorth.description}</p>
                              {arrivalDirections.fromNorth.warning && (
                                <div className="mt-2 md:mt-3 bg-rose-50 border border-rose-100 p-2.5 md:p-3.5 rounded-xl flex items-start gap-2 md:gap-3">
                                  <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-rose-500 shrink-0 mt-0.5" />
                                  <p className="text-rose-700 font-bold text-sm">{arrivalDirections.fromNorth.warning}</p>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Things You Should Know */}
              {thingsToKnow.length > 0 && (
                <div className="bg-amber-50 rounded-2xl md:rounded-3xl border border-amber-100 p-5 md:p-6 lg:p-8 shadow-sm">
                  <h2 className="text-lg md:text-xl font-black text-amber-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                    <span className="p-1.5 md:p-2 bg-amber-200 text-amber-700 rounded-lg">
                      <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
                    </span>
                    Things You Should Know
                  </h2>
                  <ul className="space-y-3 md:space-y-4">
                    {thingsToKnow.map((item: { title?: string; content: string }, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                        <p className="text-sm font-medium text-amber-900/80 leading-relaxed">
                          {item.title && <strong className="text-amber-900">{item.title}:</strong>} {item.content}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Amenities */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-6">Amenities & Services</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className={`flex items-center p-4 rounded-xl ${parking.is24Hours ? "bg-emerald-50" : "bg-slate-50"}`}>
                    <Clock className={`w-5 h-5 mr-3 ${parking.is24Hours ? "text-emerald-600" : "text-slate-400"}`} />
                    <div>
                      <p className="font-bold text-slate-900">24/7 Operation</p>
                      <p className="text-sm text-slate-500">{parking.is24Hours ? "Always open" : "Limited hours"}</p>
                    </div>
                  </div>
                  <div className={`flex items-center p-4 rounded-xl ${parking.isIndoor ? "bg-emerald-50" : "bg-slate-50"}`}>
                    <Car className={`w-5 h-5 mr-3 ${parking.isIndoor ? "text-emerald-600" : "text-slate-400"}`} />
                    <div>
                      <p className="font-bold text-slate-900">Covered Parking</p>
                      <p className="text-sm text-slate-500">{parking.isIndoor ? "Indoor/Canopy available" : "Open air"}</p>
                    </div>
                  </div>
                  <div className={`flex items-center p-4 rounded-xl ${parking.hasValet ? "bg-emerald-50" : "bg-slate-50"}`}>
                    <Car className={`w-5 h-5 mr-3 ${parking.hasValet ? "text-emerald-600" : "text-slate-400"}`} />
                    <div>
                      <p className="font-bold text-slate-900">Valet Service</p>
                      <p className="text-sm text-slate-500">{parking.hasValet ? "Available" : "Self-park only"}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 rounded-xl bg-emerald-50">
                    <Bus className="w-5 h-5 mr-3 text-emerald-600" />
                    <div>
                      <p className="font-bold text-slate-900">Free Shuttle</p>
                      <p className="text-sm text-slate-500">To terminal & back</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Parking Lots */}
              {relatedLots.length > 0 && (
                <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-5 md:p-6 lg:p-8 shadow-sm">
                  <h2 className="text-lg md:text-xl font-black text-slate-900 mb-4 md:mb-6">More Options at {parking.airport.iata}</h2>
                  <div className="space-y-3 md:space-y-4">
                    {relatedLots.map((lot) => (
                      <Link 
                        key={lot.id} 
                        href={`/parking/${lot.slug}`}
                        className="block p-3 md:p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-900 text-sm">{lot.name}</h3>
                          <span className="text-emerald-600 font-black text-sm">${lot.dailyRate.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {lot.distanceMiles && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {lot.distanceMiles} mi
                            </span>
                          )}
                          {lot.shuttleMins && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lot.shuttleMins} min
                            </span>
                          )}
                          {lot.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              {lot.rating}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link 
                    href={`/airport/${parking.airport.iataCode}/parking`}
                    className="block mt-4 text-center text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    View All {parking.airport.iata} Parking Options →
                  </Link>
                </div>
              )}

              {/* Airport Information */}
              <div className="bg-blue-50 rounded-2xl md:rounded-3xl border border-blue-100 p-5 md:p-6 lg:p-8 shadow-sm">
                <h2 className="text-base md:text-lg font-black text-blue-900 mb-3 md:mb-4">About {parking.airport.iata} Airport</h2>
                <p className="text-sm text-blue-800/80 leading-relaxed mb-4">
                  {parking.airport.name} ({parking.airport.iata}) serves the {parking.airport.city} area. 
                  This off-site parking facility offers significant savings compared to on-airport parking rates.
                </p>
                <div className="space-y-2 text-sm">
                  <Link 
                    href={`/airport/${parking.airport.iataCode}/parking`}
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
              <div className="bg-white rounded-3xl border border-slate-200 p-8 sticky top-24 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="mb-8">
                  <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Base rate</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">${parking.dailyRate.toFixed(2)}</span>
                    <span className="text-sm font-medium text-slate-400">/day</span>
                  </div>
                </div>

                {parking.affiliateUrl ? (
                  <a
                    href={parking.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-slate-900 hover:bg-black text-white font-bold text-lg py-4 rounded-xl transition-all active:scale-[0.98] mb-6 shadow-md text-center"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Reserve Space
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="block w-full bg-slate-300 text-slate-500 font-bold text-lg py-4 rounded-xl cursor-not-allowed mb-6"
                  >
                    Booking Coming Soon
                  </button>
                )}

                <div className="space-y-4">
                  <div className="flex items-center text-sm font-medium text-slate-600">
                    <Check className="w-5 h-5 text-slate-300 mr-3 shrink-0" />
                    Free cancellation anytime
                  </div>
                  <div className="flex items-center text-sm font-medium text-slate-600">
                    <Check className="w-5 h-5 text-slate-300 mr-3 shrink-0" />
                    Guaranteed parking spot
                  </div>
                  <div className="flex items-center text-sm font-medium text-slate-600">
                    <Check className="w-5 h-5 text-slate-300 mr-3 shrink-0" />
                    Direct official booking
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Best Rate Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-6 md:py-8 mt-10 md:mt-16">
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

        {/* Mobile Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 px-6 z-50 flex items-center justify-between lg:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.08)] pb-8">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Base Rate</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tighter">${parking.dailyRate.toFixed(2)}</span>
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
