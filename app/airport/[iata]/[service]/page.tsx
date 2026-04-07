import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { ChevronRight, ArrowLeft, ExternalLink, ShowerHead, Package, Moon, Bus } from 'lucide-react';

const serviceConfig: Record<string, {
  name: string;
  color: string;
  bg: string;
  borderColor: string;
  icon: React.ReactNode;
}> = {
  'luggage-storage': {
    name: 'Luggage Storage',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    borderColor: 'border-sky-200',
    icon: <Package className="w-4 h-4" />,
  },
  'showers': {
    name: 'Showers',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: <ShowerHead className="w-4 h-4" />,
  },
  'sleeping': {
    name: 'Sleeping Pods',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: <Moon className="w-4 h-4" />,
  },
  'transport': {
    name: 'City Transport',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: <Bus className="w-4 h-4" />,
  },
};

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ iata: string, service: string }> }): Promise<Metadata> {
  const { iata, service } = await params;
  const config = serviceConfig[service] || { name: service };

  const airport = await prisma.airport.findUnique({
    where: { iata: iata.toUpperCase() },
    select: { name: true, city: true, country: true, luggageData: true, showerData: true, sleepData: true, transitData: true }
  });

  const airportName = airport?.name || iata.toUpperCase();
  const canonicalUrl = `https://airportmatrix.com/airport/${iata.toLowerCase()}/${service}`;

  // 提取关键信息用于描述
  let descriptionPreview = '';
  if (airport) {
    const serviceData = service === 'luggage-storage' ? airport.luggageData :
                       service === 'showers' ? airport.showerData :
                       service === 'sleeping' ? airport.sleepData :
                       service === 'transport' ? airport.transitData : null;
    if (serviceData) {
      const parsed = JSON.parse(serviceData);
      const price = parsed.Price || parsed.price || parsed.Pricing;
      const location = parsed.Location || parsed.location || parsed.Locations;
      if (price) descriptionPreview += `Price: ${price}. `;
      if (location) descriptionPreview += `Location: ${location}. `;
    }
  }

  return {
    title: `${config.name} at ${airportName} (${iata.toUpperCase()})`,
    description: `${config.name} at ${airportName} (${iata.toUpperCase()}). ${descriptionPreview}Find prices, locations, and hours for travelers.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${config.name} at ${airportName} (${iata.toUpperCase()})`,
      description: `${config.name} information for ${airportName}. ${descriptionPreview}`,
      url: canonicalUrl,
      type: 'article',
      locale: 'en_US',
      siteName: 'Airport Matrix',
    },
    twitter: {
      card: 'summary',
      title: `${config.name} at ${airportName} (${iata.toUpperCase()})`,
      description: `${config.name} information for ${airportName}. ${descriptionPreview}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// 提取所有数据为键值对
function extractAllData(data: Record<string, unknown> | null): Array<{ key: string; value: string }> {
  if (!data) return [];

  return Object.entries(data).map(([key, value]) => ({
    key: String(key).replace(/_/g, ' '),
    value: String(value),
  }));
}

// 按航站楼分组数据
function groupByTerminal(data: Record<string, unknown> | null): Record<string, Array<{ key: string; value: string }>> {
  if (!data) return {};

  const grouped: Record<string, Array<{ key: string; value: string }>> = {};

  Object.entries(data).forEach(([key, value]) => {
    // 检测是否是航站楼键（如 "Terminal 2", "T3", "Terminal A" 等）
    const terminalMatch = key.match(/^(Terminal\s+[A-Z0-9]|T\d+|Terminal\s+\d+)/i);
    const terminal = terminalMatch ? terminalMatch[0] : 'General';

    if (!grouped[terminal]) {
      grouped[terminal] = [];
    }

    // 如果值是对象，展开它
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        grouped[terminal].push({
          key: String(subKey).replace(/_/g, ' '),
          value: String(subValue),
        });
      });
    } else {
      grouped[terminal].push({
        key: String(key).replace(/_/g, ' '),
        value: String(value),
      });
    }
  });

  return grouped;
}

// 提取摘要信息（用于卡片展示）
function extractSummary(data: Record<string, unknown> | null, service: string) {
  if (!data) return null;

  const dataStr = JSON.stringify(data).toLowerCase();
  const summary: {
    priceType: string;
    priceRange: string;
    hours: string;
    locations: string[];
    features: string[];
  } = {
    priceType: 'Paid',
    priceRange: '',
    hours: '',
    locations: [],
    features: [],
  };

  // 检测价格类型
  const isFree = dataStr.includes('free');
  const hasPaid = dataStr.includes('paid') || dataStr.includes('$') || dataStr.includes('price');
  
  if (isFree && !hasPaid) {
    summary.priceType = 'Free';
  } else if (isFree && hasPaid) {
    summary.priceType = 'Free & Paid';
  } else {
    summary.priceType = 'Paid';
  }

  // 提取价格范围
  const priceMatch = dataStr.match(/\$(\d+)(?:\s*-\s*\$?(\d+))?/);
  if (priceMatch) {
    if (priceMatch[2]) {
      summary.priceRange = `$${priceMatch[1]}-${priceMatch[2]}`;
    } else {
      summary.priceRange = `$${priceMatch[1]}`;
    }
  }

  // 提取营业时间
  if (dataStr.includes('24h') || dataStr.includes('24 hour') || dataStr.includes('24-hour')) {
    summary.hours = '24 Hours';
  } else if (dataStr.includes('6am') || dataStr.includes('6:00')) {
    summary.hours = '6AM - 11PM';
  }

  // 提取位置/航站楼
  const terminals: string[] = [];
  Object.keys(data).forEach(key => {
    const match = key.match(/^(Terminal\s+[A-Z0-9]|T\d+|Terminal\s+\d+)/i);
    if (match && !terminals.includes(match[0])) {
      terminals.push(match[0]);
    }
  });
  summary.locations = terminals.length > 0 ? terminals : ['Main Terminal'];

  // 提取特色功能
  if (service === 'showers') {
    if (dataStr.includes('private')) summary.features.push('Private');
    if (dataStr.includes('towel')) summary.features.push('Towels');
    if (dataStr.includes('toiletr')) summary.features.push('Toiletries');
  } else if (service === 'luggage-storage') {
    if (dataStr.includes('24')) summary.features.push('24/7');
    if (dataStr.includes('secure')) summary.features.push('Secure');
  }

  return summary;
}

export default async function AirportServicePage({ params }: { params: Promise<{ iata: string, service: string }> }) {
  const { iata, service } = await params;
  const config = serviceConfig[service];

  if (!config) notFound();

  const airport = await prisma.airport.findUnique({
    where: { iata: iata.toUpperCase() }
  });

  if (!airport) notFound();

  const serviceKeyMap: Record<string, string | null> = {
    'luggage-storage': airport.luggageData,
    'showers': airport.showerData,
    'sleeping': airport.sleepData,
    'transport': airport.transitData,
  };

  const rawData = serviceKeyMap[service];
  const data = rawData ? JSON.parse(rawData) : null;
  const allData = extractAllData(data);
  const terminalData = groupByTerminal(data);
  const terminals = Object.keys(terminalData);
  const hasMultipleTerminals = terminals.length > 1;
  const summary = extractSummary(data, service);

  const canonicalUrl = `https://airportmatrix.com/airport/${iata.toLowerCase()}/${service}`;

  // Schema.org 结构化数据
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${config.name} at ${airport.name}`,
    provider: {
      '@type': 'Airport',
      name: airport.name,
      iataCode: iata.toUpperCase(),
      address: {
        '@type': 'PostalAddress',
        addressLocality: airport.city,
        addressCountry: airport.country,
      },
    },
    areaServed: {
      '@type': 'Airport',
      name: airport.name,
      iataCode: iata.toUpperCase(),
    },
    url: canonicalUrl,
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
        name: airport.name,
        item: `https://airportmatrix.com/airport/${iata.toLowerCase()}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: config.name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <Script id="service-schema" type="application/ld+json">
        {JSON.stringify(serviceSchema)}
      </Script>
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </Script>

      <main className="min-h-screen bg-white">
        {/* Global Navigation - 统一全站风格 */}
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

        {/* Back to Airport Hub */}
        <div className="border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <Link
              href={`/airport/${iata.toLowerCase()}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {airport.name} ({iata.toUpperCase()})
            </Link>
          </div>
        </div>

        {/* Breadcrumb Header */}
        <header className="border-b border-slate-100 bg-slate-50/50">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Link href="/" className="hover:text-slate-600">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/airports" className="hover:text-slate-600">Airports</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/airport/${iata.toLowerCase()}`} className="hover:text-slate-600">{airport.name}</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900 font-medium">{config.name}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {config.name} at {airport.name} ({iata.toUpperCase()})
            </h1>
            <p className="text-lg text-slate-500">{airport.city}, {airport.country}</p>
          </div>

          {/* Summary Card - Quick Info */}
          {summary && (
            <div className={`mb-8 p-6 ${config.bg} rounded-2xl border ${config.borderColor}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className={`${config.color}`}>{config.icon}</span>
                <h2 className={`text-lg font-bold ${config.color}`}>Quick Overview</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Price Type */}
                <div className="bg-white/60 rounded-xl p-4">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Price Type</p>
                  <p className={`text-lg font-bold ${
                    summary.priceType === 'Free' ? 'text-emerald-600' :
                    summary.priceType === 'Free & Paid' ? 'text-blue-600' :
                    'text-purple-600'
                  }`}>
                    {summary.priceType}
                  </p>
                </div>
                {/* Price Range */}
                {summary.priceRange && (
                  <div className="bg-white/60 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Price Range</p>
                    <p className="text-lg font-bold text-slate-900">{summary.priceRange}</p>
                  </div>
                )}
                {/* Hours */}
                {summary.hours && (
                  <div className="bg-white/60 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Hours</p>
                    <p className="text-lg font-bold text-slate-900">{summary.hours}</p>
                  </div>
                )}
                {/* Locations */}
                <div className="bg-white/60 rounded-xl p-4">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-lg font-bold text-slate-900">
                    {summary.locations.length > 2 
                      ? `${summary.locations.slice(0, 2).join(', ')} +${summary.locations.length - 2}`
                      : summary.locations.join(', ')}
                  </p>
                </div>
              </div>
              {/* Features */}
              {summary.features.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {summary.features.map((feature, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/80 text-slate-700 text-sm font-medium rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

        {/* Service Details Section */}
        <section aria-labelledby="service-details-heading">
          <h2 id="service-details-heading" className="text-lg font-bold text-slate-900 mb-4">
            {config.name} Details
          </h2>

        {/* Terminal Tabs - Only show if multiple terminals */}
        {hasMultipleTerminals && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {terminals.map((terminal) => (
                <a
                  key={terminal}
                  href={`#terminal-${terminal.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  {terminal}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Data by Terminal */}
        {allData.length > 0 ? (
          <div className="space-y-6">
            {hasMultipleTerminals ? (
              // Multiple terminals - show grouped
              terminals.map((terminal) => (
                <div
                  key={terminal}
                  id={`terminal-${terminal.toLowerCase().replace(/\s+/g, '-')}`}
                  className="border border-slate-200 rounded-lg overflow-hidden scroll-mt-24"
                >
                  {/* Terminal Header */}
                  <div className={`px-6 py-3 ${config.bg} border-b ${config.borderColor}`}>
                    <h3 className={`font-bold ${config.color}`}>{terminal}</h3>
                  </div>
                  {/* Terminal Data Table */}
                  <table className="w-full">
                    <tbody className="divide-y divide-slate-100">
                      {terminalData[terminal].map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 w-1/3">
                            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                              {item.key}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-base text-slate-900">{item.value}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              // Single terminal or general data - show simple table
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-slate-100">
                    {allData.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 w-1/3">
                          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                            {item.key}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-base text-slate-900">{item.value}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-lg">
            <p className="text-slate-400">No data available</p>
          </div>
        )}
        </section>

        {/* Actions */}
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link
            href={`/airport/${iata.toLowerCase()}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {iata.toUpperCase()} Hub
          </Link>

          <Link
            href="/airports"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            All Airports
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Other Services */}
        <div className="mt-16 pt-8 border-t border-slate-100">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            Other Services at {iata.toUpperCase()}
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(serviceConfig).map(([key, cfg]) => (
              key !== service && (
                <Link
                  key={key}
                  href={`/airport/${iata.toLowerCase()}/${key}`}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${cfg.bg} ${cfg.color} ${cfg.borderColor} hover:opacity-80`}
                >
                  {cfg.name}
                </Link>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-20">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <span>© 2024-2026 Airport Matrix</span>
            <div className="flex gap-6">
              <Link href="/about" className="hover:text-slate-600">About</Link>
              <Link href="/data-sources" className="hover:text-slate-600">Data Sources</Link>
              <Link href="/privacy" className="hover:text-slate-600">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-600">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}
