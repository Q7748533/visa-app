-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Airport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "iata" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "continent" TEXT,
    "slug" TEXT NOT NULL,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "searchVolume" INTEGER,
    "luggageData" TEXT,
    "showerData" TEXT,
    "sleepData" TEXT,
    "transitData" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Airport" ("city", "country", "iata", "id", "luggageData", "name", "showerData", "sleepData", "slug", "transitData", "updatedAt") SELECT "city", "country", "iata", "id", "luggageData", "name", "showerData", "sleepData", "slug", "transitData", "updatedAt" FROM "Airport";
DROP TABLE "Airport";
ALTER TABLE "new_Airport" RENAME TO "Airport";
CREATE UNIQUE INDEX "Airport_iata_key" ON "Airport"("iata");
CREATE UNIQUE INDEX "Airport_slug_key" ON "Airport"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
