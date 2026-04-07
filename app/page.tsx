import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import SearchBox from "./components/SearchBox";

// ISR 缓存：24小时更新一次，极速秒开且省钱
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Airport Showers, Storage & Sleeping Pods | Airport Matrix",
  description: "Find airport showers, luggage storage, sleeping pods & city transport. Real-time 2026 data for 500+ airports. Plan your layover with verified facility info.",
  keywords: ["airport showers", "luggage storage", "sleeping pods", "airport transport", "airport facilities", "airport lockers", "transit hotels"],
  alternates: {
    canonical: "https://www.airportmatrix.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Airport Showers, Storage & Sleeping Pods | Airport Matrix",
    description: "Find showers, luggage storage & sleeping pods at major airports worldwide",
    url: "https://www.airportmatrix.com",
    siteName: "Airport Matrix",
    locale: "en_US",
    type: "website",
    images: [{
      url: "https://www.airportmatrix.com/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Airport Matrix - Find airport showers, storage and sleeping pods",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Airport Showers, Storage & Sleeping Pods | Airport Matrix",
    description: "Find showers, luggage storage & sleeping pods at major airports worldwide",
    images: ["https://www.airportmatrix.com/og-image.jpg"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Airport Matrix",
  "url": "https://www.airportmatrix.com",
  "description": "Find showers, luggage storage, sleeping pods at 500+ airports worldwide",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.airportmatrix.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Airport Matrix",
  "url": "https://www.airportmatrix.com",
  "logo": "https://www.airportmatrix.com/logo.png",
  "foundingDate": "2024",
  "description": "Curated airport facility database by frequent flyers and aviation professionals",
  "sameAs": []
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://www.airportmatrix.com"
  }]
};

function generateItemListSchema(airports: { code: string; name: string; city: string; country: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Popular Airports",
    "description": "Most popular airports with facility information",
    "itemListElement": airports.map((airport, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": `${airport.name} (${airport.code})`,
      "url": `https://www.airportmatrix.com/airport/${airport.code.toLowerCase()}`,
      "item": {
        "@type": "Airport",
        "name": airport.name,
        "iataCode": airport.code,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": airport.city,
          "addressCountry": airport.country
        }
      }
    }))
  };
}

async function getPopularAirports() {
  try {
    const airports = await prisma.airport.findMany({
      where: { isPopular: true }, // 只展示被标记为 Popular 的超级枢纽
      take: 6,
      orderBy: { searchVolume: 'desc' }, // 优先展示搜索量大的
      select: {
        iata: true,
        name: true,
        city: true,
        country: true,
        showerData: true,
        luggageData: true,
        sleepData: true,
        transitData: true,
      }
    });

    return airports.map(airport => ({
      code: airport.iata,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      showers: !!airport.showerData,
      storage: !!airport.luggageData,
      sleeping: !!airport.sleepData,
      transport: !!airport.transitData,
    }));
  } catch (error) {
    console.error('Failed to fetch airports:', error);
    // Fallback to empty array if database is not available
    return [];
  }
}



export default async function Home() {
  const airports = await getPopularAirports();

  return (
    <>
      <Script id="website-schema" type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </Script>
      <Script id="organization-schema" type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </Script>
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </Script>
      {airports.length > 0 && (
        <Script id="itemlist-schema" type="application/ld+json">
          {JSON.stringify(generateItemListSchema(airports))}
        </Script>
      )}

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50" role="navigation" aria-label="Main navigation">
          <div className="max-w-6xl mx-auto px-6 py-4">
            {/* Desktop Header */}
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3" aria-label="Airport Matrix Home">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/20">
                  M
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">AIRPORT<span className="text-blue-600">MATRIX</span></span>
              </Link>
              <div className="hidden md:flex items-center gap-1 text-sm font-medium">
                <Link href="/airport-showers" className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  Showers
                </Link>
                <Link href="/airport-storage" className="px-4 py-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                  Storage
                </Link>
                <Link href="/airport-sleeping" className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  Sleeping
                </Link>
                <Link href="/airport-transport" className="px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                  Transport
                </Link>
                <div className="w-px h-6 bg-slate-200 mx-2" />
                <Link href="/about" className="px-3 py-2 text-slate-500 hover:text-slate-900 transition-colors text-xs">
                  About
                </Link>
              </div>
            </div>
            {/* Mobile Quick Access Bar */}
            <div className="md:hidden mt-4 -mx-6 px-6 pb-2">
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

        <div className="max-w-6xl mx-auto px-6 py-20">
          <header className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" aria-hidden="true" />
              Airport Facilities Worldwide
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Airport Facilities <span className="text-slate-300">|</span> <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" aria-label="Showers, Storage, Sleeping Pods & Transport">Showers, Storage, Sleeping Pods & Transport</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Find showers, luggage storage, sleeping pods and transport at airports worldwide. Real-time verified data for stress-free travel.
            </p>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Community Verified
              </span>
              <span className="w-1 h-1 bg-slate-400 rounded-full" />
              <span>Regular Updates</span>
            </div>
          </header>

          <section className="mb-16" role="search" aria-label="Airport search">
            <SearchBox />
          </section>

          <section className="mb-16" aria-labelledby="popular-airports-heading">
            <div className="flex items-center justify-between mb-8">
              <h2 id="popular-airports-heading" className="text-2xl font-bold text-slate-900">Popular Airports</h2>
              <Link href="/airports" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All →</Link>
            </div>
            {airports.length > 0 ? (
              <div className="space-y-4">
                {airports.map((airport) => (
                  <article key={airport.code} className="group bg-white rounded-2xl border border-slate-200/50 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      {/* 头部：机场信息 - 点击进入机场主页 */}
                      <Link href={`/airport/${airport.code.toLowerCase()}`} className="block mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                              <span className="text-2xl font-black text-slate-700">{airport.code}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">{airport.name}</h3>
                              <span className="text-sm text-slate-500 font-medium">{airport.city}, {airport.country}</span>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-2 text-slate-400 group-hover:text-blue-600 transition-colors">
                            <span className="text-sm font-medium">View Details</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                          </div>
                        </div>
                      </Link>

                      {/* 服务可用性指示器 - 点击进入对应服务页面 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Showers */}
                        {airport.showers ? (
                          <Link href={`/airport/${airport.code.toLowerCase()}/showers`} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-100 text-emerald-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Showers</span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              </div>
                              <div className="mt-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-emerald-500 w-full" />
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 opacity-50">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-200 text-slate-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Showers</span>
                              <div className="mt-1 h-1.5 bg-slate-200 rounded-full" />
                            </div>
                          </div>
                        )}

                        {/* Storage */}
                        {airport.storage ? (
                          <Link href={`/airport/${airport.code.toLowerCase()}/luggage-storage`} className="flex items-center gap-3 p-3 rounded-xl bg-sky-50/50 hover:bg-sky-100/50 transition-colors">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-sky-100 text-sky-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Storage</span>
                                <span className="w-2 h-2 rounded-full bg-sky-500" />
                              </div>
                              <div className="mt-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-sky-500 w-full" />
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 opacity-50">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-200 text-slate-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage</span>
                              <div className="mt-1 h-1.5 bg-slate-200 rounded-full" />
                            </div>
                          </div>
                        )}

                        {/* Sleeping */}
                        {airport.sleeping ? (
                          <Link href={`/airport/${airport.code.toLowerCase()}/sleeping`} className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/50 hover:bg-purple-100/50 transition-colors">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sleeping</span>
                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                              </div>
                              <div className="mt-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-purple-500 w-full" />
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 opacity-50">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-200 text-slate-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sleeping</span>
                              <div className="mt-1 h-1.5 bg-slate-200 rounded-full" />
                            </div>
                          </div>
                        )}

                        {/* Transport */}
                        {airport.transport ? (
                          <Link href={`/airport/${airport.code.toLowerCase()}/transport`} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 hover:bg-amber-100/50 transition-colors">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-100 text-amber-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Transport</span>
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                              </div>
                              <div className="mt-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-amber-500 w-full" />
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 opacity-50">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-200 text-slate-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transport</span>
                              <div className="mt-1 h-1.5 bg-slate-200 rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/50">
                <p className="text-slate-500">No airports found in database. Please run the seed script to add airports.</p>
                <code className="mt-4 inline-block px-4 py-2 bg-slate-100 rounded-lg text-sm">npx prisma db seed</code>
              </div>
            )}
          </section>

          <section aria-labelledby="services-heading">
            <h2 id="services-heading" className="text-2xl font-bold text-slate-900 mb-8">Airport Services</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Link href="/airport-showers" className="group bg-white rounded-2xl p-6 border border-slate-200/50 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Showers</h3>
                <p className="text-sm text-slate-500">Freshen up at airports</p>
              </Link>
              <Link href="/airport-storage" className="group bg-white rounded-2xl p-6 border border-slate-200/50 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Storage</h3>
                <p className="text-sm text-slate-500">Secure luggage lockers</p>
              </Link>
              <Link href="/airport-sleeping" className="group bg-white rounded-2xl p-6 border border-slate-200/50 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Sleeping</h3>
                <p className="text-sm text-slate-500">Pods & quiet zones</p>
              </Link>
              <Link href="/airport-transport" className="group bg-white rounded-2xl p-6 border border-slate-200/50 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Transport</h3>
                <p className="text-sm text-slate-500">City connections</p>
              </Link>
            </div>
          </section>

          <section className="mt-16 pt-16 border-t border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Why Travelers Trust Us</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Verified Data</h3>
                <p className="text-sm text-slate-600">Information confirmed by airport authorities and traveler community</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Real-time Updates</h3>
                <p className="text-sm text-slate-600">Database regularly refreshed with verified facility information</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Global Coverage</h3>
                <p className="text-sm text-slate-600">Major airports worldwide, from international hubs to regional terminals</p>
              </div>
            </div>
          </section>
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
