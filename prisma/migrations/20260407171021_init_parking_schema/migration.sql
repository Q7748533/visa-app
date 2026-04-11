-- CreateTable
CREATE TABLE "Airport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "iata" TEXT NOT NULL,
    "iataCode" TEXT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "continent" TEXT,
    "slug" TEXT NOT NULL,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "searchVolume" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ParkingLot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "airportIataCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dailyRate" DECIMAL NOT NULL,
    "distanceMiles" REAL,
    "shuttleMins" INTEGER,
    "tags" TEXT,
    "isIndoor" BOOLEAN NOT NULL DEFAULT false,
    "hasValet" BOOLEAN NOT NULL DEFAULT false,
    "is24Hours" BOOLEAN NOT NULL DEFAULT true,
    "rating" REAL,
    "reviewCount" INTEGER,
    "affiliateUrl" TEXT,
    "dataSource" TEXT,
    "rawContent" TEXT,
    "lastCheckedAt" DATETIME,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ParkingLot_airportIataCode_fkey" FOREIGN KEY ("airportIataCode") REFERENCES "Airport" ("iataCode") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Airport_iata_key" ON "Airport"("iata");

-- CreateIndex
CREATE UNIQUE INDEX "Airport_iataCode_key" ON "Airport"("iataCode");

-- CreateIndex
CREATE UNIQUE INDEX "Airport_slug_key" ON "Airport"("slug");

-- CreateIndex
CREATE INDEX "Airport_isActive_idx" ON "Airport"("isActive");

-- CreateIndex
CREATE INDEX "Airport_isPopular_idx" ON "Airport"("isPopular");

-- CreateIndex
CREATE INDEX "Airport_searchVolume_idx" ON "Airport"("searchVolume");

-- CreateIndex
CREATE UNIQUE INDEX "ParkingLot_slug_key" ON "ParkingLot"("slug");

-- CreateIndex
CREATE INDEX "ParkingLot_airportIataCode_idx" ON "ParkingLot"("airportIataCode");

-- CreateIndex
CREATE INDEX "ParkingLot_type_idx" ON "ParkingLot"("type");

-- CreateIndex
CREATE INDEX "ParkingLot_dailyRate_idx" ON "ParkingLot"("dailyRate");

-- CreateIndex
CREATE INDEX "ParkingLot_featured_idx" ON "ParkingLot"("featured");

-- CreateIndex
CREATE INDEX "ParkingLot_isActive_idx" ON "ParkingLot"("isActive");

-- CreateIndex
CREATE INDEX "ParkingLot_deletedAt_idx" ON "ParkingLot"("deletedAt");
