import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="max-w-4xl mx-auto p-6 pt-20 text-center">
      <h1 className="text-4xl font-black text-slate-900 mb-4">Airport Not Found</h1>
      <p className="text-slate-500 mb-8">
        We don&apos;t have data for this airport yet. Check back soon or try another search.
      </p>
      <Link
        href="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
      >
        Back to Home
      </Link>
    </main>
  );
}
