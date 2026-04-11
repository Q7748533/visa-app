import fs from 'fs/promises';
import path from 'path';

async function debug() {
  const filePath = path.join(process.cwd(), 'sfo_detail_parknfly.json');
  const rawData = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  const result = data.result;
  const rate = result.rates[0];
  
  console.log('=== 数据结构检查 ===');
  console.log('rate keys:', Object.keys(rate));
  console.log('');
  console.log('result.facility exists:', !!result.facility);
  console.log('result.facility.airport exists:', !!result.facility?.airport);
  console.log('result.facility.airport.transportation:', result.facility?.airport?.transportation ? 'exists' : 'not found');
}

debug();
