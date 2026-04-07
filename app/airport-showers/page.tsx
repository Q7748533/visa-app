import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import SearchBox from "@/app/components/SearchBox";

export const metadata: Metadata = {
  title: "Airport Showers | Locations, Prices & Hours 2026",
  description: "Find airport shower facilities worldwide. Free terminal showers, paid facilities, and premium lounge access. Locations, prices, and operating hours at 500+ airports.",
  keywords: ["airport showers", "shower facilities", "airport amenities", "travel hygiene", "layover showers", "airport shower prices", "free airport showers"],
  alternates: {
    canonical: "https://www.airportmatrix.com/airport-showers",
  },
  openGraph: {
    title: "Airport Showers | Locations, Prices & Hours 2026",
    description: "Find airport shower facilities worldwide. Free terminal showers, paid facilities, and premium lounge access.",
    url: "https://www.airportmatrix.com/airport-showers",
    siteName: "Airport Matrix",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Airport Showers | Locations, Prices & Hours 2026",
    description: "Find airport shower facilities worldwide. Free terminal showers, paid facilities, and premium lounge access.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 86400; // ISR: 每24小时重新生成静态页面

// 第一层：获取热门机场 (Top 12) - 使用新的 Facility 模型
async function getPopularAirports() {
  try {
    // 从 Facility 表中查询提供 SHOWERS 服务的机场
    const facilities = await prisma.facility.findMany({
      where: {
        services: { contains: 'SHOWERS' },
        airport: { isPopular: true }
      },
      include: {
        airport: {
          select: {
            iata: true,
            name: true,
            city: true,
            country: true,
          }
        }
      },
      take: 12,
      orderBy: { airport: { searchVolume: 'desc' } }
    });
    
    // 按机场分组，合并设施信息
    const airportMap = new Map();
    
    facilities.forEach(facility => {
      const iata = facility.airport.iata;
      if (!airportMap.has(iata)) {
        airportMap.set(iata, {
          code: iata,
          name: facility.airport.name,
          city: facility.airport.city,
          country: facility.airport.country,
          facilities: []
        });
      }
      airportMap.get(iata).facilities.push(facility);
    });
    
    // 转换为展示格式
    return Array.from(airportMap.values()).map(airport => {
      const facilities = airport.facilities;
      
      // 分析设施信息
      let priceTag = "Verified";
      let priceRange = "";
      let hoursTag = "24h";
      let features: string[] = [];
      
      facilities.forEach((f: any) => {
        const details = f.serviceDetails ? JSON.parse(f.serviceDetails) : {};
        const showerDetails = details.showers || {};
        
        // 检测价格
        if (showerDetails.price) {
          const priceMatch = showerDetails.price.match(/\$?(\d+)/);
          if (priceMatch) {
            const price = parseInt(priceMatch[1]);
            if (price === 0) priceTag = "Free";
            else if (!priceRange) priceRange = `$${price}`;
          }
        }
        
        // 检测营业时间
        if (f.is24Hours) hoursTag = "24 Hours";
        else if (f.hours) hoursTag = f.hours;
        
        // 检测特色
        if (f.features) {
          const featureList = JSON.parse(f.features);
          features.push(...featureList);
        }
      });
      
      // 去重特色
      features = [...new Set(features)].slice(0, 3);
      
      return {
        code: airport.code,
        name: airport.name,
        city: airport.city,
        country: airport.country,
        price: priceTag,
        priceRange,
        hours: hoursTag,
        features
      };
    });
  } catch (error) {
    console.error('DB Error:', error);
    return [];
  }
}

// 所有有淋浴设施的机场（用于完整目录）- 使用新的 Facility 模型
async function getAllShowerAirports() {
  try {
    // 从 Facility 表中查询提供 SHOWERS 服务的机场
    const facilities = await prisma.facility.findMany({
      where: {
        services: { contains: 'SHOWERS' }
      },
      include: {
        airport: {
          select: {
            iata: true,
            name: true,
            city: true,
            country: true,
            continent: true,
          }
        }
      },
      orderBy: [
        { airport: { continent: 'asc' } },
        { airport: { country: 'asc' } },
        { airport: { city: 'asc' } }
      ]
    });
    
    // 按机场分组
    const airportMap = new Map();
    
    facilities.forEach(facility => {
      const iata = facility.airport.iata;
      if (!airportMap.has(iata)) {
        airportMap.set(iata, {
          code: iata,
          name: facility.airport.name,
          city: facility.airport.city,
          country: facility.airport.country,
          continent: facility.airport.continent || 'Other',
          facilities: []
        });
      }
      airportMap.get(iata).facilities.push(facility);
    });
    
    // 转换为展示格式
    return Array.from(airportMap.values()).map(airport => {
      const facilities = airport.facilities;
      
      let priceTag = "Paid";
      let hoursTag = "24h";
      
      facilities.forEach((f: any) => {
        const details = f.serviceDetails ? JSON.parse(f.serviceDetails) : {};
        const showerDetails = details.showers || {};
        
        // 检测价格
        if (showerDetails.price) {
          const priceMatch = showerDetails.price.match(/\$?(\d+)/);
          if (priceMatch) {
            const price = parseInt(priceMatch[1]);
            if (price === 0) priceTag = "Free";
          }
        }
        
        // 检测营业时间
        if (f.is24Hours) hoursTag = "24 Hours";
        else if (f.hours) hoursTag = f.hours;
      });
      
      return {
        code: airport.code,
        name: airport.name,
        city: airport.city,
        country: airport.country,
        continent: airport.continent,
        price: priceTag,
        hours: hoursTag
      };
    });
  } catch (error) {
    console.error('DB Error:', error);
    return [];
  }
}

export default async function AirportShowersPage() {
  const [popularAirports, allAirports] = await Promise.all([
    getPopularAirports(),
    getAllShowerAirports()
  ]);

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Airport Showers | Locations, Prices & Hours 2026",
    "description": "Find airport shower facilities worldwide. Free terminal showers, paid facilities, and premium lounge access. Locations, prices, and operating hours at 500+ airports.",
    "url": "https://www.airportmatrix.com/airport-showers",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.airportmatrix.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Airport Showers",
          "item": "https://www.airportmatrix.com/airport-showers"
        }
      ]
    }
  };

  const itemListSchema = popularAirports.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": popularAirports.map((airport, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": `${airport.name} (${airport.code})`,
      "url": `https://www.airportmatrix.com/airport/${airport.code.toLowerCase()}/showers`
    }))
  } : null;

  // Service Schema for shower service
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Airport Shower Facilities",
    "description": "Find shower facilities at airports worldwide including free terminal showers, pay-per-use facilities, and premium lounge access.",
    "provider": {
      "@type": "Organization",
      "name": "Airport Matrix"
    },
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Shower Types",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Free Terminal Showers"
          },
          "price": "0",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Pay-per-Use Showers"
          },
          "price": "15-30",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Lounge Shower Access"
          },
          "price": "50+",
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
      {itemListSchema && (
        <Script id="itemlist-schema" type="application/ld+json">
          {JSON.stringify(itemListSchema)}
        </Script>
      )}
      <Script id="service-schema" type="application/ld+json">
        {JSON.stringify(serviceSchema)}
      </Script>

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
        {/* 1. 主导航 */}
        <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50" role="navigation" aria-label="Main navigation">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 sm:gap-3" aria-label="Airport Matrix Home">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/20">M</div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">AIRPORT<span className="text-blue-600">MATRIX</span></span>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link href="/airport-showers" className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg">Showers</Link>
              <Link href="/airport-storage" className="px-4 py-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">Storage</Link>
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

        {/* 2. 面包屑 */}
        <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <ol className="flex items-center gap-2 text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              </li>
              <li aria-hidden="true">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="text-slate-900 font-medium" aria-current="page">Airport Showers</li>
            </ol>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 pt-12" suppressHydrationWarning>
          {/* Hero Section */}
          <div className="max-w-3xl mb-12" suppressHydrationWarning>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-sm font-semibold rounded-full mb-6 shadow-sm border border-emerald-100/50">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {allAirports.length}+ Airports Verified
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Airport Showers <span className="text-slate-300">|</span>{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Locations, Prices & Hours
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
              Find shower facilities at airports worldwide. Free terminal amenities, pay-per-use facilities, and premium lounge access with luxury toiletries.
            </p>
          </div>

          {/* Shower Types Comparison Table */}
          <section className="mb-16" aria-labelledby="shower-types-heading">
            <h2 id="shower-types-heading" className="text-lg font-bold text-slate-900 mb-4">
              Shower Types & Pricing
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Price Range</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">What's Included</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Best For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="font-bold text-slate-900">Free Terminal</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">$0</td>
                      <td className="px-6 py-4 text-slate-600">Basic shower, sometimes towels</td>
                      <td className="px-6 py-4 text-slate-600">Budget travelers</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="font-bold text-slate-900">Pay-per-Use</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-blue-600 font-bold">$15 - $30</td>
                      <td className="px-6 py-4 text-slate-600">Shower, towel, toiletries</td>
                      <td className="px-6 py-4 text-slate-600">Long layovers</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          <span className="font-bold text-slate-900">Lounge Access</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-purple-600 font-bold">$50+</td>
                      <td className="px-6 py-4 text-slate-600">Premium shower, spa products, robe</td>
                      <td className="px-6 py-4 text-slate-600">Business travelers</td>
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

          {/* 第一层：热门机场 (Top 12) - 数据表格样式 */}
          {popularAirports.length > 0 && (
            <section className="mb-20 relative z-10" aria-labelledby="popular-hubs">
              <div className="flex items-center justify-between mb-8">
                <h2 id="popular-hubs" className="text-2xl font-bold text-slate-900">Popular Hubs</h2>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">Top {popularAirports.length} Worldwide</span>
              </div>
              
              {/* 数据表格 */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* 表头 */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <div className="col-span-1">Code</div>
                  <div className="col-span-4">Airport</div>
                  <div className="col-span-2">City</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Hours</div>
                  <div className="col-span-1 text-right">→</div>
                </div>

                {/* 表格内容 */}
                <div className="divide-y divide-slate-100">
                  {popularAirports.map((airport) => (
                    <Link
                      key={airport.code}
                      href={`/airport/${airport.code.toLowerCase()}/showers`}
                      className="group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-emerald-50/30 transition-colors"
                    >
                      {/* IATA Code */}
                      <div className="col-span-2 md:col-span-1">
                        <span className="inline-flex items-center justify-center w-12 h-8 text-sm font-black text-emerald-600 bg-emerald-50 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {airport.code}
                        </span>
                      </div>

                      {/* Airport Name */}
                      <div className="col-span-10 md:col-span-4">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{airport.name}</h4>
                        <p className="text-xs text-slate-400 md:hidden">{airport.city}</p>
                      </div>

                      {/* City - 仅桌面显示 */}
                      <div className="hidden md:block col-span-2">
                        <span className="text-sm text-slate-600">{airport.city}</span>
                      </div>

                      {/* Price Type */}
                      <div className="hidden md:block col-span-2">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg ${
                          airport.price === 'Free' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : airport.price === 'Free & Paid'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {airport.price}
                        </span>
                        {airport.priceRange && (
                          <span className="ml-2 text-xs text-slate-500">{airport.priceRange}</span>
                        )}
                      </div>

                      {/* Hours */}
                      <div className="hidden md:block col-span-2">
                        <span className="text-sm text-slate-600">{airport.hours}</span>
                      </div>

                      {/* Arrow */}
                      <div className="hidden md:flex col-span-1 justify-end">
                        <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="col-span-1">Hours</div>
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
                            href={`/airport/${airport.code.toLowerCase()}/showers`}
                            className="group grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-emerald-50/30 transition-colors"
                          >
                            {/* IATA Code */}
                            <div className="col-span-2 md:col-span-1">
                              <span className="inline-flex items-center justify-center w-12 h-8 text-sm font-black text-emerald-600 bg-emerald-50 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                {airport.code}
                              </span>
                            </div>

                            {/* Airport Name */}
                            <div className="col-span-10 md:col-span-3">
                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">{airport.name}</h4>
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
                              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg ${
                                airport.price === 'Free' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : airport.price === 'Mixed'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {airport.price}
                              </span>
                            </div>

                            {/* Hours */}
                            <div className="hidden md:block col-span-1">
                              <span className="text-sm text-slate-600">{airport.hours}</span>
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex col-span-1 justify-end">
                              <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <p className="text-slate-500 font-medium">No airports with shower data available yet. Check back soon.</p>
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
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Free Showers</h3>
              <p className="text-slate-600 leading-relaxed font-medium">Available at select airports like Changi and Incheon. Complimentary facilities for all passengers, though towels may not be provided.</p>
            </article>
            <article className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Lounge & Paid Showers</h3>
              <p className="text-slate-600 leading-relaxed font-medium">Pay-per-use facilities and premium lounge showers. Usually includes fresh towels, luxury toiletries, and hairdryer access.</p>
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
