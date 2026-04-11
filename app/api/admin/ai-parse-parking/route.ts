import { NextRequest, NextResponse } from 'next/server';

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
  return `你是一个专业的停车场数据解析助手。请从以下原始数据中提取停车场信息，并以 JSON 格式返回。

原始数据：
${rawData}

请提取以下字段（如果数据中没有，请设为 null 或空数组）：
- name: 停车场名称
- address: 完整地址
- dailyRate: 每日价格（数字，单位美元）
- distanceMiles: 距离机场英里数（数字）
- shuttleMins: 班车时间（分钟，数字）
- rating: 评分（1-5 之间的数字）
- reviewCount: 评论数量（数字）
- tags: 标签数组（如 ["Self Park", "Covered", "Valet"]）
- shuttleFrequency: 班车频率描述（如 "Every 10-15 mins"）
- shuttleHours: 班车营业时间
- arrivalDirections: 到达指引。优先使用 navigation_tip 字段的内容（如何到达停车场），如果没有则使用 redemption_instructions.arrival 数组（停车后的步骤）
- thingsToKnow: 注意事项数组，格式为 [{"title": "标题", "content": "内容"}]。从 restrictions 字段提取信息并智能分类整理，优化SEO：
   * 分类建议：取消政策(Cancellation Policy)、到达须知(Arrival Instructions)、离开须知(Departure Instructions)、超时政策(Overstay Policy)、修改政策(Modification Policy)、便利设施(Amenities)、其他限制(Other Restrictions)
   * 清理HTML标签和链接，使用简洁文字
   * 合并相似内容（如Android/Apple app链接合并为一条）
   * 每个分类只保留最关键信息，利于SEO
- isIndoor: 是否室内停车场（布尔值，true/false）
- hasValet: 是否提供代客泊车（布尔值，true/false）
- is24Hours: 是否24小时营业（布尔值，true/false）

重要提示：
1. thingsToKnow 必须是数组格式，每个元素包含 title 和 content
2. 布尔值必须是 true 或 false，不要用字符串
3. 只返回 JSON 对象，不要包含任何其他文字

格式如下：
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
  "arrivalDirections": "到达指引文本或JSON",
  "thingsToKnow": [
    {"title": "取消政策", "content": "预订不可退款"},
    {"title": "营业时间", "content": "24小时营业"}
  ],
  "isIndoor": false,
  "hasValet": false,
  "is24Hours": true
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
      };
    }
    throw new Error('无法解析 AI 响应');
  } catch (error) {
    console.error('Parse AI response error:', error);
    return {};
  }
}
