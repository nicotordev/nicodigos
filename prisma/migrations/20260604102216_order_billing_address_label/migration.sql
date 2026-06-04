-- AlterTable
ALTER TABLE "order" ADD COLUMN     "billingAddressId" TEXT,
ADD COLUMN     "billingAddressLabel" TEXT NOT NULL DEFAULT '';
