import fs from 'fs/promises';
import path from 'path';

async function debug() {
  const filePath = path.join(process.cwd(), 'sfo_detail_parknfly.json');
  const rawData = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  const result = data.result;
  const rate = result.rates[0];
  
  console.log('=== 数据结构检查 ===');
  console.log('rate.facility?.airport exists:', !!rate.facility?.airport);
  console.log('rate.facility?.airport?.transportation exists:', !!rate.facility?.airport?.transportation);
  console.log('rate.facility?.airport?.transportation?.hours_of_operation:', rate.facility?.airport?.transportation?.hours_of_operation);
  console.log('rate.facility?.airport?.amenities:', rate.facility?.airport?.amenities);
}

debug();
