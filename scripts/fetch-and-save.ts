import fs from 'fs/promises';
import path from 'path';

/**
 * 核心逻辑：从 URL 抓取数据并保存为本地 JSON
 * @param iata 机场代码 (用于命名文件)
 * @param url 完整的 SpotHero API 链接
 */
async function fetchAirportParking(iata: string, url: string) {
  console.log(`\n🌐 正在从 SpotHero 抓取 ${iata} 的实时数据...`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // 💡 模拟真实浏览器，防止被 SpotHero 拦截 (403)
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://spothero.com/',
        'Origin': 'https://spothero.com'
      }
    });

    if (!response.ok) {
      throw new Error(`抓取失败！HTTP 状态码: ${response.status}`);
    }

    const data = await response.json();
    
    // 检查数据结构
    if (!data.results) {
      console.warn("⚠️ 警告：抓取成功但没发现停车场结果，请检查 URL 中的日期是否已过期。");
    }

    // 自动生成文件名，存放在项目根目录
    const fileName = `${iata.toLowerCase()}_raw.json`;
    const filePath = path.join(process.cwd(), fileName);

    // 写入文件
    await fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf-8');

    console.log(`✅ 抓取成功！数据已保存至: ${fileName}`);
    return fileName;

  } catch (error: any) {
    console.error(`❌ 抓取 ${iata} 出错:`, error.message);
    return null;
  }
}

async function main() {
  // 1. 在这里填入你想抓取的 URL
  const targetIata = "LGA";
  const targetUrl = "https://api.spothero.com/v2/search/airport?oversize=false&iata=LGA&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=19877049-edaa-4b7d-892a-b456d50655ad&action_id=01fab8c1-f66b-437f-937e-1b765e2c2c84&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd";

  await fetchAirportParking(targetIata, targetUrl);
}

main();