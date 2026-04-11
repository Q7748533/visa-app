const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const TURSO_URL = process.env.TURSO_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
  console.error('Missing TURSO_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

function formatDate(val: unknown): string | null {
  if (!val || val === '' || val === 'null') return null;
  const num = Number(val);
  if (!isNaN(num) && num > 0) {
    const ms = num > 10000000000 ? num : num * 1000;
    return new Date(ms).toISOString();
  }
  if (typeof val === 'string' && val.includes('T')) {
    return val;
  }
  return null;
}

async function main() {
  console.log('=== Fixing Turso Date Formats ===\n');

  const turso = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN });

  try {
    // 修复机场表（只有 createdAt, updatedAt）
    const airports = await turso.execute('SELECT id, createdAt, updatedAt FROM Airport');
    console.log(`Found ${airports.rows.length} airports to fix`);

    for (const row of airports.rows) {
      const id = row.id as string;
      const createdAt = formatDate(row.createdAt) || new Date().toISOString();
      const updatedAt = formatDate(row.updatedAt) || new Date().toISOString();

      await turso.execute({
        sql: 'UPDATE Airport SET createdAt = ?, updatedAt = ? WHERE id = ?',
        args: [createdAt, updatedAt, id],
      });
    }
    console.log('✅ Fixed airport dates');

    // 修复停车场表（有 createdAt, updatedAt, lastCheckedAt）
    const lots = await turso.execute('SELECT id, createdAt, updatedAt, lastCheckedAt FROM ParkingLot');
    console.log(`Found ${lots.rows.length} parking lots to fix`);

    for (const row of lots.rows) {
      const id = row.id as string;
      const createdAt = formatDate(row.createdAt) || new Date().toISOString();
      const updatedAt = formatDate(row.updatedAt) || new Date().toISOString();
      const lastCheckedAt = formatDate(row.lastCheckedAt);

      if (lastCheckedAt) {
        await turso.execute({
          sql: 'UPDATE ParkingLot SET createdAt = ?, updatedAt = ?, lastCheckedAt = ? WHERE id = ?',
          args: [createdAt, updatedAt, lastCheckedAt, id],
        });
      } else {
        await turso.execute({
          sql: 'UPDATE ParkingLot SET createdAt = ?, updatedAt = ? WHERE id = ?',
          args: [createdAt, updatedAt, id],
        });
      }
    }
    console.log('✅ Fixed parking lot dates\n');

    console.log('🎉 Date fix complete!');

  } catch (err: unknown) {
    console.error('Fix failed:', err instanceof Error ? err.message : String(err));
  }
}

main();
