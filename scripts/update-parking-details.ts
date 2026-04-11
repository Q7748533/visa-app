import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * 从 restrictions 文本中提取标题
 * 策略：
 * 1. 如果有冒号，用冒号前的内容作为标题
 * 2. 如果是 URL/App 相关内容，归类为 "App & Technology"
 * 3. 如果是退款/取消相关，归类为 "Cancellation Policy"
 * 4. 如果是超时/额外费用，归类为 "Overtime Charges"
 * 5. 如果是 QR/入场相关，归类为 "Check-in Instructions"
 * 6. 其他归类为 "Important Notes"
 */
function extractTitleFromRestriction(text: string): { title: string; content: string } {
  const trimmedText = text.trim();
  
  // 1. 检查是否有冒号
  if (trimmedText.includes(':')) {
    const colonIndex = trimmedText.indexOf(':');
    const title = trimmedText.substring(0, colonIndex).trim();
    const content = trimmedText.substring(colonIndex + 1).trim();
    return { title, content };
  }
  
  // 2. 根据关键词分类
  const lowerText = trimmedText.toLowerCase();
  
  if (lowerText.includes('app') || lowerText.includes('android') || lowerText.includes('apple') || lowerText.includes('link')) {
    return { title: 'App & Technology', content: trimmedText };
  }
  
  if (lowerText.includes('refund') || lowerText.includes('cancel') || lowerText.includes('non-refundable')) {
    return { title: 'Cancellation Policy', content: trimmedText };
  }
  
  if (lowerText.includes('overtime') || lowerText.includes('additional day') || lowerText.includes('charged') || lowerText.includes('exit')) {
    return { title: 'Overtime Charges', content: trimmedText };
  }
  
  if (lowerText.includes('qr code') || lowerText.includes('scan') || lowerText.includes('arrive') || lowerText.includes('check-in')) {
    return { title: 'Check-in Instructions', content: trimmedText };
  }
  
  if (lowerText.includes('change') || lowerText.includes('modify')) {
    return { title: 'Modification Policy', content: trimmedText };
  }
  
  if (lowerText.includes('water') || lowerText.includes('complimentary') || lowerText.includes('amenity')) {
    return { title: 'Amenities', content: trimmedText };
  }
  
  // 默认分类
  return { title: 'Important Notes', content: trimmedText };
}

/**
 * 清理 HTML 标签
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

async function updateParkingWithRichData(jsonFileName: string) {
  const filePath = path.join(process.cwd(), jsonFileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  const result = data.result;
  const facility = result.facility;
  const common = facility.common;
  const airport = data.airport;
  const rate = result.rates[0];
  
  // 注意：不同数据在不同位置
  // - transportation、redemption_instructions 在 result.facility.airport 下
  // - amenities 在 result.rates[0].airport 下
  const facilityAirport = result.facility?.airport;
  const rateAirport = rate.airport;

  console.log(`\n🔄 正在深度覆盖停车场数据: ${common.title}`);

  // 1. 提取 Amenities (标签云) - 从 rate.airport 获取
  const amenities = rateAirport?.amenities || [];
  const tagsArr = amenities.map((a: any) => a.display_name);

  // 2. 转换 ArrivalDirections
  // SpotHero 只有一套 arrival 流程，不区分方向
  const arrivalSteps = facilityAirport?.redemption_instructions?.arrival || [];
  
  // 构建到达描述
  const arrivalDescription = arrivalSteps
    .map((step: any, index: number) => {
      const stepNum = index + 1;
      const cleanText = stripHtml(step.text);
      return `Step ${stepNum}: ${cleanText}`;
    })
    .join('\n\n');
  
  // 使用 navigation_tip 作为警告/提示
  const navigationTip = common.navigation_tip || "Follow onsite signs to parking area.";
  
  const arrivalDirections = {
    fromWest: {
      description: arrivalDescription || "Please follow the signs to the parking facility upon arrival.",
      warning: navigationTip
    }
    // 注意：SpotHero 数据没有 fromNorth，所以只保留 fromWest
  };

  // 3. 转换 ThingsToKnow
  const restrictions = common.restrictions || [];
  const thingsToKnow = restrictions.map((text: string) => extractTitleFromRestriction(text));

  // 4. 提取班车相关信息
  const transportation = facilityAirport?.transportation;
  const shuttleHoursText = transportation?.hours_of_operation?.text?.[0] || "Contact facility for hours";
  
  // 提取班车频率
  let shuttleFrequencyText = "On Demand";
  if (transportation?.schedule) {
    const fastFreq = transportation.schedule.fast_frequency;
    const slowFreq = transportation.schedule.slow_frequency;
    const duration = transportation.schedule.duration;
    
    if (fastFreq && slowFreq) {
      shuttleFrequencyText = `Every ${fastFreq}-${slowFreq} mins`;
    } else if (duration) {
      shuttleFrequencyText = `${duration} min to terminal`;
    }
  }
  
  // 5. 提取距离和时间
  const distanceMeters = result.distance?.linear_meters;
  const distanceMiles = distanceMeters ? Math.round((distanceMeters / 1609.34) * 10) / 10 : null;
  const shuttleMins = transportation?.schedule?.duration || null;

  // 6. 提取地址
  const addressObj = common.addresses?.find((a: any) => a.types?.includes('default_vehicle_entrance')) || common.addresses?.[0];
  const fullAddress = addressObj 
    ? `${addressObj.street_address}, ${addressObj.city}, ${addressObj.state} ${addressObj.postal_code}`
    : "";

  // 7. 提取评分
  const ratingValue = common.rating?.average || null;
  const reviewCountValue = common.rating?.count || null;

  // 8. 提取价格
  const dailyRateValue = rate.quote?.advertised_price?.value 
    ? rate.quote.advertised_price.value / 100 
    : (rate.quote?.total_price?.value ? rate.quote.total_price.value / 100 / (rate.quote?.order?.[0]?.items?.[0]?.short_description?.includes('days') ? parseInt(rate.quote.order[0].items[0].short_description) : 1) : 0);

  // 9. 判断布尔值
  const isIndoorValue = amenities.some((a: any) => ['covered', 'garage', 'indoor'].includes(a.type));
  const hasValetValue = amenities.some((a: any) => a.type === 'valet');
  const is24HoursValue = common.hours_of_operation?.always_open || false;

  console.log(`   📍 Address: ${fullAddress}`);
  console.log(`   💰 Daily Rate: $${dailyRateValue}`);
  console.log(`   📏 Distance: ${distanceMiles} miles`);
  console.log(`   ⏱️  Shuttle: ${shuttleMins} mins, ${shuttleFrequencyText}`);
  console.log(`   ⭐ Rating: ${ratingValue}/5 (${reviewCountValue} reviews)`);
  console.log(`   🏷️  Tags: ${tagsArr.join(', ')}`);
  console.log(`   📝 Things to Know: ${thingsToKnow.length} items`);

  // 10. 查找现有记录（通过 slug 或名称匹配）
  let existingParking = await prisma.parkingLot.findUnique({
    where: { slug: common.slug },
  });

  // 如果没找到，尝试通过名称匹配（更严格的匹配逻辑）
  if (!existingParking) {
    // 方法1: 提取关键标识词（排除常见词）
    const keyWords = common.title
      .split(' ')
      .filter((word: string) => 
        word.length > 2 && 
        !['the', 'airport', 'parking', 'lot', 'self', 'uncovered', 'covered', 'valet', 'indoor', 'outdoor'].includes(word.toLowerCase())
      )
      .map((word: string) => word.toLowerCase());
    
    console.log(`   🔍 尝试用关键词匹配: ${keyWords.join(', ')}`);
    
    // 方法2: 尝试完整名称匹配（去掉连字符和空格）
    const normalizedTitle = common.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    console.log(`   🔍 尝试完整名称匹配: ${normalizedTitle}`);
    
    // 获取该机场的所有停车场
    const allParkings = await prisma.parkingLot.findMany({
      where: {
        airportIataCode: airport.code.toLowerCase(),
      },
    });
    
    console.log(`   🔍 该机场共有 ${allParkings.length} 个停车场`);
    
    // 尝试找到最佳匹配
    let bestMatch = null;
    let bestScore = 0;
    
    for (const parking of allParkings) {
      const normalizedParkingName = parking.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // 检查是否包含关键标识词（必须是独立单词）
      const parkingNameLower = parking.name.toLowerCase();
      const matchedKeywords = keyWords.filter((kw: string) => {
        // 检查是否是独立单词匹配（前后是空格或边界）
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        return regex.test(parkingNameLower);
      });
      
      // 计算相似度（简单实现：共同子串长度）
      let similarity = 0;
      for (let i = 0; i < Math.min(normalizedTitle.length, normalizedParkingName.length); i++) {
        if (normalizedTitle[i] === normalizedParkingName[i]) {
          similarity++;
        } else {
          break;
        }
      }
      
      // 计算总分：相似度 + 匹配的关键词数 * 10
      const score = similarity + (matchedKeywords.length * 10);
      
      console.log(`      - ${parking.name}: 匹配关键词=[${matchedKeywords.join(', ')}], 相似度=${similarity}, 总分=${score}`);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = parking;
      }
    }
    
    // 如果最佳匹配的分数足够高，使用它
    if (bestMatch && bestScore >= 20) {
      existingParking = bestMatch;
      console.log(`   ✅ 找到最佳匹配: ${bestMatch.name} (slug: ${bestMatch.slug}), 得分=${bestScore}`);
    }
  }

  // 11. 执行更新或创建
  if (existingParking) {
    // 更新现有记录
    await prisma.parkingLot.update({
      where: { id: existingParking.id },
      data: {
        name: common.title,
        address: fullAddress,
        rating: ratingValue,
        reviewCount: reviewCountValue,
        dailyRate: dailyRateValue,
        distanceMiles: distanceMiles,
        shuttleMins: shuttleMins,
        
        // 班车信息
        shuttleHours: shuttleHoursText,
        shuttleFrequency: shuttleFrequencyText,
        
        // 核心布尔值
        isIndoor: isIndoorValue,
        hasValet: hasValetValue,
        is24Hours: is24HoursValue,

        // JSON 字段
        tags: JSON.stringify(tagsArr),
        arrivalDirections: JSON.stringify(arrivalDirections),
        thingsToKnow: JSON.stringify(thingsToKnow),
        
        // 存入原始数据备用
        rawContent: JSON.stringify(result),
        lastCheckedAt: new Date(),
      },
    });
    console.log(`✅ [${airport.code}] ${common.title} 已更新到现有记录！`);
  } else {
    // 创建新记录
    await prisma.parkingLot.create({
      data: {
        airport: { connect: { iataCode: airport.code.toLowerCase() } },
        name: common.title,
        slug: common.slug,
        type: 'OFF_SITE',
        dailyRate: dailyRateValue,
        distanceMiles: distanceMiles,
        shuttleMins: shuttleMins,
        
        // 班车信息
        shuttleHours: shuttleHoursText,
        shuttleFrequency: shuttleFrequencyText,
        
        // 核心布尔值
        isIndoor: isIndoorValue,
        hasValet: hasValetValue,
        is24Hours: is24HoursValue,

        // JSON 字段
        tags: JSON.stringify(tagsArr),
        arrivalDirections: JSON.stringify(arrivalDirections),
        thingsToKnow: JSON.stringify(thingsToKnow),
        
        // 存入原始数据备用
        rawContent: JSON.stringify(result),
        lastCheckedAt: new Date(),
      },
    });
    console.log(`✅ [${airport.code}] ${common.title} 已创建新记录！`);
  }
}

// 主函数
async function main() {
  // 获取命令行参数中的文件列表
  const args = process.argv.slice(2);
  
  let detailFiles: string[] = [];
  
  if (args.length > 0) {
    // 使用命令行参数提供的文件
    detailFiles = args;
  } else {
    // 默认文件列表
    detailFiles = [
      "sfo_detail_parknfly.json"
    ];
  }

  console.log(`🚀 开始处理 ${detailFiles.length} 个文件...`);

  for (const file of detailFiles) {
    try {
      await updateParkingWithRichData(file);
    } catch (error) {
      console.error(`❌ 处理文件 ${file} 失败:`, error);
    }
  }

  console.log('\n🎉 所有文件处理完成！');
}

main().finally(() => prisma.$disconnect());
