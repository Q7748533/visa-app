import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, Mail, MessageSquare,
  HelpCircle, AlertCircle, CheckCircle2
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact AirportMatrix — Report Pricing Errors & Partnership Inquiries",
  description: "Contact AirportMatrix for pricing error reports, parking lot partnership inquiries, press requests, or general questions about our airport parking comparison service.",
  keywords: [
    "contact airportmatrix",
    "airportmatrix support",
    "report airport parking pricing error",
    "airport parking partnership",
    "parking lot listing airportmatrix",
  ],
  openGraph: {
    title: "Contact AirportMatrix — Pricing Reports & Partnerships",
    description: "Reach out to report incorrect parking rates, inquire about listing your parking lot, or ask general questions about AirportMatrix.",
    type: "website",
  },
  alternates: {
    canonical: "https://airportmatrix.com/contact",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AirportMatrix",
  url: "https://airportmatrix.com",
  description: "Independent travel data aggregator helping US travelers find and compare verified off-site airport parking lots vs official terminal garage rates.",
  contactPoint: {
    "@type": "ContactPage",
    url: "https://airportmatrix.com/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

      <div className="min-h-screen bg-slate-50 font-sans pb-24">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium min-h-[44px]">
              <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
              Home
            </Link>
            <div className="font-black text-xl tracking-tight text-slate-900">
              Airport<span className="text-blue-600">Matrix</span>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20">

          {/* 头部区域 */}
          <div className="text-center mb-14 md:mb-16">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6" aria-hidden="true">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 px-2">
              Contact AirportMatrix
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Have a pricing error to report, a parking lot to list, or a partnership idea? Drop us a message and we typically respond within 48 hours.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-8 lg:gap-12">

            {/* 左侧：联系信息 */}
            <div className="md:col-span-5 space-y-6">

              {/* 客服免责 */}
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                <h2 className="text-base font-bold text-amber-900 flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
                  Booking Issues? Contact Your Provider Directly
                </h2>
                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                  AirportMatrix is a comparison engine. We don&rsquo;t manage reservations. For cancellations, refunds, or shuttle questions, contact{" "}
                  <strong>SpotHero</strong>, <strong>Way.com</strong>, or the parking facility directly.
                </p>
              </div>

              {/* 联系信息卡片 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Reach Us By Email</h2>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <Mail className="w-6 h-6 text-blue-600 mr-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="font-bold text-slate-900 mb-1">General Inquiries</div>
                      <div className="text-sm text-slate-500 mb-2">Questions about our data, coverage, or how the matrix works.</div>
                      <a
                        href="/contact?subject=general"
                        className="text-sm text-blue-600 hover:underline font-bold break-all"
                      >
                        hello@airportmatrix.com
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <HelpCircle className="w-6 h-6 text-emerald-600 mr-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="font-bold text-slate-900 mb-1">Report Incorrect Pricing</div>
                      <div className="text-sm text-slate-500 mb-2">Spotted a rate that looks wrong? We verify all reports within 24 hours.</div>
                      <a
                        href="/contact?subject=pricing"
                        className="text-sm text-blue-600 hover:underline font-bold break-all"
                      >
                        pricing@airportmatrix.com
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-purple-600 mr-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="font-bold text-slate-900 mb-1">Partnerships &amp; Lot Listings</div>
                      <div className="text-sm text-slate-500 mb-2">Parking operators: get listed on AirportMatrix to reach thousands of travelers monthly.</div>
                      <a
                        href="/contact?subject=partnership"
                        className="text-sm text-blue-600 hover:underline font-bold break-all"
                      >
                        partners@airportmatrix.com
                      </a>
                    </div>
                  </li>
                </ul>
              </div>

              {/* FAQ Mini */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-4">Common Questions</h2>
                <ul className="space-y-3" aria-label="Frequently asked contact questions">
                  {[
                    ["How fast do you respond?", "Typically within 48 hours on business days."],
                    ["Do you handle booking issues?", "No — please contact your booking provider directly."],
                    ["Can I list my lot for free?", "Reach out to partners@airportmatrix.com to discuss options."],
                  ].map(([q, a]) => (
                    <li key={q} className="text-sm">
                      <div className="font-bold text-slate-800">{q}</div>
                      <div className="text-slate-500">{a}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 右侧：表单 */}
            <div className="md:col-span-7">
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Send us a message</h2>

                <form
                  action="/contact"
                  method="POST"
                  className="space-y-6"
                  noValidate
                  aria-label="Contact AirportMatrix form"
                >
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                      <input
                        id="first-name"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        placeholder="Jane"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[48px]"
                      />
                    </div>
                    <div>
                      <label htmlFor="last-name" className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                      <input
                        id="last-name"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Doe"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[48px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                      Email Address <span className="text-red-500" aria-label="required">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="jane@example.com"
                      required
                      aria-required="true"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[48px]"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-bold text-slate-700 mb-2">Topic</label>
                    <select
                      id="subject"
                      name="subject"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer min-h-[48px]"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="pricing">Report Incorrect Pricing</option>
                      <option value="partnership">Business Partnership / Add My Lot</option>
                      <option value="bug">Website Bug / Technical Issue</option>
                      <option value="press">Press Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-2">
                      Message <span className="text-red-500" aria-label="required">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="How can we help you? Be specific — screenshots of incorrect prices help us fix issues faster."
                      required
                      aria-required="true"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y min-h-[120px]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md active:scale-95 flex justify-center items-center gap-2 min-h-[52px]"
                    aria-label="Send message to AirportMatrix"
                  >
                    <MessageSquare className="w-5 h-5" aria-hidden="true" />
                    Send Message
                  </button>

                  <p className="text-xs text-slate-500 text-center font-medium" role="status" aria-live="polite">
                    We aim to respond to all inquiries within 48 business hours.
                  </p>
                </form>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}