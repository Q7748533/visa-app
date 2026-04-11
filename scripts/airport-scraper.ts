import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

// 💡 核心机场城市纠错字典
const AIRPORT_CITY_MAP: Record<string, string> = {
  'ORD': 'Chicago',
  'MDW': 'Chicago',
  'JFK': 'New York',
  'LGA': 'New York',
  'EWR': 'New York',
  'LAX': 'Los Angeles',
  'SFO': 'San Francisco',
  'SAN': 'San Diego',
  'DFW': 'Dallas',
  'IAH': 'Houston',
  'AUS': 'Austin',
  'ATL': 'Atlanta',
  'MIA': 'Miami',
  'MCO': 'Orlando',
  'BOS': 'Boston',
  'SEA': 'Seattle',
  'LAS': 'Las Vegas',
  'DEN': 'Denver',
  'PHX': 'Phoenix',
  'YYZ': 'Toronto',
};

// 生成唯一 slug 的辅助函数
const generateSlug = (airportCode: string, name: string) => {
  return `${airportCode.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/(^-|-$)+/g, '');
};

async function importFromSpotHeroJson(jsonFileName: string) { 
  const filePath = path.join(process.cwd(), jsonFileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  const spotheroData = JSON.parse(rawData);

  const realIataCode = spotheroData.airport?.code;
  if (!realIataCode) {
      throw new Error(`在 ${jsonFileName} 中找不到机场代码！`);
  }

  const iataUpper = realIataCode.toUpperCase();
  const iataLower = realIataCode.toLowerCase();
  
  console.log(`▶️ 正在解析: ${jsonFileName} -> 识别机场: ${iataUpper}`);

  const firstResult = spotheroData.results[0];
  const addressInfo = firstResult?.facility?.common?.addresses?.[0];
  
  const suburbanCity = addressInfo?.city || addressInfo?.state || "TBD";
  const detectedCountry = addressInfo?.country === 'US' ? 'USA' : (addressInfo?.country || "USA");
  const finalCity = AIRPORT_CITY_MAP[iataUpper] || suburbanCity;

  // 1. 确保 Airport 存在
  await prisma.airport.upsert({
    where: { iataCode: iataLower },
    update: {
      name: spotheroData.airport?.full_name || `${iataUpper} International Airport`,
      city: finalCity,
      country: detectedCountry,
      isActive: true,
    },
    create: {
      iata: iataUpper,
      iataCode: iataLower,
      name: spotheroData.airport?.full_name || `${iataUpper} International Airport`,
      city: finalCity, 
      country: detectedCountry,
      slug: `${iataLower}-airport`,
      isActive: true,
      isPopular: false,
      searchVolume: 0,
    }
  });

  let count = 0;
  for (const item of spotheroData.results) {
    const facility = item.facility;
    const common = facility.common;
    const airportInfo = facility.airport;
    const rateInfo = item.rates[0]?.quote;

    if (!rateInfo) continue;

    const name = common.title;
    const slug = generateSlug(iataUpper, name);

    // Features (amenities) 提取逻辑
    const rateAirportInfo = item.rates[0]?.airport;
    const amenities = rateAirportInfo?.amenities?.map((a: any) => a.display_name) || [];
    const isIndoor = rateAirportInfo?.amenities?.some((a: any) => a.type === 'covered' || a.type === 'garage') || false;
    const hasValet = rateAirportInfo?.amenities?.some((a: any) => a.type === 'valet') || false;

    // 2. 写入 ParkingLot
    await prisma.parkingLot.upsert({
      where: { slug: slug },
      update: {
        dailyRate: rateInfo.advertised_price?.value / 100 || rateInfo.total_price.value / 100,
        distanceMiles: parseFloat((item.distance.linear_meters * 0.000621371).toFixed(2)),
        shuttleMins: airportInfo.transportation?.schedule?.duration || null,
        isIndoor: isIndoor,
        hasValet: hasValet,
        is24Hours: airportInfo.hours_of_operation?.always_open || false,
        rating: common.rating?.average || null,
        reviewCount: common.rating?.count || null,
        tags: JSON.stringify(amenities),
        rawContent: JSON.stringify(item), 
        lastCheckedAt: new Date(),
        isActive: true,
      },
      create: {
        airport: { connect: { iataCode: iataLower } },
        name: name,
        slug: slug,
        type: 'OFF_SITE',
        dailyRate: rateInfo.advertised_price?.value / 100 || rateInfo.total_price.value / 100,
        distanceMiles: parseFloat((item.distance.linear_meters * 0.000621371).toFixed(2)),
        shuttleMins: airportInfo.transportation?.schedule?.duration || null,
        isIndoor: isIndoor,
        hasValet: hasValet,
        is24Hours: airportInfo.hours_of_operation?.always_open || false,
        rating: common.rating?.average || null,
        reviewCount: common.rating?.count || null,
        tags: JSON.stringify(amenities),
        dataSource: 'SpotHero_Internal_API',
        rawContent: JSON.stringify(item),
        lastCheckedAt: new Date(),
        isActive: true,
        featured: false,
      }
    });

    count++;
  }
  console.log(`✅ ${iataUpper} 同步完成，入库 ${count} 个停车场。`);
}

async function main() {
  // 💡 在这里列出所有你想要导入的 JSON 文件名
  const filesToProcess = [
    "sfo_raw.json",
    // 继续添加更多文件名...
  ];

  console.log(`\n🚀 批量导入任务开始，总计 ${filesToProcess.length} 个文件...`);

  for (const file of filesToProcess) {
    try {
      await importFromSpotHeroJson(file);
    } catch (error: any) {
      console.error(`❌ 文件 ${file} 导入失败: ${error.message}`);
      // 继续下一个文件，不中断程序
    }
  }

  console.log(`\n✨ 所有任务执行完毕！`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());