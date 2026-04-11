import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const parkings = await prisma.parkingLot.findMany({
    where: {
      name: { contains: 'Park N Fly' },
    },
  });
  
  console.log('=== 所有 Park N Fly 记录 ===');
  parkings.forEach(p => {
    console.log(`\nName: ${p.name}`);
    console.log(`Slug: ${p.slug}`);
    console.log(`Airport: ${p.airportIataCode}`);
    console.log(`Price: $${p.dailyRate}`);
    console.log(`Updated: ${p.updatedAt}`);
  });
  
  await prisma.$disconnect();
}

check();
