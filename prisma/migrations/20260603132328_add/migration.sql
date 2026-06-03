-- CreateEnum
CREATE TYPE "IdentificationType" AS ENUM ('RUT', 'DNI', 'PASSPORT', 'TAX_ID');

-- CreateEnum
CREATE TYPE "AccountHolderType" AS ENUM ('PERSON', 'COMPANY');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('BILLING', 'SHIPPING');

-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('SYSTEM', 'LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "ContentDensity" AS ENUM ('COMFORTABLE', 'COMPACT');

-- CreateEnum
CREATE TYPE "EmailFormat" AS ENUM ('HTML', 'PLAIN');

-- CreateTable
CREATE TABLE "user_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT 'es',
    "timezone" TEXT NOT NULL DEFAULT 'America/Santiago',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_identification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "identificationType" "IdentificationType" NOT NULL DEFAULT 'RUT',
    "identificationNumber" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT 'CL',
    "holderType" "AccountHolderType" NOT NULL DEFAULT 'PERSON',
    "companyName" TEXT NOT NULL DEFAULT '',
    "companyTaxId" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_identification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AddressType" NOT NULL,
    "label" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "commune" TEXT NOT NULL DEFAULT '',
    "street" TEXT NOT NULL DEFAULT '',
    "unit" TEXT NOT NULL DEFAULT '',
    "postalCode" TEXT NOT NULL DEFAULT '',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notifyEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyPush" BOOLEAN NOT NULL DEFAULT true,
    "notifySmsWhatsApp" BOOLEAN NOT NULL DEFAULT false,
    "notifyProductUpdates" BOOLEAN NOT NULL DEFAULT true,
    "notifyOrderUpdates" BOOLEAN NOT NULL DEFAULT true,
    "notifySecurityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "notifyMarketing" BOOLEAN NOT NULL DEFAULT false,
    "notifyNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "notifyReminders" BOOLEAN NOT NULL DEFAULT true,
    "loginAlerts" BOOLEAN NOT NULL DEFAULT true,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "theme" "ThemePreference" NOT NULL DEFAULT 'SYSTEM',
    "language" TEXT NOT NULL DEFAULT 'es',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "defaultCountry" TEXT NOT NULL DEFAULT 'CL',
    "contentDensity" "ContentDensity" NOT NULL DEFAULT 'COMFORTABLE',
    "emailFormat" "EmailFormat" NOT NULL DEFAULT 'HTML',
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_userId_key" ON "user_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_identification_userId_key" ON "user_identification"("userId");

-- CreateIndex
CREATE INDEX "user_address_userId_idx" ON "user_address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_identification" ADD CONSTRAINT "user_identification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_address" ADD CONSTRAINT "user_address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
