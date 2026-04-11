import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
  // 找到 SFO 的 Park N Fly 记录
  const parkings = await prisma.parkingLot.findMany({
    where: {
      airportIataCode: 'sfo',
      name: 'Park N Fly SFO - Uncovered Self Park',
    },
  });
  
  console.log(`找到 ${parkings.length} 条记录:`);
  parkings.forEach(p => {
    console.log(`- ${p.slug}: $${p.dailyRate}`);
  });
  
  if (parkings.length >= 2) {
    // 删除 slug 包含 aloft 的记录
    const toDelete = parkings.find(p => p.slug.includes('aloft'));
    const toKeep = parkings.find(p => p.slug === 'sfo-park-n-fly-sfo-uncovered-self-park');
    
    if (toDelete) {
      await prisma.parkingLot.delete({
        where: { id: toDelete.id },
      });
      console.log(`\n✅ 已删除: ${toDelete.slug}`);
    }
    
    if (toKeep) {
      console.log(`\n✅ 保留: ${toKeep.slug}`);
    }
  }
  
  await prisma.$disconnect();
}

fix();
