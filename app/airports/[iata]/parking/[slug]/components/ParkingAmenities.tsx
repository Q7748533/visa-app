import { Clock, Car, Bus, Calendar, Phone, Key } from 'lucide-react';

interface ParkingAmenitiesProps {
  is24Hours: boolean;
  isIndoor: boolean;
  hasValet: boolean;
  operatingDays?: string | null;
  contactPhone?: string | null;
  parkingAccess?: string | null;
}

export function ParkingAmenities({ 
  is24Hours, 
  isIndoor, 
  hasValet,
  operatingDays,
  contactPhone,
  parkingAccess
}: ParkingAmenitiesProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <h2 className="text-xl font-black text-slate-900 mb-6">Amenities & Services</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className={`flex items-center p-4 rounded-xl ${is24Hours ? "bg-emerald-50" : "bg-slate-50"}`}>
          <Clock className={`w-5 h-5 mr-3 ${is24Hours ? "text-emerald-600" : "text-slate-400"}`} />
          <div>
            <p className="font-bold text-slate-900">24/7 Operation</p>
            <p className="text-sm text-slate-500">{is24Hours ? "Always open" : "Limited hours"}</p>
          </div>
        </div>
        <div className={`flex items-center p-4 rounded-xl ${isIndoor ? "bg-emerald-50" : "bg-slate-50"}`}>
          <Car className={`w-5 h-5 mr-3 ${isIndoor ? "text-emerald-600" : "text-slate-400"}`} />
          <div>
            <p className="font-bold text-slate-900">Covered Parking</p>
            <p className="text-sm text-slate-500">{isIndoor ? "Indoor/Canopy available" : "Open air"}</p>
          </div>
        </div>
        <div className={`flex items-center p-4 rounded-xl ${hasValet ? "bg-emerald-50" : "bg-slate-50"}`}>
          <Car className={`w-5 h-5 mr-3 ${hasValet ? "text-emerald-600" : "text-slate-400"}`} />
          <div>
            <p className="font-bold text-slate-900">Valet Service</p>
            <p className="text-sm text-slate-500">{hasValet ? "Available" : "Self-park only"}</p>
          </div>
        </div>
        <div className="flex items-center p-4 rounded-xl bg-emerald-50">
          <Bus className="w-5 h-5 mr-3 text-emerald-600" />
          <div>
            <p className="font-bold text-slate-900">Free Shuttle</p>
            <p className="text-sm text-slate-500">To terminal & back</p>
          </div>
        </div>
        
        {/* 运营天数 */}
        {operatingDays && (
          <div className="flex items-center p-4 rounded-xl bg-blue-50">
            <Calendar className="w-5 h-5 mr-3 text-blue-600" />
            <div>
              <p className="font-bold text-slate-900">Operating Days</p>
              <p className="text-sm text-slate-500">{operatingDays}</p>
            </div>
          </div>
        )}
        
        {/* 联系电话 */}
        {contactPhone && (
          <div className="flex items-center p-4 rounded-xl bg-blue-50">
            <Phone className="w-5 h-5 mr-3 text-blue-600" />
            <div>
              <p className="font-bold text-slate-900">Contact</p>
              <a href={`tel:${contactPhone}`} className="text-sm text-blue-600 hover:underline">{contactPhone}</a>
            </div>
          </div>
        )}
        
        {/* 停车方式 */}
        {parkingAccess && (
          <div className="flex items-center p-4 rounded-xl bg-blue-50">
            <Key className="w-5 h-5 mr-3 text-blue-600" />
            <div>
              <p className="font-bold text-slate-900">Parking Access</p>
              <p className="text-sm text-slate-500">{parkingAccess}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
