import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import SearchBox from "@/app/components/SearchBox";

export const metadata: Metadata = {
  title: "Airport Sleeping Pods & Transit Hotels | Airport Matrix",
  description: "Find sleeping pods, quiet zones, and transit hotels at airports worldwide. Real-time data for restful layovers.",
  keywords: ["airport sleeping pods", "transit hotels", "airport quiet zones", "sleep in airport"],
  alternates: {
    canonical: "https://www.airportmatrix.com/airport-sleeping",
  },
  openGraph: {
    title: "Airport Sleeping Pods & Transit Hotels | Airport Matrix",
    description: "Find sleeping pods, quiet zones, and transit hotels at airports worldwide",
    url: "https://www.airportmatrix.com/airport-sleeping",
    siteName: "Airport Matrix",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Airport Sleeping Pods & Transit Hotels",
    description: "Find sleeping pods, quiet zones, and transit hotels at airports worldwide",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 86400;

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.airportmatrix.com/" },
    { "@type": "ListItem", "position": 2, "name": "Sleeping Pods", "item": "https://www.airportmatrix.com/airport-sleeping" }
  ]
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Airport Sleeping Pods & Transit Hotels | Airport Matrix",
  "description": "Find sleeping pods, quiet zones, and transit hotels at airports worldwide. Real-time data for restful layovers.",
  "url": "https://www.airportmatrix.com/airport-sleeping",
  "breadcrumb": breadcrumbSchema
};

// 热门机场
async function getAirportsWithSleep() {
  try {
    const airports = await prisma.airport.findMany({
      where: { sleepData: { not: null }, isPopular: true },
      take: 12,
      orderBy: { searchVolume: 'desc' },
      select: { iata: true, name: true, city: true, country: true, sleepData: true }
    });
    return airports.map(a => {
      let typeTag = "Hotel";
      let priceTag = "$$";
      
      try {
        const data = JSON.parse(a.sleepData || '{}');
        const dataStr = JSON.stringify(data).toLowerCase();
        
        if (dataStr.includes('pod') || dataStr.includes('capsule')) typeTag = "Sleep Pod";
        else if (dataStr.includes('lounge')) typeTag = "Lounge";
        else if (dataStr.includes('free') || dataStr.includes('quiet zone')) {
          typeTag = "Free Zone";
          priceTag = "Free";
        }
        
        if (dataStr.includes('$') || dataStr.includes('price')) {
          const priceMatch = dataStr.match(/\$(\d+)/);
          if (priceMatch) {
            const price = parseInt(priceMatch[1]);
            if (price < 50) priceTag = "$";
            else if (price < 100) priceTag = "$$";
            else priceTag = "$$$";
          }
        }
      } catch (e) {}

      return {
        code: a.iata,
        name: a.name,
        city: a.city,
        country: a.country,
        type: typeTag,
        price: priceTag
      };
    });
  } catch (e) { return []; }
}

// 所有有睡眠设施的机场
async function getAllSleepAirports() {
  try {
    const airports = await prisma.airport.findMany({
      where: { sleepData: { not: null } },
      select: { 
        iata: true, 
        name: true, 
        city: true, 
        country: true, 
        continent: true,
        sleepData: true 
      },
      orderBy: [{ continent: 'asc' }, { country: 'asc' }, { city: 'asc' }]
    });

    return airports.map(a => {
      let typeTag = "Hotel";
      let priceTag = "$$";
      
      try {
        const data = JSON.parse(a.sleepData || '{}');
        const dataStr = JSON.stringify(data).toLowerCase();
        
        if (dataStr.includes('pod') || dataStr.includes('capsule')) typeTag = "Sleep Pod";
        else if (dataStr.includes('lounge')) typeTag = "Lounge";
        else if (dataStr.includes('free') || dataStr.includes('quiet zone')) {
          typeTag = "Free Zone";
          priceTag = "Free";
        }
      } catch (e) {}

      return {
        code: a.iata,
        name: a.name,
        city: a.city,
        country: a.country,
        continent: a.continent || 'Other',
        type: typeTag,
        price: priceTag
      };
    });
  } catch (e) { return []; }
}

export default async function AirportSleepingPage() {
  const [popularAirports, allAirports] = await Promise.all([
    getAirportsWithSleep(),
    getAllSleepAirports()
  ]);

  const itemListSchema = popularAirports.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": popularAirports.map((airport, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": `${airport.name} (${airport.code})`,
      "url": `https://www.airportmatrix.com/airport/${airport.code.toLowerCase()}/sleeping`
    }))
  } : null;

  // Service Schema for sleeping service
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Airport Sleeping Facilities",
    "description": "Find sleeping pods, quiet zones, and transit hotels at airports worldwide. Real-time data for restful layovers.",
    "provider": {
      "@type": "Organization",
      "name": "Airport Matrix"
    },
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Sleeping Options",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Free Quiet Zones"
          },
          "price": "0",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Sleeping Pods"
          },
          "price": "15-25",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Transit Hotels"
          },
          "price": "80-200",
          "priceCurrency": "USD"
        }
      ]
    }
  };

  return (
    <>
      <Script id="webpage-schema" type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </Script>
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </Script>
      {itemListSchema && (
        <Script id="itemlist-schema" type="application/ld+json">
          {JSON.stringify(itemListSchema)}
        </Script>
      )}
      <Script id="service-schema" type="application/ld+json">
        {JSON.stringify(serviceSchema)}
      </Script>

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
        {/* 1. 主导航 (放在最上面，吸顶) */}
        <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50" role="navigation" aria-label="Main navigation">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 sm:gap-3" aria-label="Airport Matrix Home">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-purple-600/20">M</div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">AIRPORT<span className="text-purple-600">MATRIX</span></span>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link href="/airport-showers" className="px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Showers</Link>
              <Link href="/airport-storage" className="px-4 py-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">Storage</Link>
              <Link href="/airport-sleeping" className="px-4 py-2 text-purple-600 bg-purple-50 rounded-lg">Sleeping</Link>
              <Link href="/airport-transport" className="px-4 py-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">Transport</Link>
              <div className="w-px h-6 bg-slate-200 mx-2" />
              <Link href="/" className="px-3 py-2 text-slate-500 hover:text-slate-900 transition-colors text-xs">Home</Link>
            </div>
            {/* Mobile Navigation - Text Labels */}
            <div className="md:hidden mt-4 -mx-4 px-4 pb-2">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mb-2">
                <Link href="/airport-showers" className="flex-shrink-0 px-4 py-3 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-full whitespace-nowrap min-h-[44px] flex items-center">
                  Showers
                </Link>
                <Link href="/airport-storage" className="flex-shrink-0 px-4 py-3 bg-sky-50 text-sky-600 text-sm font-medium rounded-full whitespace-nowrap min-h-[44px] flex items-center">
                  Storage
                </Link>
                <Link href="/airport-sleeping" className="flex-shrink-0 px-4 py-3 bg-purple-50 text-purple-600 text-sm font-medium rounded-full whitespace-nowrap min-h-[44px] flex items-center">
                  Sleeping
                </Link>
                <Link href="/airport-transport" className="flex-shrink-0 px-4 py-3 bg-amber-50 text-amber-600 text-sm font-medium rounded-full whitespace-nowrap min-h-[44px] flex items-center">
                  Transport
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* 2. 面包屑 (放在下面，随页面自然滚动) */}
        <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <ol className="flex items-center gap-2 text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
              </li>
              <li aria-hidden="true">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="text-slate-900 font-medium" aria-current="page">Sleeping Pods</li>
            </ol>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 pt-12">
          {/* Hero Section */}
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 text-sm font-semibold rounded-full mb-6 shadow-sm border border-purple-100/50">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              Sleep Nodes Verified
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Airport Sleeping <span className="text-slate-300">|</span>{" "}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Pods, Hotels & Quiet Zones
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
              Discover the best places to rest during layovers. From private sleeping pods to luxury transit hotels and free quiet zones.
            </p>
          </div>

          {/* Sleeping Types Comparison Table */}
          <section className="mb-16" aria-labelledby="sleeping-types-heading">
            <h2 id="sleeping-types-heading" className="text-lg font-bold text-slate-900 mb-4">
              Sleeping Options & Pricing
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Price Range</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Best For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="font-bold text-slate-900">Free Quiet Zones</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">$0</td>
                      <td className="px-6 py-4 text-slate-600">2 - 6 hours</td>
                      <td className="px-6 py-4 text-slate-600">Budget travelers</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          <span className="font-bold text-slate-900">Sleeping Pods</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-purple-600 font-bold">$15 - $25/hour</td>
                      <td className="px-6 py-4 text-slate-600">1 - 8 hours</td>
                      <td className="px-6 py-4 text-slate-600">Short layovers</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="font-bold text-slate-900">Transit Hotels</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-blue-600 font-bold">$80 - $200/night</td>
                      <td className="px-6 py-4 text-slate-600">6 - 24 hours</td>
                      <td className="px-6 py-4 text-slate-600">Long layovers</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Search Box */}
          <div className="mb-20 relative z-40">
            <SearchBox />
          </div>

          {/* 第一层: Popular - 数据表格样式 */}
          {popularAirports.length > 0 && (
            <section className="mb-20 relative z-10" aria-labelledby="popular-hubs">
              <div className="flex items-center justify-between mb-8">
                <h2 id="popular-hubs" className="text-2xl font-bold text-slate-900">Premium Sleep Hubs</h2>
                <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">Top {popularAirports.length} Worldwide</span>
              </div>
              
              {/* 数据表格 */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* 表头 */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <div className="col-span-1">Code</div>
                  <div className="col-span-4">Airport</div>
                  <div className="col-span-2">City</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-1 text-right">→</div>
                </div>

                {/* 表格内容 */}
                <div className="divide-y divide-slate-100">
                  {popularAirports.map((airport) => (
                    <Link
                      key={airport.code}
                      href={`/airport/${airport.code.toLowerCase()}/sleeping`}
                      className="group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-purple-50/30 transition-colors"
                    >
                      {/* IATA Code */}
                      <div className="col-span-2 md:col-span-1">
                        <span className="inline-flex items-center justify-center w-12 h-8 text-sm font-black text-purple-600 bg-purple-50 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          {airport.code}
                        </span>
                      </div>

                      {/* Airport Name */}
                      <div className="col-span-10 md:col-span-4">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{airport.name}</h4>
                        <p className="text-xs text-slate-400 md:hidden">{airport.city}</p>
                      </div>

                      {/* City */}
                      <div className="hidden md:block col-span-2">
                        <span className="text-sm text-slate-600">{airport.city}</span>
                      </div>

                      {/* Type */}
                      <div className="hidden md:block col-span-2">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg ${
                          airport.type === 'Free Zone' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : airport.type === 'Sleep Pod'
                            ? 'bg-purple-100 text-purple-700'
                            : airport.type === 'Lounge'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {airport.type}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="hidden md:block col-span-2">
                        <span className={`text-sm font-bold ${
                          airport.price === 'Free' ? 'text-emerald-600' : 'text-slate-600'
                        }`}>
                          {airport.price}
                        </span>
                      </div>

                      {/* Arrow */}
                      <div className="hidden md:flex col-span-1 justify-end">
                        <svg className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 第二层：完整目录 - 数据表格 */}
          {allAirports.length > 0 && (
            <section className="mb-20 relative z-10" aria-labelledby="complete-directory">
              <div className="flex items-center justify-between mb-8">
                <h2 id="complete-directory" className="text-2xl font-bold text-slate-900">Complete Directory</h2>
                <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">{allAirports.length} Airports</span>
              </div>
              
              {/* 数据表格 */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* 表头 */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <div className="col-span-1">Code</div>
                  <div className="col-span-3">Airport</div>
                  <div className="col-span-2">City</div>
                  <div className="col-span-2">Country</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-1">Price</div>
                  <div className="col-span-1 text-right">→</div>
                </div>

                {/* 表格内容 - 按大洲分组 */}
                <div className="divide-y divide-slate-100">
                  {(() => {
                    // 按大洲分组
                    const byContinent = allAirports.reduce((acc, airport) => {
                      if (!acc[airport.continent]) acc[airport.continent] = [];
                      acc[airport.continent].push(airport);
                      return acc;
                    }, {} as Record<string, typeof allAirports>);

                    return Object.entries(byContinent).map(([continent, airports]) => (
                      <div key={continent}>
                        {/* 大洲分隔行 */}
                        <div className="px-6 py-2 bg-slate-50/80 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{continent}</span>
                          <span className="text-xs text-slate-400 ml-2">({airports.length})</span>
                        </div>

                        {/* 该大洲的机场列表 */}
                        {airports.map((airport) => (
                          <Link
                            key={airport.code}
                            href={`/airport/${airport.code.toLowerCase()}/sleeping`}
                            className="group grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-purple-50/30 transition-colors"
                          >
                            {/* IATA Code */}
                            <div className="col-span-2 md:col-span-1">
                              <span className="inline-flex items-center justify-center w-12 h-8 text-sm font-black text-purple-600 bg-purple-50 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                {airport.code}
                              </span>
                            </div>

                            {/* Airport Name */}
                            <div className="col-span-10 md:col-span-3">
                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">{airport.name}</h4>
                            </div>

                            {/* City */}
                            <div className="hidden md:block col-span-2">
                              <span className="text-sm text-slate-600">{airport.city}</span>
                            </div>

                            {/* Country */}
                            <div className="hidden md:block col-span-2">
                              <span className="text-sm text-slate-500">{airport.country}</span>
                            </div>

                            {/* Type */}
                            <div className="hidden md:block col-span-2">
                              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg ${
                                airport.type === 'Free Zone' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : airport.type === 'Sleep Pod'
                                  ? 'bg-purple-100 text-purple-700'
                                  : airport.type === 'Lounge'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {airport.type}
                              </span>
                            </div>

                            {/* Price */}
                            <div className="hidden md:block col-span-1">
                              <span className={`text-sm font-bold ${
                                airport.price === 'Free' ? 'text-emerald-600' : 'text-slate-600'
                              }`}>
                                {airport.price}
                              </span>
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex col-span-1 justify-end">
                              <svg className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </section>
          )}

          {/* 空状态 */}
          {popularAirports.length === 0 && allAirports.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 mb-20 relative z-10">
              <p className="text-slate-500 font-medium">No airports with sleeping facility data available yet. Check back soon.</p>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <article className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Free Options</h3>
              <p className="text-slate-600 leading-relaxed font-medium">Many airports offer designated quiet zones and rest areas at no cost. Look for reclining chairs, dim lighting, and minimal foot traffic areas.</p>
            </article>
            <article className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Book in Advance</h3>
              <p className="text-slate-600 leading-relaxed font-medium">Sleeping pods and transit hotels can fill up quickly during peak travel seasons. Booking ahead ensures you have a comfortable place to rest.</p>
            </article>
          </div>
        </div>

        <footer className="border-t border-slate-200 bg-white mt-20" role="contentinfo">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
              <div>© 2024-2026 Airport Matrix. All rights reserved.</div>
              <nav className="flex gap-6" aria-label="Footer navigation">
                <Link href="/about" className="hover:text-slate-900">About</Link>
                <Link href="/data-sources" className="hover:text-slate-900">Data Sources</Link>
                <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
                <Link href="/terms" className="hover:text-slate-900">Terms</Link>
              </nav>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
