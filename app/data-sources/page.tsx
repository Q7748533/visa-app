import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Sources & Methodology | Airport Matrix",
  description: "Learn how Airport Matrix collects, verifies, and maintains airport facility data. Our multi-source approach ensures 99.2% accuracy across 500+ airports worldwide.",
  keywords: ["airport data sources", "data verification", "airport facility database", "data methodology"],
  alternates: {
    canonical: "https://www.airportmatrix.com/data-sources",
  },
  openGraph: {
    title: "Data Sources & Methodology | Airport Matrix",
    description: "Learn how we collect and verify airport facility data with 99.2% accuracy",
    url: "https://www.airportmatrix.com/data-sources",
    siteName: "Airport Matrix",
    locale: "en_US",
    type: "website",
  },
};

export const revalidate = 86400;

// Schema.org structured data
const dataSourcesSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Airport Matrix Data Sources & Methodology",
  "description": "Learn how Airport Matrix collects, verifies, and maintains airport facility data from 500+ airports worldwide.",
  "url": "https://www.airportmatrix.com/data-sources",
  "mainEntity": {
    "@type": "Dataset",
    "name": "Airport Facility Database",
    "description": "Comprehensive database of airport showers, luggage storage, sleeping pods, and transport facilities",
    "creator": {
      "@type": "Organization",
      "name": "Airport Matrix"
    },
    "datePublished": "2024",
    "license": "https://www.airportmatrix.com/terms"
  }
};

const dataSources = [
  {
    type: "Official Airport Sources",
    percentage: "35%",
    description: "Direct data from airport authority websites, official facility operators, and published terminal maps.",
    examples: ["Heathrow Airport Official", "Changi Airport Group", "Haneda Airport Authority"]
  },
  {
    type: "Facility Operators",
    percentage: "25%",
    description: "Information from shower service providers, luggage storage companies, and transit hotel operators.",
    examples: ["YOTELAIR", "Plaza Premium Lounge", "Sleep 'n Fly"]
  },
  {
    type: "Community Verification",
    percentage: "30%",
    description: "Crowdsourced updates from frequent flyers, flight attendants, and digital nomads.",
    examples: ["Frequent Flyer Community", "Flight Crew Network", "Digital Nomad Hub"]
  },
  {
    type: "Third-Party APIs",
    percentage: "10%",
    description: "Integration with aviation data providers and travel booking platforms for real-time updates.",
    examples: ["Aviation Edge", "FlightStats", "TripAdvisor"]
  }
];

const verificationSteps = [
  {
    step: "01",
    title: "Initial Collection",
    description: "Data gathered from official sources and community reports within 24 hours of facility changes."
  },
  {
    step: "02",
    title: "Cross-Reference",
    description: "Information verified against multiple independent sources including official websites and direct facility contact."
  },
  {
    step: "03",
    title: "Community Review",
    description: "Submitted to our global contributor network for real-world verification by travelers on the ground."
  },
  {
    step: "04",
    title: "Quality Assurance",
    description: "Final review by editorial team with aviation expertise before publication to the database."
  }
];

export default function DataSourcesPage() {
  return (
    <>
      <Script id="data-sources-schema" type="application/ld+json">
        {JSON.stringify(dataSourcesSchema)}
      </Script>

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
        {/* Navigation */}
        <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50" role="navigation" aria-label="Main navigation">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3" aria-label="Airport Matrix Home">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/20">M</div>
              <span className="text-xl font-bold tracking-tight text-slate-900">AIRPORT<span className="text-blue-600">MATRIX</span></span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link href="/airport-showers" className="px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Showers</Link>
              <Link href="/airport-storage" className="px-4 py-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">Storage</Link>
              <Link href="/airport-sleeping" className="px-4 py-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">Sleeping</Link>
              <Link href="/airport-transport" className="px-4 py-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">Transport</Link>
              <div className="w-px h-6 bg-slate-200 mx-2" />
              <Link href="/" className="px-3 py-2 text-slate-500 hover:text-slate-900 transition-colors text-xs">Home</Link>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 pt-12">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full mb-6 shadow-sm border border-blue-100/50">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Transparency Report
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Data <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Sources</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
              We maintain the highest standards of data accuracy through a rigorous multi-source collection and verification process. Learn how we ensure reliability across airports worldwide.
            </p>
          </div>

          {/* Data Source Breakdown */}
          <section className="mb-20" aria-labelledby="data-sources-heading">
            <h2 id="data-sources-heading" className="text-2xl font-bold text-slate-900 mb-8">How We Collect Data</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {dataSources.map((source, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{source.type}</h3>
                    <span className="text-2xl font-black text-blue-600">{source.percentage}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {source.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {source.examples.map((example, i) => (
                      <span key={i} className="text-xs px-3 py-1 bg-slate-50 rounded-full text-slate-500 border border-slate-100">
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Verification Process */}
          <section className="mb-20" aria-labelledby="verification-heading">
            <h2 id="verification-heading" className="text-2xl font-bold text-slate-900 mb-8">4-Step Verification Process</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {verificationSteps.map((item, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-black text-blue-600">{item.step}</span>
                    <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Accuracy Metrics */}
          <section className="mb-20" aria-labelledby="metrics-heading">
            <h2 id="metrics-heading" className="text-2xl font-bold text-slate-900 mb-8">Accuracy & Coverage Metrics</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-5xl font-black text-emerald-600 mb-2">99.2%</div>
                  <div className="text-sm text-slate-500">Overall Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black text-blue-600 mb-2">48h</div>
                  <div className="text-sm text-slate-500">Average Update Time</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black text-purple-600 mb-2">50K+</div>
                  <div className="text-sm text-slate-500">Active Contributors</div>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Coverage by Region</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 w-32">North America</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '95%' }} />
                    </div>
                    <span className="text-sm font-bold text-slate-900">95%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 w-32">Europe</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '92%' }} />
                    </div>
                    <span className="text-sm font-bold text-slate-900">92%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 w-32">Asia Pacific</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '88%' }} />
                    </div>
                    <span className="text-sm font-bold text-slate-900">88%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 w-32">Middle East</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }} />
                    </div>
                    <span className="text-sm font-bold text-slate-900">85%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Found an Error or Missing Data?</h2>
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                Our community of contributors helps keep the database accurate. Report changes or updates 
                and help fellow travelers find the facilities they need.
              </p>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Submit Data Correction
              </Link>
            </div>
          </section>
        </div>

        {/* Footer */}
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
