import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Airport Matrix",
  description: "Get in touch with Airport Matrix. Report data errors, suggest improvements, or partner with us. We typically respond within 24-48 hours.",
  keywords: ["contact airport matrix", "report data error", "airport data partnership", "media inquiry"],
  alternates: {
    canonical: "https://www.airportmatrix.com/contact",
  },
  openGraph: {
    title: "Contact Us | Airport Matrix",
    description: "Get in touch with Airport Matrix. Report data errors or partner with us.",
    url: "https://www.airportmatrix.com/contact",
    siteName: "Airport Matrix",
    locale: "en_US",
    type: "website",
  },
};

export const revalidate = 86400;

// Schema.org structured data
const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Airport Matrix",
  "description": "Get in touch with Airport Matrix. Report data errors, suggest improvements, or partner with us.",
  "url": "https://www.airportmatrix.com/contact",
  "mainEntity": {
    "@type": "Organization",
    "name": "Airport Matrix",
    "url": "https://www.airportmatrix.com",
    "email": "hello@airportmatrix.com",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "hello@airportmatrix.com",
      "availableLanguage": ["English"]
    }
  }
};

const contactReasons = [
  {
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    title: "Report Data Error",
    description: "Found incorrect facility information? Help us fix it within 48 hours."
  },
  {
    icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Missing Airport",
    description: "Suggest an airport to add to our database. We prioritize based on traveler demand."
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    title: "Partner With Us",
    description: "Airport operators and facility providers: collaborate on accurate data sharing."
  },
  {
    icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
    title: "Media Inquiry",
    description: "Press, bloggers, and researchers: request data insights or interviews."
  }
];

const faqs = [
  {
    question: "How quickly do you respond to inquiries?",
    answer: "We typically respond within 24-48 hours during business days. Data error reports are prioritized and often resolved within 24 hours."
  },
  {
    question: "Do you offer data licensing?",
    answer: "We provide curated airport facility datasets for travel apps, research institutions, and aviation companies. Contact us for details."
  }
];

export default function ContactPage() {
  return (
    <>
      <Script id="contact-page-schema" type="application/ld+json">
        {JSON.stringify(contactPageSchema)}
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
              We are here to help
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Contact <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Us</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
              Have a question, found an error, or want to collaborate? We are here to help travelers navigate airports worldwide.
            </p>
          </div>

          {/* Contact Reasons */}
          <section className="mb-20" aria-labelledby="contact-reasons-heading">
            <h2 id="contact-reasons-heading" className="text-2xl font-bold text-slate-900 mb-8">How Can We Help?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {contactReasons.map((reason, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm hover:border-blue-300 transition-colors">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 border border-blue-100">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={reason.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{reason.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Form */}
          <section className="mb-20" aria-labelledby="contact-form-heading">
            <h2 id="contact-form-heading" className="text-2xl font-bold text-slate-900 mb-8">Send Us a Message</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select a topic</option>
                    <option value="data-error">Report Data Error</option>
                    <option value="missing-airport">Missing Airport</option>
                    <option value="partnership">Partnership</option>
                    <option value="media">Media Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    placeholder="Describe your inquiry in detail..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </section>

          {/* Direct Contact */}
          <section className="mb-20" aria-labelledby="direct-contact-heading">
            <h2 id="direct-contact-heading" className="text-2xl font-bold text-slate-900 mb-8">Direct Contact</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <a
                href="mailto:hello@airportmatrix.com"
                className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200/60 p-6 hover:border-blue-300 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Email</div>
                  <div className="text-slate-900 font-semibold">hello@airportmatrix.com</div>
                </div>
              </a>
              <a
                href="https://twitter.com/airportmatrix"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200/60 p-6 hover:border-blue-300 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Twitter</div>
                  <div className="text-slate-900 font-semibold">@airportmatrix</div>
                </div>
              </a>
            </div>
          </section>

          {/* FAQ */}
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{faq.question}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
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
