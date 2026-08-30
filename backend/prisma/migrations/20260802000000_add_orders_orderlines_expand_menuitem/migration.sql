-- Add new columns to MenuItem
ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "descriptor"  TEXT;
ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "basePrice"   DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "soldOut"     BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "featured"    BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "spicy"       BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "vegetarian"  BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "sizes"       JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "addOns"      JSONB NOT NULL DEFAULT '[]';

-- Drop old price column (replaced by basePrice)
ALTER TABLE "MenuItem" DROP COLUMN IF EXISTS "price";

-- Enums
DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('RECEIVED', 'KITCHEN', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "FulfillmentMode" AS ENUM ('DELIVERY', 'PICKUP');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Order table
CREATE TABLE IF NOT EXISTS "Order" (
  "id"              TEXT NOT NULL,
  "userId"          TEXT,
  "branchId"        TEXT NOT NULL,
  "fulfillment"     "FulfillmentMode" NOT NULL,
  "status"          "OrderStatus" NOT NULL DEFAULT 'RECEIVED',
  "subtotal"        DOUBLE PRECISION NOT NULL,
  "discount"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total"           DOUBLE PRECISION NOT NULL,
  "promoCode"       TEXT,
  "paystackRef"     TEXT,
  "deliveryAddress" TEXT,
  "customerEmail"   TEXT,
  "customerName"    TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Order_paystackRef_key" ON "Order"("paystackRef");

ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- OrderLine table
CREATE TABLE IF NOT EXISTS "OrderLine" (
  "id"          TEXT NOT NULL,
  "orderId"     TEXT NOT NULL,
  "menuItemId"  TEXT,
  "name"        TEXT NOT NULL,
  "descriptor"  TEXT,
  "sizeLabel"   TEXT NOT NULL,
  "addOns"      JSONB NOT NULL DEFAULT '[]',
  "quantity"    INTEGER NOT NULL,
  "unitPrice"   DOUBLE PRECISION NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderLine_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_menuItemId_fkey"
  FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
