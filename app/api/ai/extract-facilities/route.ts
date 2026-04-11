/**
 * AI 批量设施提取 API
 * 支持从一段文本中提取多个设施信息
 * 使用多次 AI 调用来逐个提取每个设施
 */

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

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
  services: string[];
  serviceDetails: Record<string, any>;
  areaType: 'AIRSIDE' | 'LANDSIDE' | 'BOTH' | 'PRIVATE';
  immigrationRequired: boolean;
  features?: string[];
  capacity?: string;
  notices?: string[];
}

// 首先识别文本中有多少个设施
async function identifyFacilities(text: string): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiBaseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com';
  const model = process.env.AI_MODEL || 'claude-opus-4-6';
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const prompt = `
You are an AI assistant that identifies facility names in airport facility descriptions.

Analyze the following text and identify ALL facility names (hotels, lounges, shower facilities, etc.) mentioned in it.

Input Text:
"""
${text}
"""

Return a JSON array of facility names only. For example:
["Aerotel Airport Transit Hotel", "Ambassador Transit Hotel", "YOTELAIR Singapore Changi Airport"]

Rules:
1. Look for actual facility/hotel names, NOT section headings like "THE PERFECT WAY TO REST"
2. Include the full name as it appears in the text
3. Return ONLY the JSON array, no markdown, no explanations
4. If no facilities found, return an empty array []
`;

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
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to identify facilities');
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content || '[]';
  
  try {
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanContent);
  } catch {
    return [];
  }
}

// 提取单个设施的详细信息
async function extractSingleFacility(text: string, facilityName: string): Promise<ExtractedFacility> {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiBaseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com';
  const model = process.env.AI_MODEL || 'claude-opus-4-6';
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const prompt = `
You are an AI assistant specialized in extracting airport facility information.

Extract detailed information for the facility "${facilityName}" from the text below.
Focus ONLY on information related to "${facilityName}" and ignore other facilities.

Input Text:
"""
${text}
"""

Extract and return a JSON object with these fields:
{
  "name": "Facility name as it appears in the text",
  "nameEn": "English name if different",
  "terminal": "Terminal code like T1, T2, T3 (default: T1)",
  "location": "Detailed location description",
  "locationEn": "Location in English if different",
  "phone": "Phone number with country code",
  "email": "Email address",
  "website": "Full website URL",
  "hours": "Operating hours (e.g., '08:00 - 20:00')",
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
  "notices": ["important notice 1"]
}

CRITICAL RULES:
1. TERMINAL: Extract from "Terminal X" or "T X" near the facility name
2. AREA TYPE:
   - AIRSIDE = "Departure Transit Hall", "do not clear immigration", "禁区"
   - LANDSIDE = "public area", "Arrival Hall", "需入境", "公共区域"
   - PRIVATE = "CIP Terminal", "JetQuay"
3. IMMIGRATION: 
   - FALSE if text says "do not clear immigration" or "无需入境"
   - TRUE if text says "need to clear immigration" or "需入境"
4. HOURS: Extract exact hours. is24Hours = true ONLY if explicitly says "24 hours"
5. CONTACT: Look for contact info (Tel:, Email:, Website:) in the facility section
6. PRICE - VERY IMPORTANT:
   - For hotels: Look for room rates, prices like "$80-200/night", "S$120", "€85-150"
   - For showers: Look for shower prices like "$15", "Free", "Included"
   - Look for keywords: "rates", "price", "S$", "$", "€", "£", "per night", "per hour"
   - Extract the complete price information as a string
   - Example: "S$120 for first 6 hours", "$80-200/night", "From $80"

Return ONLY the JSON object, no markdown, no explanations.`;

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
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to extract facility: ${facilityName}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Empty response from AI');
  }

  try {
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanContent);
    
    return {
      name: parsed.name || facilityName,
      terminal: parsed.terminal || 'T1',
      is24Hours: parsed.is24Hours ?? false,
      services: parsed.services || [],
      serviceDetails: parsed.serviceDetails || {},
      areaType: parsed.areaType || 'AIRSIDE',
      immigrationRequired: parsed.immigrationRequired ?? false,
      ...parsed,
    };
  } catch (e) {
    throw new Error(`Failed to parse facility data for: ${facilityName}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, airportIata } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json(
        { success: false, error: '请提供设施描述文本' },
        { status: 400 }
      );
    }

    console.log(`🔍 Identifying facilities in text for ${airportIata}...`);
    
    // 第一步：识别所有设施名称
    const facilityNames = await identifyFacilities(text);
    
    if (facilityNames.length === 0) {
      return NextResponse.json(
        { success: false, error: '未能识别到任何设施，请检查文本格式' },
        { status: 400 }
      );
    }

    console.log(`✅ Found ${facilityNames.length} facilities:`, facilityNames);

    // 第二步：逐个提取每个设施的详细信息
    const facilities: ExtractedFacility[] = [];
    
    for (const facilityName of facilityNames) {
      try {
        console.log(`📋 Extracting: ${facilityName}...`);
        const facility = await extractSingleFacility(text, facilityName);
        facilities.push(facility);
      } catch (error) {
        console.error(`❌ Failed to extract ${facilityName}:`, error);
        // 继续处理其他设施
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        count: facilities.length,
        facilities,
        facilityNames,
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Extract facilities error:', error);
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
