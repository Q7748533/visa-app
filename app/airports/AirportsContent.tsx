"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, ArrowRight, Car } from "lucide-react";

const POPULAR_LABELS: Record<string, string> = {
  ATL: "World's Busiest Airport",
  DFW: "South Central Hub",
  DEN: "Mountain Region Gateway",
  ORD: "Midwest Aviation Hub",
  LAX: "West Coast Gateway",
  JFK: "New York Gateway",
  MCO: "Orlando Theme Park Hub",
};

interface AirportData {
  iata: string;
  name: string;
  city: string;
  isPopular: boolean;
  minRate?: number;
}

export default function AirportsContent({ 
  airports, 
  cheapestAirports, 
  avgMinRate 
}: { 
  airports: AirportData[];
  cheapestAirports: AirportData[];
  avgMinRate: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const popularAirports = airports.filter(a => a.isPopular);
  const filteredAirports = airports.filter(airport => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      airport.iata.toLowerCase().includes(query) ||
      airport.name.toLowerCase().includes(query) ||
      airport.city.toLowerCase().includes(query)
    );
  });

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 py-8 md:py-16">

      {/* 头部标题区 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2 md:mb-4">
            US Airport Parking Directory
          </h1>
          <p className="text-sm sm:text-lg text-slate-600">
            Browse our complete directory of US airports. Compare official terminal rates against affordable off-site parking lots with free 24/7 shuttles.
          </p>
        </div>

        {/* 页面内快速检索 */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by city or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 md:pl-11 pr-4 py-3 md:py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm text-sm md:text-base"
            aria-label="Search airports by code, name, or city"
          />
        </div>
      </div>

      {/* 热门枢纽 */}
      {popularAirports.length > 0 && (
        <section aria-labelledby="popular-heading" className="mb-10 md:mb-16">
          <h2 id="popular-heading" className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6 flex items-center gap-2">
            <span className="bg-amber-100 text-amber-600 p-1.5 rounded-lg" aria-hidden="true">
              <Car className="w-3 h-3 md:w-4 md:h-4" />
            </span>
            Popular Airport Parking Hubs
            <span className="text-xs md:text-sm font-normal text-slate-500 ml-2">({popularAirports.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {popularAirports.map(airport => (
              <Link
                key={`pop-${airport.iata}`}
                href={`/airports/${airport.iata.toLowerCase()}/parking`}
                className="group bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl md:rounded-2xl p-4 md:p-5 text-white hover:shadow-xl hover:shadow-blue-900/20 hover:-translate-y-1 transition-all relative overflow-hidden"
                aria-label={`View ${airport.name} (${airport.iata}) airport parking${airport.minRate ? ` — from $${airport.minRate.toFixed(2)}/day` : ""}`}
              >
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Car className="w-24 h-24 md:w-32 md:h-32" />
                </div>
                <div className="relative z-10 flex justify-between items-start mb-5 md:mb-8">
                  <span className="text-2xl md:text-3xl font-black tracking-tighter">{airport.iata}</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="relative z-10">
                  <div className="font-bold text-blue-50 line-clamp-1 text-sm md:text-base">{airport.name}</div>
                  <div className="text-blue-200 text-xs md:text-sm flex items-center mt-1">
                    <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" aria-hidden="true" />
                    {airport.city}
                  </div>
                  <div className="text-xs text-blue-300 mt-1.5 md:mt-2 font-medium">
                    {POPULAR_LABELS[airport.iata] || "Popular Hub"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 完整目录网格 */}
      <AirportDirectory airports={filteredAirports} />

      {/* FAQ Section */}
      <FAQSection airports={airports} cheapestAirports={cheapestAirports} avgMinRate={avgMinRate} />

    </main>
  );
}

// Removed AirportSearch - integrated into main component

function AirportDirectory({ airports }: { airports: AirportData[] }) {
  if (airports.length === 0) {
    return (
      <section aria-labelledby="directory-heading">
        <h2 id="directory-heading" className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6 border-b border-slate-200 pb-4">
          A-Z Directory
        </h2>
        <div className="text-center py-16 md:py-20 bg-white rounded-xl md:rounded-2xl border border-dashed border-slate-300">
          <Car className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-3 md:mb-4" />
          <p className="text-slate-600 font-medium text-base md:text-lg">No airports available yet</p>
          <p className="text-slate-400 text-xs md:text-sm mt-2">Check back soon for updated parking locations</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="directory-heading">
      <h2 id="directory-heading" className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6 border-b border-slate-200 pb-4">
        Complete US Airport Directory
        <span className="text-xs md:text-sm font-normal text-slate-500 ml-2">({airports.length} airports)</span>
      </h2>

      {/* 表格形式 */}
      <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden shadow-sm">
        {/* 表头 */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-600 uppercase tracking-wider">
          <div className="col-span-3">City</div>
          <div className="col-span-5">Airport</div>
          <div className="col-span-1 text-center">Code</div>
          <div className="col-span-2 text-right">Parking From</div>
          <div className="col-span-1"></div>
        </div>

        {/* 表格内容 */}
        <div className="divide-y divide-slate-100">
          {airports.map((airport) => (
            <Link
              key={airport.iata}
              href={`/airports/${airport.iata.toLowerCase()}/parking`}
              className="group block md:grid md:grid-cols-12 gap-4 px-4 md:px-6 py-3 md:py-4 hover:bg-slate-50 transition-colors items-center"
              aria-label={`${airport.name} (${airport.iata}) parking${airport.minRate ? ` — from $${airport.minRate.toFixed(2)}/day` : ""}`}
            >
              {/* 城市 */}
              <div className="md:col-span-3 mb-2 md:mb-0">
                <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">City:</span>
                <div className="flex items-center text-slate-700">
                  <MapPin className="w-4 h-4 mr-1.5 text-slate-400" aria-hidden="true" />
                  <span className="font-medium">{airport.city}</span>
                </div>
              </div>

              {/* 机场名 */}
              <div className="md:col-span-5 mb-2 md:mb-0">
                <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Airport:</span>
                <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {airport.name}
                </span>
              </div>

              {/* IATA 代码 */}
              <div className="md:col-span-1 text-center mb-2 md:mb-0">
                <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Code:</span>
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 font-black text-sm rounded-lg">
                  {airport.iata}
                </span>
              </div>

              {/* 停车场价格 */}
              <div className="md:col-span-2 text-right mb-2 md:mb-0">
                <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Parking:</span>
                {airport.minRate ? (
                  <span className="font-bold text-emerald-600">
                    ${airport.minRate.toFixed(2)}/day
                  </span>
                ) : (
                  <span className="text-slate-400 text-sm">—</span>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="md:col-span-1 text-right">
                <span className="inline-flex items-center gap-1 text-blue-600 font-bold text-sm group-hover:text-blue-700">
                  <span className="md:hidden">View Rates</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ airports, cheapestAirports, avgMinRate }: { 
  airports: AirportData[]; 
  cheapestAirports: AirportData[];
  avgMinRate: string;
}) {
  const airportsWithRates = airports.filter(a => a.minRate);
  
  return (
    <section aria-labelledby="faq-heading" className="mt-12 md:mt-16 max-w-4xl">
      <h2 id="faq-heading" className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
        Frequently Asked Questions
      </h2>
      <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 divide-y divide-slate-100">
        <details className="p-4 md:p-6 group">
          <summary className="flex justify-between items-center cursor-pointer font-bold text-sm md:text-base text-slate-900 list-none gap-2">
            <span className="flex-1">Which airports have the cheapest parking?</span>
            <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
          </summary>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 leading-relaxed">
            {cheapestAirports.length > 0
              ? `Based on current rates, the most affordable parking is at ${cheapestAirports.map(a => `${a.iata} ($${a.minRate?.toFixed(2)}/day)`).join(", ")}. These off-site lots offer significant savings compared to official terminal rates.`
              : `We list parking options at ${airports.length} airports across the US. Off-site lots typically save you 50-70% compared to official terminal rates.`}
          </p>
        </details>
        
        <details className="p-4 md:p-6 group">
          <summary className="flex justify-between items-center cursor-pointer font-bold text-sm md:text-base text-slate-900 list-none gap-2">
            <span className="flex-1">How much does airport parking cost on average?</span>
            <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
          </summary>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 leading-relaxed">
            {airportsWithRates.length > 0
              ? `Off-site parking across our listed airports averages $${avgMinRate}/day. Official terminal parking typically costs $35-50/day, so you can save $20-35 per day by choosing verified off-site options.`
              : `Off-site airport parking typically ranges from $10-25/day, while official terminal parking costs $35-50/day. You can save 50-70% by choosing off-site options.`}
          </p>
        </details>
        
        <details className="p-4 md:p-6 group">
          <summary className="flex justify-between items-center cursor-pointer font-bold text-sm md:text-base text-slate-900 list-none gap-2">
            <span className="flex-1">How many airports do you cover?</span>
            <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
          </summary>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 leading-relaxed">
            We currently list parking options at {airports.length} airports across the United States. Each listing includes verified off-site lots with real-time pricing, customer reviews, and amenity details.
          </p>
        </details>
        
        <details className="p-4 md:p-6 group">
          <summary className="flex justify-between items-center cursor-pointer font-bold text-sm md:text-base text-slate-900 list-none gap-2">
            <span className="flex-1">What information can I find for each airport?</span>
            <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
          </summary>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 leading-relaxed">
            For each of the {airports.length} airports in our directory, you&apos;ll find: lowest available off-site parking rates, shuttle service details, lot amenities (valet, indoor parking, 24/7 access), customer ratings, and direct booking links.
          </p>
        </details>
      </div>
    </section>
  );
}
