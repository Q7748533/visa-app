import { Clock, Bus } from 'lucide-react';

interface ParkingShuttleProps {
  shuttleFrequency: string | null;
  shuttleHours: string | null;
  shuttleDesc: string | null;
}

export function ParkingShuttle({ shuttleFrequency, shuttleHours, shuttleDesc }: ParkingShuttleProps) {
  const hasShuttleInfo = shuttleFrequency || shuttleHours || shuttleDesc;
  if (!hasShuttleInfo) return null;

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-5 md:p-6 lg:p-8 shadow-sm relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-[0.03]">
        <Bus className="w-36 h-36 md:w-48 md:h-48" />
      </div>
      <h2 className="text-lg md:text-xl font-black text-slate-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3 relative z-10">
        <span className="p-1.5 md:p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Clock className="w-4 h-4 md:w-5 md:h-5" />
        </span>
        Shuttle Schedule & Details
      </h2>
      {shuttleDesc && (
        <p className="text-sm text-slate-600 mb-4 leading-relaxed relative z-10">
          {shuttleDesc}
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-3 md:gap-4 relative z-10">
        {shuttleFrequency && (
          <div className="bg-slate-50 p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-100">
            <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Frequency</p>
            <p className="text-base md:text-lg font-black text-slate-800">{shuttleFrequency}</p>
          </div>
        )}
        {shuttleHours && (
          <div className="bg-slate-50 p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-100">
            <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Operating Hours</p>
            <p className="text-base md:text-lg font-black text-slate-800">{shuttleHours}</p>
          </div>
        )}
      </div>
    </div>
  );
}
