import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Airport Matrix",
  description: "Airport Matrix Terms of Service. Read our terms and conditions for using our airport facility database and website.",
};

export const revalidate = 86400;

const termsPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Terms of Service - Airport Matrix",
  "description": "Airport Matrix Terms of Service. Read our terms and conditions for using our airport facility database and website.",
  "url": "https://www.airportmatrix.com/terms",
  "mainEntity": {
    "@type": "TermsOfService",
    "name": "Airport Matrix Terms of Service",
    "datePublished": "2024-01-01",
    "dateModified": "2024-01-01"
  }
};

export default function TermsPage() {
  return (
    <>
      <Script id="terms-page-schema" type="application/ld+json">
        {JSON.stringify(termsPageSchema)}
      </Script>

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
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

        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 text-sm font-semibold rounded-full mb-6">Legal</div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Terms of <span className="text-blue-600">Service</span></h1>
            <p className="text-slate-500">Last updated: January 1, 2024 | Effective Date: January 1, 2024</p>
          </div>

          <section className="mb-12">
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed mb-4">Welcome to Airport Matrix. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our website located at www.airportmatrix.com (the &quot;Service&quot;), operated by Airport Matrix (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).</p>
              <p className="text-slate-600 leading-relaxed">By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.</p>
            </div>
          </section>

          <section className="mb-12" aria-labelledby="use-heading">
            <h2 id="use-heading" className="text-2xl font-bold text-slate-900 mb-6">Use of Service</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed mb-4">Airport Matrix provides a database of airport facility information including showers, luggage storage, sleeping pods, and transport options. Our Service is designed to help travelers find accurate and up-to-date airport information.</p>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Permitted Use</h3>
              <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
                <li>Personal, non-commercial use</li>
                <li>Research and educational purposes</li>
                <li>Travel planning and reference</li>
              </ul>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Prohibited Use</h3>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Scraping or automated data collection</li>
                <li>Commercial resale of our data</li>
                <li>Creating competing services using our data</li>
                <li>Any use that violates applicable laws</li>
              </ul>
            </div>
          </section>

          <section className="mb-12" aria-labelledby="content-heading">
            <h2 id="content-heading" className="text-2xl font-bold text-slate-900 mb-6">Content and Accuracy</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed mb-4">We strive to provide accurate and up-to-date information, but we cannot guarantee the completeness or accuracy of all data. Airport facilities, services, and policies change frequently.</p>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Disclaimer</h3>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Information is provided &quot;as is&quot; without warranties</li>
                <li>Always verify critical information with official sources</li>
                <li>We are not responsible for changes made by airports</li>
                <li>Service availability and pricing may vary</li>
              </ul>
            </div>
          </section>

          <section className="mb-12" aria-labelledby="contributions-heading">
            <h2 id="contributions-heading" className="text-2xl font-bold text-slate-900 mb-6">User Contributions</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed mb-4">Users may contribute information, corrections, and reviews. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your contributions.</p>
              <p className="text-slate-600 leading-relaxed">You represent that your contributions are accurate, do not violate any third-party rights, and comply with applicable laws.</p>
            </div>
          </section>

          <section className="mb-12" aria-labelledby="ip-heading">
            <h2 id="ip-heading" className="text-2xl font-bold text-slate-900 mb-6">Intellectual Property</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed mb-4">The Service and its original content, features, and functionality are owned by Airport Matrix and are protected by international copyright, trademark, and other intellectual property laws.</p>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Our Rights</h3>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Website design and branding</li>
                <li>Curated database structure</li>
                <li>Original content and descriptions</li>
                <li>Software and algorithms</li>
              </ul>
            </div>
          </section>

          <section className="mb-12" aria-labelledby="ads-heading">
            <h2 id="ads-heading" className="text-2xl font-bold text-slate-900 mb-6">Advertising</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed">We display advertisements through Google AdSense and other partners. These third parties may use cookies and similar technologies to provide personalized ads. See our <Link href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link> for more information about advertising and your choices.</p>
            </div>
          </section>

          <section className="mb-12" aria-labelledby="liability-heading">
            <h2 id="liability-heading" className="text-2xl font-bold text-slate-900 mb-6">Limitation of Liability</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed mb-4">To the maximum extent permitted by law, Airport Matrix shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.</p>
              <p className="text-slate-600 leading-relaxed">This includes damages for loss of profits, goodwill, use, data, or other intangible losses, even if we have been advised of the possibility of such damages.</p>
            </div>
          </section>

          <section className="mb-12" aria-labelledby="indemnification-heading">
            <h2 id="indemnification-heading" className="text-2xl font-bold text-slate-900 mb-6">Indemnification</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed">You agree to defend, indemnify, and hold harmless Airport Matrix and its affiliates from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your access to or use of the Service.</p>
            </div>
          </section>

          <section className="mb-12" aria-labelledby="termination-heading">
            <h2 id="termination-heading" className="text-2xl font-bold text-slate-900 mb-6">Termination</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed mb-4">We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms.</p>
              <p className="text-slate-600 leading-relaxed">Upon termination, your right to use the Service will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive.</p>
            </div>
          </section>

          <section className="mb-12" aria-labelledby="governing-heading">
            <h2 id="governing-heading" className="text-2xl font-bold text-slate-900 mb-6">Governing Law</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed">These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any legal action arising from these Terms shall be brought in the courts located in the United States.</p>
            </div>
          </section>

          <section className="mb-12" aria-labelledby="changes-heading">
            <h2 id="changes-heading" className="text-2xl font-bold text-slate-900 mb-6">Changes to Terms</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed">We reserve the right to modify or replace these Terms at any time. We will provide notice of any material changes by posting the new Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service after any changes constitutes acceptance of the new Terms.</p>
            </div>
          </section>

          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-2xl font-bold text-slate-900 mb-6">Contact Us</h2>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed mb-4">If you have any questions about these Terms, please contact us:</p>
              <ul className="text-slate-600 space-y-2">
                <li>Email: <a href="mailto:legal@airportmatrix.com" className="text-blue-600 hover:text-blue-500">legal@airportmatrix.com</a></li>
                <li>Address: Airport Matrix, Legal Department</li>
              </ul>
            </div>
          </section>
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
