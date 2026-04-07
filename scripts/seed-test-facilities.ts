/**
 * 测试数据种子脚本
 * 添加示例设施数据用于测试新的 Facility 模型
 * 运行方式: npx tsx scripts/seed-test-facilities.ts
 */

import { prisma } from '../lib/db';

async function seedTestFacilities() {
  console.log('🌱 Seeding test facilities...\n');

  // 先确保有测试机场
  const testAirports = [
    { iata: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', continent: 'Asia', isPopular: true, searchVolume: 5000 },
    { iata: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', continent: 'Asia', isPopular: true, searchVolume: 4500 },
    { iata: 'ICN', name: 'Seoul Incheon International Airport', city: 'Seoul', country: 'South Korea', continent: 'Asia', isPopular: true, searchVolume: 4000 },
    { iata: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', continent: 'Asia', isPopular: true, searchVolume: 4200 },
    { iata: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', continent: 'Europe', isPopular: true, searchVolume: 4800 },
    { iata: 'CDG', name: 'Paris Charles de Gaulle Airport', city: 'Paris', country: 'France', continent: 'Europe', isPopular: true, searchVolume: 3800 },
    { iata: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', continent: 'North America', isPopular: true, searchVolume: 4600 },
    { iata: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', continent: 'North America', isPopular: true, searchVolume: 4400 },
  ];

  // 创建或更新机场
  for (const airport of testAirports) {
    await prisma.airport.upsert({
      where: { iata: airport.iata },
      update: airport,
      create: {
        ...airport,
        slug: `${airport.city.toLowerCase().replace(/\s+/g, '-')}-airport-${airport.iata.toLowerCase()}`,
      },
    });
    console.log(`✈️  Airport: ${airport.iata} - ${airport.name}`);
  }

  // 添加淋浴设施
  const showerFacilities = [
    // SIN - 新加坡樟宜机场
    {
      airportIata: 'SIN',
      name: 'Aerotel Airport Transit Hotel',
      nameEn: 'Aerotel Airport Transit Hotel',
      terminal: 'T1',
      location: 'Level 3, Departure Transit Hall (above Gate D41)',
      locationEn: 'Level 3, Departure Transit Hall (above Gate D41)',
      phone: '+65 6808 2388',
      email: 'rsvn.sin@myaerotel.com',
      website: 'https://www.myaerotel.com',
      hours: '24 hours',
      is24Hours: true,
      services: JSON.stringify(['SLEEPING', 'SHOWERS']),
      serviceDetails: JSON.stringify({
        sleeping: { type: 'hotel', price: '$80-200/night' },
        showers: { type: 'in_room', price: 'Included with room' }
      }),
      areaType: 'AIRSIDE',
      immigrationRequired: false,
      features: JSON.stringify(['淋浴', '按摩池', '叫醒服务']),
      notices: JSON.stringify(['需提前预订', '两岁以下免费']),
      dataSource: 'official',
    },
    {
      airportIata: 'SIN',
      name: 'Ambassador Transit Hotel',
      nameEn: 'Ambassador Transit Hotel',
      terminal: 'T2',
      location: 'Level 3, Departure Transit Hall South',
      locationEn: 'Level 3, Departure Transit Hall South',
      phone: '+65 6288 8911',
      email: 'enquiry@harilelahospitality.com',
      website: 'https://www.harilelahospitality.com',
      hours: '24 hours',
      is24Hours: true,
      services: JSON.stringify(['SLEEPING', 'SHOWERS']),
      serviceDetails: JSON.stringify({
        sleeping: { type: 'hotel', price: '$100-250/night' },
        showers: { type: 'in_room', price: 'Included with room' }
      }),
      areaType: 'AIRSIDE',
      immigrationRequired: false,
      features: JSON.stringify(['淋浴', '叫醒服务']),
      notices: JSON.stringify(['请勿办理入境手续']),
      dataSource: 'official',
    },
    // HND - 东京羽田机场
    {
      airportIata: 'HND',
      name: 'Shower Rooms',
      nameEn: 'Shower Rooms',
      terminal: 'T3',
      location: 'International Departure Area',
      locationEn: 'International Departure Area',
      hours: '24 hours',
      is24Hours: true,
      services: JSON.stringify(['SHOWERS']),
      serviceDetails: JSON.stringify({
        showers: { type: 'pay_per_use', price: '$15' }
      }),
      areaType: 'AIRSIDE',
      immigrationRequired: false,
      features: JSON.stringify(['毛巾', '洗浴用品']),
      dataSource: 'official',
    },
    // ICN - 首尔仁川机场
    {
      airportIata: 'ICN',
      name: 'Free Shower Facilities',
      nameEn: 'Free Shower Facilities',
      terminal: 'T1',
      location: 'East Wing, 4F',
      locationEn: 'East Wing, 4F',
      hours: '06:00 - 22:00',
      is24Hours: false,
      services: JSON.stringify(['SHOWERS']),
      serviceDetails: JSON.stringify({
        showers: { type: 'free', price: 'Free' }
      }),
      areaType: 'AIRSIDE',
      immigrationRequired: false,
      features: JSON.stringify(['免费', '毛巾']),
      dataSource: 'official',
    },
    // DXB - 迪拜机场
    {
      airportIata: 'DXB',
      name: 'Ahlan Business Class Lounge',
      nameEn: 'Ahlan Business Class Lounge',
      terminal: 'T3',
      location: 'Concourse A, Level 4',
      locationEn: 'Concourse A, Level 4',
      phone: '+971 4 505 1212',
      hours: '24 hours',
      is24Hours: true,
      services: JSON.stringify(['SHOWERS', 'LOUNGE']),
      serviceDetails: JSON.stringify({
        showers: { type: 'lounge', price: 'Included with lounge access' },
        lounge: { type: 'business', price: '$60' }
      }),
      areaType: 'AIRSIDE',
      immigrationRequired: false,
      features: JSON.stringify(['淋浴', '豪华洗浴用品', '毛巾']),
      dataSource: 'official',
    },
    // LHR - 伦敦希思罗机场
    {
      airportIata: 'LHR',
      name: 'No1 Lounge',
      nameEn: 'No1 Lounge',
      terminal: 'T3',
      location: 'Departure Lounge',
      locationEn: 'Departure Lounge',
      phone: '+44 20 8745 4599',
      hours: '04:30 - 22:30',
      is24Hours: false,
      services: JSON.stringify(['SHOWERS', 'LOUNGE']),
      serviceDetails: JSON.stringify({
        showers: { type: 'lounge', price: 'Included with lounge' },
        lounge: { type: 'pay_per_use', price: '£40' }
      }),
      areaType: 'AIRSIDE',
      immigrationRequired: false,
      features: JSON.stringify(['淋浴', '水疗产品']),
      dataSource: 'official',
    },
    // CDG - 巴黎戴高乐机场
    {
      airportIata: 'CDG',
      name: 'YotelAir Paris CDG',
      nameEn: 'YotelAir Paris CDG',
      terminal: 'T2E',
      location: 'Landside, Terminal 2E',
      locationEn: 'Landside, Terminal 2E',
      phone: '+33 1 74 25 29 50',
      hours: '24 hours',
      is24Hours: true,
      services: JSON.stringify(['SLEEPING', 'SHOWERS']),
      serviceDetails: JSON.stringify({
        sleeping: { type: 'pod', price: '€85-150' },
        showers: { type: 'in_room', price: 'Included' }
      }),
      areaType: 'LANDSIDE',
      immigrationRequired: true,
      features: JSON.stringify(['淋浴', '智能床']),
      dataSource: 'official',
    },
    // JFK - 纽约肯尼迪机场
    {
      airportIata: 'JFK',
      name: 'Delta Sky Club',
      nameEn: 'Delta Sky Club',
      terminal: 'T4',
      location: 'Concourse B, Level 2',
      locationEn: 'Concourse B, Level 2',
      hours: '04:30 - 23:30',
      is24Hours: false,
      services: JSON.stringify(['SHOWERS', 'LOUNGE']),
      serviceDetails: JSON.stringify({
        showers: { type: 'lounge', price: 'Included with membership' },
        lounge: { type: 'airline', price: '$59' }
      }),
      areaType: 'AIRSIDE',
      immigrationRequired: false,
      features: JSON.stringify(['淋浴', '高级洗浴用品']),
      dataSource: 'official',
    },
    // LAX - 洛杉矶机场
    {
      airportIata: 'LAX',
      name: 'Qantas First Lounge',
      nameEn: 'Qantas First Lounge',
      terminal: 'TBIT',
      location: 'Level 5, International Terminal',
      locationEn: 'Level 5, International Terminal',
      phone: '+1 310 665 6700',
      hours: '06:00 - 23:30',
      is24Hours: false,
      services: JSON.stringify(['SHOWERS', 'LOUNGE', 'SPA']),
      serviceDetails: JSON.stringify({
        showers: { type: 'lounge', price: 'First Class only' },
        lounge: { type: 'first_class', price: 'Complimentary' },
        spa: { type: 'treatment', price: 'From $80' }
      }),
      areaType: 'AIRSIDE',
      immigrationRequired: false,
      features: JSON.stringify(['淋浴', '水疗', '豪华设施']),
      dataSource: 'official',
    },
  ];

  // 创建设施
  for (const facility of showerFacilities) {
    await prisma.facility.create({
      data: facility,
    });
    console.log(`🚿 Facility: ${facility.name} at ${facility.airportIata}`);
  }

  console.log('\n✅ Test facilities seeded successfully!');
  console.log(`📊 Added ${showerFacilities.length} facilities across ${testAirports.length} airports`);
}

// 运行种子脚本
seedTestFacilities()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
