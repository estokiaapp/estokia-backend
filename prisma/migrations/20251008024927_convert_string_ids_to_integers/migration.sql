/*
  Warnings:

  - The primary key for the `alerts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `alerts` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `product_id` on the `alerts` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `user_id` on the `alerts` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `demand_forecasts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `demand_forecasts` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `product_id` on the `demand_forecasts` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `category_id` on the `products` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `products` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `supplier_id` on the `products` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `sale_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `sale_items` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `product_id` on the `sale_items` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `sale_id` on the `sale_items` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `sales` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `sales` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `user_id` on the `sales` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `stock_movements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `stock_movements` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `product_id` on the `stock_movements` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `user_id` on the `stock_movements` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `suppliers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `suppliers` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `system_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `system_settings` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `users` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_alerts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER,
    "user_id" INTEGER,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "alert_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alerts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_alerts" ("alert_date", "created_at", "id", "message", "priority", "product_id", "read", "title", "type", "user_id") SELECT "alert_date", "created_at", "id", "message", "priority", "product_id", "read", "title", "type", "user_id" FROM "alerts";
DROP TABLE "alerts";
ALTER TABLE "new_alerts" RENAME TO "alerts";
CREATE INDEX "alerts_user_id_read_idx" ON "alerts"("user_id", "read");
CREATE INDEX "alerts_product_id_idx" ON "alerts"("product_id");
CREATE INDEX "alerts_type_priority_idx" ON "alerts"("type", "priority");
CREATE TABLE "new_categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_categories" ("created_at", "description", "id", "name", "updated_at") SELECT "created_at", "description", "id", "name", "updated_at" FROM "categories";
DROP TABLE "categories";
ALTER TABLE "new_categories" RENAME TO "categories";
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE TABLE "new_demand_forecasts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER NOT NULL,
    "days_to_stockout" INTEGER,
    "average_daily_demand" REAL,
    "confidence_level" REAL,
    "historical_data" TEXT,
    "calculation_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "demand_forecasts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_demand_forecasts" ("average_daily_demand", "calculation_date", "confidence_level", "created_at", "days_to_stockout", "historical_data", "id", "product_id") SELECT "average_daily_demand", "calculation_date", "confidence_level", "created_at", "days_to_stockout", "historical_data", "id", "product_id" FROM "demand_forecasts";
DROP TABLE "demand_forecasts";
ALTER TABLE "new_demand_forecasts" RENAME TO "demand_forecasts";
CREATE INDEX "demand_forecasts_product_id_idx" ON "demand_forecasts"("product_id");
CREATE INDEX "demand_forecasts_calculation_date_idx" ON "demand_forecasts"("calculation_date" DESC);
CREATE TABLE "new_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category_id" INTEGER,
    "supplier_id" INTEGER,
    "cost_price" REAL,
    "selling_price" REAL,
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "minimum_stock" INTEGER NOT NULL DEFAULT 0,
    "maximum_stock" INTEGER,
    "unit_of_measure" TEXT NOT NULL DEFAULT 'UN',
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_products" ("active", "category_id", "cost_price", "created_at", "current_stock", "description", "id", "maximum_stock", "minimum_stock", "name", "selling_price", "sku", "supplier_id", "unit_of_measure", "updated_at") SELECT "active", "category_id", "cost_price", "created_at", "current_stock", "description", "id", "maximum_stock", "minimum_stock", "name", "selling_price", "sku", "supplier_id", "unit_of_measure", "updated_at" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE INDEX "products_sku_idx" ON "products"("sku");
CREATE INDEX "products_category_id_idx" ON "products"("category_id");
CREATE INDEX "products_supplier_id_idx" ON "products"("supplier_id");
CREATE INDEX "products_active_idx" ON "products"("active");
CREATE TABLE "new_sale_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sale_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sale_items_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sale_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sale_items" ("created_at", "id", "product_id", "quantity", "sale_id", "subtotal", "unit_price") SELECT "created_at", "id", "product_id", "quantity", "sale_id", "subtotal", "unit_price" FROM "sale_items";
DROP TABLE "sale_items";
ALTER TABLE "new_sale_items" RENAME TO "sale_items";
CREATE INDEX "sale_items_product_id_idx" ON "sale_items"("product_id");
CREATE INDEX "sale_items_sale_id_idx" ON "sale_items"("sale_id");
CREATE TABLE "new_sales" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sale_number" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "total_amount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sale_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sales_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sales" ("created_at", "id", "sale_date", "sale_number", "status", "total_amount", "updated_at", "user_id") SELECT "created_at", "id", "sale_date", "sale_number", "status", "total_amount", "updated_at", "user_id" FROM "sales";
DROP TABLE "sales";
ALTER TABLE "new_sales" RENAME TO "sales";
CREATE UNIQUE INDEX "sales_sale_number_key" ON "sales"("sale_number");
CREATE INDEX "sales_sale_date_idx" ON "sales"("sale_date" DESC);
CREATE INDEX "sales_status_idx" ON "sales"("status");
CREATE INDEX "sales_user_id_idx" ON "sales"("user_id");
CREATE TABLE "new_stock_movements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" REAL,
    "reason" TEXT,
    "notes" TEXT,
    "movement_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "stock_movements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_stock_movements" ("created_at", "id", "movement_date", "notes", "product_id", "quantity", "reason", "type", "unit_price", "user_id") SELECT "created_at", "id", "movement_date", "notes", "product_id", "quantity", "reason", "type", "unit_price", "user_id" FROM "stock_movements";
DROP TABLE "stock_movements";
ALTER TABLE "new_stock_movements" RENAME TO "stock_movements";
CREATE INDEX "stock_movements_product_id_movement_date_idx" ON "stock_movements"("product_id", "movement_date" DESC);
CREATE INDEX "stock_movements_type_idx" ON "stock_movements"("type");
CREATE INDEX "stock_movements_user_id_idx" ON "stock_movements"("user_id");
CREATE TABLE "new_suppliers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "tax_id" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_suppliers" ("active", "address", "created_at", "email", "id", "name", "phone", "tax_id", "updated_at") SELECT "active", "address", "created_at", "email", "id", "name", "phone", "tax_id", "updated_at" FROM "suppliers";
DROP TABLE "suppliers";
ALTER TABLE "new_suppliers" RENAME TO "suppliers";
CREATE UNIQUE INDEX "suppliers_tax_id_key" ON "suppliers"("tax_id");
CREATE TABLE "new_system_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "setting_key" TEXT NOT NULL,
    "setting_value" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'STRING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_system_settings" ("created_at", "description", "id", "setting_key", "setting_value", "type", "updated_at") SELECT "created_at", "description", "id", "setting_key", "setting_value", "type", "updated_at" FROM "system_settings";
DROP TABLE "system_settings";
ALTER TABLE "new_system_settings" RENAME TO "system_settings";
CREATE UNIQUE INDEX "system_settings_setting_key_key" ON "system_settings"("setting_key");
CREATE INDEX "system_settings_setting_key_idx" ON "system_settings"("setting_key");
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OPERATOR',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_users" ("active", "created_at", "email", "id", "name", "password", "type", "updated_at") SELECT "active", "created_at", "email", "id", "name", "password", "type", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
