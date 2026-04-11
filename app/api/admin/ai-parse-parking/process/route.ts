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
- arrivalDirections: Arrival instructions. Prioritize navigation_tip field content (how to reach the parking lot), otherwise use redemption_instructions.arrival array (steps after parking)
- thingsToKnow: Array of important notes in format [{"title": "Title", "content": "Content"}]. 
   EXTRACT FROM THESE FIELDS IN ORDER OF PRIORITY:
   1. arrivalInstructions - Convert each step to a note with title "Arrival Instructions"
   2. departureInstructions - Convert each step to a note with title "Departure Instructions"  
   3. restrictions - Extract policies like cancellation, shuttle hours, etc.
   4. cancellation - Extract cancellation policy details
   
   CATEGORIZATION RULES:
   * "Arrival Instructions" - Steps from arrivalInstructions (check-in, parking, shuttle)
   * "Departure Instructions" - Steps from departureInstructions (call shuttle, find shuttle, leave)
   * "Shuttle Information" - From restrictions or shuttle.hours
   * "Cancellation Policy" - From cancellation field
   * "Operating Hours" - From hoursOfOperation or is24Hours
   * "Amenities" - Key features from amenities array
   
   FORMAT EACH NOTE:
   * Clean HTML tags, use plain text
   * Combine related steps into logical groups
   * Keep instructions clear and actionable
- isIndoor: Whether indoor parking (boolean, true/false)
- hasValet: Whether valet service available (boolean, true/false)
- is24Hours: Whether open 24 hours (boolean, true/false)

IMPORTANT INSTRUCTIONS:
1. ALL text content MUST be in English ONLY. Do not use any Chinese or other languages.
2. thingsToKnow must be an array format, each element contains title and content
3. Boolean values must be true or false, not strings
4. Only return JSON object, do not include any other text

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
  "arrivalDirections": "Arrival directions text or JSON",
  "thingsToKnow": [
    {"title": "Cancellation Policy", "content": "Reservations are non-refundable"},
    {"title": "Operating Hours", "content": "Open 24 hours"}
  ],
  "isIndoor": false,
  "hasValet": false,
  "is24Hours": true
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
