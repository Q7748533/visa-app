import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — AirportMatrix | User Agreement & Disclaimers",
  description: "Read the AirportMatrix terms of service. Understand our role as a travel comparison aggregator, affiliate disclosures, accuracy disclaimers, and limitation of liability.",
  keywords: [
    "airportmatrix terms of service",
    "airport parking comparison terms",
    "airportmatrix user agreement",
    "airportmatrix affiliate disclosure",
  ],
  openGraph: {
    title: "Terms of Service — AirportMatrix",
    description: "User terms, affiliate disclosure, and liability disclaimers for AirportMatrix.com. Last updated April 2026.",
    type: "website",
  },
  alternates: {
    canonical: "https://airportmatrix.com/terms",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LegalServicePage",
  name: "AirportMatrix Terms of Service",
  description: "Terms of service for AirportMatrix.com — an independent airport parking comparison aggregator. Covers service description, affiliate links, accuracy disclaimers, and limitation of liability.",
  url: "https://airportmatrix.com/terms",
  lastReviewed: "2026-04-01",
  mainEntity: {
    "@type": "WebSite",
    name: "AirportMatrix",
    url: "https://airportmatrix.com",
  },
};

export default function TermsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-slate-50 font-sans pb-24">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium min-h-[44px]">
              <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
              Home
            </Link>
            <div className="font-black text-xl tracking-tight text-slate-900">
              Airport<span className="text-blue-600">Matrix</span>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="mb-12">
            <div className="w-14 h-14 bg-slate-200 text-slate-700 rounded-2xl flex items-center justify-center mb-6" aria-hidden="true">
              <Scale className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Terms of Service
            </h1>
            <p className="text-slate-500 font-medium">
              Last Updated:{" "}
              <time dateTime="2026-04" className="text-slate-700 font-bold">April 2026</time>
            </p>
          </div>

          <article className="prose prose-slate prose-lg max-w-none text-slate-600">
            <p>
              Welcome to AirportMatrix.com. By accessing or using our website, you agree to be bound by these Terms of Service. Please read them carefully before using our service.
            </p>

            <h2 id="service">1. Description of Service</h2>
            <p>
              AirportMatrix (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates as an independent travel information aggregator and comparison engine. We provide information regarding airport parking options, rates, and availability at 15 major US airports. <strong>We do not own, operate, or manage any parking facilities.</strong>
            </p>

            <h2 id="affiliate">2. Affiliate Disclosure and Third-Party Bookings</h2>
            <p>
              Our website contains affiliate links to third-party booking platforms (such as SpotHero, Way.com, and ParkWhiz). When you click on these links and make a reservation, we may earn a referral commission at no additional cost to you.
            </p>
            <p>
              All bookings, payments, cancellations, and customer service inquiries are handled entirely by the respective third-party platform or the parking facility itself. We are not a party to your transaction.
            </p>

            <h2 id="accuracy">3. Accuracy of Information</h2>
            <p>
              While we strive to keep our pricing, shuttle schedules, and facility details as accurate as possible, prices in the travel industry are dynamic. We do not guarantee the accuracy, completeness, or currentness of the rates or information displayed on our site. Always verify the final price and terms on the booking partner&rsquo;s website before completing your transaction.
            </p>

            <h2 id="liability">4. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, AirportMatrix shall not be liable for any direct, indirect, incidental, or consequential damages arising from:
            </p>
            <ul>
              <li>Your use of or reliance on the information provided on this website.</li>
              <li>Vehicle damage, theft, break-ins, or loss of personal property occurring at any parking facility listed on our site.</li>
              <li>Missed flights or delays resulting from shuttle schedules, traffic, or inaccurate distance estimations.</li>
            </ul>
            <p>
              You park at your own risk and are subject to the terms and conditions of the specific parking lot operator.
            </p>

            <h2 id="intellectual-property">5. Intellectual Property</h2>
            <p>
              The content, design, and comparison algorithms on this website are the property of AirportMatrix.com. You may not scrape, copy, reproduce, or distribute our data without explicit written permission. All third-party trademarks remain the property of their respective owners.
            </p>

            <h2 id="changes">6. Changes to These Terms</h2>
            <p>
              We may update these Terms of Service from time to time. The &ldquo;Last Updated&rdquo; date at the top of this page reflects the most recent revision. Continued use of the site after any changes constitutes your acceptance of the revised terms.
            </p>
          </article>

          <nav aria-label="Related pages" className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap gap-4 text-sm font-bold">
            <Link href="/privacy" className="text-blue-600 hover:underline min-h-[44px] flex items-center">Privacy Policy</Link>
            <span className="text-slate-300 self-center" aria-hidden="true">•</span>
            <Link href="/about" className="text-blue-600 hover:underline min-h-[44px] flex items-center">About AirportMatrix</Link>
            <span className="text-slate-300 self-center" aria-hidden="true">•</span>
            <Link href="/contact" className="text-blue-600 hover:underline min-h-[44px] flex items-center">Contact Us</Link>
          </nav>
        </main>
      </div>
    </>
  );
}