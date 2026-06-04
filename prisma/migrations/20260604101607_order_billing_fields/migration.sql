-- AlterTable
ALTER TABLE "order" ADD COLUMN     "billingCity" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "billingCommune" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "billingCompanyName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "billingEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "billingFullName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "billingGiro" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "billingPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "billingRegion" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "billingRut" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "billingStreet" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "billingUnit" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3);
