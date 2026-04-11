import { ExternalLink, Check } from 'lucide-react';

interface ParkingBookingCardProps {
  dailyRate: number;
  affiliateUrl: string | null;
}

export function ParkingBookingCard({ dailyRate, affiliateUrl }: ParkingBookingCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 sticky top-24 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-8">
        <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Base rate</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-5xl font-black text-slate-900 tracking-tighter">${dailyRate.toFixed(2)}</span>
          <span className="text-sm font-medium text-slate-400">/day</span>
        </div>
      </div>

      {affiliateUrl ? (
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-slate-900 hover:bg-black text-white font-bold text-lg py-4 rounded-xl transition-all active:scale-[0.98] mb-6 shadow-md text-center"
        >
          <span className="flex items-center justify-center gap-2">
            Reserve Space
            <ExternalLink className="w-4 h-4" />
          </span>
        </a>
      ) : (
        <button
          disabled
          className="block w-full bg-slate-300 text-slate-500 font-bold text-lg py-4 rounded-xl cursor-not-allowed mb-6"
        >
          Booking Coming Soon
        </button>
      )}

      <div className="space-y-4">
        <div className="flex items-center text-sm font-medium text-slate-600">
          <Check className="w-5 h-5 text-slate-300 mr-3 shrink-0" />
          Free cancellation anytime
        </div>
        <div className="flex items-center text-sm font-medium text-slate-600">
          <Check className="w-5 h-5 text-slate-300 mr-3 shrink-0" />
          Guaranteed parking spot
        </div>
        <div className="flex items-center text-sm font-medium text-slate-600">
          <Check className="w-5 h-5 text-slate-300 mr-3 shrink-0" />
          Direct official booking
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
        <Check className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Best Rate Guarantee</span>
      </div>
    </div>
  );
}
