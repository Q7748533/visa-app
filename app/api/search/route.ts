import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.toLowerCase().trim() || "";
  const type = searchParams.get("type") || "all"; // all, airport, parking

  if (!query || query.length < 2) {
    return NextResponse.json({
      airports: [],
      parkings: [],
      suggestions: [],
    });
  }

  try {
    // For SQLite, we need to fetch more data and filter in JavaScript
    // because SQLite doesn't support case-insensitive search with Prisma's mode

    // Search airports - fetch all active and filter
    let airports: any[] = [];
    if (type === "all" || type === "airport") {
      const allAirports = await prisma.airport.findMany({
        where: { isActive: true },
        select: {
          iata: true,
          iataCode: true,
          name: true,
          city: true,
          country: true,
          isPopular: true,
          _count: {
            select: { parkings: { where: { isActive: true } } },
          },
        },
      });

      airports = allAirports.filter(a => {
        const iataMatch = a.iata.toLowerCase() === query;
        const iataCodeMatch = a.iataCode?.toLowerCase() === query;
        const nameMatch = a.name.toLowerCase().includes(query);
        const cityMatch = a.city.toLowerCase().includes(query);
        return iataMatch || iataCodeMatch || nameMatch || cityMatch;
      }).slice(0, 10);
    }

    // Search parking lots - fetch and filter
    let parkings: any[] = [];
    if (type === "all" || type === "parking") {
      // First get airports matching the query to find their parkings
      const matchingAirportIatas = airports.map(a => a.iata);

      const allParkings = await prisma.parkingLot.findMany({
        where: {
          isActive: true,
        },
        include: {
          airport: {
            select: {
              iata: true,
              iataCode: true,
              name: true,
              city: true,
            },
          },
        },
      });

      parkings = allParkings.filter(p => {
        // Match by airport IATA
        const airportMatch = matchingAirportIatas.includes(p.airport.iata);
        // Match by parking name
        const nameMatch = p.name.toLowerCase().includes(query);
        // Match by description
        const descMatch = (p as any).description?.toLowerCase().includes(query);
        // Match by type
        const typeMatch = p.type?.toLowerCase().includes(query);
        // Match by features
        const valetMatch = query === "valet" && p.hasValet;
        const indoorMatch = query === "indoor" && p.isIndoor;
        const hoursMatch = (query === "24/7" || query === "24h") && p.is24Hours;

        return airportMatch || nameMatch || descMatch || typeMatch || valetMatch || indoorMatch || hoursMatch;
      }).slice(0, 20);
    }

    // Generate suggestions
    const suggestions = generateSuggestions(query, airports, parkings);

    return NextResponse.json({
      airports: airports.map(a => ({
        iata: a.iata,
        name: a.name,
        city: `${a.city}, ${a.country}`,
        isPopular: a.isPopular,
        parkingCount: a._count.parkings,
        url: `/airports/${a.iataCode?.toLowerCase() || a.iata.toLowerCase()}/parking`,
      })),
      parkings: parkings.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        airport: {
          iata: p.airport.iata,
          name: p.airport.name,
          city: p.airport.city,
        },
        dailyRate: p.dailyRate,
        rating: p.rating,
        isIndoor: p.isIndoor,
        hasValet: p.hasValet,
        is24Hours: p.is24Hours,
        url: `/parking/${p.slug}`,
      })),
      suggestions,
      query,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}

function generateSuggestions(
  query: string,
  airports: any[],
  parkings: any[]
): string[] {
  const suggestions: string[] = [];

  // Airport-based suggestions - use kebab-case for URL consistency
  airports.forEach(airport => {
    const iata = airport.iata.toLowerCase();
    suggestions.push(`${iata}-parking`);
    suggestions.push(`${iata}-airport-parking`);
    suggestions.push(`cheap-${iata}-parking`);
  });

  // Feature-based suggestions
  if (query.includes("valet") || parkings.some(p => p.hasValet)) {
    suggestions.push("valet-parking");
  }
  if (query.includes("indoor") || parkings.some(p => p.isIndoor)) {
    suggestions.push("indoor-parking");
  }
  if (query.includes("cheap") || query.includes("save")) {
    suggestions.push("cheap-airport-parking");
    suggestions.push("long-term-parking");
  }

  // Remove duplicates and limit
  return [...new Set(suggestions)].slice(0, 8);
}
