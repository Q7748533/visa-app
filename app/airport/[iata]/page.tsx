import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { ChevronRight } from 'lucide-react';
import SearchBox from '@/app/components/SearchBox';

// 服务配置
const serviceMeta = [
  { 
    id: 'showers', 
    name: 'Showers', 
    icon: 'M19 14l-7 7m0 0l-7-7m7 7V3', 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-100',
    hoverBorder: 'hover:border-emerald-300'
  },
  { 
    id: 'sleeping', 
    name: 'Sleeping Pods', 
    icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z', 
    color: 'text-purple-600', 
    bg: 'bg-purple-50', 
    border: 'border-purple-100',
    hoverBorder: 'hover:border-purple-300'
  },
  { 
    id: 'luggage-storage', 
    name: 'Luggage Storage', 
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', 
    color: 'text-sky-600', 
    bg: 'bg-sky-50', 
    border: 'border-sky-100',
    hoverBorder: 'hover:border-sky-300'
  },
  { 
    id: 'transport', 
    name: 'City Transport', 
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', 
    color: 'text-amber-600', 
    bg: 'bg-amber-50', 
    border: 'border-amber-100',
    hoverBorder: 'hover:border-amber-300'
  },
];

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ iata: string }> }) {
  const { iata } = await params;
  const airport = await prisma.airport.findUnique({ 
    where: { iata: iata.toUpperCase() },
    select: { name: true, city: true, country: true }
  });
  
  if (!airport) {
    return {
      title: 'Airport Not Found | Airport Matrix',
    };
  }

  const canonicalUrl = `https://airportmatrix.com/airport/${iata.toLowerCase()}`;

  return {
    title: `${airport.name} (${iata.toUpperCase()}) - Facilities & Services | Airport Matrix`,
    description: `Find showers, luggage storage, sleeping pods, and transport at ${airport.name} (${iata.toUpperCase()}). Complete facility guide for ${airport.city}, ${airport.country}.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${airport.name} (${iata.toUpperCase()}) - Airport Facilities`,
      description: `Showers, storage & sleeping pods at ${airport.name}. Real-time facility data for travelers.`,
      url: canonicalUrl,
      type: 'website',
      locale: 'en_US',
      siteName: 'Airport Matrix',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${airport.name} (${iata.toUpperCase()}) - Airport Facilities`,
      description: `Find showers, luggage storage & sleeping pods at ${airport.name}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AirportHubPage({ params }: { params: Promise<{ iata: string }> }) {
  const { iata } = await params;
  const airport = await prisma.airport.findUnique({ 
    where: { iata: iata.toUpperCase() },
    select: { 
      iata: true,
      name: true, 
      city: true, 
      country: true,
      showerData: true,
      sleepData: true,
      luggageData: true,
      transitData: true,
    }
  });

  if (!airport) notFound();

  const availability = {
    'showers': !!airport.showerData,
    'sleeping': !!airport.sleepData,
    'luggage-storage': !!airport.luggageData,
    'transport': !!airport.transitData,
  };

  const availableCount = Object.values(availability).filter(Boolean).length;

  // Schema.org 结构化数据
  const airportSchema = {
    '@context': 'https://schema.org',
    '@type': 'Airport',
    name: airport.name,
    iataCode: iata.toUpperCase(),
    address: {
      '@type': 'PostalAddress',
      addressLocality: airport.city,
      addressCountry: airport.country,
    },
    url: `https://airportmatrix.com/airport/${iata.toLowerCase()}`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://airportmatrix.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Airports',
        item: 'https://airportmatrix.com/airports',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${airport.name} (${iata.toUpperCase()})`,
        item: `https://airportmatrix.com/airport/${iata.toLowerCase()}`,
      },
    ],
  };

  return (
    <>
      <Script id="airport-schema" type="application/ld+json">
        {JSON.stringify(airportSchema)}
      </Script>
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </Script>
      
      <main className="min-h-screen bg-slate-50/50">
        {/* Navigation */}
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
            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-1">
              <Link href="/airport-showers" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" aria-label="Showers">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Link>
              <Link href="/airport-storage" className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" aria-label="Storage">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </Link>
              <Link href="/airport-sleeping" className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" aria-label="Sleeping">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </Link>
              <Link href="/airport-transport" className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" aria-label="Transport">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </Link>
            </div>
          </div>
        </nav>

        {/* Breadcrumb */}
        <nav className="bg-white border-b border-slate-100" aria-label="Breadcrumb">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors">Home</Link>
              </li>
              <li><ChevronRight className="w-4 h-4 text-slate-300" /></li>
              <li>
                <Link href="/airports" className="text-slate-500 hover:text-blue-600 transition-colors">Airports</Link>
              </li>
              <li><ChevronRight className="w-4 h-4 text-slate-300" /></li>
              <li className="text-slate-900 font-medium" aria-current="page">
                {airport.name} ({iata.toUpperCase()})
              </li>
            </ol>
          </div>
        </nav>

        {/* Header */}
        <div className="bg-white border-b border-slate-200 pt-16 sm:pt-20 pb-10 sm:pb-12 px-4 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <span className="text-xs sm:text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter mb-4 inline-block">
              Airport Hub
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
              {airport.name} <span className="text-slate-300">/</span> {iata.toUpperCase()}
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 font-bold">{airport.city}, {airport.country}</p>
            
            {/* Available Services Count */}
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-bold text-slate-600">{availableCount} Services Available</span>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
          <div className="mb-8">
            <SearchBox />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 sm:mb-8 text-center">
            Available Services at {airport.name}
          </h2>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {serviceMeta.map((service) => {
              const isAvail = availability[service.id as keyof typeof availability];

              const cardContent = (
                <>
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 transition-transform ${isAvail ? 'group-hover:scale-110 bg-white shadow-sm' : 'bg-slate-200'}`}>
                    <svg className={`w-7 h-7 sm:w-8 sm:h-8 ${isAvail ? service.color : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={service.icon} />
                    </svg>
                  </div>
                  <h3 className={`text-lg sm:text-xl font-black tracking-tight ${isAvail ? 'text-slate-900' : 'text-slate-500'}`}>
                    {service.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    {isAvail ? 'Available Now' : 'No Data Yet'}
                  </p>
                  {isAvail && (
                     <div className="mt-4 sm:mt-6 w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-blue-600 transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                     </div>
                  )}
                </>
              );

              return isAvail ? (
                <Link
                  key={service.id}
                  href={`/airport/${iata.toLowerCase()}/${service.id}`}
                  className={`group relative p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center text-center ${service.bg} ${service.border} ${service.hoverBorder} hover:shadow-xl hover:-translate-y-1`}
                >
                  {cardContent}
                </Link>
              ) : (
                <div
                  key={service.id}
                  className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed flex flex-col items-center text-center"
                >
                  {cardContent}
                </div>
              );
            })}
          </div>

          {/* Affiliate Placeholder - Hidden until affiliate program ready */}
          {/*
          <div className="mt-8 sm:mt-12 p-6 sm:p-8 bg-slate-900 rounded-2xl sm:rounded-[2.5rem] text-white text-center">
              <h3 className="text-xl sm:text-2xl font-black mb-2">Need a hotel near {iata.toUpperCase()}?</h3>
              <p className="text-slate-400 mb-4 sm:mb-6 text-sm">Get up to 20% off on transit hotels and lounges.</p>
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all text-sm sm:text-base">
                Check Deals →
              </button>
          </div>
          */}

          {/* Back to All Airports */}
          <div className="mt-8 text-center">
            <Link 
              href="/airports" 
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Airports
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white" role="contentinfo">
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
