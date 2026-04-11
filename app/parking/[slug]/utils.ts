import { ThingToKnow, ArrivalDirections, ArrivalDirectionStep } from './types';

/**
 * 安全解析 JSON 字符串
 */
export function safeJsonParse<T>(jsonString: string | null, defaultValue: T): T {
  if (!jsonString || jsonString.trim() === '' || jsonString === '[]' || jsonString === '{}') {
    return defaultValue;
  }
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return defaultValue;
  }
}

/**
 * 解析标签
 */
export function parseTags(tagsString: string | null): string[] {
  if (!tagsString || tagsString.trim() === '' || tagsString === '[]') {
    return [];
  }
  try {
    const parsed = JSON.parse(tagsString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse tags:', e);
    return [];
  }
}

/**
 * 解析 arrivalDirections
 * 支持 JSON 格式或普通文本
 */
export function parseArrivalDirections(
  directionsString: string | null
): { directions: ArrivalDirections | null; text: string | null } {
  if (!directionsString || directionsString.trim() === '' || directionsString === '{}') {
    return { directions: null, text: null };
  }

  const trimmed = directionsString.trim();
  
  // JSON 格式
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return { directions: { fromWest: { description: parsed.map((s: ArrivalDirectionStep) => s.text || s.description).join('. ') } }, text: null };
      }
      return { directions: parsed as ArrivalDirections, text: null };
    } catch (e) {
      console.error('Failed to parse arrivalDirections:', e);
      return { directions: null, text: directionsString };
    }
  }

  // 普通文本格式
  return { directions: null, text: directionsString };
}

/**
 * 解析 thingsToKnow
 */
export function parseThingsToKnow(thingsToKnowString: string | null): ThingToKnow[] {
  if (!thingsToKnowString || thingsToKnowString.trim() === '' || thingsToKnowString === '[]') {
    return [];
  }

  const trimmed = thingsToKnowString.trim();
  
  try {
    if (trimmed.startsWith('[')) {
      // 标准格式：数组
      return JSON.parse(thingsToKnowString) as ThingToKnow[];
    } else if (trimmed.startsWith('{')) {
      // 错误格式：对象
      console.warn('thingsToKnow is an object, not an array. Data may be incorrect.');
      return [];
    }
  } catch (e) {
    console.error('Failed to parse thingsToKnow:', e);
  }
  
  return [];
}

/**
 * 生成通用 FAQ
 */
export function generateGeneralFAQs(
  airportIata: string,
  dailyRate: number,
  shuttleFrequency: string | null,
  shuttleHours: string | null,
  isIndoor: boolean,
  cancellationPolicy: string | null,
  thingsToKnow: ThingToKnow[]
): Array<{ question: string; answer: string }> {
  const faqs = [
    {
      question: `Do parking lots at ${airportIata} offer discounts for longer stays?`,
      answer: `Yes, many airport parking facilities offer discounted daily rates for extended stays. While our listed prices show the base rate for comparison, you can often save 10-20% per day when booking 3+ days of parking. For example, a lot showing $${dailyRate.toFixed(2)}/day might charge less per day for a 5-day reservation. The exact discount varies by facility, season, and availability.`,
    },
    {
      question: `How does the shuttle service work?`,
      answer: `${shuttleFrequency ? `This facility offers ${shuttleFrequency.toLowerCase()} shuttle service to ${airportIata} airport. ` : `This facility provides shuttle service to ${airportIata} airport. `}${shuttleHours ? `Shuttles operate ${shuttleHours.toLowerCase()}. ` : 'Shuttles typically run 24/7. '}Simply park your vehicle and proceed to the designated shuttle pickup area. Upon your return, the shuttle will bring you back to your car.`,
    },
    {
      question: `Is my vehicle secure at this facility?`,
      answer: `${isIndoor ? 'This facility offers covered/indoor parking, providing additional protection from weather elements. ' : 'This is an open-air parking facility. '}Most airport parking lots have security measures including surveillance cameras, on-site staff, and gated access. We recommend removing valuables from your vehicle and ensuring it is locked before leaving.`,
    },
  ];

  // 添加取消政策 FAQ
  const cancellationItem = thingsToKnow.find((item) =>
    item.title?.toLowerCase().includes('cancellation')
  );
  
  if (cancellationPolicy || cancellationItem) {
    faqs.push({
      question: `What is the cancellation policy?`,
      answer: cancellationPolicy || cancellationItem?.content || '',
    });
  }

  return faqs;
}

/**
 * 生成 ParkingFacility JSON-LD
 */
export function generateParkingJsonLd(
  parking: {
    name: string;
    airport: { name: string; iata: string; city: string; country: string };
    dailyRate: number;
    address: string | null;
    rating: number | null;
    reviewCount: number | null;
    is24Hours: boolean;
    isIndoor: boolean;
    hasValet: boolean;
    distanceMiles: number | null;
  },
  slug: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ParkingFacility',
    name: parking.name,
    description: `${parking.name} at ${parking.airport.name} (${parking.airport.iata}). $${parking.dailyRate}/day with free shuttle.`,
    url: `https://airportmatrix.com/parking/${slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: parking.airport.city,
      addressRegion: 'USA',
      streetAddress: parking.address || `${parking.airport.city}, ${parking.airport.country}`,
    },
    priceRange: `$${parking.dailyRate}`,
    aggregateRating: parking.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: parking.rating,
          reviewCount: parking.reviewCount || 0,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Free Shuttle', value: true },
      { '@type': 'LocationFeatureSpecification', name: '24/7 Service', value: parking.is24Hours },
      { '@type': 'LocationFeatureSpecification', name: 'Indoor Parking', value: parking.isIndoor },
      { '@type': 'LocationFeatureSpecification', name: 'Valet Service', value: parking.hasValet },
    ].filter((a) => a.value),
    openingHoursSpecification: parking.is24Hours
      ? {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59',
        }
      : undefined,
    geo: parking.distanceMiles
      ? {
          '@type': 'GeoCoordinates',
          latitude: 0,
          longitude: 0,
        }
      : undefined,
  };
}

/**
 * 生成 FAQ JSON-LD
 */
export function generateFaqJsonLd(
  generalFAQs: Array<{ question: string; answer: string }>,
  thingsToKnow: ThingToKnow[],
  parkingName: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      ...generalFAQs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
      ...thingsToKnow.map((item) => ({
        '@type': 'Question',
        name: item.title || `What should I know about ${parkingName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.content,
        },
      })),
    ],
  };
}
