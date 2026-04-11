import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
  // 1. 找到两条 Park N Fly 记录
  const parkings = await prisma.parkingLot.findMany({
    where: {
      airportIataCode: 'sfo',
      name: { contains: 'Park N Fly' },
    },
  });
  
  console.log('找到的记录:');
  parkings.forEach(p => {
    console.log(`- ${p.name} (slug: ${p.slug})`);
  });
  
  if (parkings.length >= 2) {
    // 2. 删除 slug 为 sfo-the-westin-sf-airport-uncovered-self-park 的记录
    const toDelete = parkings.find(p => p.slug === 'sfo-the-westin-sf-airport-uncovered-self-park');
    const toKeep = parkings.find(p => p.slug === 'sfo-park-n-fly-sfo-uncovered-self-park');
    
    if (toDelete) {
      await prisma.parkingLot.delete({
        where: { id: toDelete.id },
      });
      console.log(`\n✅ 已删除: ${toDelete.name} (${toDelete.slug})`);
    }
    
    if (toKeep) {
      console.log(`\n✅ 保留: ${toKeep.name} (${toKeep.slug})`);
    }
  }
  
  await prisma.$disconnect();
}

fix();
