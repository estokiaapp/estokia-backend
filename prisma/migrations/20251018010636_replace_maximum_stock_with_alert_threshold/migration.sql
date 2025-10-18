/*
  Warnings:

  - You are about to drop the column `maximum_stock` on the `products` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category_id" INTEGER,
    "cost_price" REAL,
    "selling_price" REAL,
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "minimum_stock" INTEGER NOT NULL DEFAULT 0,
    "alert_threshold_days" INTEGER NOT NULL DEFAULT 7,
    "unit_of_measure" TEXT NOT NULL DEFAULT 'UN',
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_products" ("active", "category_id", "cost_price", "created_at", "current_stock", "description", "id", "minimum_stock", "name", "selling_price", "sku", "unit_of_measure", "updated_at") SELECT "active", "category_id", "cost_price", "created_at", "current_stock", "description", "id", "minimum_stock", "name", "selling_price", "sku", "unit_of_measure", "updated_at" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE INDEX "products_sku_idx" ON "products"("sku");
CREATE INDEX "products_category_id_idx" ON "products"("category_id");
CREATE INDEX "products_active_idx" ON "products"("active");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
