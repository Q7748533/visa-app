import { Star } from 'lucide-react';

interface ParkingRatingsProps {
  locationRating: number | null;
  staffRating: number | null;
  facilityRating: number | null;
  safetyRating: number | null;
  recommendationPct: number | null;
}

export function ParkingRatings({
  locationRating,
  staffRating,
  facilityRating,
  safetyRating,
  recommendationPct,
}: ParkingRatingsProps) {
  const hasAnyRating = locationRating || staffRating || facilityRating || safetyRating;
  if (!hasAnyRating) return null;

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-5 md:p-6 lg:p-8 shadow-sm">
      <h2 className="text-lg md:text-xl font-black text-slate-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
        <span className="p-1.5 md:p-2 bg-amber-50 text-amber-600 rounded-lg">
          <Star className="w-4 h-4 md:w-5 md:h-5" />
        </span>
        Detailed Ratings
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {locationRating && (
          <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 text-center">
            <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-lg font-black text-slate-800">{locationRating}</span>
            </div>
          </div>
        )}
        {staffRating && (
          <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 text-center">
            <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Service</p>
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-lg font-black text-slate-800">{staffRating}</span>
            </div>
          </div>
        )}
        {facilityRating && (
          <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 text-center">
            <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Facility</p>
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-lg font-black text-slate-800">{facilityRating}</span>
            </div>
          </div>
        )}
        {safetyRating && (
          <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 text-center">
            <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Safety</p>
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-lg font-black text-slate-800">{safetyRating}</span>
            </div>
          </div>
        )}
      </div>
      {recommendationPct && (
        <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
          <p className="text-sm text-emerald-800">
            <span className="font-black text-emerald-600">{recommendationPct}%</span> of guests recommend this facility
          </p>
        </div>
      )}
    </div>
  );
}
