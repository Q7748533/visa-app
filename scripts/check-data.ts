import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const parking = await prisma.parkingLot.findUnique({
    where: { slug: 'sfo-park-n-fly-sfo-uncovered-self-park' },
  });
  
  if (parking) {
    console.log('=== 数据库中的数据 ===');
    console.log('Name:', parking.name);
    console.log('Slug:', parking.slug);
    console.log('Daily Rate:', parking.dailyRate);
    console.log('Distance:', parking.distanceMiles);
    console.log('Address:', parking.address);
    console.log('Rating:', parking.rating);
    console.log('Review Count:', parking.reviewCount);
    console.log('Tags:', parking.tags);
    console.log('Things to Know:', parking.thingsToKnow?.substring(0, 100));
    console.log('Arrival Directions:', parking.arrivalDirections?.substring(0, 100));
    console.log('Updated At:', parking.updatedAt);
  } else {
    console.log('找不到记录!');
  }
  
  await prisma.$disconnect();
}

check();
