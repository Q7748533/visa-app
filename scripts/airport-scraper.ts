import { chromium } from 'playwright';
import OpenAI from 'openai';
import * as fs from 'fs';
import dotenv from 'dotenv';

// 1. 初始化环境变量
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const apiKey = process.env.VECTOR_ENGINE_API_KEY || process.env.GEMINI_API_KEY;
const baseURL = 'https://api.vectorengine.ai/v1';

if (!apiKey) {
  console.error("❌ 找不到 API Key，请检查 .env 文件中是否有 VECTOR_ENGINE_API_KEY");
  process.exit(1);
}

const openai = new OpenAI({ apiKey, baseURL });

// --- 待采集列表 (可以继续往里塞) ---
const TARGET_AIRPORTS = [
  { iata: 'SIN', url: 'https://www.changiairport.com/en/airport-guide/facilities-and-services.html' },
  { iata: 'DXB', url: 'https://www.dubaiairports.ae/before-you-fly/at-the-airport/showers' },
  { iata: 'LHR', url: 'https://www.heathrow.com/at-the-airport/terminal-facilities/showers' },
  { iata: 'HND', url: 'https://tokyo-haneda.com/en/service/facilities/shower_room.html' }
];

/**
 * PDF 提取引擎
 */
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({ data: uint8Array });
  const pdfDocument = await loadingTask.promise;
  let fullText = '';
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return fullText;
}

/**
 * 核心抓取逻辑
 */
async function processAirport(iata: string, url: string) {
  console.log(`\n🛫 [Scraper] 正在攻克: ${iata} -> ${url}`);
  let contentText = '';
  const isPdf = url.split('?')[0].toLowerCase().endsWith('.pdf');

  if (isPdf) {
    try {
      const response = await fetch(url);
      const buffer = Buffer.from(await response.arrayBuffer());
      contentText = await extractTextFromPdf(buffer);
      console.log(`✅ PDF 解析成功`);
    } catch (err) {
      console.error(`❌ PDF 处理失败: ${iata}`);
      return null;
    }
  } else {
    // 🚀 LHR 破防配置：模拟真实用户，不强制等待网络空闲
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(6000); // 稳一波，强制等6秒让内容渲染
      contentText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim());
      console.log(`✅ 网页抓取成功 (${contentText.length} 字)`);
    } catch (err) {
      console.error(`❌ 网页抓取失败: ${iata}`);
      return null;
    } finally {
      await browser.close();
    }
  }

  // --- AI 提取 ---
  try {
    console.log(`🤖 呼叫 Gemini 进行深度建模...`);
    const completion = await openai.chat.completions.create({
      model: "gemini-3.1-pro-preview",
      messages: [
        { 
          role: "system", 
          content: "You are a professional data extractor. Output ONLY raw JSON. No markdown blocks. Fields: showerData, sleepData, luggageData, transitData. Use 'Not specified' for missing info." 
        },
        { role: "user", content: `Extract airport infrastructure from this text:\n\n${contentText.substring(0, 18000)}` }
      ],
      response_format: { type: "json_object" }
    });

    // 🚀 暴力清洗 JSON：防止 AI 吐出 ```json ... ```
    let rawContent = completion.choices[0].message.content || '{}';
    const cleanedJson = rawContent.replace(/```json|```/g, "").trim();
    const aiResponse = JSON.parse(cleanedJson);

    return {
      iata: iata.toUpperCase(),
      showerData: JSON.stringify(aiResponse.showerData || {}),
      sleepData: JSON.stringify(aiResponse.sleepData || {}),
      luggageData: JSON.stringify(aiResponse.luggageData || {}),
      transitData: JSON.stringify(aiResponse.transitData || []),
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ AI 处理失败 [${iata}]:`, error);
    return null;
  }
}

/**
 * 执行器
 */
async function main() {
  const finalResults = [];
  
  // 如果之前有运行结果，先读取，实现增量采集
  if (fs.existsSync('airport_data_batch.json')) {
    const existing = JSON.parse(fs.readFileSync('airport_data_batch.json', 'utf-8'));
    finalResults.push(...existing);
  }

  for (const item of TARGET_AIRPORTS) {
    // 跳过已存在的
    if (finalResults.some(r => r.iata === item.iata)) {
      console.log(`⏭️  跳过已存在的机场: ${item.iata}`);
      continue;
    }

    const data = await processAirport(item.iata, item.url);
    if (data) {
      finalResults.push(data);
      fs.writeFileSync('airport_data_batch.json', JSON.stringify(finalResults, null, 2), 'utf-8');
      console.log(`💾 数据已保存至缓存文件。`);
    }

    // 礼貌休息
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n🎉 任务全部完成！数据已准备好。`);
}

main().catch(console.error);