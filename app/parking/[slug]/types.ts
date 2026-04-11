export interface Airport {
  id: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  iataCode: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  slug: string;
  airportIataCode: string;
  type: 'OFFICIAL' | 'OFF_SITE';
  dailyRate: number;
  distanceMiles: number | null;
  shuttleMins: number | null;
  isIndoor: boolean;
  hasValet: boolean;
  is24Hours: boolean;
  rating: number | null;
  reviewCount: number | null;
  tags: string | null;
  affiliateUrl: string | null;
  featured: boolean;
  isActive: boolean;
  address: string | null;
  shuttleFrequency: string | null;
  shuttleHours: string | null;
  arrivalDirections: string | null;
  thingsToKnow: string | null;
  description: string | null;
  shuttleDesc: string | null;
  cancellationPolicy: string | null;
  parkingAccess: string | null;
  operatingDays: string | null;
  contactPhone: string | null;
  recommendationPct: number | null;
  locationRating: number | null;
  staffRating: number | null;
  facilityRating: number | null;
  safetyRating: number | null;
  reviewSummary: string | null;
  dataSource: string;
  airport: Airport;
}

export interface RelatedParkingLot {
  id: string;
  name: string;
  slug: string;
  dailyRate: number;
  distanceMiles: number | null;
  shuttleMins: number | null;
  rating: number | null;
}

export interface ThingToKnow {
  title?: string;
  content: string;
}

export interface ArrivalDirectionStep {
  text?: string;
  description?: string;
}

export interface ArrivalDirections {
  fromWest?: {
    description: string;
    warning?: string;
  };
  fromNorth?: {
    description: string;
    warning?: string;
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}
