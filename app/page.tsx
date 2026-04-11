import type { Metadata } from "next";
import Link from "next/link";
import SearchBox from "./components/SearchBox";
import Header from "./components/Header";
import { ShieldCheck, Bus, Ban, Star, X, Globe } from "lucide-react";
import { prisma } from "@/lib/db";

export const revalidate = 3600;

interface HomeStats {
  airportCount: number;
  lotCount: number;
  minRate: number;
  maxOfficialRate: number;
  avgOffSiteRate: number;
  shuttlePct: number;
  totalReviews: number;
  avgRating: number;
}

interface PopularAirport {
  iata: string;
  name: string;
  city: string;
  minRate: number;
}

async function getHomeStats(): Promise<HomeStats> {
  const [airportCount, lots, officialLots, offSiteLots] = await Promise.all([
    prisma.airport.count({ where: { isActive: true } }),
    prisma.parkingLot.findMany({
      where: { isActive: true },
      select: { dailyRate: true, is24Hours: true, rating: true, reviewCount: true, type: true },
    }),
    prisma.parkingLot.findMany({
      where: { isActive: true, type: "OFFICIAL" },
      select: { dailyRate: true },
    }),
    prisma.parkingLot.findMany({
      where: { isActive: true, type: "OFF_SITE" },
      select: { dailyRate: true, is24Hours: true },
    }),
  ]);

  const allRates = lots.map(l => Number(l.dailyRate));
  const totalReviews = lots.reduce((sum, l) => sum + (l.reviewCount || 0), 0);
  const ratedLots = lots.filter(l => l.rating);
  const offSite24h = offSiteLots.filter(l => l.is24Hours);

  return {
    airportCount,
    lotCount: lots.length,
    minRate: allRates.length > 0 ? Math.min(...allRates) : 5,
    maxOfficialRate: officialLots.length > 0 ? Math.max(...officialLots.map(l => Number(l.dailyRate))) : 50,
    avgOffSiteRate: offSiteLots.length > 0 ? Math.round(offSiteLots.reduce((s, l) => s + Number(l.dailyRate), 0) / offSiteLots.length) : 12,
    shuttlePct: offSiteLots.length > 0 ? Math.round((offSite24h.length / offSiteLots.length) * 100) : 95,
    totalReviews,
    avgRating: ratedLots.length > 0 ? Math.round((ratedLots.reduce((s, l) => s + (l.rating || 0), 0) / ratedLots.length) * 10) / 10 : 4.6,
  };
}

async function getPopularAirports(limit = 8): Promise<PopularAirport[]> {
  const airports = await prisma.airport.findMany({
    where: { isActive: true, isPopular: true },
    orderBy: { searchVolume: "desc" },
    take: limit,
    include: {
      parkings: {
        where: { isActive: true },
        orderBy: { dailyRate: "asc" },
        take: 1,
        select: { dailyRate: true },
      },
    },
  });

  return airports.map(a => ({
    iata: a.iata,
    name: a.name.replace("International Airport", "").replace("Airport", "").trim(),
    city: a.city,
    minRate: a.parkings[0] ? Number(a.parkings[0].dailyRate) : 0,
  }));
}

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getHomeStats();

  return {
    title: `Airport Parking Comparison | Save 70% at ${stats.airportCount}+ US Airports`,
    description: `Compare parking rates at ${stats.airportCount} US airports. ${stats.lotCount}+ verified lots from $${stats.minRate}/day. ${stats.shuttlePct}% with free 24/7 shuttles. Save up to 70% vs terminal garages.`,
    keywords: [
      "airport parking",
      "airport parking rates",
      "off-site airport parking",
      "airport parking coupons",
      "parking near airport",
      "cheap airport parking",
      "airport parking shuttle",
      "airport parking comparison",
    ],
    openGraph: {
      title: `AirportMatrix | Save Up to 70% at ${stats.airportCount}+ US Airports`,
      description: `Compare terminal rates with ${stats.lotCount}+ verified off-site lots. Book secure parking from $${stats.minRate}/day with free shuttles.`,
      type: "website",
    },
    alternates: {
      canonical: "https://airportmatrix.com",
    },
  };
}

export default async function HomePage() {
  const [stats, popularAirports] = await Promise.all([
    getHomeStats(),
    getPopularAirports(8),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `AirportMatrix | Save Up to 70% on Airport Parking`,
    description: `Compare official terminal rates with verified off-site parking lots. Book secure parking with free shuttles at ${stats.airportCount} major US airports.`,
    url: "https://airportmatrix.com",
    mainEntity: {
      "@type": "Service",
      name: "Airport Parking Comparison",
      provider: {
        "@type": "Organization",
        name: "AirportMatrix",
        url: "https://airportmatrix.com",
      },
      areaServed: "United States",
      serviceType: "Airport Parking Booking",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />

        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center mt-8 sm:mt-12 md:mt-24 mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs md:text-sm font-bold mb-6 md:mb-8 shadow-sm" role="banner">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" aria-hidden="true"></span>
            Save up to 70% on Airport Parking
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mb-4 md:mb-6 leading-tight px-2">
            Airport Parking Comparison: Save up to <span className="text-blue-600">70%</span> on US Airport Parking
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mb-8 md:mb-12 font-medium leading-relaxed px-2 md:px-4">
            Stop paying <strong className="text-slate-900">${stats.maxOfficialRate}/day</strong> at terminal garages.
            Compare official rates with <strong className="text-slate-900">{stats.lotCount}+</strong> verified off-site lots.
            Book secure parking from <strong className="text-slate-900">${stats.minRate}/day</strong> with free shuttles at <strong className="text-slate-900">{stats.airportCount}</strong> major US airports.
          </p>

          <SearchBox />

          <section aria-labelledby="trust-heading" className="mt-16 md:mt-20 max-w-4xl w-full px-3 md:px-4">
            <h2 id="trust-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-8 text-center">
              Why Travelers Trust AirportMatrix
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12">
              {[
                { Icon: ShieldCheck, bg: "bg-emerald-100", color: "text-emerald-600", label: `${stats.lotCount}+ Secure Lots` },
                { Icon: Bus, bg: "bg-blue-100", color: "text-blue-600", label: `${stats.shuttlePct}% Free Shuttles` },
                { Icon: Ban, bg: "bg-purple-100", color: "text-purple-600", label: "Free Cancellation" },
                { Icon: Star, bg: "bg-amber-100", color: "text-amber-600", label: `${stats.totalReviews.toLocaleString()}+ Reviews` },
              ].map(({ Icon, bg, color, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 md:gap-3">
                  <div className={`${bg} p-3 md:p-4 rounded-full ${color}`} aria-hidden="true">
                    <Icon className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <span className="font-bold text-slate-700">{label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 md:mt-20 max-w-4xl w-full px-3 md:px-4 text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-4 md:mb-6 text-center">
              How Airport Parking Comparison Works
            </h2>
            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200">
                <div className="text-2xl md:text-3xl font-black text-blue-600 mb-2 md:mb-3">1</div>
                <h3 className="font-bold text-slate-900 mb-2">Search Your Airport</h3>
                <p className="text-slate-600 text-sm">Enter your airport code (JFK, LAX, etc.) or city name to find available parking options.</p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200">
                <div className="text-2xl md:text-3xl font-black text-blue-600 mb-2 md:mb-3">2</div>
                <h3 className="font-bold text-slate-900 mb-2">Compare Rates</h3>
                <p className="text-slate-600 text-sm">See side-by-side pricing for official airport garages vs verified off-site lots.</p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200">
                <div className="text-2xl md:text-3xl font-black text-blue-600 mb-2 md:mb-3">3</div>
                <h3 className="font-bold text-slate-900 mb-2">Book &amp; Save</h3>
                <p className="text-slate-600 text-sm">Reserve your spot online with free cancellation. Save up to 70% vs drive-up rates.</p>
              </div>
            </div>
          </section>

          <section className="mt-16 md:mt-20 max-w-3xl w-full px-3 md:px-4 text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-8 text-center">
              Common Questions About Airport Parking
            </h2>
            <div className="space-y-3 md:space-y-4">
              <details className="bg-white rounded-xl border border-slate-200 overflow-hidden group">
                <summary className="px-4 md:px-6 py-3 md:py-4 font-semibold text-sm md:text-base text-slate-900 cursor-pointer hover:bg-slate-50 flex justify-between items-center gap-2">
                  <span className="flex-1">How much can I save with off-site airport parking?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
                </summary>
                <div className="px-4 md:px-6 pb-3 md:pb-4 text-slate-600 text-sm">
                  Off-site parking lots typically cost 50-70% less than official airport garages. For example, while official terminals charge up to ${stats.maxOfficialRate}/day, our verified off-site lots start at just ${stats.minRate}/day with free shuttle service included. That&apos;s an average savings of ${Math.round(stats.maxOfficialRate - stats.avgOffSiteRate)} per day!
                </div>
              </details>
              <details className="bg-white rounded-xl border border-slate-200 overflow-hidden group">
                <summary className="px-4 md:px-6 py-3 md:py-4 font-semibold text-sm md:text-base text-slate-900 cursor-pointer hover:bg-slate-50 flex justify-between items-center gap-2">
                  <span className="flex-1">Is off-site airport parking safe?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
                </summary>
                <div className="px-4 md:px-6 pb-3 md:pb-4 text-slate-600 text-sm">
                  Yes. All {stats.lotCount}+ parking lots listed on AirportMatrix are verified for security features including 24/7 surveillance, gated access, and on-site staff. We only partner with established operators with proven track records and {stats.totalReviews.toLocaleString()}+ verified reviews averaging {stats.avgRating}/5 stars.
                </div>
              </details>
              <details className="bg-white rounded-xl border border-slate-200 overflow-hidden group">
                <summary className="px-4 md:px-6 py-3 md:py-4 font-semibold text-sm md:text-base text-slate-900 cursor-pointer hover:bg-slate-50 flex justify-between items-center gap-2">
                  <span className="flex-1">How does the free shuttle service work?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
                </summary>
                <div className="px-4 md:px-6 pb-3 md:pb-4 text-slate-600 text-sm">
                  All off-site parking lots include complimentary shuttle service to and from the airport terminal. Shuttles run every 15-30 minutes, 24/7 ({stats.shuttlePct}% of our partner lots offer round-the-clock service). Simply park your car, check in at the front desk, and board the next available shuttle.
                </div>
              </details>
              <details className="bg-white rounded-xl border border-slate-200 overflow-hidden group">
                <summary className="px-4 md:px-6 py-3 md:py-4 font-semibold text-sm md:text-base text-slate-900 cursor-pointer hover:bg-slate-50 flex justify-between items-center gap-2">
                  <span className="flex-1">Can I cancel my parking reservation?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
                </summary>
                <div className="px-4 md:px-6 pb-3 md:pb-4 text-slate-600 text-sm">
                  Yes, most reservations can be cancelled free of charge up to 24 hours before your scheduled arrival. Check the specific cancellation policy for your chosen parking lot during booking.
                </div>
              </details>
            </div>
          </section>

          <section className="mt-16 md:mt-20 max-w-4xl w-full px-3 md:px-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-4 md:mb-6 text-center">
              Popular Airport Parking Destinations
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {popularAirports.map((airport) => (
                <Link
                  key={airport.iata}
                  href={`/airport/${airport.iata.toLowerCase()}/parking`}
                  className="bg-white rounded-xl p-3 md:p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-center"
                >
                  <div className="text-lg md:text-xl font-black text-blue-600">{airport.iata}</div>
                  <div className="text-xs md:text-sm text-slate-600">{airport.city}</div>
                  <div className="text-xs text-slate-400 mt-1">From ${airport.minRate}/day</div>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <footer className="bg-slate-900 text-slate-300 mt-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 md:py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
              <div className="col-span-2 md:col-span-1">
                <div className="font-black text-xl text-white mb-4 tracking-tight">
                  Airport<span className="text-blue-400">Matrix</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  Independent airport parking comparison engine. We help US travelers find secure off-site parking at a fraction of terminal garage prices.
                </p>
                <div className="flex gap-3">
                    <a
                    href="https://twitter.com/airportmatrix"
                    aria-label="AirportMatrix on Twitter"
                    className="w-9 h-9 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors text-slate-400 hover:text-white"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </a>
                    <a
                    href="https://github.com/airportmatrix"
                    aria-label="AirportMatrix on GitHub"
                    className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors text-slate-400 hover:text-white"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Globe className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <nav aria-label="Parking navigation">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Browse</h3>
                <ul className="space-y-3 text-sm">
                  {[
                    ["All Airports", "/airports", "all-airports"],
                    ["How It Works", "/about", "how-it-works"],
                  ].map(([label, href, key]) => (
                    <li key={key ?? href}>
                      <Link href={href} className="hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Partnership navigation">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Partners</h3>
                <ul className="space-y-3 text-sm">
                  {[
                    ["List Your Parking Lot", "/contact?subject=partnership", "list-lot"],
                    ["API & Data Access", "/contact?subject=general", "api-access"],
                    ["Advertise With Us", "/contact?subject=general", "advertise"],
                  ].map(([label, href, key]) => (
                    <li key={key ?? href}>
                      <Link href={href} className="hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Legal navigation">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Legal</h3>
                <ul className="space-y-3 text-sm">
                  {[
                    ["Privacy Policy", "/privacy", "privacy"],
                    ["Terms of Service", "/terms", "terms"],
                    ["Contact Us", "/contact", "/contact"],
                    ["Affiliate Disclosure", "/about#transparency-heading", "affiliate"],
                  ].map(([label, href, key]) => (
                    <li key={key ?? href}>
                      <Link href={href} className="hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
              <p>
                &copy; <time dateTime="2026">2026</time> AirportMatrix. All rights reserved. Not affiliated with any airport authority.
              </p>
              <p>
                Prices and availability subject to change. Always verify rates on the booking partner&apos;s site.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
