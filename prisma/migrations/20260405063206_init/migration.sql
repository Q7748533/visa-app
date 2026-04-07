/*
  Warnings:

  - You are about to drop the `Flight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `code` on the `Airport` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Airport` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Airport` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Airport` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `Airport` table. All the data in the column will be lost.
  - Added the required column `iata` to the `Airport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Airport` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Flight";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Airport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "iata" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "luggageData" TEXT,
    "showerData" TEXT,
    "sleepData" TEXT,
    "transitData" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Airport" ("city", "country", "id", "name", "updatedAt") SELECT "city", "country", "id", "name", "updatedAt" FROM "Airport";
DROP TABLE "Airport";
ALTER TABLE "new_Airport" RENAME TO "Airport";
CREATE UNIQUE INDEX "Airport_iata_key" ON "Airport"("iata");
CREATE UNIQUE INDEX "Airport_slug_key" ON "Airport"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
