/*
  Warnings:

  - Added the required column `user_id` to the `demand_forecasts` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_demand_forecasts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "days_to_stockout" INTEGER,
    "average_daily_demand" REAL,
    "confidence_level" TEXT,
    "historical_data" TEXT,
    "calculation_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "demand_forecasts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "demand_forecasts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_demand_forecasts" ("average_daily_demand", "calculation_date", "confidence_level", "created_at", "days_to_stockout", "historical_data", "id", "product_id") SELECT "average_daily_demand", "calculation_date", "confidence_level", "created_at", "days_to_stockout", "historical_data", "id", "product_id" FROM "demand_forecasts";
DROP TABLE "demand_forecasts";
ALTER TABLE "new_demand_forecasts" RENAME TO "demand_forecasts";
CREATE INDEX "demand_forecasts_product_id_idx" ON "demand_forecasts"("product_id");
CREATE INDEX "demand_forecasts_user_id_idx" ON "demand_forecasts"("user_id");
CREATE INDEX "demand_forecasts_calculation_date_idx" ON "demand_forecasts"("calculation_date" DESC);
CREATE UNIQUE INDEX "demand_forecasts_user_id_product_id_key" ON "demand_forecasts"("user_id", "product_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
