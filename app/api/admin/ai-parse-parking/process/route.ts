/**
 * AI 停车场数据解析 - 后台处理 API
 * POST /api/admin/ai-parse-parking/process
 * 
 * 请求体: { taskId: string }
 * 此端点由异步任务触发，处理时间较长
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// AI 配置
const AI_CONFIG = {
  model: process.env.AI_MODEL || 'gemini-3.1-pro-preview',
  apiUrl: (process.env.OPENAI_BASE_URL || 'https://api.vectorengine.ai') + '/chat/completions',
  apiKey: process.env.OPENAI_API_KEY || '',
};

export async function POST(request: NextRequest) {
  try {
    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: '缺少任务ID' }, { status: 400 });
    }

    // 获取任务
    const task = await prisma.aIParsingTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    if (task.status !== 'pending') {
      return NextResponse.json({ error: '任务状态不正确' }, { status: 400 });
    }

    // 更新状态为处理中
    await prisma.aIParsingTask.update({
      where: { id: taskId },
      data: { status: 'processing' },
    });

    try {
      // 调用 AI API
      const prompt = buildPrompt(task.inputData);
      const aiResponse = await callAI(prompt);
      const parsedData = parseAIResponse(aiResponse);

      // 更新任务结果
      await prisma.aIParsingTask.update({
        where: { id: taskId },
        data: {
          status: 'completed',
          result: JSON.stringify(parsedData),
        },
      });

      return NextResponse.json({ success: true });
    } catch (aiError) {
      // 更新失败状态
      await prisma.aIParsingTask.update({
        where: { id: taskId },
        data: {
          status: 'failed',
          error: aiError instanceof Error ? aiError.message : 'AI 处理失败',
        },
      });

      return NextResponse.json(
        { error: 'AI 处理失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Process task error:', error);
    return NextResponse.json(
      { error: '处理任务失败' },
      { status: 500 }
    );
  }
}

function buildPrompt(rawData: string): string {
  return `You are a professional parking lot data extraction assistant. Please extract parking lot information from the following raw data and return it in JSON format.

Raw Data:
${rawData}

Please extract the following fields (set to null or empty array if not present in data):

===== CORE FIELDS (Way.com format) =====
- name: Parking lot name (from listingName)
- description: Detailed description (from listingDesc)
- address: Full address (from address.addressString or combine address fields)
- dailyRate: Daily price (number, in USD, from parkingTypes[0].listingPrice or parkingTypes[0].avgPrice)
- distanceMiles: Distance from airport in miles (from airportDistance)
- shuttleMins: Shuttle duration in minutes (extract from shuttleDescription or parkingTypes[0].duration)
- rating: Overall rating (number between 1-5, from avgRating)
- reviewCount: Number of reviews (from ratingCount or reviewAttribute.reviewCount)

===== WAY.COM SPECIFIC FIELDS =====
- shuttleDesc: Detailed shuttle description (from shuttleDescription, e.g., "Free shuttle service to and from the airport terminals, running every 15 minutes daily")
- cancellationPolicy: Cancellation policy text (from cancellationPolicy)
- parkingAccess: Arrival/parking instructions (from parkingAccess, clean HTML tags but keep structure)
- operatingDays: Operating hours summary (from operatingDays array, format as readable text like "Open 24/7" or "Mon-Fri: 6AM-10PM, Sat-Sun: 8AM-8PM")
- contactPhone: Contact phone number (from contactValue)
- recommendationPct: Recommendation percentage (from recommendationPercentage)

===== DETAILED RATINGS (Way.com) =====
- locationRating: Location rating (from reviewAttribute.locationRating)
- staffRating: Staff/service rating (from reviewAttribute.staffRating)
- facilityRating: Facility rating (from reviewAttribute.facilityRating)
- safetyRating: Safety rating (from reviewAttribute.safetyRating)

===== FACILITY FEATURES =====
- tags: Array of amenity tags (from amenities[].amenityName, convert to concise tags like ["Staffed", "Free Shuttle", "Camera Surveillance", "24 Hour Attendant"])
- isIndoor: Whether indoor/covered parking (boolean, check amenities for "Covered" or parkingTypes for "Indoor")
- hasValet: Whether valet service available (boolean, check parkingTypes[].parkingType for "Valet" or amenities)
- is24Hours: Whether open 24 hours (boolean, check operatingDays or customMessage for "24/7")

===== ADDITIONAL INFO =====
- shuttleFrequency: Shuttle frequency short version (extract from shuttleDesc, e.g., "Every 15 mins")
- shuttleHours: Shuttle operating hours (from shuttleDesc or operatingDays)
- arrivalDirections: Simplified arrival directions (extract key info from parkingAccess, plain text)
- thingsToKnow: Array of important notes in format [{"title": "Title", "content": "Content"}]. Extract from:
   * cancellationPolicy → "Cancellation Policy"
   * customMessage → "Important Notes"
   * parkingAccess → "Arrival Instructions"
   * amenities → "Amenities"
   Clean HTML tags, use concise text, keep only critical information

===== INSTRUCTIONS =====
1. ALL text content MUST be in English ONLY
2. For dailyRate: Convert to number (e.g., 19.70 not "19.70")
3. For operatingDays: If all days are 00:00-23:59, output "Open 24/7"
4. For parkingAccess: Remove HTML tags but preserve paragraph structure
5. thingsToKnow must be an array format with title and content
6. Boolean values must be true or false, not strings
7. Only return JSON object, do not include any other text

Format:
{
  "name": "ARB Parking JFK Airport",
  "description": "ARB Parking JFK Airport, just 0.8 mile from JFK Airport...",
  "address": "128-20 152nd Ave, Queens, New York, 11420",
  "dailyRate": 19.70,
  "distanceMiles": 0.8,
  "shuttleMins": 8,
  "rating": 5.0,
  "reviewCount": 688,
  "shuttleDesc": "Free shuttle service to and from the airport terminals, running every 15 minutes daily",
  "cancellationPolicy": "Flexible. You can cancel the parking reservation up to the minute before the check-in time and receive a full refund.",
  "parkingAccess": "This facility is open 24/7. Customers must print out their confirmation emails...",
  "operatingDays": "Open 24/7",
  "contactPhone": "+1 7184806663",
  "recommendationPct": 98,
  "locationRating": 4.1,
  "staffRating": 4.9,
  "facilityRating": 4.8,
  "safetyRating": 4.5,
  "tags": ["Staffed", "Free Shuttle", "Camera Surveillance", "24 Hour Attendant", "Security Guard"],
  "isIndoor": false,
  "hasValet": true,
  "is24Hours": true,
  "shuttleFrequency": "Every 15 mins",
  "shuttleHours": "24/7",
  "arrivalDirections": "Show your email confirmation to the attendant on your smartphone or as a printout...",
  "thingsToKnow": [
    {"title": "Cancellation Policy", "content": "Flexible cancellation up to check-in time with full refund"},
    {"title": "Vehicle Types", "content": "Mini Van/SUV: +$5/day, Large SUV/Truck: +$7/day"},
    {"title": "Check-in", "content": "Print confirmation and place on dashboard before handing to valet"}
  ]
}`;
}

async function callAI(prompt: string, retries = 3): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000); // 55秒超时

      const response = await fetch(AI_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
      }
    }
  }

  throw lastError || new Error('AI API 调用失败');
}

function parseAIResponse(response: string): any {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('无法解析 AI 响应');
  } catch (error) {
    console.error('Parse error:', error);
    return {};
  }
}
