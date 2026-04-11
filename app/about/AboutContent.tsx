"use client";

import Link from "next/link";
import {
  ArrowLeft, ShieldCheck, BarChart3,
  Car, Globe, Star, Building2, CheckCircle2
} from "lucide-react";

export default function AboutContent() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">

      {/* Hero 宣言区 */}
      <div className="text-center mb-16 md:mb-20">
        <h1 className="text-3xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight px-2">
          We Help Travelers Find <br className="hidden md:block" />
          <span className="text-blue-600">Cheap Airport Parking</span>
        </h1>
        <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed px-4">
          AirportMatrix was built with a single mission: to expose the massive price difference between official terminal garages and verified off-site parking lots, so you stop overpaying every time you fly.
        </p>
      </div>

      {/* 我们的故事 */}
      <section aria-labelledby="why-expensive-heading" className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 mb-16">
        <h2 id="why-expensive-heading" className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" aria-hidden="true" />
          Why Official Airport Parking Costs $40&ndash;$70 Per Day
        </h2>
        <div className="space-y-4 text-slate-600 font-medium leading-relaxed max-w-none">
          <p>
            Have you ever returned from a relaxing vacation, only to be handed a $350 parking bill at the airport exit gate? You're not alone — and it's not your fault.
          </p>
          <p>
            Airports hold a monopoly on terminal parking. They know you are in a rush, dragging luggage, and stressed about catching your flight. So they charge <strong>drive-up rates of $40, $50, or $60 per day</strong> simply because they can.
          </p>
          <p>
            Just 5 minutes outside the airport property line, independent parking operators offer the exact same security — fenced lots, 24/7 monitoring, and free shuttles — for a fraction of the cost. The problem? Finding reliable options was a mess. That's why we built AirportMatrix.
          </p>
        </div>
      </section>

      {/* 核心价值观 */}
      <section aria-labelledby="commitment-heading" className="mb-20">
        <h2 id="commitment-heading" className="text-2xl font-bold text-slate-900 mb-8 text-center">
          Our Commitment to Every Traveler
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50/50 p-8 rounded-2xl border border-blue-100">
            <ShieldCheck className="w-10 h-10 text-blue-600 mb-4" aria-hidden="true" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Every Partner is Vetted</h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              We don't list just any dirt lot. Every off-site facility in our directory must have security fencing, 24/7 monitoring, and reliable shuttle services. If a lot drops below 4.5 stars, it's removed.
            </p>
          </div>
          <div className="bg-emerald-50/50 p-8 rounded-2xl border border-emerald-100">
            <BarChart3 className="w-10 h-10 text-emerald-600 mb-4" aria-hidden="true" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Rates Verified Daily</h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              Our data team cross-references official terminal rates against off-site lot prices at 15 US airports every single day. When a deal drops or a partner raises prices, we update our site immediately.
            </p>
          </div>
          <div className="bg-amber-50/50 p-8 rounded-2xl border border-amber-100">
            <Car className="w-10 h-10 text-amber-600 mb-4" aria-hidden="true" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Free Shuttles, Always</h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              Every parking lot in our directory includes complimentary 24/7 shuttle service to and from your terminal. No exceptions. If a partner removes their shuttle, they're delisted.
            </p>
          </div>
          <div className="bg-purple-50/50 p-8 rounded-2xl border border-purple-100">
            <Star className="w-10 h-10 text-purple-600 mb-4" aria-hidden="true" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Real Reviews Only</h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              We pull verified customer reviews from Google and partner platforms. We don't write our own testimonials. If a lot has a pattern of bad reviews, it doesn't appear in our top recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* 数据规模 */}
      <section aria-labelledby="numbers-heading" className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 text-center mb-16 shadow-xl">
        <h2 id="numbers-heading" className="text-2xl font-bold mb-10">AirportMatrix at a Glance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div>
            <div className="text-4xl md:text-5xl font-black text-blue-400 mb-2" aria-label="15 US airports covered">15</div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">US Airports Covered</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-emerald-400 mb-2" aria-label="up to 70 percent savings">70%</div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Max Savings vs Terminal</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-amber-400 mb-2" aria-label="shuttle available 24 hours a day 7 days a week">24/7</div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Shuttle Availability</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-purple-400 mb-2" aria-label="4.5 star minimum rating">4.5+</div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Min Partner Rating</div>
          </div>
        </div>
      </section>

      {/* 信任信号 & 声明 */}
      <section aria-labelledby="transparency-heading" className="border-t border-slate-200 pt-10">
        <h2 id="transparency-heading" className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-slate-400" aria-hidden="true" />
          Transparency &amp; Affiliate Disclosure
        </h2>
        <p className="text-slate-500 leading-relaxed mb-6">
          AirportMatrix is an independent travel data aggregator. We are not affiliated with, endorsed by, or sponsored by any official airport authority.
        </p>
        <p className="text-slate-500 leading-relaxed mb-8">
          To keep this site free for travelers, we may earn a commission when you book parking through our verified affiliate partners (such as SpotHero or Way.com) at no additional cost to you. This revenue helps us maintain accurate pricing data and improve our coverage across more airports.
        </p>

        <nav aria-label="Legal and contact links" className="flex flex-wrap gap-x-4 gap-y-3 text-sm font-bold">
          <Link href="/terms" className="text-blue-600 hover:text-blue-700 hover:underline min-h-[44px] flex items-center">Terms of Service</Link>
          <span className="text-slate-300 self-center" aria-hidden="true">•</span>
          <Link href="/privacy" className="text-blue-600 hover:text-blue-700 hover:underline min-h-[44px] flex items-center">Privacy Policy</Link>
          <span className="text-slate-300 self-center" aria-hidden="true">•</span>
          <Link href="/contact" className="text-blue-600 hover:text-blue-700 hover:underline min-h-[44px] flex items-center">Contact Us</Link>
          <span className="text-slate-300 self-center" aria-hidden="true">•</span>
          <Link href="/airports" className="text-blue-600 hover:text-blue-700 hover:underline min-h-[44px] flex items-center">Browse Airport Parking</Link>
        </nav>
      </section>

    </main>
  );
}