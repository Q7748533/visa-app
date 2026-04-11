import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const parkings = await prisma.parkingLot.findMany({
    where: { airportIataCode: 'sfo' },
    select: {
      id: true,
      name: true,
      slug: true,
      dailyRate: true,
      updatedAt: true,
    },
    orderBy: { name: 'asc' },
  });
  
  console.log('=== SFO 机场的所有停车场 ===');
  parkings.forEach(p => {
    console.log(`- ${p.name}`);
    console.log(`  slug: ${p.slug}`);
    console.log(`  price: $${p.dailyRate}`);
    console.log(`  updated: ${p.updatedAt}`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

check();
