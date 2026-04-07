import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Airport Matrix",
  description: "Airport Matrix privacy policy. Learn how we collect, use, and protect your personal data in compliance with GDPR and CCPA.",
  keywords: ["privacy policy", "GDPR", "CCPA", "data protection", "cookie policy"],
  alternates: {
    canonical: "https://www.airportmatrix.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Airport Matrix",
    description: "Learn how we collect, use, and protect your personal data",
    url: "https://www.airportmatrix.com/privacy",
    siteName: "Airport Matrix",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Airport Matrix",
    description: "Learn how we collect, use, and protect your personal data in compliance with GDPR and CCPA.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 86400;

// Schema.org structured data
const privacyPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Privacy Policy - Airport Matrix",
  "description": "Airport Matrix privacy policy. Learn how we collect, use, and protect your personal data in compliance with GDPR and CCPA.",
  "url": "https://www.airportmatrix.com/privacy",
  "mainEntity": {
    "@type": "PrivacyPolicy",
    "name": "Airport Matrix Privacy Policy",
    "datePublished": "2024-01-01",
    "dateModified": "2024-01-01"
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.airportmatrix.com/" },
    { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": "https://www.airportmatrix.com/privacy" }
  ]
};

export default function PrivacyPage() {
  return (
    <>
      <Script id="privacy-page-schema" type="application/ld+json">
        {JSON.stringify(privacyPageSchema)}
      </Script>
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
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

        <div className="max-w-4xl mx-auto px-6 pt-12">
          {/* Header */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full mb-6 shadow-sm border border-blue-100/50">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Legal
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Privacy <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-lg text-slate-600">
              Last updated: January 1, 2024 | Effective Date: January 1, 2024
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-16">
            <p className="text-slate-700 leading-relaxed mb-6">
              Airport Matrix (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website www.airportmatrix.com.
            </p>
            <p className="text-slate-700 leading-relaxed">
              We comply with the General Data Protection Regulation (GDPR) for users in the European Union and the California Consumer Privacy Act (CCPA) for California residents.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-16" aria-labelledby="info-collect-heading">
            <h2 id="info-collect-heading" className="text-2xl font-bold text-slate-900 mb-6">Information We Collect</h2>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Personal Information</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  We may collect personal information that you voluntarily provide when using our contact form or subscribing to updates:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Message content</li>
                  <li>IP address</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Automatically Collected Information</h3>
                <p className="text-slate-600 leading-relaxed">
                  When you visit our website, we automatically collect certain information about your device and browsing activity, including browser type, operating system, referring URLs, and pages viewed.
                </p>
              </div>
            </div>
          </section>

          {/* Google AdSense & Analytics */}
          <section className="mb-16" aria-labelledby="google-services-heading">
            <h2 id="google-services-heading" className="text-2xl font-bold text-slate-900 mb-6">Google AdSense & Analytics</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed mb-4">
                We use Google AdSense to display advertisements and Google Analytics 4 (GA4) to analyze website traffic. These services may use cookies and similar technologies to collect and process data.
              </p>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Google AdSense</h3>
              <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
                <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits</li>
                <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and other sites on the Internet</li>
                <li>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">Google Ads Settings</a></li>
              </ul>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Google Analytics 4</h3>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>We use GA4 to understand how visitors interact with our website</li>
                <li>GA4 collects data such as page views, session duration, and user interactions</li>
                <li>You can opt out by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">Google Analytics Opt-out Browser Add-on</a></li>
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-16" aria-labelledby="how-use-heading">
            <h2 id="how-use-heading" className="text-2xl font-bold text-slate-900 mb-6">How We Use Your Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Primary Uses</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Respond to your inquiries</li>
                  <li>Improve website functionality</li>
                  <li>Analyze usage patterns</li>
                  <li>Display relevant advertisements</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Legal Basis (GDPR)</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Consent for cookies and ads</li>
                  <li>Legitimate interest for analytics</li>
                  <li>Contract performance for contact requests</li>
                  <li>Legal compliance</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-16" aria-labelledby="cookies-heading">
            <h2 id="cookies-heading" className="text-2xl font-bold text-slate-900 mb-6">Cookies & Tracking Technologies</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your browsing experience. You can control cookies through your browser settings.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="pb-3">Cookie Type</th>
                      <th className="pb-3">Purpose</th>
                      <th className="pb-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    <tr className="border-b border-slate-100">
                      <td className="py-3">Essential</td>
                      <td className="py-3">Website functionality</td>
                      <td className="py-3">Session</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3">Analytics (GA4)</td>
                      <td className="py-3">Traffic analysis</td>
                      <td className="py-3">2 years</td>
                    </tr>
                    <tr>
                      <td className="py-3">Advertising</td>
                      <td className="py-3">Personalized ads</td>
                      <td className="py-3">13 months</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-16" aria-labelledby="rights-heading">
            <h2 id="rights-heading" className="text-2xl font-bold text-slate-900 mb-6">Your Privacy Rights</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">GDPR Rights (EU)</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Right to access</li>
                  <li>Right to rectification</li>
                  <li>Right to erasure</li>
                  <li>Right to restrict processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">CCPA Rights (California)</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Right to know</li>
                  <li>Right to delete</li>
                  <li>Right to opt-out of sale</li>
                  <li>Right to non-discrimination</li>
                </ul>
              </div>
            </div>
            <p className="text-slate-600 mt-6">
              To exercise your rights, contact us at <a href="mailto:privacy@airportmatrix.com" className="text-blue-600 hover:text-blue-500">privacy@airportmatrix.com</a>.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-16" aria-labelledby="security-heading">
            <h2 id="security-heading" className="text-2xl font-bold text-slate-900 mb-6">Data Security</h2>
            <p className="text-slate-600 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          {/* Third-Party Links */}
          <section className="mb-16" aria-labelledby="third-party-heading">
            <h2 id="third-party-heading" className="text-2xl font-bold text-slate-900 mb-6">Third-Party Links</h2>
            <p className="text-slate-600 leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          {/* Children&apos;s Privacy */}
          <section className="mb-16" aria-labelledby="children-heading">
            <h2 id="children-heading" className="text-2xl font-bold text-slate-900 mb-6">Children&apos;s Privacy</h2>
            <p className="text-slate-600 leading-relaxed">
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-16" aria-labelledby="changes-heading">
            <h2 id="changes-heading" className="text-2xl font-bold text-slate-900 mb-6">Changes to This Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact */}
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-2xl font-bold text-slate-900 mb-6">Contact Us</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="text-slate-600 space-y-2">
                <li>Email: <a href="mailto:privacy@airportmatrix.com" className="text-blue-600 hover:text-blue-500">privacy@airportmatrix.com</a></li>
                <li>Address: Airport Matrix, Privacy Department</li>
              </ul>
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
