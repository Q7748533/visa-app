import { ParkingLot, ThingToKnow } from '../types';
import { generateParkingJsonLd, generateFaqJsonLd } from '../utils';

interface ParkingJsonLdProps {
  parking: ParkingLot;
  slug: string;
  generalFAQs: Array<{ question: string; answer: string }>;
  thingsToKnow: ThingToKnow[];
}

export function ParkingJsonLd({ parking, slug, generalFAQs, thingsToKnow }: ParkingJsonLdProps) {
  const parkingJsonLd = generateParkingJsonLd(parking, slug);
  const faqJsonLd = generateFaqJsonLd(generalFAQs, thingsToKnow, parking.name);

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(parkingJsonLd) }} 
      />
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} 
      />
    </>
  );
}
