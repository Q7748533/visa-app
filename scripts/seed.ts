import { prisma } from '../lib/db';

async function main() {
  const airports = [
    {
      iata: 'LHR',
      name: 'Heathrow Airport',
      city: 'London',
      country: 'UK',
      slug: 'lhr-airport',
      luggageData: JSON.stringify({
        location: 'Terminal 2, Level 1, Near Check-in Zone B',
        price: '£10-15 per item per day',
        hours: '24 hours'
      }),
      showerData: JSON.stringify({
        location: 'Terminal 2, Level 2, Near Gate B30',
        isFree: false,
        price: '£20 per use'
      }),
      sleepData: JSON.stringify({
        pods: 'YOTELAIR in Terminal 4',
        quietZones: 'Terminal 2, Level 3 Rest Area'
      }),
      transitData: JSON.stringify({
        train: 'Heathrow Express to Paddington (15 min)',
        bus: 'National Express to Central London',
        lastBus: '23:30'
      })
    },
    {
      iata: 'HND',
      name: 'Haneda Airport',
      city: 'Tokyo',
      country: 'Japan',
      slug: 'hnd-airport',
      luggageData: JSON.stringify({
        location: 'Terminal 3, 2F, Near International Arrivals',
        price: '¥500-1000 per item per day',
        hours: '24 hours'
      }),
      showerData: JSON.stringify({
        location: 'Terminal 3, 2F, Near Gate 114',
        isFree: false,
        price: '¥1500 per use'
      }),
      sleepData: JSON.stringify({
        pods: 'First Cabin in Terminal 1',
        quietZones: 'Terminal 3, 2F Rest Area'
      }),
      transitData: JSON.stringify({
        train: 'Tokyo Monorail to Hamamatsucho (13 min)',
        bus: 'Airport Limousine to major hotels',
        lastBus: '23:55'
      })
    }
  ];

  for (const airport of airports) {
    await prisma.airport.upsert({
      where: { iata: airport.iata },
      update: airport,
      create: airport
    });
    console.log(`Added ${airport.iata}: ${airport.name}`);
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
