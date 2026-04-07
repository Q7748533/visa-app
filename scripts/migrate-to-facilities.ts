/**
 * 数据迁移脚本：将现有服务数据迁移到新的 Facility 模型
 * 运行方式: npx ts-node scripts/migrate-to-facilities.ts
 */

import { prisma } from '../lib/db';

// 服务类型映射
const SERVICE_MAP: Record<string, string> = {
  'sleepData': 'SLEEPING',
  'showerData': 'SHOWERS',
  'luggageData': 'STORAGE',
  'transitData': 'TRANSPORT',
};

// 区域类型推断
function inferAreaType(dataStr: string): string {
  const lower = dataStr.toLowerCase();
  if (lower.includes('landside') || lower.includes('public') || lower.includes('入境')) {
    return 'LANDSIDE';
  }
  if (lower.includes('private') || lower.includes('cip') || lower.includes('贵宾')) {
    return 'PRIVATE';
  }
  if (lower.includes('both') || lower.includes('both sides')) {
    return 'BOTH';
  }
  return 'AIRSIDE'; // 默认禁区
}

// 推断是否需要入境
function inferImmigrationRequired(dataStr: string, areaType: string): boolean {
  const lower = dataStr.toLowerCase();
  if (lower.includes('需入境') || lower.includes('immigration required') || lower.includes('check in')) {
    return true;
  }
  if (lower.includes('勿办理入境') || lower.includes('do not clear immigration') || lower.includes('airside')) {
    return false;
  }
  return areaType === 'LANDSIDE'; // 公共区域默认需要入境
}

// 提取航站楼信息
function extractTerminal(dataStr: string): string {
  const lower = dataStr.toLowerCase();
  const terminals: string[] = [];
  
  if (lower.includes('terminal 1') || lower.includes('t1') || lower.includes('1号航站楼')) terminals.push('T1');
  if (lower.includes('terminal 2') || lower.includes('t2') || lower.includes('2号航站楼')) terminals.push('T2');
  if (lower.includes('terminal 3') || lower.includes('t3') || lower.includes('3号航站楼')) terminals.push('T3');
  if (lower.includes('terminal 4') || lower.includes('t4') || lower.includes('4号航站楼')) terminals.push('T4');
  if (lower.includes('terminal 5') || lower.includes('t5') || lower.includes('5号航站楼')) terminals.push('T5');
  
  return terminals.length > 0 ? terminals.join(', ') : 'T1'; // 默认 T1
}

// 提取营业时间
function extractHours(dataStr: string): string {
  const lower = dataStr.toLowerCase();
  if (lower.includes('24 hour') || lower.includes('24h') || lower.includes('24小时')) {
    return '24小时';
  }
  // 尝试匹配时间模式
  const timeMatch = dataStr.match(/(\d{1,2}:\d{2}\s*(AM|PM)?\s*-\s*\d{1,2}:\d{2}\s*(AM|PM)?)/i);
  if (timeMatch) {
    return timeMatch[1];
  }
  return '24小时'; // 默认
}

// 为单个服务创建 Facility 记录
async function createFacilityFromService(
  airportIata: string,
  serviceType: string,
  dataStr: string
) {
  try {
    const data = JSON.parse(dataStr);
    const dataStrLower = dataStr.toLowerCase();
    
    // 推断基本信息
    const areaType = inferAreaType(dataStr);
    const immigrationRequired = inferImmigrationRequired(dataStr, areaType);
    const terminal = extractTerminal(dataStr);
    const hours = extractHours(dataStr);
    const is24Hours = hours.includes('24');
    
    // 构建设施名称
    let facilityName = `${airportIata} ${SERVICE_MAP[serviceType]} Facility`;
    if (data.name || data.facilityName) {
      facilityName = data.name || data.facilityName;
    }
    
    // 构建 serviceDetails
    const serviceDetails: Record<string, any> = {};
    serviceDetails[serviceType.replace('Data', '')] = {
      ...data,
      rawData: dataStr,
    };
    
    // 创建 Facility
    const facility = await prisma.facility.create({
      data: {
        airportIata,
        name: facilityName,
        terminal,
        location: data.location || data.address || null,
        phone: data.phone || data.tel || null,
        email: data.email || null,
        website: data.website || data.url || null,
        hours,
        is24Hours,
        services: JSON.stringify([SERVICE_MAP[serviceType]]),
        serviceDetails: JSON.stringify(serviceDetails),
        areaType,
        immigrationRequired,
        features: data.features ? JSON.stringify(data.features) : null,
        rawContent: dataStr,
        dataSource: 'migrated_from_legacy',
      },
    });
    
    console.log(`✓ Created facility: ${facility.name} (${facility.id}) for ${airportIata}`);
    return facility;
  } catch (error) {
    console.error(`✗ Failed to create facility for ${airportIata} ${serviceType}:`, error);
    return null;
  }
}

// 主迁移函数
async function migrateToFacilities() {
  console.log('🚀 Starting migration to Facility model...\n');
  
  // 获取所有有服务数据的机场
  const airports = await prisma.airport.findMany({
    where: {
      OR: [
        { sleepData: { not: null } },
        { showerData: { not: null } },
        { luggageData: { not: null } },
        { transitData: { not: null } },
      ],
    },
  });
  
  console.log(`Found ${airports.length} airports with service data\n`);
  
  let totalFacilities = 0;
  
  for (const airport of airports) {
    console.log(`\n📍 Processing ${airport.iata} - ${airport.name}`);
    
    // 迁移睡眠数据
    if (airport.sleepData) {
      const facility = await createFacilityFromService(airport.iata, 'sleepData', airport.sleepData);
      if (facility) totalFacilities++;
    }
    
    // 迁移淋浴数据
    if (airport.showerData) {
      const facility = await createFacilityFromService(airport.iata, 'showerData', airport.showerData);
      if (facility) totalFacilities++;
    }
    
    // 迁移行李数据
    if (airport.luggageData) {
      const facility = await createFacilityFromService(airport.iata, 'luggageData', airport.luggageData);
      if (facility) totalFacilities++;
    }
    
    // 迁移交通数据
    if (airport.transitData) {
      const facility = await createFacilityFromService(airport.iata, 'transitData', airport.transitData);
      if (facility) totalFacilities++;
    }
  }
  
  console.log(`\n✅ Migration completed!`);
  console.log(`📊 Total facilities created: ${totalFacilities}`);
  console.log(`\n⚠️  Note: This is a basic migration. You may need to:`);
  console.log(`   1. Manually merge duplicate facilities (e.g., hotel with both sleeping and showers)`);
  console.log(`   2. Update facility names and details for better accuracy`);
  console.log(`   3. Add more facilities using the new AI-assisted import feature`);
}

// 运行迁移
migrateToFacilities()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
