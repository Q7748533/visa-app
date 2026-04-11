import { NextRequest, NextResponse } from 'next/server';

// Node.js Runtime - 60s timeout, better for slow AI APIs
export const maxDuration = 60;

// AI 配置 - 使用环境变量
// 注意：在 Next.js API Route 中，环境变量可以直接通过 process.env 访问
const AI_CONFIG = {
  model: process.env.AI_MODEL || 'gemini-3.1-pro-preview',
  apiUrl: (process.env.OPENAI_BASE_URL || 'https://api.vectorengine.ai') + '/chat/completions',
  apiKey: process.env.OPENAI_API_KEY || '',
};

interface ParsedParkingData {
  name?: string;
  address?: string;
  dailyRate?: number;
  distanceMiles?: number;
  shuttleMins?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  shuttleFrequency?: string;
  shuttleHours?: string;
  arrivalDirections?: string;
  thingsToKnow?: string;
  isIndoor?: boolean;
  hasValet?: boolean;
  is24Hours?: boolean;
  // Way.com 扩展字段
  description?: string;
  shuttleDesc?: string;
  cancellationPolicy?: string;
  parkingAccess?: string;
  operatingDays?: string;
  contactPhone?: string;
  recommendationPct?: number;
  locationRating?: number;
  staffRating?: number;
  facilityRating?: number;
  safetyRating?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { rawData } = await request.json();

    if (!rawData || typeof rawData !== 'string') {
      return NextResponse.json(
        { error: '请提供原始数据' },
        { status: 400 }
      );
    }

    // 检查 API Key 是否配置
    if (!AI_CONFIG.apiKey) {
      console.error('AI_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI API Key 未配置，请检查环境变量' },
        { status: 500 }
      );
    }

    // 构建 AI Prompt
    const prompt = buildPrompt(rawData);

    // 调用 AI API
    const aiResponse = await callAI(prompt);

    // 解析 AI 返回的结果
    const parsedData = parseAIResponse(aiResponse);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error('AI parsing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'AI 解析失败，请重试';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function buildPrompt(rawData: string): string {
  return `You are a professional parking lot data extraction assistant. Please extract parking lot information from the following raw data and return it in JSON format.

Raw Data:
${rawData}

Please extract the following fields (set to null or empty array if not present in data):

===== CORE FIELDS =====
- name: Parking lot name
- address: Full address
- dailyRate: Daily price (number, in USD)
- distanceMiles: Distance from airport in miles (number)
- shuttleMins: Shuttle time in minutes (number)
- rating: Rating (number between 1-5)
- reviewCount: Number of reviews (number)
- tags: Array of tags (e.g., ["Self Park", "Covered", "Valet"])
- shuttleFrequency: Shuttle frequency description (e.g., "Every 10-15 mins")
- shuttleHours: Shuttle operating hours
- arrivalDirections: Arrival instructions (concise, practical directions on how to reach the parking lot and check in. Extract from parkingAccess field, keep only the essential arrival steps)
- thingsToKnow: Array of important notes in format [{"title": "Title", "content": "Content"}]. Extract from customMessage, cancellationPolicy, and other policy fields. DO NOT include arrival instructions here - only policies, restrictions, fees, and important rules
- isIndoor: Whether indoor parking (boolean, true/false)
- hasValet: Whether valet service available (boolean, true/false)
- is24Hours: Whether open 24 hours (boolean, true/false)

===== WAY.COM EXTENSION FIELDS =====
- description: Detailed parking lot description (from listingDesc or description field)
- shuttleDesc: Detailed shuttle service description (from shuttleDescription)
- cancellationPolicy: Cancellation policy text (from cancellationPolicy)
- parkingAccess: Arrival/parking instructions (from parkingAccess, clean HTML tags)
- operatingDays: Operating hours summary (from operatingDays, format as readable text like "Open 24/7")
- contactPhone: Contact phone number (from contactValue or phone)
- recommendationPct: Recommendation percentage (from recommendationPercentage, number 0-100)
- locationRating: Location rating (from reviewAttribute.locationRating, number 0-5)
- staffRating: Staff/service rating (from reviewAttribute.staffRating, number 0-5)
- facilityRating: Facility rating (from reviewAttribute.facilityRating, number 0-5)
- safetyRating: Safety rating (from reviewAttribute.safetyRating, number 0-5)

IMPORTANT INSTRUCTIONS:
1. ALL text content MUST be in English ONLY. Do not use any Chinese or other languages.
2. thingsToKnow must be an array format, each element contains title and content
3. Boolean values must be true or false, not strings
4. Only return JSON object, do not include any other text
5. AVOID DUPLICATION: arrivalDirections and thingsToKnow should NOT contain the same information. 
   - arrivalDirections = practical steps to arrive and check in (e.g., "Show your confirmation email to the attendant")
   - thingsToKnow = policies, fees, restrictions (e.g., "Vehicle Charges: Mini Van / SUV: $5 per day")
6. DO NOT put operating hours (24/7) in arrivalDirections - it belongs in operatingDays field

Format:
{
  "name": "...",
  "address": "...",
  "dailyRate": 25.99,
  "distanceMiles": 2.5,
  "shuttleMins": 10,
  "rating": 4.5,
  "reviewCount": 120,
  "tags": ["Self Park", "Covered"],
  "shuttleFrequency": "Every 10-15 mins",
  "shuttleHours": "24/7",
  "arrivalDirections": "Arrival directions text",
  "thingsToKnow": [
    {"title": "Cancellation Policy", "content": "Reservations are non-refundable"},
    {"title": "Operating Hours", "content": "Open 24 hours"}
  ],
  "isIndoor": false,
  "hasValet": false,
  "is24Hours": true,
  "description": "Detailed description of the parking lot...",
  "shuttleDesc": "Free shuttle service running every 15 minutes...",
  "cancellationPolicy": "Flexible cancellation up to check-in time...",
  "parkingAccess": "This facility is open 24/7...",
  "operatingDays": "Open 24/7",
  "contactPhone": "+1 7184806663",
  "recommendationPct": 98,
  "locationRating": 4.1,
  "staffRating": 4.9,
  "facilityRating": 4.8,
  "safetyRating": 4.5
}`;
}

async function callAI(prompt: string, retries = 3): Promise<string> {
  console.log('Calling AI API:', AI_CONFIG.apiUrl);
  console.log('Model:', AI_CONFIG.model);
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${retries}...`);
      
      // 向量引擎完全兼容 OpenAI 接口，使用 Authorization: Bearer 格式
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时（2分钟）
      
      const response = await fetch(AI_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('AI API response status:', response.status);
      console.log('Content-Type:', response.headers.get('content-type'));

      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 500));

      if (!response.ok) {
        console.error('AI API error response:', responseText);
        throw new Error(`AI API error: ${response.status} - ${responseText.substring(0, 200)}`);
      }

      // 检查是否是 JSON 响应
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`AI API 返回了非 JSON 响应: ${contentType}. 响应内容: ${responseText.substring(0, 200)}`);
      }

      try {
        const data = JSON.parse(responseText);
        console.log('AI API response parsed:', JSON.stringify(data, null, 2));
        return data.choices?.[0]?.message?.content || '';
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        throw new Error(`AI API 返回了无效的 JSON: ${responseText.substring(0, 200)}`);
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < retries) {
        const delay = attempt * 2000; // 递增延迟: 2s, 4s, 6s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('AI API 调用失败，已重试多次');
}

// 清理 HTML 标签的辅助函数
function stripHtmlTags(html: string): string {
  if (!html) return '';
  // 移除 HTML 标签
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// 清理 thingsToKnow 中的 HTML
function cleanThingsToKnow(thingsToKnow: any): any {
  if (!thingsToKnow) return undefined;
  
  if (Array.isArray(thingsToKnow)) {
    return thingsToKnow.map(item => {
      if (typeof item === 'string') {
        return stripHtmlTags(item);
      }
      if (typeof item === 'object' && item !== null) {
        return {
          title: item.title ? stripHtmlTags(item.title) : undefined,
          content: item.content ? stripHtmlTags(item.content) : '',
        };
      }
      return item;
    });
  }
  
  return thingsToKnow;
}

function parseAIResponse(response: string): ParsedParkingData {
  try {
    // 尝试提取 JSON 部分
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: parsed.name || undefined,
        address: parsed.address || undefined,
        dailyRate: parsed.dailyRate || undefined,
        distanceMiles: parsed.distanceMiles || undefined,
        shuttleMins: parsed.shuttleMins || undefined,
        rating: parsed.rating || undefined,
        reviewCount: parsed.reviewCount || undefined,
        tags: Array.isArray(parsed.tags) ? parsed.tags : undefined,
        shuttleFrequency: parsed.shuttleFrequency || undefined,
        shuttleHours: parsed.shuttleHours || undefined,
        arrivalDirections: parsed.arrivalDirections ? stripHtmlTags(parsed.arrivalDirections) : undefined,
        thingsToKnow: cleanThingsToKnow(parsed.thingsToKnow),
        isIndoor: parsed.isIndoor || undefined,
        hasValet: parsed.hasValet || undefined,
        is24Hours: parsed.is24Hours !== undefined ? parsed.is24Hours : undefined,
        // Way.com 扩展字段
        description: parsed.description || undefined,
        shuttleDesc: parsed.shuttleDesc || undefined,
        cancellationPolicy: parsed.cancellationPolicy || undefined,
        parkingAccess: parsed.parkingAccess ? stripHtmlTags(parsed.parkingAccess) : undefined,
        operatingDays: parsed.operatingDays || undefined,
        contactPhone: parsed.contactPhone || undefined,
        recommendationPct: parsed.recommendationPct || undefined,
        locationRating: parsed.locationRating || undefined,
        staffRating: parsed.staffRating || undefined,
        facilityRating: parsed.facilityRating || undefined,
        safetyRating: parsed.safetyRating || undefined,
      };
    }
    throw new Error('无法解析 AI 响应');
  } catch (error) {
    console.error('Parse AI response error:', error);
    return {};
  }
}
