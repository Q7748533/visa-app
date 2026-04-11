import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function check() {
  // 1. 读取数据库数据
  const parking = await prisma.parkingLot.findUnique({
    where: { slug: 'sfo-park-n-fly-sfo-uncovered-self-park' },
  });
  
  // 2. 读取原始 JSON 数据
  const filePath = path.join(process.cwd(), 'sfo_detail_parknfly.json');
  const rawData = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  const result = data.result;
  const common = result.facility.common;
  const facilityAirport = result.facility?.airport;
  const transportation = facilityAirport?.transportation;
  const rate = result.rates[0];
  
  console.log('=== 数据对比检查 ===\n');
  
  // Address
  const addressObj = common.addresses?.find((a: any) => a.types?.includes('default_vehicle_entrance')) || common.addresses?.[0];
  const jsonAddress = addressObj ? `${addressObj.street_address}, ${addressObj.city}, ${addressObj.state} ${addressObj.postal_code}` : 'N/A';
  console.log('📍 Address:');
  console.log(`   JSON:  ${jsonAddress}`);
  console.log(`   DB:    ${parking?.address || 'N/A'}`);
  console.log(`   Match: ${jsonAddress === parking?.address ? '✅' : '❌'}`);
  console.log('');
  
  // Rating
  const jsonRating = common.rating?.average || 'N/A';
  console.log('⭐ Rating:');
  console.log(`   JSON:  ${jsonRating}`);
  console.log(`   DB:    ${parking?.rating || 'N/A'}`);
  console.log(`   Match: ${jsonRating === parking?.rating ? '✅' : '❌'}`);
  console.log('');
  
  // Review Count
  const jsonReviews = common.rating?.count || 'N/A';
  console.log('📝 Reviews:');
  console.log(`   JSON:  ${jsonReviews}`);
  console.log(`   DB:    ${parking?.reviewCount || 'N/A'}`);
  console.log(`   Match: ${jsonReviews === parking?.reviewCount ? '✅' : '❌'}`);
  console.log('');
  
  // Tags (Amenities) - 从 rate.airport 获取
  const amenities = rate.airport?.amenities || [];
  const jsonTags = amenities.map((a: any) => a.display_name);
  let dbTags: string[] = [];
  try {
    if (parking?.tags) dbTags = JSON.parse(parking.tags);
  } catch (e) {}
  console.log('🏷️ Tags:');
  console.log(`   JSON:  ${jsonTags.join(', ') || 'N/A'}`);
  console.log(`   DB:    ${dbTags.join(', ') || 'N/A'}`);
  console.log(`   Match: ${JSON.stringify(jsonTags.sort()) === JSON.stringify(dbTags.sort()) ? '✅' : '❌'}`);
  console.log('');
  
  // Daily Rate
  const jsonRate = rate.quote?.advertised_price?.value ? rate.quote.advertised_price.value / 100 : 'N/A';
  console.log('💰 Daily Rate:');
  console.log(`   JSON:  $${jsonRate}`);
  console.log(`   DB:    $${parking?.dailyRate || 'N/A'}`);
  console.log(`   Match: ${jsonRate === Number(parking?.dailyRate) ? '✅' : '❌'}`);
  console.log('');
  
  // Distance
  const distanceMeters = result.distance?.linear_meters;
  const jsonDistance = distanceMeters ? Math.round((distanceMeters / 1609.34) * 10) / 10 : 'N/A';
  console.log('📏 Distance:');
  console.log(`   JSON:  ${jsonDistance} miles`);
  console.log(`   DB:    ${parking?.distanceMiles || 'N/A'} miles`);
  console.log(`   Match: ${jsonDistance === parking?.distanceMiles ? '✅' : '❌'}`);
  console.log('');
  
  // Travel Time (shuttleMins)
  const jsonDuration = transportation?.schedule?.duration || 'N/A';
  console.log('⏱️ Travel Time:');
  console.log(`   JSON:  ${jsonDuration} min`);
  console.log(`   DB:    ${parking?.shuttleMins || 'N/A'} min`);
  console.log(`   Match: ${jsonDuration === parking?.shuttleMins ? '✅' : '❌'}`);
  console.log('');
  
  // Lot Type
  console.log('🏢 Lot Type:');
  console.log(`   DB:    ${parking?.type || 'N/A'}`);
  console.log(`   Expected: OFF_SITE`);
  console.log('');
  
  // isIndoor
  const jsonIsIndoor = amenities.some((a: any) => ['covered', 'garage', 'indoor'].includes(a.type));
  console.log('🏠 isIndoor:');
  console.log(`   JSON (derived): ${jsonIsIndoor}`);
  console.log(`   DB:             ${parking?.isIndoor}`);
  console.log(`   Match: ${jsonIsIndoor === parking?.isIndoor ? '✅' : '❌'}`);
  console.log('');
  
  // Shuttle Hours
  const jsonShuttleHours = transportation?.hours_of_operation?.text?.[0] || 'N/A';
  console.log('🚌 Shuttle Hours:');
  console.log(`   JSON:  ${jsonShuttleHours}`);
  console.log(`   DB:    ${parking?.shuttleHours || 'N/A'}`);
  console.log(`   Match: ${jsonShuttleHours === parking?.shuttleHours ? '✅' : '❌'}`);
  
  await prisma.$disconnect();
}

check();
