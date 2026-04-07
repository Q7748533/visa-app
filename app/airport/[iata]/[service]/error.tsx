'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <main className="max-w-4xl mx-auto p-6 pt-20 text-center">
      <h1 className="text-4xl font-black text-slate-900 mb-4">Something went wrong</h1>
      <p className="text-slate-500 mb-8">
        We couldn&apos;t load this airport data. Please try again.
      </p>
      <button
        onClick={reset}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </main>
  );
}
