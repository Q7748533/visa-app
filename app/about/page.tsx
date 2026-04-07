import Link from "next/link";
import Script from "next/script";

const schema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Airport Matrix",
  "description": "Learn about Airport Matrix - the curated airport facility database built by frequent flyers and aviation professionals.",
  "url": "https://www.airportmatrix.com/about"
};

export default function AboutPage() {
  return (
    <>
      <Script id="schema" type="application/ld+json">
        {JSON.stringify(schema)}
      </Script>

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50" role="navigation" aria-label="Main navigation">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3" aria-label="Airport Matrix Home">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/20">
                M
              </div>
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

        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full mb-6">
              About Us
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Building the <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Future</span> of Airport Data
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
              We&apos;re building the most comprehensive, accurate, and up-to-date database of airport facilities worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-lg shadow-slate-200/50">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed">
                Every traveler has faced the frustration of arriving at an unfamiliar airport with no idea where to find basic amenities. Airport Matrix was born from these exact frustrations. We set out to create a single, reliable source of truth for airport infrastructure information.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-lg shadow-slate-200/50">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Team</h2>
              <p className="text-slate-600 leading-relaxed">
                Our core team includes former airline staff, aviation consultants, and frequent business travelers with deep knowledge of airport operations worldwide. Supported by a network of 50,000+ contributors.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-lg shadow-slate-200/50 mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Data Sources & Verification</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Official Sources</h3>
                <p className="text-sm text-slate-600">Direct partnerships with airport authorities for authoritative information.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Real-time Updates</h3>
                <p className="text-sm text-slate-600">Crowdsourced verification with changes confirmed within 48 hours.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Quality Assurance</h3>
                <p className="text-sm text-slate-600">Multi-layer verification combining automated checks with human review.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-center text-white">
              <div className="text-4xl font-black mb-2">500+</div>
              <div className="text-sm opacity-90">Airports Covered</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-center text-white">
              <div className="text-4xl font-black mb-2">50K+</div>
              <div className="text-sm opacity-90">Contributors</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-center text-white">
              <div className="text-4xl font-black mb-2">24h</div>
              <div className="text-sm opacity-90">Update Cycle</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-center text-white">
              <div className="text-4xl font-black mb-2">99.2%</div>
              <div className="text-sm opacity-90">Accuracy Rate</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-lg shadow-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Get in Touch</h2>
            <p className="text-slate-600 mb-6">Have questions or feedback? We&apos;d love to hear from you.</p>
            <a href="mailto:hello@airportmatrix.com" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-600/25 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              hello@airportmatrix.com
            </a>
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
