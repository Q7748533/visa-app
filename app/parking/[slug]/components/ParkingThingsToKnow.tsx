import { AlertTriangle } from 'lucide-react';
import { ThingToKnow } from '../types';

interface ParkingThingsToKnowProps {
  items: ThingToKnow[];
}

export function ParkingThingsToKnow({ items }: ParkingThingsToKnowProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-amber-50 rounded-2xl md:rounded-3xl border border-amber-100 p-5 md:p-6 lg:p-8 shadow-sm">
      <h2 className="text-lg md:text-xl font-black text-amber-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
        <span className="p-1.5 md:p-2 bg-amber-200 text-amber-700 rounded-lg">
          <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
        </span>
        Things You Should Know
      </h2>
      <ul className="space-y-3 md:space-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
            <p className="text-sm font-medium text-amber-900/80 leading-relaxed">
              {item.title && <strong className="text-amber-900">{item.title}:</strong>} {item.content}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
