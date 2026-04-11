import { Navigation, AlertTriangle } from 'lucide-react';
import { ArrivalDirections } from '../types';

interface ParkingDirectionsProps {
  directions: ArrivalDirections | null;
  textDirections: string | null;
  parkingAccess: string | null;
}

export function ParkingDirections({ directions, textDirections, parkingAccess }: ParkingDirectionsProps) {
  const hasDirections = directions || textDirections || parkingAccess;
  if (!hasDirections) return null;

  return (
    <div className="bg-indigo-50 rounded-2xl md:rounded-3xl border border-indigo-100 p-5 md:p-6 lg:p-8 shadow-sm">
      <h2 className="text-lg md:text-xl font-black text-indigo-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
        <span className="p-1.5 md:p-2 bg-indigo-200 text-indigo-700 rounded-lg">
          <Navigation className="w-4 h-4 md:w-5 md:h-5" />
        </span>
        Arrival & Directions
      </h2>
      <div className="space-y-4 md:space-y-6 text-sm font-medium text-indigo-900/80 leading-relaxed">
        {/* Way.com parkingAccess */}
        {parkingAccess && (
          <div dangerouslySetInnerHTML={{ __html: parkingAccess }} />
        )}

        {/* 普通文本格式 */}
        {textDirections && (
          <p>{textDirections}</p>
        )}

        {/* JSON 对象格式：fromWest/fromNorth */}
        {directions && (
          <>
            {directions.fromWest && (
              <div>
                <strong className="text-indigo-900 block mb-1 text-base">🚗 From West and South:</strong>
                <p>{directions.fromWest.description}</p>
                {directions.fromWest.warning && (
                  <div className="mt-2 md:mt-3 bg-rose-50 border border-rose-100 p-2.5 md:p-3.5 rounded-xl flex items-start gap-2 md:gap-3">
                    <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-rose-700 font-bold text-sm">{directions.fromWest.warning}</p>
                  </div>
                )}
              </div>
            )}
            {directions.fromNorth && (
              <>
                <div className="h-px w-full bg-indigo-200/60" />
                <div>
                  <strong className="text-indigo-900 block mb-1 text-base">🚙 From North to East:</strong>
                  <p>{directions.fromNorth.description}</p>
                  {directions.fromNorth.warning && (
                    <div className="mt-2 md:mt-3 bg-rose-50 border border-rose-100 p-2.5 md:p-3.5 rounded-xl flex items-start gap-2 md:gap-3">
                      <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-rose-700 font-bold text-sm">{directions.fromNorth.warning}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
