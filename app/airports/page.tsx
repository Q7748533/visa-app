import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import SearchBox from "../components/SearchBox";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "All Airports Directory | Airport Matrix",
  description: "Browse all airports with showers, luggage storage, sleeping pods and transport facilities. Complete directory of 500+ airports worldwide.",
  keywords: ["airport directory", "all airports", "airport facilities", "airport showers", "luggage storage", "sleeping pods", "airport transport"],
  alternates: {
    canonical: "https://www.airportmatrix.com/airports",
  },
  openGraph: {
    title: "All Airports Directory | Airport Matrix",
    description: "Browse all airports with showers, luggage storage, sleeping pods and transport facilities.",
    url: "https://www.airportmatrix.com/airports",
    siteName: "Airport Matrix",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Airports Directory | Airport Matrix",
    description: "Browse all airports with showers, luggage storage, sleeping pods and transport facilities. Complete directory of 500+ airports worldwide.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

function generateSchema(airports: { code: string; name: string }[]) {
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.airportmatrix.com" },
      { "@type": "ListItem", "position": 2, "name": "All Airports", "item": "https://www.airportmatrix.com/airports" }
    ]
  };

  const webPageSchema = {
    "@type": "WebPage",
    "name": "Complete Airport Directory | All Airports with Facilities",
    "description": "Browse all airports with showers, luggage storage, sleeping pods and transport facilities. Complete directory of airports worldwide.",
    "url": "https://www.airportmatrix.com/airports",
    "breadcrumb": breadcrumbSchema
  };

  const itemListSchema = {
    "@type": "ItemList",
    "name": "Global Airport Directory",
    "description": "Comprehensive list of airports worldwide with transit facilities including showers, luggage storage, sleeping pods, and transport options.",
    "itemListElement": airports.slice(0, 20).map((a, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://www.airportmatrix.com/airport/${a.code.toLowerCase()}/showers`,
      "name": `${a.name} (${a.code})`
    }))
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      webPageSchema,
      breadcrumbSchema,
      itemListSchema
    ]
  };
}

async function getAllAirports() {
  try {
    const airports = await prisma.airport.findMany({
      orderBy: [{ continent: 'asc' }, { country: 'asc' }, { city: 'asc' }],
      select: {
        iata: true, name: true, city: true, country: true, continent: true,
        isPopular: true, showerData: true, luggageData: true, sleepData: true, transitData: true,
      }
    });
    return airports.map(airport => ({
      code: airport.iata,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      continent: airport.continent || 'Other',
      isPopular: airport.isPopular,
      services: {
        showers: !!airport.showerData,
        storage: !!airport.luggageData,
        sleeping: !!airport.sleepData,
        transport: !!airport.transitData,
      }
    }));
  } catch (error) { return []; }
}

// 核心逻辑：按 大洲 -> 国家 进行二级分组
function groupByHierarchy(airports: any[]) {
  return airports.reduce((acc: any, airport) => {
    const { continent, country } = airport;
    if (!acc[continent]) acc[continent] = {};
    if (!acc[continent][country]) acc[continent][country] = [];
    acc[continent][country].push(airport);
    return acc;
  }, {});
}

const continentOrder = ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania', 'Other'];

export default async function AirportsPage() {
  const airports = await getAllAirports();
  const hierarchy = groupByHierarchy(airports);
  const totalAirports = airports.length;

  const combinedSchema = generateSchema(airports);

  return (
    <>
      <Script id="combined-schema" type="application/ld+json">
        {JSON.stringify(combinedSchema)}
      </Script>

      <main className="min-h-screen bg-slate-50/50">
        {/* 1. 统一的清爽导航 */}
        <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50" role="navigation" aria-label="Main navigation">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 sm:gap-3" aria-label="Airport Matrix Home">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/20">
                M
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">AIRPORT<span className="text-blue-600">MATRIX</span></span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link href="/airport-showers" className="px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Showers</Link>
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* 2. 轻量级 Hero */}
          <header className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-4">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Global Infrastructure Index 2026
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Complete Airport Directory <span className="text-slate-300">|</span> All Airports with Facilities
            </h1>
            <p className="text-base sm:text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
              Browse verified facility data for {totalAirports} airports. Organized by region and country for quick access.
            </p>
          </header>

          {/* 3. 搜索与大洲跳转 */}
          <div className="mb-12 py-4 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-slate-50/80 border-b border-slate-200/50">
            <div className="flex flex-col gap-4">
              <div className="w-full"><SearchBox /></div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 justify-center">
                {continentOrder.map(c => hierarchy[c] && (
                  <a key={c} href={`#${c.toLowerCase().replace(/\s+/g, '-')}`}
                     className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all whitespace-nowrap shadow-sm">
                    {c}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* 4. 专业数据表格 */}
          <section aria-label="Airport directory">
            {airports.length > 0 ? (
              <div className="space-y-16">
                {continentOrder.map(continent => {
                  const countries = hierarchy[continent];
                  if (!countries) return null;

                  // 统计该大洲的机场数量
                  const continentAirports = Object.values(countries).flat().length;

                  return (
                    <section key={continent} id={continent.toLowerCase().replace(/\s+/g, '-')} className="scroll-mt-32">
                      {/* 大洲标题 + 统计 */}
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-900">{continent}</h2>
                        <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                          {continentAirports} airports
                        </span>
                      </div>

                      {/* 数据表格 */}
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        {/* 表头 */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                          <div className="col-span-1">Code</div>
                          <div className="col-span-4">Airport</div>
                          <div className="col-span-2">City</div>
                          <div className="col-span-2">Country</div>
                          <div className="col-span-3 text-right">Services</div>
                        </div>

                        {/* 表格内容 - 按国家分组 */}
                        <div className="divide-y divide-slate-100">
                          {Object.entries(countries).map(([country, list]: [string, any]) => (
                            <div key={country}>
                              {/* 国家分隔行 */}
                              <div className="px-6 py-2 bg-slate-50/50 border-b border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{country}</span>
                              </div>

                              {/* 该国家的机场列表 */}
                              {list.map((airport: any) => (
                                <Link
                                  key={airport.code}
                                  href={`/airport/${airport.code.toLowerCase()}`}
                                  className="group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-blue-50/30 transition-colors"
                                >
                                  {/* IATA Code */}
                                  <div className="col-span-2 md:col-span-1">
                                    <span className="inline-flex items-center justify-center w-12 h-8 text-sm font-black text-blue-600 bg-blue-50 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                      {airport.code}
                                    </span>
                                  </div>

                                  {/* Airport Name */}
                                  <div className="col-span-10 md:col-span-4">
                                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{airport.name}</h4>
                                  </div>

                                  {/* City - 仅桌面显示 */}
                                  <div className="hidden md:block col-span-2">
                                    <span className="text-sm text-slate-600">{airport.city}</span>
                                  </div>

                                  {/* Country - 仅桌面显示 */}
                                  <div className="hidden md:block col-span-2">
                                    <span className="text-sm text-slate-500">{country}</span>
                                  </div>

                                  {/* Services */}
                                  <div className="col-span-12 md:col-span-3 flex items-center justify-end gap-2 mt-2 md:mt-0">
                                    {airport.services.showers ? (
                                      <span
                                        className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"
                                        title="Showers Available"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                      </span>
                                    ) : (
                                      <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-300 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                      </span>
                                    )}

                                    {airport.services.storage ? (
                                      <span
                                        className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center"
                                        title="Storage Available"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                      </span>
                                    ) : (
                                      <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-300 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                      </span>
                                    )}

                                    {airport.services.sleeping ? (
                                      <span
                                        className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"
                                        title="Sleeping Available"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                      </span>
                                    ) : (
                                      <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-300 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                      </span>
                                    )}

                                    {airport.services.transport ? (
                                      <span
                                        className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"
                                        title="Transport Available"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                      </span>
                                    ) : (
                                      <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-300 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/50">
                <p className="text-slate-500 text-lg">No airports found in database.</p>
                <p className="text-slate-400 text-sm mt-2">Please run the seed script to add airports.</p>
                <code className="mt-4 inline-block px-4 py-2 bg-slate-100 rounded-lg text-sm">npx prisma db seed</code>
              </div>
            )}
          </section>
        </div>

        {/* Back to Top Button */}
        <a
          href="#"
          className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all z-50"
          aria-label="Back to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </a>

        {/* 5. 简约页脚 */}
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