'use client';

import { Database, ExternalLink, MapPin, Phone, Clock, Calendar } from 'lucide-react';

interface ParkingInfoCardProps {
  dataSource?: string | null;
  address?: string | null;
  contactPhone?: string | null;
  operatingDays?: string | null;
  type?: 'OFFICIAL' | 'OFF_SITE';
}

export function ParkingInfoCard({
  dataSource,
  address,
  contactPhone,
  operatingDays,
  type
}: ParkingInfoCardProps) {
  const hasAnyInfo = dataSource || address || contactPhone || operatingDays;
  if (!hasAnyInfo) return null;

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-5 md:p-6 lg:p-8 shadow-sm">
      <h2 className="text-lg md:text-xl font-black text-slate-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
        <span className="p-1.5 md:p-2 bg-slate-100 text-slate-600 rounded-lg">
          <Database className="w-4 h-4 md:w-5 md:h-5" />
        </span>
        Parking Information
      </h2>
      
      <div className="space-y-4">
        {/* 地址 */}
        {address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-700">Address</p>
              <p className="text-sm text-slate-600">{address}</p>
            </div>
          </div>
        )}
        
        {/* 联系电话 */}
        {contactPhone && (
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-700">Contact</p>
              <a 
                href={`tel:${contactPhone}`} 
                className="text-sm text-blue-600 hover:underline"
              >
                {contactPhone}
              </a>
            </div>
          </div>
        )}
        
        {/* 运营天数 */}
        {operatingDays && (
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-700">Operating Days</p>
              <p className="text-sm text-slate-600">{operatingDays}</p>
            </div>
          </div>
        )}
        
        {/* 停车场类型 */}
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-slate-700">Facility Type</p>
            <p className="text-sm text-slate-600">
              {type === 'OFFICIAL' ? 'Official Airport Parking' : 'Off-Site Parking with Shuttle'}
            </p>
          </div>
        </div>
        
        {/* 数据来源 */}
        {dataSource && (
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Database className="w-3 h-3" />
              Data source: {dataSource}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
