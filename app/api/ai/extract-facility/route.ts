/**
 * AI 设施提取 API
 * POST /api/ai/extract-facility
 * 
 * 请求体: { text: string, airportIata?: string }
 * 响应: { success: boolean, data: ExtractedFacility, error?: string }
 */

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

// 提取的设施数据结构
interface ExtractedFacility {
  name: string;
  nameEn?: string;
  terminal: string;
  location?: string;
  locationEn?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  is24Hours: boolean;
  services: string[]; // ["SLEEPING", "SHOWERS", ...]
  serviceDetails: Record<string, any>;
  areaType: 'AIRSIDE' | 'LANDSIDE' | 'BOTH' | 'PRIVATE';
  immigrationRequired: boolean;
  features?: string[];
  capacity?: string;
  notices?: string[];
}

// AI API 调用（支持 OpenAI 和向量引擎等兼容接口）
async function callAI(text: string): Promise<ExtractedFacility> {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiBaseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com';
  const model = process.env.AI_MODEL || 'claude-opus-4-6';
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const prompt = `
You are an AI assistant specialized in extracting airport facility information from unstructured text.

CRITICAL INSTRUCTIONS:
1. The input text may contain MULTIPLE facilities. Extract ONLY the FIRST facility mentioned.
2. Ignore headings like "THE PERFECT WAY TO REST" - these are NOT facility names.
3. Look for actual facility names like "Aerotel Airport Transit Hotel", "Ambassador Transit Hotel", etc.

Input Text:
"""
${text}
"""

Extract and return a JSON object with these fields:
{
  "name": "Facility name in original language (NOT headings like 'THE PERFECT WAY TO REST')",
  "nameEn": "Facility name in English (if different from name)",
  "terminal": "Terminal code like T1, T2, T3, or 'Main Terminal' (default: T1)",
  "location": "Detailed location description in original language",
  "locationEn": "Location in English (if different)",
  "phone": "Phone number with country code",
  "email": "Email address",
  "website": "Full website URL",
  "hours": "Operating hours description (e.g., '08:00 - 20:00')",
  "is24Hours": true/false,
  "services": ["SLEEPING", "SHOWERS", "STORAGE", "TRANSPORT", "LOUNGE", "FOOD", "SPA", "WIFI"],
  "serviceDetails": {
    "sleeping": { "type": "hotel/pod/zone", "price": "price info" },
    "showers": { "type": "in_room/shared/pay_per_use", "price": "price info" }
  },
  "areaType": "AIRSIDE/LANDSIDE/BOTH/PRIVATE",
  "immigrationRequired": true/false,
  "features": ["feature1", "feature2"],
  "capacity": "capacity description",
  "notices": ["important notice 1", "notice 2"]
}

CRITICAL RULES:
1. FACILITY NAME: Look for actual hotel/facility names, NOT section headings. Examples: "Aerotel Airport Transit Hotel", "Ambassador Transit Hotel", "YOTELAIR"
2. TERMINAL: Extract from "Terminal X" or "T X" patterns
3. AREA TYPE:
   - AIRSIDE = "Departure Transit Hall", "do not clear immigration", "禁区", "中转区"
   - LANDSIDE = "public area", "Arrival Hall", "需入境", "公共区域"
   - PRIVATE = "CIP Terminal", "JetQuay"
4. IMMIGRATION: 
   - immigrationRequired = FALSE if text says "do not clear immigration" or "无需入境"
   - immigrationRequired = TRUE if text says "you will need to clear immigration" or "需入境"
5. HOURS: Extract exact hours like "08:00 - 20:00". is24Hours = true ONLY if explicitly says "24 hours" or "24-hour"
6. SERVICES: Include SLEEPING for hotels/accommodations, SHOWERS for shower facilities
7. CONTACT: Extract phone (Tel:), email, and website URLs

Return ONLY the JSON object, no markdown formatting, no explanations.`;

  const response = await fetch(`${apiBaseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'You are a precise data extraction assistant. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3, // 低温度确保一致性
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  // 解析 JSON 响应
  try {
    // 清理可能的 markdown 格式
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanContent);
    
    // 确保必需字段
    return {
      name: parsed.name || 'Unknown Facility',
      terminal: parsed.terminal || 'T1',
      is24Hours: parsed.is24Hours ?? false,
      services: parsed.services || [],
      serviceDetails: parsed.serviceDetails || {},
      areaType: parsed.areaType || 'AIRSIDE',
      immigrationRequired: parsed.immigrationRequired ?? false,
      ...parsed,
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to parse AI response: ${errorMessage}`);
  }
}

// 备用提取逻辑（当 AI 不可用时）
function fallbackExtract(text: string): ExtractedFacility {
  const lower = text.toLowerCase();
  const services: string[] = [];
  const serviceDetails: Record<string, any> = {};
  
  // 检测服务类型
  if (lower.includes('酒店') || lower.includes('hotel') || lower.includes('睡眠') || lower.includes('sleep') || lower.includes('pod')) {
    services.push('SLEEPING');
    serviceDetails.sleeping = { type: 'hotel' };
  }
  
  if (lower.includes('淋浴') || lower.includes('shower') || lower.includes('洗澡')) {
    services.push('SHOWERS');
    serviceDetails.showers = { type: 'shared' };
  }
  
  if (lower.includes('行李') || lower.includes('luggage') || lower.includes('storage') || lower.includes('寄存')) {
    services.push('STORAGE');
    serviceDetails.storage = { type: 'locker' };
  }
  
  if (lower.includes('交通') || lower.includes('transport') || lower.includes('train') || lower.includes('bus')) {
    services.push('TRANSPORT');
  }
  
  // 检测航站楼
  let terminal = 'T1';
  if (lower.includes('terminal 1') || lower.includes('t1') || lower.includes('1号航站楼')) terminal = 'T1';
  else if (lower.includes('terminal 2') || lower.includes('t2') || lower.includes('2号航站楼')) terminal = 'T2';
  else if (lower.includes('terminal 3') || lower.includes('t3') || lower.includes('3号航站楼')) terminal = 'T3';
  
  // 检测区域类型
  let areaType: 'AIRSIDE' | 'LANDSIDE' | 'BOTH' | 'PRIVATE' = 'AIRSIDE';
  if (lower.includes('public') || lower.includes('入境') || lower.includes('landside')) areaType = 'LANDSIDE';
  else if (lower.includes('private') || lower.includes('cip')) areaType = 'PRIVATE';
  
  // 检测是否需要入境
  const immigrationRequired = areaType === 'LANDSIDE' || 
    lower.includes('需入境') || 
    lower.includes('immigration required');
  
  // 检测营业时间
  const is24Hours = lower.includes('24 hour') || lower.includes('24h') || lower.includes('24小时');
  
  // 提取名称（第一行）
  const name = text.split('\n')[0].trim().substring(0, 100) || 'Unknown Facility';
  
  return {
    name,
    terminal,
    is24Hours,
    services,
    serviceDetails,
    areaType,
    immigrationRequired,
  };
}

// POST 处理函数
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, useAI = true } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid text field' },
        { status: 400 }
      );
    }

    let extractedData: ExtractedFacility;

    // 尝试使用 AI 提取
    if (useAI && process.env.OPENAI_API_KEY) {
      try {
        extractedData = await callAI(text);
        console.log('AI extraction successful');
      } catch (aiError) {
        console.warn('AI extraction failed, using fallback:', aiError);
        extractedData = fallbackExtract(text);
      }
    } else {
      // 使用备用提取逻辑
      extractedData = fallbackExtract(text);
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
      method: useAI && process.env.OPENAI_API_KEY ? 'ai' : 'fallback',
    });

  } catch (error) {
    console.error('Extract facility error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// 配置路由 - Edge Runtime 已在文件顶部定义
export const maxDuration = 30; // 30秒超时
