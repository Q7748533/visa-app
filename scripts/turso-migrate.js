require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const migrations = [
  `ALTER TABLE "ParkingLot" ADD COLUMN "description" TEXT;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "shuttleDesc" TEXT;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "cancellationPolicy" TEXT;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "parkingAccess" TEXT;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "operatingDays" TEXT;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "contactPhone" TEXT;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "recommendationPct" INTEGER;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "locationRating" REAL;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "staffRating" REAL;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "facilityRating" REAL;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "safetyRating" REAL;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "address" TEXT;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "shuttleFrequency" TEXT;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "shuttleHours" TEXT;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "arrivalDirections" TEXT;`,
  `ALTER TABLE "ParkingLot" ADD COLUMN "thingsToKnow" TEXT;`,
];

async function runMigrations() {
  console.log('Running Turso migrations...');
  for (const sql of migrations) {
    try {
      await client.execute(sql);
      console.log('✓', sql);
    } catch (error) {
      if (error.message.includes('duplicate column')) {
        console.log('⊘', sql, '(already exists)');
      } else {
        console.error('✗', sql);
        console.error(error.message);
      }
    }
  }
  console.log('Done!');
  process.exit(0);
}

runMigrations();
