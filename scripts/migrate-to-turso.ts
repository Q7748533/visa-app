const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const TURSO_URL = process.env.TURSO_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
  console.error('Missing TURSO_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

async function main() {
  console.log('=== SQLite → Turso Migration (Native) ===\n');

  const localDb = new Database('prisma/dev.db', { readonly: true });
  const turso = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN });

  try {
    const airports = localDb.prepare('SELECT * FROM Airport').all();
    const lots = localDb.prepare('SELECT * FROM ParkingLot').all();

    console.log(`Local: ${airports.length} airports, ${lots.length} parking lots\n`);

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS Airport (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6)))),
        iata TEXT NOT NULL UNIQUE,
        iataCode TEXT UNIQUE,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL DEFAULT 'USA',
        slug TEXT NOT NULL UNIQUE,
        isPopular INTEGER NOT NULL DEFAULT 0,
        isActive INTEGER NOT NULL DEFAULT 1,
        searchVolume INTEGER,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL
      )
    `);

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS ParkingLot (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6)))),
        airportIataCode TEXT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        featured INTEGER NOT NULL DEFAULT 0,
        isActive INTEGER NOT NULL DEFAULT 1,
        dailyRate REAL NOT NULL,
        distanceMiles REAL,
        shuttleMins INTEGER,
        tags TEXT,
        isIndoor INTEGER NOT NULL DEFAULT 0,
        hasValet INTEGER NOT NULL DEFAULT 0,
        is24Hours INTEGER NOT NULL DEFAULT 1,
        address TEXT,
        shuttleFrequency TEXT,
        shuttleHours TEXT,
        arrivalDirections TEXT,
        thingsToKnow TEXT,
        rating REAL,
        reviewCount INTEGER,
        affiliateUrl TEXT,
        dataSource TEXT,
        rawContent TEXT,
        lastCheckedAt TEXT,
        deletedAt TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL
      )
    `);

    console.log('Tables created on Turso');

    for (const a of airports) {
      await turso.execute({
        sql: `INSERT OR IGNORE INTO Airport (id, iata, iataCode, name, city, country, slug, isPopular, isActive, searchVolume, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [a.id, a.iata, a.iataCode, a.name, a.city, a.country, a.slug, a.isPopular ? 1 : 0, a.isActive ? 1 : 0, a.searchVolume, a.createdAt, a.updatedAt],
      });
    }
    console.log(`✅ Migrated ${airports.length} airports`);

    for (const l of lots) {
      await turso.execute({
        sql: `INSERT OR IGNORE INTO ParkingLot (id, airportIataCode, name, slug, type, featured, isActive, dailyRate, distanceMiles, shuttleMins, tags, isIndoor, hasValet, is24Hours, address, shuttleFrequency, shuttleHours, arrivalDirections, thingsToKnow, rating, reviewCount, affiliateUrl, dataSource, rawContent, lastCheckedAt, deletedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [l.id, l.airportIataCode, l.name, l.slug, l.type, l.featured ? 1 : 0, l.isActive !== undefined ? (l.isActive ? 1 : 0) : 1, Number(l.dailyRate), l.distanceMiles, l.shuttleMins, l.tags, l.isIndoor ? 1 : 0, l.hasValet ? 1 : 0, l.is24Hours !== undefined ? (l.is24Hours ? 1 : 0) : 1, l.address, l.shuttleFrequency, l.shuttleHours, l.arrivalDirections, l.thingsToKnow, l.rating, l.reviewCount, l.affiliateUrl, l.dataSource, l.rawContent, l.lastCheckedAt, l.deletedAt, l.createdAt, l.updatedAt],
      });
    }
    console.log(`✅ Migrated ${lots.length} parking lots\n`);

    const result = await turso.execute('SELECT COUNT(*) as c FROM Airport');
    const result2 = await turso.execute('SELECT COUNT(*) as c FROM ParkingLot');
    console.log(`=== Verification ===`);
    console.log(`Turso: ${result.rows[0].c} airports, ${result2.rows[0].c} parking lots`);
    console.log('\n🎉 Migration complete!');

  } catch (err: unknown) {
    console.error('Migration failed:', err instanceof Error ? err.message : String(err));
  } finally {
    localDb.close();
  }
}

main();
