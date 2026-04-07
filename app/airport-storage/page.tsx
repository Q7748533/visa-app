import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import SearchBox from "@/app/components/SearchBox";

export const metadata: Metadata = {
  title: "Airport Luggage Storage - Baggage Lockers Worldwide | Airport Matrix",
  description: "Find secure airport luggage storage and baggage lockers worldwide. Pricing, locations, and size limits at major international hubs.",
  keywords: ["airport luggage storage", "baggage lockers", "left luggage", "airport storage price"],
  alternates: {
    canonical: "https://www.airportmatrix.com/airport-storage",
  },
  openGraph: {
    title: "Airport Luggage Storage - Baggage Lockers Worldwide | Airport Matrix",
    description: "Find secure airport luggage storage and baggage lockers worldwide",
    url: "https://www.airportmatrix.com/airport-storage",
    siteName: "Airport Matrix",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Airport Luggage Storage - Baggage Lockers Worldwide",
    description: "Find secure airport luggage storage and baggage lockers worldwide",
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
    { "@type": "ListItem", "position": 2, "name": "Luggage Storage", "item": "https://www.airportmatrix.com/airport-storage" }
  ]
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Airport Luggage Storage - Baggage Lockers Worldwide | Airport Matrix",
  "description": "Find secure airport luggage storage and baggage lockers worldwide. Pricing, locations, and size limits at major international hubs.",
  "url": "https://www.airportmatrix.com/airport-storage",
  "breadcrumb": breadcrumbSchema
};

// 热门机场
async function getAirportsWithStorage() {
  try {
    const airports = await prisma.airport.findMany({
      where: { luggageData: { not: null }, isPopular: true },
      take: 12,
      orderBy: { searchVolume: 'desc' },
      select: { iata: true, name: true, city: true, country: true, luggageData: true }
    });
    return airports.map(a => {
      let priceTag = "$10-15/day";
      let sizeTag = "Standard";
      
      try {
        const data = JSON.parse(a.luggageData || '{}');
        const dataStr = JSON.stringify(data).toLowerCase();
        
        // 检测价格
        const priceMatch = dataStr.match(/\$(\d+)/);
        if (priceMatch) {
          priceTag = `$${priceMatch[1]}/day`;
        }
        
        // 检测尺寸
        if (dataStr.includes('large') || dataStr.includes('xl')) sizeTag = "Large";
        else if (dataStr.includes('small') || dataStr.includes('locker')) sizeTag = "Small";
        
      } catch (e) {}

      return {
        code: a.iata,
        name: a.name,
        city: a.city,
        country: a.country,
        price: priceTag,
        size: sizeTag
      };
    });
  } catch (e) { return []; }
}

// 所有有行李存储的机场
async function getAllStorageAirports() {
  try {
    const airports = await prisma.airport.findMany({
      where: { luggageData: { not: null } },
      select: { 
        iata: true, 
        name: true, 
        city: true, 
        country: true, 
        continent: true,
        luggageData: true 
      },
      orderBy: [{ continent: 'asc' }, { country: 'asc' }, { city: 'asc' }]
    });

    return airports.map(a => {
      let priceTag = "$10-15/day";
      let sizeTag = "Standard";
      
      try {
        const data = JSON.parse(a.luggageData || '{}');
        const dataStr = JSON.stringify(data).toLowerCase();
        
        const priceMatch = dataStr.match(/\$(\d+)/);
        if (priceMatch) {
          priceTag = `$${priceMatch[1]}/day`;
        }
        
        if (dataStr.includes('large') || dataStr.includes('xl')) sizeTag = "Large";
        else if (dataStr.includes('small') || dataStr.includes('locker')) sizeTag = "Small";
      } catch (e) {}

      return {
        code: a.iata,
        name: a.name,
        city: a.city,
        country: a.country,
        continent: a.continent || 'Other',
        price: priceTag,
        size: sizeTag
      };
    });
  } catch (e) { return []; }
}

export default async function AirportStoragePage() {
  const [popularAirports, allAirports] = await Promise.all([
    getAirportsWithStorage(),
    getAllStorageAirports()
  ]);

  const itemListSchema = popularAirports.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": popularAirports.map((airport, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": `${airport.name} (${airport.code})`,
      "url": `https://www.airportmatrix.com/airport/${airport.code.toLowerCase()}/luggage-storage`
    }))
  } : null;

  // Service Schema for storage service
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Airport Luggage Storage Services",
    "description": "Find secure airport luggage storage and baggage lockers worldwide. Pricing, locations, and size limits at major international hubs.",
    "provider": {
      "@type": "Organization",
      "name": "Airport Matrix"
    },
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Storage Options",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Small Lockers"
          },
          "price": "5-10",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Standard Storage"
          },
          "price": "10-15",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Large/Oversized Items"
          },
          "price": "15-25",
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
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-600 to-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-sky-600/20">M</div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">AIRPORT<span className="text-sky-600">MATRIX</span></span>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link href="/airport-showers" className="px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Showers</Link>
              <Link href="/airport-storage" className="px-4 py-2 text-sky-600 bg-sky-50 rounded-lg">Storage</Link>
              <Link href="/airport-sleeping" className="px-4 py-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">Sleeping</Link>
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
                <Link href="/" className="hover:text-sky-600 transition-colors">Home</Link>
              </li>
              <li aria-hidden="true">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="text-slate-900 font-medium" aria-current="page">Luggage Storage</li>
            </ol>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 pt-12">
          {/* Hero Section */}
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 text-sm font-semibold rounded-full mb-6 shadow-sm border border-sky-100/50">
              <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
              Storage Nodes Active
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Airport Storage <span className="text-slate-300">|</span>{" "}
              <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                Luggage Lockers & Services
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
              Find secure baggage lockers and left luggage facilities at airports worldwide. Compare rates for short-term and overnight storage.
            </p>
          </div>

          {/* Storage Types Comparison Table */}
          <section className="mb-16" aria-labelledby="storage-types-heading">
            <h2 id="storage-types-heading" className="text-lg font-bold text-slate-900 mb-4">
              Storage Options & Pricing
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Price Range</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Size</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Best For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="font-bold text-slate-900">Small Lockers</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">$5 - $10/day</td>
                      <td className="px-6 py-4 text-slate-600">Backpack, Hand luggage</td>
                      <td className="px-6 py-4 text-slate-600">Day trips</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sky-500" />
                          <span className="font-bold text-slate-900">Standard Storage</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sky-600 font-bold">$10 - $15/day</td>
                      <td className="px-6 py-4 text-slate-600">Large suitcase</td>
                      <td className="px-6 py-4 text-slate-600">Short layovers</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          <span className="font-bold text-slate-900">Large/Oversized</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-purple-600 font-bold">$15 - $25/day</td>
                      <td className="px-6 py-4 text-slate-600">Multiple bags, Sports gear</td>
                      <td className="px-6 py-4 text-slate-600">Extended storage</td>
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
                <h2 id="popular-hubs" className="text-2xl font-bold text-slate-900">Popular Storage Hubs</h2>
                <span className="text-sm font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-lg">Top {popularAirports.length} Worldwide</span>
              </div>
              
              {/* 数据表格 */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* 表头 */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <div className="col-span-1">Code</div>
                  <div className="col-span-4">Airport</div>
                  <div className="col-span-2">City</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-1 text-right">→</div>
                </div>

                {/* 表格内容 */}
                <div className="divide-y divide-slate-100">
                  {popularAirports.map((airport) => (
                    <Link
                      key={airport.code}
                      href={`/airport/${airport.code.toLowerCase()}/luggage-storage`}
                      className="group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-sky-50/30 transition-colors"
                    >
                      {/* IATA Code */}
                      <div className="col-span-2 md:col-span-1">
                        <span className="inline-flex items-center justify-center w-12 h-8 text-sm font-black text-sky-600 bg-sky-50 rounded-lg group-hover:bg-sky-600 group-hover:text-white transition-colors">
                          {airport.code}
                        </span>
                      </div>

                      {/* Airport Name */}
                      <div className="col-span-10 md:col-span-4">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{airport.name}</h4>
                        <p className="text-xs text-slate-400 md:hidden">{airport.city}</p>
                      </div>

                      {/* City */}
                      <div className="hidden md:block col-span-2">
                        <span className="text-sm text-slate-600">{airport.city}</span>
                      </div>

                      {/* Price */}
                      <div className="hidden md:block col-span-2">
                        <span className="text-sm font-bold text-slate-700">{airport.price}</span>
                      </div>

                      {/* Size */}
                      <div className="hidden md:block col-span-2">
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700">
                          {airport.size}
                        </span>
                      </div>

                      {/* Arrow */}
                      <div className="hidden md:flex col-span-1 justify-end">
                        <svg className="w-5 h-5 text-slate-300 group-hover:text-sky-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="col-span-2">Price</div>
                  <div className="col-span-1">Size</div>
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
                            href={`/airport/${airport.code.toLowerCase()}/luggage-storage`}
                            className="group grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-sky-50/30 transition-colors"
                          >
                            {/* IATA Code */}
                            <div className="col-span-2 md:col-span-1">
                              <span className="inline-flex items-center justify-center w-12 h-8 text-sm font-black text-sky-600 bg-sky-50 rounded-lg group-hover:bg-sky-600 group-hover:text-white transition-colors">
                                {airport.code}
                              </span>
                            </div>

                            {/* Airport Name */}
                            <div className="col-span-10 md:col-span-3">
                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">{airport.name}</h4>
                            </div>

                            {/* City */}
                            <div className="hidden md:block col-span-2">
                              <span className="text-sm text-slate-600">{airport.city}</span>
                            </div>

                            {/* Country */}
                            <div className="hidden md:block col-span-2">
                              <span className="text-sm text-slate-500">{airport.country}</span>
                            </div>

                            {/* Price */}
                            <div className="hidden md:block col-span-2">
                              <span className="text-sm font-bold text-slate-700">{airport.price}</span>
                            </div>

                            {/* Size */}
                            <div className="hidden md:block col-span-1">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700">
                                {airport.size}
                              </span>
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex col-span-1 justify-end">
                              <svg className="w-5 h-5 text-slate-300 group-hover:text-sky-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <p className="text-slate-500 font-medium">No airports with luggage storage data available yet. Check back soon.</p>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <article className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Secure Facilities</h3>
              <p className="text-slate-600 leading-relaxed font-medium">Most airport storage facilities offer 24/7 security monitoring, CCTV surveillance, and secure locker systems with unique access codes.</p>
            </article>
            <article className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-sky-500/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Flexible Duration</h3>
              <p className="text-slate-600 leading-relaxed font-medium">From hourly rates for short layovers to weekly rates for extended trips. Many locations offer both short-term and long-term storage options.</p>
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
