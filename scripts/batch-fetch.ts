import fs from 'fs/promises';
import path from 'path';

// 💡 配置你想抓取的 URL 列表
const TARGET_URLS = [
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=ORD&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=d241e9e0-74fd-4a64-8340-0fdaf86ebf22&action_id=539cb76f-36a1-4a37-8030-ed98cfd7a939&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=MDW&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=1ca2dd40-28e7-4239-bc78-4e4eee170b6b&action_id=048ec217-2ad2-41bb-8c48-642c6709481a&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd", 
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=JFK&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=6f060f6c-b1cb-4fd1-b3c8-804af4d9c829&action_id=5347fa0b-9f10-47bf-b034-f94423df8e51&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd", 
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=LGA&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=5b5d2ded-1803-4741-b288-891c28b6105b&action_id=c28fd1fc-14e7-4b3b-b810-6002a791f95e&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=EWR&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=622f7731-f1c8-4054-8fb1-defb0c3b8b9c&action_id=c07f0f8f-3ea7-4e76-82b7-500747337d19&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=LAX&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=45e53f18-b3ee-483b-b825-1ae0cca6bfb4&action_id=e4195e37-477f-46e6-8505-18bed2900572&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=SFO&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=e935180e-9d6b-4204-9eb2-cded4565261b&action_id=465295b3-e7c0-4c2b-885e-f904bf5f7fe5&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=SAN&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=532c3ae8-d006-4a93-8a2a-2b4f416c6942&action_id=86a86799-5a39-4ee5-b66c-ec6ae08bcf0c&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=DFW&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=3be8e62f-7262-4aec-be5a-b070992b29b4&action_id=c80dc246-525b-4ce8-b69c-03bd1b4c4c7c&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=IAH&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=9d45b19b-96ff-4634-8c4b-2930637b2d54&action_id=7a2d2846-5be2-4b60-984a-66e7b54d7a0a&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=AUS&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=a43d630d-3b68-4935-8031-bf47a0090c47&action_id=0c8219f0-e72d-4cd0-b3b9-5f8327f35906&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=ATL&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=9f625377-3b0a-4ec7-b05d-a1599c4be6d2&action_id=8897cf03-a501-4dc4-ab96-2f2f33c6f03a&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=MIA&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=549c6d0c-fed9-4d5c-b8b0-ba0b0ea03f34&action_id=2b2308fa-552b-4ff5-a7c9-56a7e1ae9094&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=MCO&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=57863942-f9e6-4e2a-9f07-1311996fe628&action_id=8c5a720e-3c65-4221-bbf5-013027415d85&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=BOS&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=eeba430c-903e-46ed-9774-c17cfb11dbb9&action_id=b2651645-1cfb-4342-a36c-e0a4a6e2f59d&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=LAS&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=5c993d66-51b8-47e1-87ea-ff9e82474ba8&action_id=ec3567a1-4b82-4e1e-89a9-2e778b11b657&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=DEN&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=c12d99b1-4400-43b2-becb-469350c717fa&action_id=1cd34b8b-52f6-430b-b532-0a37e8388b83&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  "https://api.spothero.com/v2/search/airport?oversize=false&iata=PHX&starts=2026-04-09T12:00:00&ends=2026-04-13T12:00:00&show_unavailable=false&session_uuid=e4c2b395-5c09-4fc3-961f-1bd3caf8202a&search_id=97dfe6f7-210c-4d40-ae05-721942bd423b&action_id=f4aff7cf-21c9-4943-bd81-e8f5b94f01e9&action=SEARCH&fingerprint=d79e504b-a29e-4fc7-abc1-7c522ec1c5fd",
  // 在这里继续粘贴你所有的 URL...
];

/**
 * 核心逻辑：模拟浏览器从 API 抓取并保存
 */
async function fetchAndSave(url: string, index: number) {
  // 1. 从 URL 中自动提取 IATA 代码用于命名，如果提取不到就用序号
  const urlObj = new URL(url);
  const iata = urlObj.searchParams.get('iata')?.toLowerCase() || `unknown_${index}`;
  const fileName = `${iata}_raw.json`;

  console.log(`\n🚀 [${index + 1}/${TARGET_URLS.length}] 正在抓取机场: ${iata.toUpperCase()}...`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://spothero.com/',
      }
    });

    if (!response.ok) {
      throw new Error(`抓取失败，HTTP ${response.status}`);
    }

    const data = await response.json();
    const filePath = path.join(process.cwd(), fileName);

    await fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf-8');
    console.log(`✅ 抓取完成！已保存至: ${fileName}`);

    // 💡 关键：每次抓取完歇 2 秒，防止频率太快被 SpotHero 封 IP
    await new Promise(resolve => setTimeout(resolve, 2000));

  } catch (error: any) {
    console.error(`❌ 抓取第 ${index + 1} 个 URL 出错:`, error.message);
  }
}

async function main() {
  console.log(`\n--- 开始批量抓取任务，共 ${TARGET_URLS.length} 个机场 ---`);
  
  for (let i = 0; i < TARGET_URLS.length; i++) {
    await fetchAndSave(TARGET_URLS[i], i);
  }

  console.log(`\n🏁 所有抓取任务已结束！快去跑之前的导入脚本吧。`);
}

main();