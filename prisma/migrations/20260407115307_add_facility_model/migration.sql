-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "airportIata" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "terminal" TEXT NOT NULL,
    "location" TEXT,
    "locationEn" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "hours" TEXT,
    "is24Hours" BOOLEAN NOT NULL DEFAULT false,
    "services" TEXT NOT NULL,
    "serviceDetails" TEXT,
    "areaType" TEXT NOT NULL DEFAULT 'AIRSIDE',
    "immigrationRequired" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT,
    "capacity" TEXT,
    "notices" TEXT,
    "dataSource" TEXT,
    "rawContent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Facility_airportIata_fkey" FOREIGN KEY ("airportIata") REFERENCES "Airport" ("iata") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Facility_airportIata_idx" ON "Facility"("airportIata");
