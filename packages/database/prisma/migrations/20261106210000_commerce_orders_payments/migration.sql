-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('CREATED', 'REDIRECTED', 'CALLBACK_RECEIVED', 'VERIFIED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "CouponDiscountType" AS ENUM ('PERCENT', 'FIXED_TOMAN');

-- CreateEnum
CREATE TYPE "GatewayCredentialsStatus" AS ENUM ('MISSING', 'PRESENT');

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "codeNormalized" TEXT NOT NULL,
    "discountType" "CouponDiscountType" NOT NULL,
    "percentOff" DECIMAL(5,2),
    "amountOffToman" DECIMAL(12,2),
    "minOrderToman" DECIMAL(12,2),
    "maxDiscountToman" DECIMAL(12,2),
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "maxRedemptions" INTEGER,
    "redemptionCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponRedemption" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

-- AlterTable Order: Decimal money + coupon snapshot fields
ALTER TABLE "Order" ADD COLUMN "couponId" TEXT,
ADD COLUMN "couponCode" TEXT,
ADD COLUMN "listPriceToman" DECIMAL(12,2),
ADD COLUMN "discountToman" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'IRT',
ADD COLUMN "paidAt" TIMESTAMP(3);

-- Migrate existing integer amountToman → Decimal (if any rows)
ALTER TABLE "Order" ALTER COLUMN "amountToman" TYPE DECIMAL(12,2) USING ("amountToman"::DECIMAL(12,2));

-- Backfill listPriceToman from amountToman for any legacy rows
UPDATE "Order" SET "listPriceToman" = "amountToman" WHERE "listPriceToman" IS NULL;
ALTER TABLE "Order" ALTER COLUMN "listPriceToman" SET NOT NULL;

-- Drop legacy gatewayRef (moved to PaymentTransaction.gatewayAuthority/ref)
ALTER TABLE "Order" DROP COLUMN IF EXISTS "gatewayRef";

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'CREATED',
    "amountToman" DECIMAL(12,2) NOT NULL,
    "gatewayAuthority" TEXT,
    "gatewayRefId" TEXT,
    "callbackPayload" JSONB,
    "verifyPayload" JSONB,
    "idempotencyKey" TEXT NOT NULL,
    "failureReason" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentGatewaySetting" (
    "id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "technicalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "checkoutVisible" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sandboxMode" BOOLEAN NOT NULL DEFAULT true,
    "credentialsStatus" "GatewayCredentialsStatus" NOT NULL DEFAULT 'MISSING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentGatewaySetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_codeNormalized_key" ON "Coupon"("codeNormalized");

-- CreateIndex
CREATE INDEX "Coupon_active_endsAt_idx" ON "Coupon"("active", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "CouponRedemption_orderId_key" ON "CouponRedemption"("orderId");

-- CreateIndex
CREATE INDEX "CouponRedemption_couponId_idx" ON "CouponRedemption"("couponId");

-- CreateIndex
CREATE INDEX "CouponRedemption_userId_idx" ON "CouponRedemption"("userId");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_courseId_idx" ON "Order"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_idempotencyKey_key" ON "PaymentTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentTransaction_orderId_status_idx" ON "PaymentTransaction"("orderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_provider_gatewayAuthority_key" ON "PaymentTransaction"("provider", "gatewayAuthority");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentGatewaySetting_provider_key" ON "PaymentGatewaySetting"("provider");

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
