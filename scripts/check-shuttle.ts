import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const parking = await prisma.parkingLot.findUnique({
    where: { slug: 'sfo-park-n-fly-sfo-uncovered-self-park' },
  });
  
  if (parking) {
    console.log('=== Shuttle 信息 ===');
    console.log('shuttleHours:', parking.shuttleHours);
    console.log('shuttleFrequency:', parking.shuttleFrequency);
    console.log('shuttleMins:', parking.shuttleMins);
    console.log('is24Hours:', parking.is24Hours);
  } else {
    console.log('找不到记录!');
  }
  
  await prisma.$disconnect();
}

check();
