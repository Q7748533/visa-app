import Link from 'next/link';
import { MapPin, Clock, Star } from 'lucide-react';
import { RelatedParkingLot, Airport } from '../types';

interface ParkingRelatedProps {
  lots: RelatedParkingLot[];
  airport: Airport;
  iata: string;
}

export function ParkingRelated({ lots, airport, iata }: ParkingRelatedProps) {
  if (lots.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-5 md:p-6 lg:p-8 shadow-sm">
      <h2 className="text-lg md:text-xl font-black text-slate-900 mb-4 md:mb-6">More Options at {airport.iata}</h2>
      <div className="space-y-3 md:space-y-4">
        {lots.map((lot) => (
          <Link 
            key={lot.id} 
            href={`/airports/${iata}/parking/${lot.slug}`}
            className="block p-3 md:p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-900 text-sm">{lot.name}</h3>
              <span className="text-emerald-600 font-black text-sm">${lot.dailyRate.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {lot.distanceMiles && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {lot.distanceMiles} mi
                </span>
              )}
              {lot.shuttleMins && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lot.shuttleMins} min
                </span>
              )}
              {lot.rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {lot.rating}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
      <Link 
        href={`/airports/${iata}/parking`}
        className="block mt-4 text-center text-sm font-bold text-blue-600 hover:text-blue-700"
      >
        View All {airport.iata} Parking Options →
      </Link>
    </div>
  );
}
