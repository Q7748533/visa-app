-- Add Way.com specific fields to ParkingLot table

-- Add description fields
ALTER TABLE "ParkingLot" ADD COLUMN "description" TEXT;
ALTER TABLE "ParkingLot" ADD COLUMN "shuttleDesc" TEXT;
ALTER TABLE "ParkingLot" ADD COLUMN "cancellationPolicy" TEXT;
ALTER TABLE "ParkingLot" ADD COLUMN "parkingAccess" TEXT;
ALTER TABLE "ParkingLot" ADD COLUMN "operatingDays" TEXT;

-- Add contact and rating fields
ALTER TABLE "ParkingLot" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "ParkingLot" ADD COLUMN "recommendationPct" INTEGER;

-- Add detailed rating fields
ALTER TABLE "ParkingLot" ADD COLUMN "locationRating" REAL;
ALTER TABLE "ParkingLot" ADD COLUMN "staffRating" REAL;
ALTER TABLE "ParkingLot" ADD COLUMN "facilityRating" REAL;
ALTER TABLE "ParkingLot" ADD COLUMN "safetyRating" REAL;

-- Add missing detail fields
ALTER TABLE "ParkingLot" ADD COLUMN "address" TEXT;
ALTER TABLE "ParkingLot" ADD COLUMN "shuttleFrequency" TEXT;
ALTER TABLE "ParkingLot" ADD COLUMN "shuttleHours" TEXT;
ALTER TABLE "ParkingLot" ADD COLUMN "arrivalDirections" TEXT;
ALTER TABLE "ParkingLot" ADD COLUMN "thingsToKnow" TEXT;

-- Update dataSource default value
-- SQLite doesn't support ALTER COLUMN, so we use a workaround
-- For production, you may need to recreate the table or use a different approach
