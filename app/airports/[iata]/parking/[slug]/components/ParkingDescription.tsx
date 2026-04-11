import { Car } from 'lucide-react';

interface ParkingDescriptionProps {
  description: string | null;
}

export function ParkingDescription({ description }: ParkingDescriptionProps) {
  if (!description) return null;

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-5 md:p-6 lg:p-8 shadow-sm">
      <h2 className="text-lg md:text-xl font-black text-slate-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
        <span className="p-1.5 md:p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Car className="w-4 h-4 md:w-5 md:h-5" />
        </span>
        About This Facility
      </h2>
      <p className="text-sm text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
