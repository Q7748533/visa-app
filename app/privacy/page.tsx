import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — AirportMatrix | How We Protect Your Data",
  description: "Read the AirportMatrix privacy policy. Learn how we collect data, use cookies, work with advertising partners, and protect your privacy when you compare airport parking.",
  keywords: [
    "airportmatrix privacy policy",
    "airport parking website privacy",
    "airportmatrix cookies",
    "third party parking affiliate privacy",
  ],
  openGraph: {
    title: "Privacy Policy — AirportMatrix",
    description: "How AirportMatrix collects, uses, and protects your data. Last updated April 2026.",
    type: "website",
  },
  alternates: {
    canonical: "https://airportmatrix.com/privacy",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LegalServicePage",
  name: "AirportMatrix Privacy Policy",
  description: "Privacy policy for AirportMatrix.com — an independent airport parking comparison website. Covers data collection, cookies, third-party links, and advertising partners.",
  url: "https://airportmatrix.com/privacy",
  lastReviewed: "2026-04-01",
  about: {
    "@type": "Thing",
    name: "Website privacy and data protection",
  },
  mainEntity: {
    "@type": "WebSite",
    name: "AirportMatrix",
    url: "https://airportmatrix.com",
  },
};

export default function PrivacyPage() {
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
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6" aria-hidden="true">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Privacy Policy
            </h1>
            <p className="text-slate-500 font-medium">
              Last Updated:{" "}
              <time dateTime="2026-04" className="text-slate-700 font-bold">April 2026</time>
            </p>
          </div>

          <article className="prose prose-slate prose-lg max-w-none text-slate-600">
            <p>
              At AirportMatrix.com, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you visit our website.
            </p>

            <h2 id="info-collect">1. Information We Collect</h2>
            <p>
              We are designed to be a low-friction tool. <strong>We do not require you to create an account, and we do not collect personally identifiable information (PII)</strong> such as your name, email address, or credit card numbers directly on our site.
            </p>
            <p>
              However, we do automatically collect certain non-personal data when you visit, including:
            </p>
            <ul>
              <li><strong>Log Data:</strong> Your IP address, browser type, operating system, referring URLs, and pages viewed.</li>
              <li><strong>Search Queries:</strong> The airport codes or cities you enter into our search box to help us improve our directory accuracy.</li>
            </ul>

            <h2 id="cookies">2. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand where our audience is coming from.
            </p>
            <ul>
              <li><strong>Analytics Cookies:</strong> We use tools like Google Analytics to measure website performance.</li>
              <li><strong>Affiliate Tracking Cookies:</strong> When you click on an outbound link to one of our parking partners, an affiliate tracking cookie is placed on your browser to attribute the referral to our website.</li>
            </ul>

            <h2 id="third-party">3. Third-Party Links and Booking Partners</h2>
            <p>
              Our website is an aggregator that links to external parking reservation platforms. Once you click a &ldquo;Book Now&rdquo; or similar button, you will be redirected to a third-party website.
            </p>
            <p>
              Please be aware that <strong>we do not control the privacy practices of these external sites.</strong> Any personal information or payment details you provide during the booking process are governed solely by the Privacy Policy of that specific partner platform. We encourage you to review their policies before completing a transaction.
            </p>

            <h2 id="advertising">4. Advertising Partners</h2>
            <p>
              We may use third-party advertising companies to serve ads when you visit our website. These companies may use aggregated information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
            </p>

            <h2 id="contact">5. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy, please contact us at:{" "}
              <a
                href="/contact"
                className="text-blue-600 hover:underline font-bold"
              >
                Visit our Contact Page
              </a>{" "}
              or reach us via our contact form.
            </p>
          </article>

          <nav aria-label="Related pages" className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap gap-4 text-sm font-bold">
            <Link href="/terms" className="text-blue-600 hover:underline min-h-[44px] flex items-center">Terms of Service</Link>
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