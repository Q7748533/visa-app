import { MapPin, Star, DollarSign, Clock, Car } from 'lucide-react';
import { ParkingLot } from '../types';

interface ParkingHeroProps {
  parking: ParkingLot;
}

export function ParkingHero({ parking }: ParkingHeroProps) {
  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-5 md:p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start gap-3 md:gap-4 mb-5 md:mb-6">
        <div>
          <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
            <span className="px-2 md:px-3 py-0.5 md:py-1 bg-slate-100 text-slate-700 font-black text-[9px] md:text-[10px] uppercase tracking-wider rounded-lg">
              {parking.airport.iata} Airport
            </span>
            {parking.featured && (
              <span className="px-2 md:px-3 py-0.5 md:py-1 bg-amber-100 text-amber-700 font-black text-[9px] md:text-[10px] uppercase tracking-wider rounded-lg">
                Featured
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-1.5 md:mb-2">
            {parking.name} Parking at {parking.airport.iata} Airport
          </h1>
          <p className="text-slate-500 font-medium flex items-start sm:items-center mt-3 text-sm sm:text-base">
            <MapPin className="w-4 h-4 mr-1.5 mt-0.5 sm:mt-0 text-slate-400 shrink-0" />
            {parking.address || `${parking.airport.city}, ${parking.airport.country}`}
          </p>
        </div>
        {parking.rating && (
          <div className="text-left md:text-right shrink-0">
            <div className="flex items-center gap-1 text-amber-500 justify-start md:justify-end">
              <Star className="w-6 h-6 fill-amber-500" />
              <span className="font-black text-2xl text-slate-900">{parking.rating}</span>
            </div>
            <p className="text-sm font-semibold text-slate-400 mt-1">{parking.reviewCount || 0} reviews</p>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6 md:mb-8">
        {parking.hasValet ? (
          <span className="px-2 md:px-3 py-0.5 md:py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">Valet Parking</span>
        ) : (
          <span className="px-2 md:px-3 py-0.5 md:py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">Self Park</span>
        )}
        {parking.isIndoor ? (
          <span className="px-2 md:px-3 py-0.5 md:py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">Indoor</span>
        ) : (
          <span className="px-2 md:px-3 py-0.5 md:py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">Uncovered</span>
        )}
        <span className="px-2 md:px-3 py-0.5 md:py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">On-Site Staff</span>
        <span className="px-2 md:px-3 py-0.5 md:py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">Free Shuttle</span>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 py-4 md:py-6 border-t border-slate-100">
        <div className="text-center">
          <div className="w-9 h-9 md:w-10 md:h-10 mx-auto bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-1.5 md:mb-2">
            <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Base Rate</p>
          <p className="font-black text-slate-900 text-sm md:text-base">${parking.dailyRate.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <div className="w-9 h-9 md:w-10 md:h-10 mx-auto bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-1.5 md:mb-2">
            <MapPin className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Distance</p>
          <p className="font-black text-slate-900 text-sm md:text-base">{parking.distanceMiles ? `${parking.distanceMiles} mi` : "N/A"}</p>
        </div>
        <div className="text-center">
          <div className="w-9 h-9 md:w-10 md:h-10 mx-auto bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-1.5 md:mb-2">
            <Clock className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Travel Time</p>
          <p className="font-black text-slate-900 text-sm md:text-base">{parking.shuttleMins ? `${parking.shuttleMins} min` : "N/A"}</p>
        </div>
        <div className="text-center">
          <div className="w-9 h-9 md:w-10 md:h-10 mx-auto bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-1.5 md:mb-2">
            <Car className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Lot Type</p>
          <p className="font-black text-slate-900 text-sm md:text-base">{parking.type === "OFFICIAL" ? "Official" : "Off-Site"}</p>
        </div>
      </div>
    </div>
  );
}
