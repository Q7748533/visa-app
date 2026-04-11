import { HelpCircle } from 'lucide-react';
import { ThingToKnow } from '../types';

interface ParkingFAQProps {
  airportIata: string;
  dailyRate: number;
  shuttleFrequency: string | null;
  shuttleHours: string | null;
  isIndoor: boolean;
  cancellationPolicy: string | null;
  thingsToKnow: ThingToKnow[];
}

export function ParkingFAQ({
  airportIata,
  dailyRate,
  shuttleFrequency,
  shuttleHours,
  isIndoor,
  cancellationPolicy,
  thingsToKnow,
}: ParkingFAQProps) {
  const cancellationItem = thingsToKnow.find((item) =>
    item.title?.toLowerCase().includes('cancellation')
  );

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-5 md:p-6 lg:p-8 shadow-sm">
      <h2 className="text-lg md:text-xl font-black text-slate-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
        <span className="p-1.5 md:p-2 bg-blue-100 text-blue-600 rounded-lg">
          <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
        </span>
        Frequently Asked Questions
      </h2>
      <div className="space-y-4 md:space-y-6">
        {/* Q1: Long-term discounts */}
        <div className="border-b border-slate-100 pb-4 md:pb-6 last:border-0 last:pb-0">
          <h3 className="text-sm md:text-base font-bold text-slate-900 mb-2">
            Do parking lots offer discounts for longer stays?
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Yes, many airport parking facilities offer <strong>discounted daily rates for extended stays</strong>. 
            While our listed prices show the base rate for comparison, you can often save 10-20% per day when booking 3+ days of parking. 
            For example, a lot showing ${dailyRate.toFixed(2)}/day might charge less per day for a 5-day reservation. 
            The exact discount varies by facility, season, and availability.
          </p>
        </div>
        
        {/* Q2: Shuttle service */}
        <div className="border-b border-slate-100 pb-4 md:pb-6 last:border-0 last:pb-0">
          <h3 className="text-sm md:text-base font-bold text-slate-900 mb-2">
            How does the shuttle service work?
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {shuttleFrequency 
              ? `This facility offers ${shuttleFrequency.toLowerCase()} shuttle service to ${airportIata} airport. `
              : `This facility provides shuttle service to ${airportIata} airport. `
            }
            {shuttleHours 
              ? `Shuttles operate ${shuttleHours.toLowerCase()}. `
              : 'Shuttles typically run 24/7. '
            }
            Simply park your vehicle and proceed to the designated shuttle pickup area. 
            Upon your return, the shuttle will bring you back to your car.
          </p>
        </div>
        
        {/* Q3: Security */}
        <div className="border-b border-slate-100 pb-4 md:pb-6 last:border-0 last:pb-0">
          <h3 className="text-sm md:text-base font-bold text-slate-900 mb-2">
            Is my vehicle secure at this facility?
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {isIndoor 
              ? 'This facility offers covered/indoor parking, providing additional protection from weather elements. '
              : 'This is an open-air parking facility. '
            }
            Most airport parking lots have security measures including surveillance cameras, 
            on-site staff, and gated access. We recommend removing valuables from your vehicle 
            and ensuring it is locked before leaving.
          </p>
        </div>
        
        {/* Q4: Cancellation */}
        {(cancellationPolicy || cancellationItem) && (
          <div className="border-b border-slate-100 pb-4 md:pb-6 last:border-0 last:pb-0">
            <h3 className="text-sm md:text-base font-bold text-slate-900 mb-2">
              What is the cancellation policy?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {cancellationPolicy || cancellationItem?.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
